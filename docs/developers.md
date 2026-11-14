# Developer guide

How the church website and the worship team page are built. For day-to-day admin tasks, see the [main guide](../README.md). For how the worship team uses their page, see the [worship team guide](worship-team.md).

---

## Architecture

```
                    GitHub (kdvasquez/church-website, branch main)
                                     │  every push
                                     ▼
                                  Netlify
        ┌────────────────────────────┼─────────────────────────────┐
        │                            │                             │
  Static files (CDN)         Netlify Function               Netlify Forms
  index.html, img/, …        /api/songs                     form "contact"
  alabanza/ (worship UI)     netlify/functions/songs.mjs    → Netlify dashboard
        │                            │                        and email
        │   fetch + x-passcode       ▼
        └──────────────────────► Netlify Blobs
                                 store "worship" (production)
                                 store "worship-preview" (previews)

  Embedded third parties: Google Calendar (events), Facebook Page Plugin, Google Fonts
```

- **There's no build step.** Netlify publishes the repository root as is and bundles the one function with esbuild, installing `@netlify/blobs` from `package.json`.
- **The public website** is a single page, `index.html`, with inline CSS and JavaScript. It's static apart from the embeds and the contact form.
- **The worship page** (`alabanza/index.html` and `alabanza/app.js`) is a small client that talks to one JSON endpoint, `/api/songs`. All storage and rules live in the function.

## Tech stack

| Part | What it uses |
|---|---|
| Public website | Plain HTML, CSS and JavaScript, with no framework |
| Hosting | Netlify. Pushes to `main` deploy to production; pull requests get deploy previews at `https://deploy-preview-<number>--iddpmisoledad.netlify.app`. |
| Contact form | Netlify Forms (`name="contact"`), with a honeypot field. It redirects to `gracias.html`. |
| Events and messages | Embedded Google Calendar, and the Facebook Page Plugin (SDK v21). The Facebook embed currently shows only the page header, without posts. That's on Facebook's side; the code follows their instructions. |
| Worship page | Plain HTML, CSS and JavaScript. The charts are hand-drawn SVG, with no libraries. |
| Worship API | A Netlify Function (Node.js, ES modules) at `/api/songs` |
| Storage | Netlify Blobs with strong consistency |
| Access | A shared passcode in the `WORSHIP_PASSCODE` environment variable |
| Fonts | Google Fonts: Playfair Display, Lora and Cormorant Garamond |
| Headers | Security headers, `noindex` for private pages, and blocking of repository files are set in `netlify.toml` |

## Files

```
index.html                    Public website (styles and scripts inline)
gracias.html                  Contact form confirmation page (noindex)
img/                          Photos, logo, link preview image (share.jpg, 1200×630)
favicon.ico, img/icons/       Logo icons (browser tabs, phone home screens)
alabanza/index.html           Worship page markup and styles (noindex)
alabanza/app.js               Worship page behavior
netlify/functions/songs.mjs   Worship API: passcode check, rules and storage
netlify.toml                  Publish settings, headers, functions folder, blocked paths
package.json                  @netlify/blobs dependency for the function
docs/                         These guides
robots.txt, sitemap.xml       Search engine settings
```

`README.md`, `docs/`, `netlify/` and `package.json` are blocked from being served on the website by redirects in `netlify.toml`.

## Worship API

Every request must send the passcode in the `x-passcode` header. Request and response bodies are JSON. Every successful request returns the full current data, `{ songs, entries }`, and the page re-renders from it.

| Method | Body | What it does |
|---|---|---|
| `GET` | none | Returns `{ songs, entries }`. Runs any pending data migrations first. |
| `POST` | `{ action: "addSong", song, artist?, genre, key?, date }` | Creates a repertoire song and logs it on `date`. Returns **409** `{ error: "exists", song }` if a song with the same name already exists. |
| `POST` | `{ action: "sing", songId, date }` | Logs an existing song on `date`. If the song is already in that week, nothing is added and the response includes `alreadyThisWeek: true`. |
| `PATCH` | `{ action: "editSong", id, song, artist?, genre, key? }` | Edits a song's details everywhere. Returns **409** if the new name matches another song. |
| `PATCH` | `{ action: "editEntry", id, date }` | Moves a logged song to another date. Returns **409** if the song is already in that week. |
| `DELETE` | `{ action: "entry", id }` | Removes one logged date. The song stays in the repertoire. |
| `DELETE` | `{ action: "song", id }` | Deletes a song and all its logged dates. |

- `genre` is `"alabanza"` or `"adoracion"`, and `date` is `YYYY-MM-DD`.
- Other status codes: **400** invalid input, **401** wrong passcode (with a 0.5 s delay to slow down guessing), **404** unknown id, **503** `WORSHIP_PASSCODE` not set.

## Data model (Netlify Blobs)

| Key | Value |
|---|---|
| `s/<uuid>` | A repertoire song: `{ id, song, artist, genre, key, createdAt }` |
| `e/<uuid>` | One time a song was sung: `{ id, songId, date, createdAt }` |
| `meta/weeks-end-on-sunday` | Marker showing the one-time week-rule migration has run |

- **Weeks** run Monday through Sunday and are identified by their Sunday (`weekOf()` in both `songs.mjs` and `app.js`). Keep the two in sync.
- **Song names** are compared ignoring accents, capitals, punctuation and extra spaces (`normName()`), so "Renuévame!" and "renuevame" are the same song.
- **Stores:** production uses `worship`. Deploy previews, branch deploys and `netlify dev` use `worship-preview`, so a preview never touches real data. The choice is based on `context.deploy.context`.
- **Migrations run on load and are idempotent.** The first converts the original format, where song details were stored on each entry, into songs plus entries. The second moves weekday-dated entries from the old Sunday-to-Saturday rule onto their Sunday, once.
- Old fields such as `songOfWeek` may remain on saved entries. They're ignored.

## Checking changes

There are no automated tests, to keep the project simple. After changing the worship API or page, try it on a deploy preview (see below) on both phone and desktop: add a song, add an existing song, edit, remove from a week, delete, and check the repertoire and song history.

## Making changes

1. Create a branch and make the change.
2. Open a pull request. Netlify posts a **deploy preview** link. The worship page there uses the separate `worship-preview` store with the same passcode, so try things freely.
3. Merge into `main`, and Netlify deploys to production in about a minute.
4. To undo a bad deploy, go to Netlify → **Deploys**, open a previous deploy, and click **Publish deploy**. Blobs data isn't affected by rollbacks.

**Running locally:** open `index.html` directly to see the public website. For the worship page, use the Netlify CLI: run `netlify dev` with `WORSHIP_PASSCODE` set. It uses the `worship-preview` store.

## Security notes

- The passcode is the only protection on the worship page. It's compared in constant time; it isn't rate-limited beyond the 0.5 s delay. Use a long passcode.
- The page escapes all user-entered text before rendering it.
- Security headers are set in `netlify.toml`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` and `Permissions-Policy`.
- No secrets are stored in the repository.

## Search engines

- The homepage is indexable, with title, description, Open Graph and Twitter tags (image `img/share.jpg`) and `Church` structured data (JSON-LD).
- `gracias.html` and `/alabanza/` are marked `noindex`.
- When the homepage changes significantly, update `<lastmod>` in `sitemap.xml`.
- If the site moves to a new domain, update the absolute URLs in `index.html`, `robots.txt` and `sitemap.xml`.
