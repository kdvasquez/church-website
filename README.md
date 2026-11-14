# Iglesia de Dios Pentecostal M.I. Soledad — Website

This is the church's website, plus a private page where the worship team keeps track of the songs they sing. This guide is written for whoever looks after the website. You don't need to know how to code to use it.

- **Church website:** https://iddpmisoledad.netlify.app/
- **Worship team page:** https://iddpmisoledad.netlify.app/alabanza/ (needs the team passcode)

---

## The big picture

The website is a few files kept on **GitHub**. Whenever a file on GitHub changes, **Netlify** publishes the new version on the internet automatically, usually within 1–2 minutes. There's nothing to install and nothing to pay for.

These are the accounts the website depends on. Whoever looks after the website needs to be able to sign in to them:

| Account | What it's for |
|---|---|
| **[GitHub](https://github.com/kdvasquez/church-website)** | Where the website's files live. Change a file here and the website updates. |
| **[Netlify](https://app.netlify.com/)** | Publishes the website. It also receives contact form messages, stores the worship team's songs, and holds the worship team passcode. |
| **Google Calendar** | The events shown on the website come from the church's Google Calendar. |
| **Facebook** | The church's Facebook page, linked from the website. |
| **[Google Search Console](https://search.google.com/search-console)** (optional) | Helps the website show up in Google searches. |

---

## Everyday tasks

### Change text on the website (service times, phone, address, about us)

1. Go to the [website files on GitHub](https://github.com/kdvasquez/church-website) and sign in.
2. Click **`index.html`**, which is the main page.
3. Click the **pencil icon** (✎, "Edit this file") near the top right.
4. Press **Ctrl+F** (or **Cmd+F** on a Mac) and search for the words you want to change, for example `10:00`.
5. Change **only the words people see**. Leave everything between `<` and `>` exactly as it is.
   - Example: in `<p>Domingo 10:00 AM</p>`, change only `Domingo 10:00 AM`.
6. Click **Commit changes…**, write a short note like "Changed Sunday time", and click **Commit changes** again.
7. Wait 1–2 minutes, then open the website to check. If you don't see the change, refresh the page.

> Not sure? Make one small change at a time and check the website after each one. If something looks wrong, see **"If something breaks"** below.

### Replace a photo

1. Make the new photo smaller first: under 1,500 pixels wide and under 500 KB. Any free online "image compressor" works.
2. Rename it to **exactly** the same name as the photo it replaces, for example `group.jpg`.
3. On GitHub, open the **`img`** folder, click **Add file → Upload files**, drag the photo in, and click **Commit changes**.
4. Check the website after 1–2 minutes.

The photos and where they appear:

| File | Where it shows |
|---|---|
| `img/background.jpg` | The big picture at the top of the website |
| `img/share.jpg` | The picture people see when the website link is shared by text, WhatsApp or Facebook. It's a copy of the top picture, sized 1200 × 630 pixels. |
| `img/church-cover2.jpg`, `img/church-cover5.jpg`, `img/group.jpg` | Photos in the "Quiénes Somos" area |
| `img/churchlogo-removebg-preview.png` | The church logo at the top and bottom of the page |
| `img/map.png` | The map picture in the "Contáctenos" area (it opens directions when clicked) |
| `favicon.ico` and the `img/icons` folder | The small logo in browser tabs, on phone home screens and in Google results |

> **About the link preview picture:** apps like Facebook and WhatsApp remember a link's picture for a while. To make Facebook use a new one right away, paste the website address into Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/) and click **Scrape Again**.

### Add or change events

Events come straight from the church's **Google Calendar**. Add, change or delete them there, and the website updates by itself. The calendar must stay set to public, or visitors won't see the events.

### Read contact form messages

Messages sent from the website's contact form go to **Netlify**:

1. Sign in to [Netlify](https://app.netlify.com/) and open the church's project.
2. Click **Forms**, then **contact**.

To also get the messages by email, open **Forms → Form notifications** in Netlify and add the church's email address.

### Help the website show up on Google

The website is already set up for search engines. To help Google find it sooner, someone with the church's Google account can:

1. Open [Google Search Console](https://search.google.com/search-console) and add the website as a **URL prefix**: `https://iddpmisoledad.netlify.app/`.
2. Follow Google's steps to prove the website belongs to you. The **HTML tag** option gives you one line of code, and a developer can add it to `index.html` for you.
3. Under **Sitemaps**, type `sitemap.xml` and click **Submit**.

Google usually lists a new website within a few days to a few weeks.

---

## Worship team page (Equipo de Alabanza)

**Address:** https://iddpmisoledad.netlify.app/alabanza/

This is a private page for the worship team. It isn't linked from the website and doesn't show up on Google. Everything on it is in Spanish.

### How the team uses it

- **Getting in:** enter the team passcode. The phone or computer remembers it until someone taps **Salir**.
- **Planning a Sunday (Armar la lista):**
  1. Tap **Este domingo** (the coming Sunday) or **Próximo domingo** (the Sunday after that). You can also pick any date.
  2. Type a song's name. Songs already in the repertoire appear as you type. Tap one to add it.
  3. If the song is new, tap **＋ Nueva canción**, fill in the artist, alabanza or adoración, and the key, and it's added to the repertoire and the list at once.
  4. Tap **✕** to take a song off the list.
- **The last 3 weeks:** shows **Este domingo**, **Semana pasada** and **Hace dos semanas**. Older weeks disappear from this section by themselves, but nothing is deleted: every song stays in the repertoire.
  - A red dot means alabanza, and a blue dot means adoración.
  - ✎ fixes a song's details. On a computer, hover over a song to see ✎ and ✕.
- **The repertoire (Todas las canciones):** every song the team has sung, with how many times, the key, and when it was last sung.
  - Search, filter and sort the list. It shows 10 songs at a time.
  - **+** adds a song to this Sunday. **✓** means it's already there.
  - Tap a song's **name** to see every Sunday it was sung in the past year and which songs were sung with it.
  - **✎** edits a song. Deleting a song from the repertoire entirely is in that same window.
- **Charts:** the most-sung songs, the balance between alabanza and adoración, and songs that haven't been sung in a while.

### Keep a backup

The songs are stored only in Netlify. Every month or two, open the worship page and click **⤓ Descargar copia** next to the repertoire search. It downloads a file with every song and date, which opens in Excel or Google Sheets. Keep it somewhere safe, like the church's Google Drive.

### Change the team passcode

1. Sign in to [Netlify](https://app.netlify.com/) and open the church's project.
2. Go to **Project configuration → Environment variables**.
3. Find **`WORSHIP_PASSCODE`**, click it, and change the value. Use something long that's hard to guess.
4. Go to **Deploys** and click **Trigger deploy → Deploy site**.
5. After 1–2 minutes the new passcode works, and everyone is asked for it the next time they open the page.

Anyone who has the passcode can see and change the song list, so share it only with the worship team.

---

## If something breaks

Netlify keeps every past version of the website, so you can always go back:

1. Sign in to [Netlify](https://app.netlify.com/) and open the church's project.
2. Click **Deploys**. Each line is a version of the website, newest at the top.
3. Click the last version that worked, then click **Publish deploy**.

The website goes back to that version right away. On GitHub, you can also open the file you changed, click **History**, and see exactly what changed and when.

> Going back to an older version doesn't affect the worship team's songs or the contact form messages. Those are stored separately in Netlify.

---

## Handing the website over to a new admin

When someone else takes over, give them access to each account:

- [ ] **GitHub:** in the repository, go to **Settings → Collaborators** and add their GitHub account. To give them the website completely, use **Settings → Transfer ownership** instead. If you do, reconnect the new repository in Netlify, because Netlify publishes from GitHub.
- [ ] **Netlify:** add them as a team member, or transfer the project to their account. Look under the team's **Members** settings.
- [ ] **Google Calendar:** share the church calendar with them, with permission to make changes.
- [ ] **Facebook:** make them an admin of the church's Facebook page.
- [ ] **Google Search Console** (if set up): add them as an owner.
- [ ] Tell them the **worship team passcode**, or have them change it (see above).
- [ ] Download a fresh **backup** of the worship songs (see above).

> Netlify and GitHub sometimes rename their menus. If a button isn't where this guide says, search their help pages for the task, for example "Netlify invite team member".

---

## For developers

Everything below is technical detail for someone comfortable with code.

**Tech stack**

| Part | What it uses |
|---|---|
| Public website | Plain HTML, CSS and JavaScript, with no framework and no build step |
| Hosting | Netlify, deployed automatically from the `main` branch. Pull requests get deploy previews at `https://deploy-preview-<number>--iddpmisoledad.netlify.app`. |
| Contact form | Netlify Forms (form name `contact`), with a honeypot field. It redirects to `gracias.html`. |
| Events and messages | Embedded Google Calendar and Facebook Page Plugin. The Facebook embed currently shows only the page header, without posts. That's on Facebook's side; the code follows their instructions. |
| Worship page | `alabanza/index.html` and `alabanza/app.js`. The charts are hand-drawn SVG, with no libraries. |
| Worship data | A Netlify Function at `/api/songs` (`netlify/functions/songs.mjs`, Node.js) that stores data in Netlify Blobs. Its only dependency is `@netlify/blobs`. |
| Access | A shared passcode in the `WORSHIP_PASSCODE` environment variable, sent in the `x-passcode` header |
| Fonts | Google Fonts: Playfair Display, Lora and Cormorant Garamond |
| Headers | Security and indexing headers are set in `netlify.toml` |

**Files**

```
index.html                    Public website (styles and scripts inline)
gracias.html                  Contact form confirmation page (noindex)
img/                          Photos, logo, link preview image (share.jpg)
favicon.ico, img/icons/       Logo icons; site.webmanifest lists them for phones
alabanza/                     Worship page (noindex)
netlify/functions/songs.mjs   Worship API: passcode check and storage
netlify.toml                  Publish settings, headers, functions folder
package.json                  @netlify/blobs dependency for the function
robots.txt, sitemap.xml       Search engine settings
```

**Worship data model**

- `s/<id>` holds a repertoire song: `{ id, song, artist, genre, key }`.
- `e/<id>` holds one time a song was sung: `{ id, songId, date }`.
- Weeks run Monday through Sunday and are named by their Sunday.
- Production uses the `worship` store. Deploy previews and branch deploys use `worship-preview`, so testing a preview never touches the real list.
- Old fields such as `songOfWeek` may remain in saved data. They're no longer shown.
- `meta/weeks-end-on-sunday` marks a one-time date migration that has already run.

**Running it locally:** open `index.html` directly in a browser to see the public website. The worship page needs its function, so run it with the Netlify CLI (`netlify dev`) or use a deploy preview.

**Search engines:** the homepage is indexable, with title, description, Open Graph and Twitter tags, and `Church` structured data. When the homepage changes significantly, update `<lastmod>` in `sitemap.xml`. If the site moves to a new domain, update the URLs in `index.html`, `robots.txt` and `sitemap.xml`.

---

Created by [Karla Vasquez](https://github.com/kdvasquez).
