// Worship team song log API.
//
// Data lives in Netlify Blobs:
//   s/<id>  a song in the repertoire: { id, song, artist, genre, key, createdAt }
//   e/<id>  one time a song was sung:  { id, songId, date, songOfWeek, createdAt }
// Production uses the "worship" store; deploy previews and branch deploys use
// "worship-preview", so trying out a preview never touches the real list.
//
// Every request must send the team passcode in the "x-passcode" header;
// the passcode is the WORSHIP_PASSCODE environment variable in Netlify.

import { getStore } from "@netlify/blobs";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const config = { path: "/api/songs" };

const GENRES = ["alabanza", "adoracion"];

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  });

function passcodeOk(given) {
  const expected = process.env.WORSHIP_PASSCODE;
  if (!expected || typeof given !== "string") return false;
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// Sunday that starts the week containing a YYYY-MM-DD date.
export function weekOf(date) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().slice(0, 10);
}

// Same song regardless of accents, capitals, punctuation or extra spaces.
export function normName(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const text = (v, max = 120) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

async function readAll(store, prefix) {
  const { blobs } = await store.list({ prefix });
  const items = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return items.filter(Boolean);
}

// Older entries stored the song details inline. Turn them into repertoire songs.
async function migrate(store, songs, entries) {
  const old = entries.filter((e) => !e.songId && e.song);
  if (!old.length) return false;
  const byName = new Map(songs.map((s) => [normName(s.song), s]));
  old.sort((a, b) => (a.date + (a.createdAt || "")).localeCompare(b.date + (b.createdAt || "")));
  for (const e of old) {
    const k = normName(e.song);
    let s = byName.get(k);
    if (!s) {
      s = { id: randomUUID(), song: e.song, artist: "", genre: e.genre, key: "", createdAt: e.createdAt || new Date().toISOString() };
      byName.set(k, s);
    }
    // the most recent time sung wins for name, genre, artist and key
    s.song = text(e.song) || s.song;
    s.genre = GENRES.includes(e.genre) ? e.genre : s.genre;
    if (e.artist) s.artist = e.artist;
    if (e.key) s.key = e.key;
    s._dirty = true;
    e._songId = s.id;
  }
  for (const s of byName.values()) {
    if (s._dirty) {
      delete s._dirty;
      await store.setJSON(`s/${s.id}`, s);
    }
  }
  for (const e of old) {
    await store.setJSON(`e/${e.id}`, {
      id: e.id, songId: e._songId, date: e.date, songOfWeek: !!e.songOfWeek, createdAt: e.createdAt || "",
    });
  }
  return true;
}

async function load(store) {
  let [songs, entries] = await Promise.all([readAll(store, "s/"), readAll(store, "e/")]);
  if (await migrate(store, songs, entries)) {
    [songs, entries] = await Promise.all([readAll(store, "s/"), readAll(store, "e/")]);
  }
  // drop entries whose song no longer exists
  const ids = new Set(songs.map((s) => s.id));
  return { songs, entries: entries.filter((e) => ids.has(e.songId)) };
}

// Only one song of the week per week.
async function setStar(store, entries, entry, value) {
  if (value) {
    const w = weekOf(entry.date);
    for (const e of entries) {
      if (e.id !== entry.id && e.songOfWeek && weekOf(e.date) === w) {
        e.songOfWeek = false;
        await store.setJSON(`e/${e.id}`, e);
      }
    }
  }
  entry.songOfWeek = value;
  await store.setJSON(`e/${entry.id}`, entry);
}

async function addEntry(store, entries, songId, date, star) {
  const existing = entries.find((e) => e.songId === songId && weekOf(e.date) === weekOf(date));
  if (existing) {
    if (star) await setStar(store, entries, existing, true);
    return { entry: existing, alreadyThisWeek: true };
  }
  const entry = { id: randomUUID(), songId, date, songOfWeek: false, createdAt: new Date().toISOString() };
  entries.push(entry);
  await store.setJSON(`e/${entry.id}`, entry);
  if (star) await setStar(store, entries, entry, true);
  return { entry, alreadyThisWeek: false };
}

function songFields(body) {
  const song = text(body.song);
  const genre = GENRES.includes(body.genre) ? body.genre : null;
  if (!song || !genre) return null;
  return { song, artist: text(body.artist), genre, key: text(body.key, 12) };
}

export default async function handler(req, context, storeOverride) {
  if (!process.env.WORSHIP_PASSCODE) return json(503, { error: "not_configured" });
  if (!passcodeOk(req.headers.get("x-passcode"))) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return json(401, { error: "bad_passcode" });
  }

  const production = context?.deploy?.context === "production";
  const store =
    storeOverride || getStore({ name: production ? "worship" : "worship-preview", consistency: "strong" });

  if (req.method === "GET") return json(200, await load(store));

  let body = {};
  try { body = await req.json(); } catch { body = {}; }
  const { songs, entries } = await load(store);
  const findSong = (id) => songs.find((s) => s.id === id);
  const findEntry = (id) => entries.find((e) => e.id === id);
  const sameName = (name, exceptId) => songs.find((s) => s.id !== exceptId && normName(s.song) === normName(name));

  switch (`${req.method} ${body.action}`) {
    // New song: goes into the repertoire and is logged as sung on `date`.
    case "POST addSong": {
      const f = songFields(body);
      if (!f || !validDate(body.date)) return json(400, { error: "invalid" });
      const dup = sameName(f.song);
      if (dup) return json(409, { error: "exists", song: dup });
      const song = { id: randomUUID(), ...f, createdAt: new Date().toISOString() };
      await store.setJSON(`s/${song.id}`, song);
      await addEntry(store, entries, song.id, body.date, body.songOfWeek === true);
      return json(201, await load(store));
    }
    // A repertoire song was sung on `date` (no duplicates within a week).
    case "POST sing": {
      if (!findSong(body.songId) || !validDate(body.date)) return json(400, { error: "invalid" });
      const r = await addEntry(store, entries, body.songId, body.date, body.songOfWeek === true);
      return json(200, { ...(await load(store)), alreadyThisWeek: r.alreadyThisWeek });
    }
    case "PATCH editSong": {
      const song = findSong(body.id);
      const f = songFields(body);
      if (!song) return json(404, { error: "not_found" });
      if (!f) return json(400, { error: "invalid" });
      if (sameName(f.song, song.id)) return json(409, { error: "exists" });
      await store.setJSON(`s/${song.id}`, { ...song, ...f });
      return json(200, await load(store));
    }
    case "PATCH editEntry": {
      const entry = findEntry(body.id);
      if (!entry) return json(404, { error: "not_found" });
      if (!validDate(body.date)) return json(400, { error: "invalid" });
      const clash = entries.find((e) => e.id !== entry.id && e.songId === entry.songId && weekOf(e.date) === weekOf(body.date));
      if (clash) return json(409, { error: "already_that_week" });
      entry.date = body.date;
      await store.setJSON(`e/${entry.id}`, entry);
      if (entry.songOfWeek) await setStar(store, entries, entry, true);
      return json(200, await load(store));
    }
    case "PATCH star": {
      const entry = findEntry(body.id);
      if (!entry) return json(404, { error: "not_found" });
      await setStar(store, entries, entry, body.value === true);
      return json(200, await load(store));
    }
    // Remove one time sung; the song stays in the repertoire.
    case "DELETE entry": {
      if (!findEntry(body.id)) return json(404, { error: "not_found" });
      await store.delete(`e/${body.id}`);
      return json(200, await load(store));
    }
    // Remove a song from the repertoire, with its whole history.
    case "DELETE song": {
      if (!findSong(body.id)) return json(404, { error: "not_found" });
      await Promise.all(entries.filter((e) => e.songId === body.id).map((e) => store.delete(`e/${e.id}`)));
      await store.delete(`s/${body.id}`);
      return json(200, await load(store));
    }
    default:
      return json(400, { error: "unknown_action" });
  }
}
