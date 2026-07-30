# ⛪ Church Website

> **Live Site:** *(coming soon)*
> **Built for:** Iglesia de Dios M.I
> **Status:** ✅ Website live &nbsp;|&nbsp; 🚧 Backend & automation in progress

---

## 📖 About

A full-stack church website built for a real Christian congregation. The site serves as the church's digital home — sharing service times, events, sermons, and contact information with the local Spanish-speaking community.

The site is being expanded with a Node.js backend that powers Facebook livestream automation and AI-generated sermon notes. Events and contact form handling use lightweight, fully-managed services (Google Calendar embed and Netlify Forms) rather than custom backend code — a deliberate choice to keep infrastructure simple where a simple tool already solves the problem well, and reserve custom backend work for where it's actually needed: authenticating with Meta's Graph API and orchestrating the Claude-powered sermon notes pipeline.

---

## ✨ Features

### ✅ Completed
- Fully responsive single-page website in Spanish
- Warm, traditional design with custom red & cream color palette
- Animated diagonal photo collage (scroll-triggered slide-in)
- Service times, About/Mission, Events, Sermons, and Contact sections
- **Google Calendar integration** — public calendar embedded live; church staff add events directly in Google Calendar and the site updates automatically, no code changes needed
- **Working contact form** — built on Netlify Forms (serverless form handling, spam protection via honeypot field, Reply-To automatically set to the visitor's email so replies go directly to them)
- **Facebook livestream feed** — official Meta Page Plugin embedded in the Sermons section; automatically stays current with the Page's latest posts/videos with zero manual updates and zero backend
- AI Sermon Notes Generator — paste any Facebook video URL and Claude generates:
  - Main scripture & verse text
  - Key sermon points
  - Core insights
  - Reflection questions
  - Practical weekly application
- Scroll-reveal animations throughout
- Mobile-responsive navigation with hamburger menu
- Demo mode for AI feature (works without API key for portfolio demos)

### 🚧 In Progress — Priority Order SUBJECT TO CHANGE

#### 1. 🤖 AI Sermon Notes — Full Pipeline
- [ ] Feed fetched livestream video/transcript directly into Claude
- [ ] Auto-generate and auto-display structured sermon notes (no manual paste step)

### ✅ Decided — Not Building
- **Contact form backend (Nodemailer):** Netlify Forms already handles this reliably for free, with Reply-To support. A custom Node/Express + Nodemailer route would demonstrate a skill already covered by other backend work, so it's intentionally out of scope.
- **Meta Graph API + Page Access Token for livestreams:** Originally planned, but requires phone-verifying a Facebook Business account and generating/maintaining a Page Access Token — both blockers given the church admin's account setup at the time. Instead, the **Facebook Page Plugin** (an official Meta-hosted embed, `developers.facebook.com/docs/plugins/page-plugin`) is used in the Sermons section. It requires zero authentication, zero tokens, and zero backend — Facebook's own script keeps it automatically up to date with the Page's latest posts and videos, so there's no manual weekly update step for church staff. The tradeoff: it renders in Facebook's native widget style rather than fully custom-styled cards, and it doesn't feed structured data into the AI sermon notes pipeline (see below). If Graph API access becomes viable later (e.g., admin account gets phone-verified), this can be revisited.

### 💡 Planned (Future)
- [ ] AI sermon notes from transcript (low priority for now)
- [ ] AssemblyAI transcription fallback
- [ ] WhatsApp contact button
- [ ] Spanish/English language toggle
- [ ] Custom domain

---

## 🏗 Architecture

### Current (Phase 1) — Live
```
Browser → Netlify (static HTML/CSS/JS)
                ↓
         ┌──────────────────────────┐
         │  Netlify Forms            │  ← Contact form (serverless, built-in)
         │  Google Calendar (embed)  │  ← Events (public calendar, no backend)
         │  Facebook Page Plugin     │  ← Livestreams (Meta-hosted embed, no backend)
         └──────────────────────────┘
                ↓
         Anthropic API (Claude)
         called directly from browser
         when user pastes a FB video URL
```

### Future (Phase 2) — AI Pipeline
```
Facebook Livestream
        ↓
Meta Graph API → video captions/transcript
        ↓
[fallback] AssemblyAI → audio transcription
        ↓
Anthropic API (Claude Sonnet)
→ structured sermon notes in Spanish
        ↓
Auto-displayed on website
```

> **Note:** the AI pipeline above would require the Meta Graph API + Page Access Token (see "Decided — Not Building" above for why this isn't currently in place). Revisit if/when that becomes viable.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Google Fonts (Playfair Display, Lora, Cormorant Garamond) |
| AI (sermon notes) | Anthropic API — Claude Sonnet |
| Events | Google Calendar (public embed, no backend) |
| Contact form | Netlify Forms (serverless, built-in) |
| Livestream feed | Facebook Page Plugin (Meta-hosted embed, no backend) |
| Frontend hosting | Netlify (free tier) |
| Version control | GitHub |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (only needed if/when the AI sermon notes pipeline is built)
- A Facebook account with Editor access to the church page
- Church Google Calendar made public (no API key needed for the embed)
- Free account at [Anthropic](https://console.anthropic.com) (for AI sermon notes)
- Free account at [Render.com](https://render.com) (for the backend, once built)

### Frontend
The site is a single HTML file — no build step needed.
```bash
git clone https://github.com/kdvasquez/church-website.git
cd church-website

# Open in browser
open index.html

# Or drag folder onto netlify.com/drop to deploy
```

### Environment Variables
Only needed if/when the AI sermon notes pipeline is built — the site currently runs with no secrets or backend at all. See `.env.example`:
```env
# Anthropic (AI sermon notes — future)
ANTHROPIC_API_KEY=your_key_here

PORT=3000
```

> ⚠️ Never commit `.env` — it's in `.gitignore`.

### Backend
```bash
npm install
node server.js
# Server running at http://localhost:3000
```

---

## 📁 Project Structure

```
church-website/
├── index.html          # Full frontend (single file)
├── img/                # Church logo and photos
├── server.js           # Node.js backend — Facebook/Claude pipeline (in progress)
├── package.json
├── .env.example        # Environment variable template
├── .gitignore
└── README.md
```

---

## 🔑 What You Need From the Church

| What | Who provides it | How hard |
|---|---|---|
| Google Calendar made public | Whoever manages the calendar | Calendar Settings → Access permissions |

---

## 🔑 API Setup Guide

### 1. Google Calendar (Events — done, no API key needed)
1. Church admin opens Google Calendar → Settings → your calendar
2. Scroll to "Access permissions" → check **"Make available to public"** and **"See all event details"**
3. Copy the embed code from **Integrate calendar** and drop it into the site — no API key, no backend

### 2. Netlify Forms (Contact form — done)
1. Form includes `data-netlify="true"` and a hidden `form-name` field
2. Netlify auto-detects the form at deploy time — no config needed
3. Reply-To is set dynamically via a hidden `reply-to` field, populated with the visitor's email on submit
4. Notifications configured under **Site settings → Notifications → Form submission notifications**

### 3. Facebook Page Plugin (Livestreams — done, no API key needed)
1. Go to [developers.facebook.com/docs/plugins/page-plugin](https://developers.facebook.com/docs/plugins/page-plugin)
2. Enter the church Page URL, set tabs to `timeline`, enable "Adapt Container Width"
3. Copy the generated `<div class="fb-page">` + SDK `<script>` snippet into the site — no login, no token, no backend
4. Facebook's own script keeps the embed automatically current; no maintenance required

### 4. Anthropic API (AI sermon notes)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key → copy to `.env`

---

## 🌐 Deployment

### Frontend → Netlify
```bash
# Push to GitHub, then connect the repo in Netlify:
# Netlify → Add new site → Import an existing project → GitHub → select repo
# Publish directory: leave blank (root)
# Auto-deploys on every push to main
```

### Backend → Render.com
```bash
# 1. Push to GitHub
# 2. Render.com → New Web Service → connect repo
# 3. Add environment variables in Render dashboard
# 4. Deploy → live at https://your-app.onrender.com
```

---

## 👤 Author

Built by **Karla Vasquez**
[github.com/kdvasquez](https://github.com/kdvasquez) · [kdvasquez.github.io](https://kdvasquez.github.io)

*A real project built for a real church community.*

---

## 📄 License

MIT — feel free to use this as a template for your own church or community website.