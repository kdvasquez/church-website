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

#### 1. 📺 Facebook Livestream → Auto Weekly Update
- [ ] Meta Graph API integration (requires Facebook Editor access to church page)
- [ ] Long-lived Page Access Token setup (exchanged server-side, never exposed to the client)
- [ ] Backend fetches latest video/livestream link + title every week automatically
- [ ] Sermons section updates with new link, thumbnail, and date — no manual work

#### 2. 🤖 AI Sermon Notes — Full Pipeline
- [ ] Feed fetched livestream video/transcript directly into Claude
- [ ] Auto-generate and auto-display structured sermon notes (no manual paste step)

### ✅ Decided — Not Building
- **Contact form backend (Nodemailer):** Netlify Forms already handles this reliably for free, with Reply-To support. A custom Node/Express + Nodemailer route would demonstrate a skill already covered by the Facebook/Graph API backend work, so it's intentionally out of scope.

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
         └──────────────────────────┘
                ↓
         Anthropic API (Claude)
         called directly from browser
         when user pastes a FB video URL
```

### In Progress (Phase 2) — Backend
```
                    ┌─────────────────────────────┐
                    │   Node.js Server (Render.com)│
                    │                             │
Facebook Page ─────►│ Meta Graph API → Latest     │
(Editor access)     │ livestream link + title      │
                    └──────────────┬──────────────┘
                                   │
                              Church Website
                              (Netlify)
                         displays everything live
```

### Future (Phase 3) — Full AI Pipeline
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

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Google Fonts (Playfair Display, Lora, Cormorant Garamond) |
| AI (sermon notes) | Anthropic API — Claude Sonnet |
| Events | Google Calendar (public embed, no backend) |
| Contact form | Netlify Forms (serverless, built-in) |
| Livestream updates | Meta Graph API + Node.js backend |
| Frontend hosting | Netlify (free tier) |
| Backend hosting | Render.com (free tier) |
| Version control | GitHub |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (for the Facebook/AI backend piece only)
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
Create a `.env` file in the project root (see `.env.example`) — only needed once the Facebook/AI backend is built:
```env
# Meta Graph API (Facebook)
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# Anthropic (AI sermon notes)
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
| Facebook Editor role | Church page admin | 30 seconds — Settings → Page Roles |
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

### 3. Meta Graph API (Facebook Livestreams — in progress)
1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → Business
2. Add church Facebook page to the app
3. Go to Tools → Graph API Explorer
4. Select app + page → check permissions:
   - `pages_read_engagement`
   - `pages_show_list`
5. Generate a long-lived Page Access Token (exchanged server-side, never exposed client-side)

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