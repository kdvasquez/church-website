# Iglesia de Dios M.I. Soledad

A simple, welcoming website for our church community in Soledad, California. Built in Spanish to help visitors find service times, learn about the church, see upcoming events, and get in touch.

## What's included

- Service times, church information, and directions
- A Google Calendar embed for upcoming events
- A Facebook feed and links to church messages
- A contact form configured for Netlify Forms
- Responsive layouts for phones and computers

Built with HTML, CSS, and JavaScript. No framework, dependencies, or build step required.

## Preview locally

Open `index.html` in your browser. The calendar and Facebook feed need an internet connection; contact form submissions need a Netlify deployment with form detection enabled.

## Deploy to Netlify

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
7. Set up form email notifications for the church inbox if you want messages delivered by email.

If this repository is already connected to a Netlify project, use that project instead of creating another one.

The site currently references `https://iddpmisoledad.netlify.app/`. Confirm that this is your published address, or update the URLs in `index.html`, `robots.txt`, and `sitemap.xml` to match.

## Keeping it up to date

- Edit `index.html` to update service times, contact details, and church information.
- Add or replace photos in `img/`; resize and compress large images before uploading.
- Manage events in the linked Google Calendar, and make sure visitors can view it without signing in.
- Check the Facebook feed and contact form on the live site before sharing it with the congregation.

Created by [Karla Vasquez](https://github.com/kdvasquez).
