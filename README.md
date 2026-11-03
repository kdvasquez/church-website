# Iglesia de Dios M.I. Soledad

A simple, welcoming website for a church community in Soledad, California. Built in Spanish to help visitors find service times, learn about the church, see upcoming events, and get in touch. It also includes a private dashboard for the worship team.

## What's included

- Service times, church information, and directions
- A Google Calendar embed for upcoming events
- A Facebook Page embed and links to church messages
- A contact form configured for Netlify Forms
- A private worship team dashboard at `/alabanza/`
- Responsive layouts for phones and computers

## Tech stack

| Part | What it uses |
|---|---|
| Public website | Plain HTML, CSS and JavaScript, with no framework and no build step |
| Hosting | [Netlify](https://www.netlify.com/), deployed automatically from the `main` branch on GitHub |
| Contact form | Netlify Forms, with a hidden honeypot field to catch spam |
| Events | Embedded Google Calendar |
| Messages | Facebook Page Plugin (Meta's embed) |
| Worship dashboard page | Plain HTML, CSS and JavaScript (`alabanza/index.html`, `alabanza/app.js`); the charts are drawn as SVG by hand, with no chart library |
| Worship dashboard data | A Netlify Function (`netlify/functions/songs.mjs`, Node.js) that saves songs in Netlify Blobs; its only dependency is `@netlify/blobs` |
| Dashboard access | A shared team passcode, stored in Netlify as the `WORSHIP_PASSCODE` environment variable |
| Fonts | Google Fonts: Playfair Display, Lora and Cormorant Garamond |
| Security headers | Set in `netlify.toml` |

## Project structure

```
index.html                    Public website
gracias.html                  Contact form confirmation page
img/                          Photos and logo
alabanza/index.html           Worship dashboard page and styles
alabanza/app.js               Worship dashboard behavior
netlify/functions/songs.mjs   Worship dashboard API (passcode check and storage)
netlify.toml                  Netlify settings, security headers, functions folder
package.json                  Dependency for the function (@netlify/blobs)
robots.txt, sitemap.xml       Search engine settings
```

## Preview locally

Open `index.html` in your browser. The calendar and Facebook embed need an internet connection; contact form submissions need a Netlify deployment with form detection enabled.

The worship dashboard needs its Netlify Function, so it only works on Netlify, either on the live site or a deploy preview, or locally with `netlify dev`.

## Deploy to Netlify

`netlify.toml` sets the publish directory to the repository root with no build command. Netlify installs the function's dependency from `package.json` automatically.

1. Commit your changes and push them to the `main` branch on [GitHub](https://github.com/kdvasquez/church-website).
2. Sign in to [Netlify](https://app.netlify.com/) and choose **Add new project → Import an existing project**.
3. Connect GitHub and select `kdvasquez/church-website`.
4. Use these deployment settings:
   - **Production branch:** `main`
   - **Base directory:** leave blank
   - **Build command:** leave blank
   - **Publish directory:** `.` (the repository root)
5. Deploy the project. Future pushes to `main` will deploy automatically.
6. In **Forms**, enable form detection if needed, then redeploy. Confirm that the `contact` form appears and submit a test message from the published site.
   Successful submissions redirect to the Spanish confirmation page, `gracias.html`.
7. Set up form email notifications for the church inbox if you want messages delivered by email.
8. Set the worship team passcode (see below).

If this repository is already connected to a Netlify project, use that project instead of creating another one.

**Deploy previews:** opening a pull request on GitHub creates a preview at `https://deploy-preview-<number>--iddpmisoledad.netlify.app`, where you can try changes before merging.

The contact number is **831-287-7965** throughout the site.

The site currently references `https://iddpmisoledad.netlify.app/`. Confirm that this is your published address, or update the URLs in `index.html`, `robots.txt`, and `sitemap.xml` to match.

## Worship team dashboard (`/alabanza`)

A private page where the worship team logs the songs sung each week. It is not linked from the public site and is hidden from search engines. Everything is in Spanish.

**Features**

- **Passcode screen:** the whole page asks for the team passcode. Each device remembers it until someone taps **Salir**.
- **Song of the week:** shown at the top, along with the number of songs in the repertoire.
- **Building a week's list ("Armar la lista"):**
  - Pick the service date, or tap **Este domingo** or **Próximo domingo**. The list for that week shows underneath.
  - Search the repertoire as you type and tap a song to add it. Songs already in the list show "✓ ya está".
  - If the song isn't in the repertoire, choose **＋ Nueva canción**, fill in artist, genre and key, and it's added to the repertoire and the list together.
  - ★ marks the song of the week, and ✕ removes a song from the list.
- **Last 3 weeks:** shows this week, last week and the week before. If next Sunday's list has been started, it shows next week, this week and last week instead. Older weeks drop off automatically but stay in the repertoire.
  - ★ stars or unstars the song of the week. There's only one per week.
  - ✎ edits a song.
  - ✕ removes a song from that week only.
  - A colored dot marks the genre: red for alabanza, blue for adoración.
- **Repertoire:** every song, with how many times it was sung, its key, and when it was last sung.
  - It can be searched, filtered by genre and sorted.
  - It shows 10 songs per page.
  - ★ makes a song this week's song of the week. **+** adds it to this week, and ✓ means it's already there.
  - ✎ edits a song. The editor can also delete a song from the repertoire, along with its history.
- **Song history:** tapping a song's name shows every week it was sung in the last year, with the other songs from that set, and the songs it's most often paired with. Older history stays saved and is only hidden from this view.
- **Charts:**
  - A pie chart of the most-sung songs.
  - The balance between alabanza and adoración.
  - Songs that haven't been sung in a while.

**How the data is stored**

- Songs are saved in Netlify Blobs through `netlify/functions/songs.mjs`, at the address `/api/songs`. There's no database or other service to set up.
- Each repertoire song is stored once (name, artist, genre, key), so an edit shows everywhere. Each time a song is sung is a separate small record pointing to that song.
- The live site uses the `worship` store. Deploy previews and branch deploys use a separate `worship-preview` store, so testing a preview never touches the real list.
- The data is in the Netlify project under **Blobs**.

**Passcode**

- In Netlify, open the project and go to **Project configuration → Environment variables**. Add `WORSHIP_PASSCODE` with a long passcode, then redeploy. Until it is set, the page says it isn't configured.
- To change it, update the variable and redeploy. Everyone will be asked for the new one.
- Anyone with the passcode can view and edit the list, so share it only with the worship team.

## Keeping it up to date

- Edit `index.html` to update service times, contact details, and church information.
- Add or replace photos in `img/`; resize and compress large images before uploading.
- Manage events in the linked Google Calendar, and make sure visitors can view it without signing in.
- The Facebook embed currently shows only the page header, without posts. This is on Facebook's side; the code follows Facebook's instructions, and the posts will reappear if Facebook fixes it.
- Check the contact form on the live site after changes.

Created by [Karla Vasquez](https://github.com/kdvasquez).
