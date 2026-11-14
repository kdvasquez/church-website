# Worship team page (Equipo de Alabanza)

**Address:** https://iddpmisoledad.netlify.app/alabanza/

A private page where the worship team plans each Sunday's songs and keeps track of everything they've sung. It isn't linked from the church website and doesn't show up on Google. Everything on the page is in Spanish.

← Back to the [main guide](../README.md)

---

## How the team uses it

### Getting in

Open the address and enter the team passcode. The phone or computer remembers it until someone taps **Salir**.

### Planning a Sunday (Armar la lista)

1. Tap **Este domingo** (the coming Sunday) or **Próximo domingo** (the Sunday after that). You can also pick any date.
2. Type a song's name. Songs already in the repertoire appear as you type. Tap one to add it.
3. If the song is new, tap **＋ Nueva canción**. Fill in the artist, alabanza or adoración, and the key, and it's added to the repertoire and the list at once.
4. Tap **✕** to take a song off the list.

A song can only be in a week's list once. If it's already there, it shows "✓ ya está".

### The last 3 weeks

The page shows **Este domingo**, **Semana pasada** and **Hace dos semanas**. If someone has started next Sunday's list, it shows **Próximo domingo**, **Este domingo** and **Semana pasada** instead.

- Weeks run Monday through Sunday. From Monday on, "Este domingo" means the coming Sunday.
- Older weeks disappear from this section by themselves, but nothing is deleted: every song stays in the repertoire, with its history.
- A red dot means alabanza, and a blue dot means adoración.
- ✎ fixes a song's details, and ✕ takes it off that week. On a computer, hover over a song to see them.

### The repertoire (Todas las canciones)

Every song the team has sung, with how many times, the key, and when it was last sung.

- Search, filter by alabanza or adoración, and sort the list. It shows 10 songs at a time.
- **+** adds a song to this Sunday. **✓** means it's already there.
- Tap a song's **name** to see every Sunday it was sung in the past year and which songs were sung with it.
- **✎** edits a song: name, artist, alabanza or adoración, and key. A change shows everywhere that song appears. Deleting a song from the repertoire entirely, along with its history, is in that same window.

### Charts

- **Las más cantadas:** the most-sung songs.
- **Alabanza y adoración:** the balance between the two.
- **Hace tiempo que no se cantan:** songs that haven't been sung in a while.

---

## For whoever looks after the page

### Keep a backup

The songs are stored only in Netlify. Every month or two:

1. Open the worship page.
2. Click **⤓ Descargar copia** next to the repertoire search.
3. Save the downloaded file somewhere safe, like the church's Google Drive. It opens in Excel or Google Sheets and lists every song and date.

### Change the team passcode

1. Sign in to [Netlify](https://app.netlify.com/) and open the church's project.
2. Go to **Project configuration → Environment variables**.
3. Find **`WORSHIP_PASSCODE`**, click it, and change the value. Use something long that's hard to guess.
4. Go to **Deploys** and click **Trigger deploy → Deploy site**.
5. After 1–2 minutes the new passcode works, and everyone is asked for it the next time they open the page.

Anyone who has the passcode can see and change the song list, so share it only with the worship team.

### If the page says it isn't configured

The passcode setting is missing in Netlify. Add `WORSHIP_PASSCODE` as described above, then redeploy.

### Where the songs are kept

In Netlify, under the project's **Blobs** section, in a store named `worship`. You don't need to touch it; the page manages it. Putting back an older version of the website doesn't affect the songs.
