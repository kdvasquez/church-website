// Equipo de Alabanza dashboard
(() => {
  const API = '/api/songs';
  const GENRE_NAME = { alabanza: 'Alabanza', adoracion: 'Adoración' };
  const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];
  const WEEKS_SHOWN = 3;
  const PAGE_SIZE = 10;
  let repPage = 1;
  const $ = id => document.getElementById(id);

  let passcode = '';
  let songs = [];
  let entries = [];
  let pendingDelete = null;   // entry id waiting for a second tap
  let editing = null;         // { songId, entryId }

  // ---------- remembered passcode (storage may be unavailable) ----------
  const saved = {
    get() { try { return localStorage.getItem('alabanzaPass') || ''; } catch { return ''; } },
    set(v) { try { localStorage.setItem('alabanzaPass', v); } catch {} },
    clear() { try { localStorage.removeItem('alabanzaPass'); } catch {} },
  };

  // ---------- utils ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]/g, '').replace(/\s+/g, ' ').trim();
  const toDate = d => new Date(d + 'T12:00:00Z');
  const fmtDayMonth = d => toDate(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const fmtWeekday = d => toDate(d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', timeZone: 'UTC' });
  const fmtShort = d => toDate(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const todayStr = () => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const weekOf = d => { const x = toDate(d); x.setUTCDate(x.getUTCDate() - x.getUTCDay()); return x.toISOString().slice(0, 10); };
  const addDays = (d, n) => { const x = toDate(d); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const thisWeek = () => weekOf(todayStr());
  function ago(d) {
    if (!d) return 'nunca';
    const days = Math.round((toDate(todayStr()) - toDate(d)) / 86400000);
    if (days <= 0) return 'hoy';
    if (days === 1) return 'ayer';
    if (days < 14) return `hace ${days} días`;
    if (days < 60) return `hace ${Math.round(days / 7)} semanas`;
    if (days < 365) return `hace ${Math.round(days / 30)} meses`;
    const y = Math.round(days / 365); return y === 1 ? 'hace 1 año' : `hace ${y} años`;
  }
  function toast(text) {
    const t = $('toast'); t.textContent = text; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2800);
  }
  const songById = id => songs.find(s => s.id === id);
  const findByName = name => songs.find(s => norm(s.song) === norm(name));

  // ---------- API ----------
  async function api(method, body) {
    const res = await fetch(API, {
      method,
      headers: { 'x-passcode': passcode, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) { const e = new Error(data.error || 'error'); e.status = res.status; e.data = data; throw e; }
    if (data.songs) { songs = data.songs; entries = data.entries; }
    return data;
  }
  function errorText(e) {
    if (e.status === 401) return 'Clave incorrecta.';
    if (e.status === 503) return 'El panel todavía no está configurado (falta la clave en Netlify).';
    if (e.status === 400) return 'Revisa los datos: falta la canción, el género o la fecha.';
    if (e.message === 'exists') return 'Ya hay otra canción con ese nombre en el repertorio.';
    if (e.message === 'already_that_week') return 'Esa canción ya está registrada en esa semana.';
    return 'No se pudo conectar. Revisa tu internet e intenta de nuevo.';
  }
  async function run(fn) {
    try { return await fn(); }
    catch (e) {
      toast(errorText(e));
      if (e.status === 401) $('logout').click();
      throw e;
    }
  }

  // ---------- lock ----------
  async function unlock(code, quiet) {
    passcode = code;
    $('lockBtn').disabled = true;
    try {
      await api('GET');
      saved.set(code);
      $('lock').hidden = true; $('app').hidden = false;
      render();
    } catch (e) {
      saved.clear();
      if (!quiet) $('lockMsg').textContent = errorText(e);
      $('pass').value = ''; $('pass').focus();
    } finally {
      $('lockBtn').disabled = false;
    }
  }
  $('lockForm').addEventListener('submit', e => { e.preventDefault(); $('lockMsg').textContent = ''; unlock($('pass').value); });
  $('logout').addEventListener('click', () => {
    saved.clear(); passcode = ''; songs = []; entries = [];
    $('app').hidden = true; $('lock').hidden = false; $('pass').focus();
  });

  // ---------- derived data ----------
  function repertoire() {
    return songs.map(s => {
      const mine = entries.filter(e => e.songId === s.id);
      const last = mine.reduce((m, e) => (e.date > m ? e.date : m), '');
      const now = mine.find(e => weekOf(e.date) === thisWeek());
      return { ...s, count: mine.length, last, thisWeekEntry: now || null };
    });
  }
  function shownWeeks() {
    const w0 = thisWeek();
    return Array.from({ length: WEEKS_SHOWN }, (_, i) => {
      const w = addDays(w0, -7 * i);
      const list = entries.filter(e => weekOf(e.date) === w)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || ''));
      return { w, i, list };
    });
  }

  // ---------- render ----------
  function render() {
    const rep = repertoire();
    const weeks = shownWeeks();
    $('stRep').textContent = songs.length;
    renderSotw(weeks);
    renderWeeks(weeks);
    renderChart(rep);
    renderSplit();
    renderStale(rep);
    renderRep(rep);
    $('songList').innerHTML = songs.map(s => `<option value="${esc(s.song)}">`).join('');
    $('artistList').innerHTML = [...new Set(songs.map(s => s.artist).filter(Boolean))].map(a => `<option value="${esc(a)}">`).join('');
    checkDup();
  }

  function renderSotw(weeks) {
    let found = null;
    for (const wk of weeks) { const e = wk.list.find(x => x.songOfWeek); if (e) { found = { wk, e }; break; } }
    const box = $('sotw');
    if (!found) {
      box.innerHTML = `<div class="label">Canción de la semana</div><h2>Sin elegir todavía</h2>
        <p class="empty">Toca la estrella ★ de una canción, en la semana o en el repertorio, para que aparezca aquí.</p>`;
      return;
    }
    const { wk, e } = found;
    const s = songById(e.songId);
    const when = wk.i === 0 ? 'esta semana' : 'semana del ' + fmtDayMonth(wk.w);
    box.innerHTML = `<div class="label">Canción de la semana · ${esc(when)}</div>
      <h2>${esc(s.song)}</h2>
      ${s.artist ? `<div class="who">${esc(s.artist)}</div>` : ''}
      <div class="meta"><span>${GENRE_NAME[s.genre]}</span>${s.key ? `<span>Tono: ${esc(s.key)}</span>` : ''}<span>${esc(fmtShort(e.date))}</span></div>`;
  }

  const WEEK_TITLES = ['Esta semana', 'Semana pasada', 'Hace 2 semanas'];
  const fmtDM = d => toDate(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');
  function renderWeeks(weeks) {
    $('weeks').innerHTML = weeks.map(({ w, i, list }) => `
      <div class="week ${list.length ? '' : 'empty-week'}">
        <h3><span>${WEEK_TITLES[i]}</span><small>${esc(fmtDM(w))}</small></h3>
        <ul>${list.length ? list.map(e => {
          const s = songById(e.songId);
          const confirm = pendingDelete === e.id;
          return `
          <li class="${e.songOfWeek ? 'sotw-row' : ''}">
            <button type="button" class="icon-btn star ${e.songOfWeek ? 'on' : ''}" data-entry="${esc(e.id)}"
              aria-pressed="${e.songOfWeek}" title="Canción de la semana" aria-label="Canción de la semana: ${esc(s.song)}">★</button>
            <span class="gdot ${s.genre}" title="${GENRE_NAME[s.genre]}" aria-label="${GENRE_NAME[s.genre]}"></span>
            <div class="song-main">
              <strong>${esc(s.song)}</strong>
              ${s.artist ? `<small>${esc(s.artist)}</small>` : ''}
            </div>
            ${s.key ? `<span class="key">${esc(s.key)}</span>` : ''}
            <span class="row-tools">
              <button type="button" class="icon-btn edit" data-entry="${esc(e.id)}" title="Editar" aria-label="Editar: ${esc(s.song)}">✎</button>
              <button type="button" class="icon-btn del ${confirm ? 'confirm' : ''}" data-entry="${esc(e.id)}"
                title="Quitar de la semana" aria-label="${confirm ? 'Confirmar quitar' : 'Quitar de la semana'}: ${esc(s.song)}">${confirm ? '¿Quitar?' : '✕'}</button>
            </span>
          </li>`; }).join('') : '<li class="none">Sin canciones</li>'}
        </ul>
      </div>`).join('');
  }

  function renderChart(rep) {
    const box = $('chart');
    const sung = rep.filter(r => r.count > 0);
    const total = entries.length;
    if (!total) { box.innerHTML = `<p class="empty-note">El gráfico aparecerá cuando agregues canciones.</p>`; return; }
    const sorted = [...sung].sort((a, b) => b.count - a.count || b.last.localeCompare(a.last));
    const top = sorted.slice(0, 4);
    const restCount = sorted.slice(4).reduce((s, r) => s + r.count, 0);
    const slices = top.map((r, i) => ({ name: r.song, count: r.count, color: SERIES[i] }));
    if (restCount) slices.push({ name: `Otras (${sorted.length - 4})`, count: restCount, color: 'var(--series-other)' });
    const R = 100, r0 = 62, cx = 110, cy = 110;
    let a0 = -Math.PI / 2;
    const pt = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
    const paths = slices.map((s, i) => {
      const frac = s.count / total;
      let d;
      if (frac >= 0.9999) {
        d = `M${cx} ${cy - R}A${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}ZM${cx} ${cy - r0}A${r0} ${r0} 0 1 0 ${cx + 0.01} ${cy - r0}Z`;
      } else {
        const a1 = a0 + frac * 2 * Math.PI, big = frac > 0.5 ? 1 : 0;
        const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
        d = `M${x0} ${y0}A${R} ${R} 0 ${big} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${big} 0 ${x3} ${y3}Z`;
        a0 = a1;
      }
      return `<path d="${d}" fill="${s.color}" fill-rule="evenodd" data-i="${i}" tabindex="0"
        aria-label="${esc(s.name)}: ${s.count} ${s.count === 1 ? 'vez' : 'veces'}"></path>`;
    }).join('');
    box.innerHTML = `
      <svg viewBox="0 0 220 220" role="img" aria-label="Gráfico de las canciones más cantadas">
        ${paths}
        <g class="donut-center" text-anchor="middle">
          <text x="110" y="112" style="font-family:'Playfair Display',serif;font-size:30px;fill:var(--red-dark)">${total}</text>
          <text x="110" y="132">veces cantadas</text>
        </g>
      </svg>
      <ul class="legend">${slices.map((s, i) => `
        <li data-i="${i}"><span class="sw" style="background:${s.color}"></span><span class="nm">${esc(s.name)}</span>
        <span class="ct">${s.count} · ${Math.round(s.count / total * 100)}%</span></li>`).join('')}
      </ul>
      <div class="tip" hidden></div>`;
    const tip = box.querySelector('.tip');
    const hot = (i, ev) => {
      box.classList.toggle('dim', i != null);
      box.querySelectorAll('path').forEach(p => p.classList.toggle('hot', p.dataset.i == i));
      if (i == null || !ev) { tip.hidden = true; return; }
      const s = slices[i], rect = box.getBoundingClientRect();
      tip.innerHTML = `<b>${esc(s.name)}</b> · ${s.count} ${s.count === 1 ? 'vez' : 'veces'} (${Math.round(s.count / total * 100)}%)`;
      let x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      if (ev.type === 'focus') { const b = ev.target.getBoundingClientRect(); x = b.left + b.width / 2 - rect.left; y = b.top - rect.top; }
      tip.style.left = Math.max(80, Math.min(rect.width - 80, x)) + 'px';
      tip.style.top = y + 'px';
      tip.hidden = false;
    };
    box.querySelectorAll('path').forEach(p => {
      p.addEventListener('pointermove', ev => hot(p.dataset.i, ev));
      p.addEventListener('pointerleave', () => hot(null));
      p.addEventListener('focus', ev => hot(p.dataset.i, ev));
      p.addEventListener('blur', () => hot(null));
    });
    box.querySelectorAll('.legend li').forEach(li => {
      li.addEventListener('pointerenter', () => hot(li.dataset.i));
      li.addEventListener('pointerleave', () => hot(null));
    });
  }

  function renderSplit() {
    const genreOf = e => songById(e.songId)?.genre;
    const al = entries.filter(e => genreOf(e) === 'alabanza').length;
    const ad = entries.length - al;
    const tot = entries.length || 1;
    $('split').innerHTML = entries.length
      ? `${al ? `<div style="flex:${al};background:var(--series-1)"></div>` : ''}${ad ? `<div style="flex:${ad};background:var(--series-2)"></div>` : ''}`
      : `<div style="flex:1;background:#eee"></div>`;
    $('splitLegend').innerHTML = `
      <span><span class="badge alabanza">Alabanza</span> ${al} (${Math.round(al / tot * 100)}%)</span>
      <span>${ad} (${Math.round(ad / tot * 100)}%) <span class="badge adoracion">Adoración</span></span>`;
  }

  function renderStale(rep) {
    const list = [...rep].sort((a, b) => a.last.localeCompare(b.last)).slice(0, 4);
    $('stale').innerHTML = rep.length > 4
      ? list.map(r => `<li><span class="nm">${esc(r.song)}</span><span class="ct">${esc(ago(r.last))}</span></li>`).join('')
      : `<li><span class="nm" style="color:var(--gray-medium);font-style:italic">Aparecerán cuando el repertorio crezca.</span></li>`;
  }

  function renderRep(rep) {
    const q = norm($('q').value);
    const g = $('fGenre').value;
    const rows = rep.filter(r => (!g || r.genre === g) && (!q || norm(r.song + ' ' + (r.artist || '')).includes(q)));
    rows.sort({
      last: (a, b) => b.last.localeCompare(a.last),
      oldest: (a, b) => a.last.localeCompare(b.last),
      count: (a, b) => b.count - a.count || b.last.localeCompare(a.last),
      az: (a, b) => a.song.localeCompare(b.song, 'es'),
    }[$('sort').value]);
    if (!songs.length) {
      $('rep').innerHTML = `<tr><td colspan="6" class="empty-note">El repertorio se llenará solo conforme agregues canciones.</td></tr>`;
      $('repEmpty').hidden = true;
      $('pager').hidden = true;
      return;
    }
    const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    repPage = Math.min(Math.max(1, repPage), pages);
    const from = (repPage - 1) * PAGE_SIZE;
    const pageRows = rows.slice(from, from + PAGE_SIZE);
    $('pager').hidden = pages <= 1;
    $('pageInfo').textContent = `${from + 1}–${from + pageRows.length} de ${rows.length} · página ${repPage} de ${pages}`;
    $('prevPage').disabled = repPage <= 1;
    $('nextPage').disabled = repPage >= pages;
    $('rep').innerHTML = pageRows.map(r => {
      const tw = r.thisWeekEntry;
      return `
      <tr>
        <td class="c-song"><button type="button" class="song-link" data-hist="${esc(r.id)}" title="Ver historial">${esc(r.song)}</button>${r.artist ? `<small>${esc(r.artist)}</small>` : ''}</td>
        <td class="c-genre"><span class="badge ${r.genre}">${GENRE_NAME[r.genre]}</span></td>
        <td class="c-count num">${r.count}×</td>
        <td class="c-key">${r.key ? `<span class="key">${esc(r.key)}</span>` : '<span style="color:#bbb">—</span>'}</td>
        <td class="c-last">${r.last ? esc(fmtShort(r.last)) : '—'}<span class="ago">${esc(ago(r.last))}</span></td>
        <td class="c-act"><div class="row-actions">
          <button type="button" class="icon-btn star ${tw && tw.songOfWeek ? 'on' : ''}" data-song="${esc(r.id)}"
            aria-pressed="${!!(tw && tw.songOfWeek)}" title="Canción de esta semana"
            aria-label="Canción de esta semana: ${esc(r.song)}">★</button>
          ${tw
            ? `<button type="button" class="icon-btn add done" title="Ya está en esta semana" aria-label="${esc(r.song)} ya está en esta semana" disabled>✓</button>`
            : `<button type="button" class="icon-btn add" data-song="${esc(r.id)}" title="Agregar a esta semana" aria-label="Agregar a esta semana: ${esc(r.song)}">+</button>`}
          <button type="button" class="icon-btn edit" data-song="${esc(r.id)}" title="Editar" aria-label="Editar: ${esc(r.song)}">✎</button>
        </div></td>
      </tr>`; }).join('');
    $('repEmpty').hidden = rows.length > 0;
  }

  // ---------- add form ----------
  $('fDate').value = todayStr();
  function checkDup() {
    const match = $('fSong').value.trim() ? findByName($('fSong').value) : null;
    $('dup').hidden = !match;
    $('newFields').hidden = !!match;
    if (match) {
      $('dupName').textContent = `“${match.song}”`;
      $('addBtn').textContent = 'Agregar a la semana';
    } else {
      $('addBtn').textContent = 'Agregar';
    }
    return match;
  }
  $('fSong').addEventListener('input', checkDup);
  $('dupShow').addEventListener('click', () => {
    const m = findByName($('fSong').value); if (!m) return;
    $('q').value = m.song; $('fGenre').value = ''; repPage = 1; renderRep(repertoire());
    $('rep').closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('addForm').addEventListener('submit', async ev => {
    ev.preventDefault();
    const btn = $('addBtn'); btn.disabled = true;
    const date = $('fDate').value, star = $('fStar').checked;
    const match = checkDup();
    try {
      if (match) {
        const r = await run(() => api('POST', { action: 'sing', songId: match.id, date, songOfWeek: star }));
        toast(r.alreadyThisWeek
          ? `“${match.song}” ya estaba en esa semana${star ? '; ahora es la canción de la semana' : ''}.`
          : `“${match.song}” agregada a la semana.`);
      } else {
        await run(() => api('POST', {
          action: 'addSong', date, songOfWeek: star,
          song: $('fSong').value, artist: $('fArtist').value, key: $('fKey').value,
          genre: document.querySelector('input[name=genre]:checked').value,
        }));
        toast(`“${$('fSong').value.trim()}” agregada al repertorio y a la semana.`);
      }
      $('fSong').value = ''; $('fArtist').value = ''; $('fKey').value = ''; $('fStar').checked = false;
      render();
      $('fSong').focus();
    } catch (e) {
      if (e.message === 'exists') { await api('GET').catch(() => {}); render(); }
    } finally { btn.disabled = false; }
  });

  // ---------- star (shared) ----------
  async function toggleEntryStar(entry) {
    await run(() => api('PATCH', { action: 'star', id: entry.id, value: !entry.songOfWeek }));
    render();
  }

  // ---------- week list actions ----------
  $('weeks').addEventListener('click', async ev => {
    const btn = ev.target.closest('button[data-entry]'); if (!btn) return;
    const entry = entries.find(e => e.id === btn.dataset.entry); if (!entry) return;
    if (btn.classList.contains('star')) return toggleEntryStar(entry).catch(() => {});
    if (btn.classList.contains('edit')) return openEdit(entry.songId, entry.id);
    if (btn.classList.contains('del')) {
      if (pendingDelete !== entry.id) {
        pendingDelete = entry.id; render();
        setTimeout(() => { if (pendingDelete === entry.id) { pendingDelete = null; render(); } }, 4000);
        document.querySelector(`.del[data-entry="${CSS.escape(entry.id)}"]`)?.focus();
        return;
      }
      pendingDelete = null;
      const name = songById(entry.songId)?.song;
      try {
        await run(() => api('DELETE', { action: 'entry', id: entry.id }));
        toast(`“${name}” quitada de la semana (sigue en el repertorio).`);
      } catch {}
      render();
    }
  });

  // ---------- repertoire actions ----------
  $('rep').addEventListener('click', async ev => {
    const h = ev.target.closest('button[data-hist]');
    if (h) return openHistory(h.dataset.hist);
    const btn = ev.target.closest('button[data-song]'); if (!btn) return;
    const song = songById(btn.dataset.song); if (!song) return;
    const tw = entries.find(e => e.songId === song.id && weekOf(e.date) === thisWeek());
    try {
      if (btn.classList.contains('edit')) return openEdit(song.id, null);
      if (btn.classList.contains('star')) {
        if (tw) await toggleEntryStar(tw);
        else {
          await run(() => api('POST', { action: 'sing', songId: song.id, date: todayStr(), songOfWeek: true }));
          toast(`“${song.song}” es la canción de esta semana.`);
          render();
        }
        return;
      }
      if (btn.classList.contains('add')) {
        await run(() => api('POST', { action: 'sing', songId: song.id, date: todayStr(), songOfWeek: false }));
        toast(`“${song.song}” agregada a esta semana.`);
        render();
      }
    } catch {}
  });
  ['q', 'fGenre', 'sort'].forEach(id => $(id).addEventListener('input', () => { repPage = 1; renderRep(repertoire()); }));
  const goPage = d => { repPage += d; renderRep(repertoire()); $('rep').closest('section').scrollIntoView({ block: 'start' }); };
  $('prevPage').addEventListener('click', () => goPage(-1));
  $('nextPage').addEventListener('click', () => goPage(1));

  // ---------- edit dialog ----------
  const dlg = $('editDlg');
  let deleteArmed = false;
  function openEdit(songId, entryId) {
    const s = songById(songId); if (!s) return;
    editing = { songId, entryId };
    $('eSong').value = s.song; $('eArtist').value = s.artist || ''; $('eGenre').value = s.genre; $('eKey').value = s.key || '';
    const entry = entryId && entries.find(e => e.id === entryId);
    $('eDateWrap').hidden = !entry;
    if (entry) $('eDate').value = entry.date;
    $('editMsg').textContent = '';
    deleteArmed = false; $('editDelete').classList.remove('confirm'); $('editDelete').textContent = 'Borrar del repertorio';
    dlg.showModal();
    $('eSong').focus();
  }
  $('editCancel').addEventListener('click', () => dlg.close());
  $('editForm').addEventListener('submit', async ev => {
    ev.preventDefault();
    const save = $('editSave'); save.disabled = true; $('editMsg').textContent = '';
    try {
      await api('PATCH', { action: 'editSong', id: editing.songId, song: $('eSong').value, artist: $('eArtist').value, genre: $('eGenre').value, key: $('eKey').value });
      const entry = editing.entryId && entries.find(e => e.id === editing.entryId);
      if (entry && $('eDate').value !== entry.date) {
        await api('PATCH', { action: 'editEntry', id: entry.id, date: $('eDate').value });
      }
      dlg.close();
      render();
      toast('Cambios guardados.');
    } catch (e) {
      $('editMsg').textContent = errorText(e);
      render();
    } finally { save.disabled = false; }
  });
  $('editDelete').addEventListener('click', async () => {
    const s = songById(editing.songId); if (!s) return;
    if (!deleteArmed) {
      deleteArmed = true;
      $('editDelete').classList.add('confirm');
      $('editDelete').textContent = `Sí, borrar “${s.song}” y su historial`;
      return;
    }
    try {
      await api('DELETE', { action: 'song', id: s.id });
      dlg.close(); render(); toast(`“${s.song}” borrada del repertorio.`);
    } catch (e) { $('editMsg').textContent = errorText(e); }
  });

  // ---------- song history ----------
  const hist = $('histDlg');
  function openHistory(songId) {
    const s = songById(songId); if (!s) return;
    const since = addDays(todayStr(), -365);
    const mine = entries.filter(e => e.songId === songId && e.date >= since)
      .sort((a, b) => b.date.localeCompare(a.date));
    const pairs = new Map();
    const weeksHtml = mine.map(e => {
      const w = weekOf(e.date);
      const set = entries.filter(x => weekOf(x.date) === w)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt || '').localeCompare(b.createdAt || ''));
      set.forEach(x => { if (x.songId !== songId) pairs.set(x.songId, (pairs.get(x.songId) || 0) + 1); });
      return `
        <div class="hweek">
          <div class="hweek-h"><span>Semana del ${esc(fmtShort(w))}</span>${e.songOfWeek ? '<span class="hstar">★ Canción de la semana</span>' : ''}</div>
          <ul>${set.map(x => {
            const o = songById(x.songId); if (!o) return '';
            const me = x.songId === songId;
            return `<li class="${me ? 'me' : ''}"><span class="gdot ${o.genre}"></span>${me
              ? `<strong>${esc(o.song)}</strong>`
              : `<button type="button" class="song-link" data-hist="${esc(o.id)}">${esc(o.song)}</button>`}${o.key ? `<span class="key">${esc(o.key)}</span>` : ''}</li>`;
          }).join('')}</ul>
        </div>`;
    }).join('');
    const top = [...pairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([id, n]) => { const o = songById(id); return o ? `<button type="button" class="song-link" data-hist="${esc(id)}">${esc(o.song)}</button> <span class="muted">(${n})</span>` : ''; })
      .filter(Boolean);
    $('histTitle').innerHTML = esc(s.song);
    $('histSub').textContent = mine.length
      ? `${s.artist ? s.artist + ' · ' : ''}${mine.length} ${mine.length === 1 ? 'vez' : 'veces'} en el último año`
      : `${s.artist ? s.artist + ' · ' : ''}No se ha cantado en el último año`;
    $('histPairs').hidden = !top.length;
    $('histPairs').innerHTML = top.length ? `<span class="label">Más acompañada de</span><div>${top.join(' · ')}</div>` : '';
    $('histBody').innerHTML = weeksHtml || '<p class="empty-note">Sin historial en el último año.</p>';
    $('histBody').scrollTop = 0;
    if (!hist.open) hist.showModal();
  }
  hist.addEventListener('click', ev => {
    const b = ev.target.closest('button[data-hist]');
    if (b) openHistory(b.dataset.hist);
    else if (ev.target === hist) hist.close();
  });
  $('histClose').addEventListener('click', () => hist.close());

  // ---------- start ----------
  const remembered = saved.get();
  if (remembered) unlock(remembered, true); else $('pass').focus();
})();
