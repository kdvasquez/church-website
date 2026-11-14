# Iglesia de Dios Pentecostal M.I. Soledad — Website

This is the church's website, plus a private page where the worship team keeps track of the songs they sing. This guide is written for whoever looks after the website. You don't need to know how to code to use it.

**Guides**

- This page covers the website and the accounts behind it.
- [Worship team page guide](docs/worship-team.md) covers the Equipo de Alabanza page.
- [Developer guide](docs/developers.md) covers how everything is built, for someone who codes.

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

A private page where the worship team plans each Sunday's songs and keeps track of their repertoire: https://iddpmisoledad.netlify.app/alabanza/

It has its own guide, covering how the team uses it, how to keep a backup of the songs, and how to change the passcode: **[docs/worship-team.md](docs/worship-team.md)**.

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
- [ ] Tell them the **worship team passcode**, or have them change it ([how](docs/worship-team.md#change-the-team-passcode)).
- [ ] Download a fresh **backup** of the worship songs ([how](docs/worship-team.md#keep-a-backup)).

> Netlify and GitHub sometimes rename their menus. If a button isn't where this guide says, search their help pages for the task, for example "Netlify invite team member".

---

## For developers

How the website is built, how the worship page stores its songs, how to run the tests, and how to make changes safely: **[docs/developers.md](docs/developers.md)**.

---

Created by [Karla Vasquez](https://github.com/kdvasquez).
