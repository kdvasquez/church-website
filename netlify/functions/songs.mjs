// Worship team song log API.
// Stores each sung song as its own entry in Netlify Blobs (store "worship").
// Every request must send the team passcode in the "x-passcode" header;
// the passcode is set in Netlify as the WORSHIP_PASSCODE environment variable.

import { getStore } from "@netlify/blobs";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const config = { path: "/api/songs" };

const GENRES = ["alabanza", "adoracion"];
const MAX_TEXT = 120;

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

function cleanText(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT) : "";
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

async function allEntries(store) {
  const { blobs } = await store.list({ prefix: "e/" });
  const entries = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return entries.filter(Boolean);
}

export default async function handler(req, _context, storeOverride) {
  if (!process.env.WORSHIP_PASSCODE) {
    return json(503, { error: "not_configured" });
  }
  if (!passcodeOk(req.headers.get("x-passcode"))) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return json(401, { error: "bad_passcode" });
  }

  const store = storeOverride || getStore({ name: "worship", consistency: "strong" });

  if (req.method === "GET") {
    return json(200, { entries: await allEntries(store) });
  }

  let body = {};
  if (req.method !== "DELETE" || req.headers.get("content-length") !== "0") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  if (req.method === "POST") {
    const song = cleanText(body.song);
    const artist = cleanText(body.artist);
    const key = cleanText(body.key).slice(0, 12);
    const genre = GENRES.includes(body.genre) ? body.genre : null;
    if (!song || !genre || !validDate(body.date)) {
      return json(400, { error: "invalid" });
    }
    const entry = {
      id: randomUUID(),
      date: body.date,
      song,
      artist,
      genre,
      key,
      songOfWeek: false,
      createdAt: new Date().toISOString(),
    };
    await store.setJSON(`e/${entry.id}`, entry);
    if (body.songOfWeek === true) await setSongOfWeek(store, entry.id, true);
    return json(201, { entry: { ...entry, songOfWeek: body.songOfWeek === true } });
  }

  if (req.method === "PATCH") {
    const id = cleanText(body.id);
    const ok = await setSongOfWeek(store, id, body.songOfWeek === true);
    return ok ? json(200, { ok: true }) : json(404, { error: "not_found" });
  }

  if (req.method === "DELETE") {
    const id = cleanText(new URL(req.url).searchParams.get("id") || body.id);
    if (!id) return json(400, { error: "invalid" });
    await store.delete(`e/${id}`);
    return json(200, { ok: true });
  }

  return json(405, { error: "method_not_allowed" });
}

// Only one song of the week per week: starring one clears the others that week.
async function setSongOfWeek(store, id, value) {
  const entry = await store.get(`e/${id}`, { type: "json" });
  if (!entry) return false;
  if (value) {
    const week = weekOf(entry.date);
    const others = (await allEntries(store)).filter(
      (e) => e.id !== id && e.songOfWeek && weekOf(e.date) === week
    );
    await Promise.all(others.map((e) => store.setJSON(`e/${e.id}`, { ...e, songOfWeek: false })));
  }
  await store.setJSON(`e/${id}`, { ...entry, songOfWeek: value });
  return true;
}
