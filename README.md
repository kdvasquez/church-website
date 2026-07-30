# ⛪ Church Website

**Live Site:** *(add your Netlify URL here)*
**Built for:** Iglesia de Dios Pentecostal M.I. Soledad

A bilingual church website built for a real congregation — sharing service times, events, sermons, and contact info with the local Spanish-speaking community.

---

## ✨ What It Does

- 📅 **Events** — pulled live from a public Google Calendar. Church staff add events directly in Google Calendar; the website updates automatically.
- ✉️ **Contact form** — powered by Netlify Forms. No backend needed, and replies go straight to the visitor's email.
- 📺 **Livestreams** — embedded via the official Facebook Page Plugin. Always shows the latest posts/videos automatically, with zero manual updates.
- 🎨 Fully responsive, Spanish-language design with a custom red & cream color palette.

---

## 🎯 The Goal (In Progress)

The next big piece: **AI-generated sermon notes.**

The plan is to build a small **Node.js backend** that talks to the **Meta Graph API** to pull the church's latest livestream video, then send that video/transcript to **Claude (Anthropic's AI)** to automatically generate:

- Key scripture references
- Main sermon points
- Reflection questions
- A practical weekly takeaway

...all in Spanish, and all without anyone having to write notes by hand.

**Why this isn't built yet:** the Graph API requires a verified Facebook Business account and an access token, and that verification is currently blocked on the admin's end. Once that's resolved, this becomes the main focus.

---

## 🛠 Built With

| Layer | Tool |
|---|---|
| Frontend | HTML, CSS, JavaScript (no framework) |
| Fonts | Google Fonts |
| Events | Google Calendar (public embed) |
| Contact form | Netlify Forms |
| Livestreams | Facebook Page Plugin |
| Hosting | Netlify |
| AI (planned) | Anthropic Claude |
| Backend (planned) | Node.js + Meta Graph API |

---

## 🚀 Running It Locally

```bash
git clone https://github.com/kdvasquez/church-website.git
cd church-website
open index.html
```

That's it — it's a single HTML file, no build step required.

To deploy: push to GitHub, then connect the repo in Netlify (auto-deploys on every push).

---

## 👤 Author

**Karla Vasquez**
[github.com/kdvasquez](https://github.com/kdvasquez) · [kdvasquez.github.io](https://kdvasquez.github.io)

---

## 📄 License

MIT — feel free to use this as a template for your own church or community website.