// Tests for the worship team API (netlify/functions/songs.mjs).
// Run with: npm test   (needs Node.js 18+ and `npm install` once)
import { test } from "node:test";
import assert from "node:assert/strict";
import handler, { weekOf, normName } from "../netlify/functions/songs.mjs";

// In-memory stand-in for a Netlify Blobs store.
function memoryStore() {
  const m = new Map();
  return {
    map: m,
    async list({ prefix }) { return { blobs: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })) }; },
    async get(k) { return m.has(k) ? structuredClone(m.get(k)) : null; },
    async setJSON(k, v) { m.set(k, structuredClone(v)); },
    async delete(k) { m.delete(k); },
  };
}

function client(store, passcode = "secreto") {
  return async (method, body) => {
    const res = await handler(
      new Request("https://example.test/api/songs", {
        method,
        headers: { "x-passcode": passcode, "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      }),
      { deploy: { context: "production" } },
      store
    );
    return [res.status, await res.json()];
  };
}

process.env.WORSHIP_PASSCODE = "secreto";

test("weeks run Monday to Sunday and are named by their Sunday", () => {
  assert.equal(weekOf("2026-11-08"), "2026-11-08"); // Sunday
  assert.equal(weekOf("2026-11-09"), "2026-11-15"); // Monday -> coming Sunday
  assert.equal(weekOf("2026-11-14"), "2026-11-15"); // Saturday
});

test("song names match regardless of accents, case and punctuation", () => {
  assert.equal(normName("  Renuévame! "), normName("renuevame"));
});

test("passcode is required", async () => {
  const [status] = await client(memoryStore(), "wrong")("GET");
  assert.equal(status, 401);
});

test("reports not configured when no passcode is set", async () => {
  const saved = process.env.WORSHIP_PASSCODE;
  delete process.env.WORSHIP_PASSCODE;
  try {
    const [status] = await client(memoryStore())("GET");
    assert.equal(status, 503);
  } finally {
    process.env.WORSHIP_PASSCODE = saved;
  }
});

test("add, reuse, edit and delete songs", async () => {
  const call = client(memoryStore());
  let [status, d] = await call("POST", { action: "addSong", song: "Way Maker", artist: "Sinach", genre: "adoracion", key: "G", date: "2026-11-15" });
  assert.equal(status, 201);
  const wm = d.songs[0];

  [status, d] = await call("POST", { action: "addSong", song: "WAY MAKER!", genre: "adoracion", date: "2026-11-15" });
  assert.equal(status, 409, "duplicate names are refused");
  assert.equal(d.song.id, wm.id);

  [status, d] = await call("POST", { action: "sing", songId: wm.id, date: "2026-11-12" });
  assert.equal(d.alreadyThisWeek, true, "same week is not added twice");
  assert.equal(d.entries.length, 1);

  [status, d] = await call("POST", { action: "sing", songId: wm.id, date: "2026-11-22" });
  assert.equal(d.entries.length, 2);

  [status, d] = await call("POST", { action: "addSong", song: "Alabaré", genre: "alabanza", date: "2026-11-15" });
  [status] = await call("PATCH", { action: "editSong", id: wm.id, song: "alabare", genre: "alabanza" });
  assert.equal(status, 409, "renaming onto another song is refused");

  [status, d] = await call("PATCH", { action: "editSong", id: wm.id, song: "Way Maker", artist: "Sinach", genre: "adoracion", key: "A" });
  assert.equal(d.songs.find((s) => s.id === wm.id).key, "A");

  const later = d.entries.find((e) => e.date === "2026-11-22");
  [status] = await call("PATCH", { action: "editEntry", id: later.id, date: "2026-11-10" });
  assert.equal(status, 409, "moving into a week that already has the song is refused");

  [status, d] = await call("DELETE", { action: "entry", id: later.id });
  assert.ok(d.songs.some((s) => s.id === wm.id), "removing from a week keeps the song");

  [status, d] = await call("DELETE", { action: "song", id: wm.id });
  assert.ok(!d.songs.some((s) => s.id === wm.id));
  assert.ok(!d.entries.some((e) => e.songId === wm.id), "deleting a song removes its history");
});

test("rejects invalid input", async () => {
  const call = client(memoryStore());
  assert.equal((await call("POST", { action: "addSong", song: "x", genre: "rock", date: "2026-11-15" }))[0], 400);
  assert.equal((await call("POST", { action: "addSong", song: "x", genre: "alabanza", date: "2026-02-30" }))[0], 400);
  assert.equal((await call("POST", { action: "addSong", song: "  ", genre: "alabanza", date: "2026-11-15" }))[0], 400);
  assert.equal((await call("POST", { action: "nope" }))[0], 400);
});

test("converts the original data format and the old week rule once", async () => {
  const store = memoryStore();
  // original format: song details stored inside each entry
  store.map.set("e/a", { id: "a", date: "2026-10-25", song: "Way Maker", artist: "Sinach", genre: "adoracion", key: "G", createdAt: "2026-10-25T10:00:00Z" });
  store.map.set("e/b", { id: "b", date: "2026-11-02", song: "way maker", artist: "", genre: "adoracion", key: "A", createdAt: "2026-11-02T10:00:00Z" });
  const call = client(store);
  let [, d] = await call("GET");
  assert.equal(d.songs.length, 1, "same song merged");
  assert.equal(d.songs[0].key, "A", "most recent details win");
  assert.equal(d.songs[0].artist, "Sinach", "artist kept from earlier entry");
  // Monday Nov 2 belonged to the week of Sunday Nov 1 under the old rule
  assert.equal(d.entries.find((e) => e.id === "b").date, "2026-11-01");
  assert.ok(store.map.has("meta/weeks-end-on-sunday"));

  // after the one-time move, new weekday dates are kept
  await call("POST", { action: "sing", songId: d.songs[0].id, date: "2026-11-13" });
  [, d] = await call("GET");
  assert.ok(d.entries.some((e) => e.date === "2026-11-13"));
});
