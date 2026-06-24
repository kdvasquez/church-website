# ⛪ Church Website

> **Live Site:** *(coming soon)*
> **Built for:** Iglesia de Dios Pentecostal M.I
> **Status:** ✅ Website live &nbsp;|&nbsp; 🚧 Backend & automation in progress

---

## 📖 About

A full-stack church website built for a real Christian congregation. The site serves as the church's digital home — sharing service times, events, sermons, and contact information with the local Spanish-speaking community.

The site is being expanded with a Node.js backend that powers three things automatically: pulling upcoming events from the church's Google Calendar, updating the latest Facebook livestream link every week, and handling contact form submissions — all with zero manual effort from church staff.

---

## ✨ Features

### ✅ Completed
- Fully responsive single-page website in Spanish
- Warm, traditional design with custom red & cream color palette
- Animated diagonal photo collage (scroll-triggered slide-in)
- Service times, About/Mission, Events, Sermons, and Contact sections
- AI Sermon Notes Generator — paste any Facebook video URL and Claude generates:
  - Main scripture & verse text
  - Key sermon points
  - Core insights
  - Reflection questions
  - Practical weekly application
- Contact form UI (Formspree placeholder wired in)
- Scroll-reveal animations throughout
- Mobile-responsive navigation with hamburger menu
- Demo mode for AI feature (works without API key for portfolio demos)

### 🚧 In Progress — Priority Order SUBJECT TO CHANGE

#### 1. 📧 Contact Form Backend
- [ ] Node.js + Express server on Render.com
- [ ] Contact form submissions sent directly to church email via Nodemailer
- [ ] No third-party form service needed — fully owned backend

#### 2. 📅 Google Calendar → Auto Events
- [ ] Church admin makes calendar public + shares Calendar ID
- [ ] Backend fetches upcoming events via Google Calendar API (free, no auth needed for public calendars)
- [ ] Events section on website updates automatically — no manual edits ever
- [ ] Shows event name, date, time, and description

#### 3. 📺 Facebook Livestream → Auto Weekly Update
- [ ] Meta Graph API integration (requires Facebook Editor access to church page)
- [ ] Backend fetches latest video/livestream link + title every week automatically
- [ ] Sermons section updates with new link, thumbnail, and date — no manual work
- [ ] Permanent Page Access Token setup (one-time, never expires)

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
         Anthropic API (Claude)
         called directly from browser
         when user pastes a FB video URL
```

### In Progress (Phase 2) — Backend
```
                    ┌─────────────────────────────┐
                    │   Node.js Server (Render.com)│
                    │                             │
Contact Form ──────►│ Nodemailer → Church Email   │
                    │                             │
Google Calendar ───►│ Calendar API → Events data  │
(public calendar)   │                             │
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
| Events | Google Calendar API (free, public) |
| Livestream updates | Meta Graph API |
| Contact form | Node.js + Nodemailer (backend) |
| Frontend hosting | Netlify? (free tier) |
| Backend hosting | Render.com (free tier) |
| Version control | GitHub |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A Facebook account with Editor access to the church page
- Church Google Calendar ID (admin makes it public)
- Free accounts at: [Anthropic](https://console.anthropic.com), [Render.com](https://render.com)

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
Create a `.env` file in the project root (see `.env.example`):
```env
# Email (contact form)
EMAIL_USER=churchemail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Google Calendar
GOOGLE_CALENDAR_ID=your_calendar_id_here
GOOGLE_API_KEY=your_google_api_key_here

# Meta Graph API (Facebook)
FACEBOOK_PAGE_ID=your_page_id_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_token_here
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here

# Anthropic (AI sermon notes - future)
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
├── server.js           # Node.js backend (in progress)
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
| Google Calendar ID | Whoever manages the calendar | Make calendar public → copy ID |
| Church email + app password | Church leader | Gmail → Security → App Passwords |

---

## 🔑 API Setup Guide

### 1. Google Calendar (Events — easiest, start here)
1. Church admin opens Google Calendar → Settings → your calendar
2. Scroll to "Access permissions" → check **"Make available to public"**
3. Copy the **Calendar ID** (looks like `abc123@group.calendar.google.com`)
4. Go to [console.cloud.google.com](https://console.cloud.google.com) → Create project → Enable Calendar API → Create API Key
5. Paste both into `.env`

### 2. Meta Graph API (Facebook Livestreams)
1. Go to [developers.facebook.com](https://developers.facebook.com) → Create App → Business
2. Add church Facebook page to the app
3. Go to Tools → Graph API Explorer
4. Select app + page → check permissions:
   - `pages_read_engagement`
   - `pages_show_list`
5. Generate Access Token → run one-time permanent token exchange (in `server.js`)

### 3. Contact Form Email
1. Use the church Gmail account
2. Google Account → Security → 2-Step Verification → App Passwords
3. Generate a password for "Mail" → paste into `.env` as `EMAIL_PASS`

### 4. Anthropic API (AI sermon notes — future)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key → copy to `.env`

---

## 🌐 Deployment

### Frontend → Netlify
```bash
# Drag and drop your project folder onto netlify.com/drop
# Or connect GitHub repo for auto-deploy on every push
# Netlify → New Site → Import from GitHub → select repo
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
