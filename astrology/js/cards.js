/* Карточки для сторис (1080×1920) и подарочные сертификаты (2000×1414) — рисуются в canvas. */
(function () {
  'use strict';
  const AC = window.AstroCore, T = window.ASTRO_TEXTS, UI = window.UI, SITE = window.SITE;
  const { esc, fmt, icon } = UI;

  // палитра — как у сайта (css/skin.css): ночные хребты и горный туман, акцент — рододендрон
  const C = { n1: '#0e131a', n2: '#16202c', n3: '#2d4f6e', gold: '#ef9cc2', gold2: '#c0507f', ink: '#eef0f1', ink2: '#d3dae0', ink3: '#a9b3bd', hot: '#9c2f63', hot2: '#c0507f',
    paper: '#eef0f1', paper2: '#dbe0e3', plum: '#18212c', plum2: '#87264f', plum3: '#55606b', goldInk: '#87264f' };
  const F = {
    display: '"Newsreader", Georgia, "Times New Roman", serif',
    body: '"Hanken Grotesk", "Segoe UI", system-ui, sans-serif',
    hand: '"Newsreader", Georgia, serif', // «рукописные» строки — курсивом той же антиквы
    glyph: '"Noto Sans Symbols", "Noto Sans Symbols 2", "Segoe UI Symbol", "Apple Symbols", sans-serif',
  };

  async function fontsReady() {
    if (!document.fonts || !document.fonts.load) return;
    const list = ['500 64px "Newsreader"', 'italic 400 64px "Newsreader"', '700 32px "Hanken Grotesk"', '500 32px "Hanken Grotesk"', '64px "Noto Sans Symbols"'];
    try { await Promise.race([Promise.all(list.map((f) => document.fonts.load(f, 'AaZz♈☉'))), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* шрифты по умолчанию */ }
  }

  const font = (w, size, fam, italic) => (fam === F.hand ? `italic 400 ${size}px ${fam}` : `${italic ? 'italic ' : ''}${fam === F.display ? Math.min(w, 500) : w} ${size}px ${fam}`);
  function rng(seed) { let s = seed % 2147483647 || 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function loadImg(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  const svgImg = (svg) => loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
  function spaced(ctx, px) { try { ctx.letterSpacing = px + 'px'; } catch (e) { /* старый браузер */ } }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); } }

  /** Перенос строк; возвращает y под последней строкой. */
  function wrap(ctx, text, x, y, maxW, lh, align) {
    ctx.textAlign = align || 'center';
    const words = String(text).split(/\s+/);
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; } else line = t;
    }
    if (line) { ctx.fillText(line, x, y); y += lh; }
    return y;
  }

  function nightBg(ctx, w, h, seed) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, C.n1); g.addColorStop(0.55, C.n2); g.addColorStop(1, C.n3);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const glow = (x, y, r, col) => { const rg = ctx.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h); };
    glow(w * 0.5, h * 1.02, w * 0.8, 'rgba(224, 122, 168, 0.14)');
    // звёзды — мелкие точки, едва заметные (текст важнее)
    // Звёзды не должны спорить с текстом: мягко размытые и едва заметные.
    // Фигура рисуется за краем холста, а в кадр попадает только её размытая “тень” (работает во всех браузерах).
    const r = rng(seed || 11), OFF = w + 400;
    ctx.shadowOffsetX = OFF; ctx.shadowOffsetY = 0;
    for (let i = 0; i < Math.round((w * h) / 12000); i++) {
      const x = r() * w, y = r() * h, q = r();
      const R = q < 0.06 ? 12 + r() * 6 : q < 0.26 ? 7 + r() * 3 : 4.5 + r() * 2; // половина ширины искорки
      const col = r() < 0.12 ? '#f2a9c9' : '#ffffff';
      ctx.globalAlpha = 0.18 + r() * 0.4; ctx.fillStyle = col; ctx.shadowColor = col;
      ctx.shadowBlur = R * 0.3;
      ctx.beginPath(); ctx.arc(x - OFF, y, R * 0.22, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0;
    ctx.globalAlpha = 1;
  }

  function paperBg(ctx, w, h, seed) {
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h);
    const rg = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
    rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(60, 80, 100, 0.12)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, w, h);
    const r = rng(seed || 3);
    for (let i = 0; i < (w * h) / 900; i++) { ctx.fillStyle = `rgba(120, 90, 50, ${0.02 + r() * 0.05})`; ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5); }
  }

  function zodiacRing(ctx, cx, cy, R, col, alpha, rot) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.translate(cx, cy); ctx.rotate(rot || 0);
    ctx.lineWidth = Math.max(1, R / 260);
    for (const k of [1, 0.89, 0.83]) { ctx.beginPath(); ctx.arc(0, 0, R * k, 0, Math.PI * 2); ctx.stroke(); }
    for (let d = 0; d < 360; d += 5) {
      const a = d * Math.PI / 180, r2 = d % 30 === 0 ? R * 0.94 : R * 0.97;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * R, Math.sin(a) * R); ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); ctx.stroke();
    }
    ctx.font = font(400, R * 0.07, F.glyph); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    AC.SIGNS.forEach((s, i) => { const a = (i * 30 + 15 - 90) * Math.PI / 180; ctx.save(); ctx.translate(Math.cos(a) * R * 0.86, Math.sin(a) * R * 0.86); ctx.rotate(a + Math.PI / 2); ctx.fillText(T.signs[s].glyph, 0, 0); ctx.restore(); });
    ctx.restore(); ctx.textBaseline = 'alphabetic';
  }

  /** Подпись Алины: аватар и имя, выровнены по левому краю (x — левый край аватара, y — его центр). */
  async function brand(ctx, x0, y, dark) {
    const av = await loadImg(SITE.avatar || 'assets/img/avatar.webp');
    const r = 44;
    ctx.save();
    if (av) { ctx.save(); ctx.beginPath(); ctx.arc(x0 + r, y, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip(); ctx.drawImage(av, x0, y - r, r * 2, r * 2); ctx.restore(); }
    ctx.strokeStyle = dark ? C.gold : C.goldInk; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0 + r, y, r + 4, 0, Math.PI * 2); ctx.stroke();
    ctx.font = font(600, 44, F.display); ctx.fillStyle = dark ? C.ink : C.plum; ctx.textAlign = 'left'; ctx.fillText(SITE.name, x0 + r * 2 + 22, y + 2);
    const nameW = ctx.measureText(SITE.name).width;
    ctx.font = font(700, 19, F.body); spaced(ctx, 6); ctx.fillStyle = dark ? C.gold : C.goldInk; ctx.fillText(SITE.role.toUpperCase(), x0 + r * 2 + 24, y + 34); spaced(ctx, 0);
    ctx.restore();
    return x0 + r * 2 + 22 + nameW; // правый край подписи
  }

  /** Низ сторис: кнопка-призыв по центру, под ней — подпись Алины слева и адрес сайта справа. */
  async function footer(ctx, w, y, text, dark) {
    ctx.save();
    ctx.font = font(700, 34, F.body);
    const tw = ctx.measureText(text).width + 90;
    const g = ctx.createLinearGradient(w / 2 - tw / 2, 0, w / 2 + tw / 2, 0);
    g.addColorStop(0, C.hot); g.addColorStop(1, C.hot2);
    rr(ctx, w / 2 - tw / 2, y - 52, tw, 84, 6); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(text, w / 2, y + 2);
    ctx.restore();
    const by = y + 140, left = 84;
    const nameEnd = await brand(ctx, left, by, dark);
    // адрес сайта справа, по нижней строке подписи; если не помещается — шрифт мельче
    const url = SITE.siteUrl || '';
    if (url) {
      ctx.save();
      let fs = 26; ctx.font = font(600, fs, F.body);
      while (ctx.measureText(url).width > w - left - nameEnd - 40 && fs > 16) { fs -= 2; ctx.font = font(600, fs, F.body); }
      ctx.fillStyle = dark ? C.ink3 : C.plum3; ctx.textAlign = 'right'; ctx.fillText(url, w - left, by + 34);
      ctx.restore();
    }
  }

  function handTitle(ctx, text, x, y, size, col, angle) {
    ctx.save(); ctx.translate(x, y); ctx.rotate((angle || -3) * Math.PI / 180);
    ctx.font = font(700, size, F.hand); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(text, 0, 0); ctx.restore();
  }

  // ---------- сторис: натальная карта ----------
  async function storyNatal(chart, p, opts) {
    opts = opts || {};
    await fontsReady();
    const W = 1080, H = 1920, cv = canvas(W, H), ctx = cv.getContext('2d');
    nightBg(ctx, W, H, Math.round(chart.byId.sun.lon * 100));
    handTitle(ctx, 'my sky on the day I was born', W / 2, 330, 74, C.gold, -3);
    if (opts.showName && p.name) { ctx.font = font(600, 84, F.display); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(p.name, W / 2, 430); }
    // колесо
    const svg = window.Wheel.svg(chart, { animate: false, theme: 'dark' });
    const img = await svgImg(svg);
    const ws = 640, wy = opts.showName && p.name ? 470 : 420;
    const halo = ctx.createRadialGradient(W / 2, wy + ws / 2, ws * 0.2, W / 2, wy + ws / 2, ws * 0.62);
    halo.addColorStop(0, 'rgba(232, 198, 127, 0.18)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, wy - 80, W, ws + 160);
    if (img) ctx.drawImage(img, W / 2 - ws / 2, wy, ws, ws);
    // большая тройка
    const y0 = wy + ws + 70;
    [['sun', 'Sun'], ['moon', 'Moon'], ['asc', 'Ascendant']].forEach(([id, label], i) => {
      const x = W / 2 + (i - 1) * 310;
      const pt = chart.byId[id];
      ctx.textAlign = 'center';
      ctx.font = font(400, 92, F.glyph); ctx.fillStyle = C.gold; ctx.fillText(pt ? T.signs[pt.sign].glyph : '?', x, y0 + 40);
      ctx.font = font(700, 22, F.body); spaced(ctx, 5); ctx.fillStyle = C.ink3; ctx.fillText(label.toUpperCase(), x, y0 + 100); spaced(ctx, 0);
      ctx.font = font(600, 50, F.display); ctx.fillStyle = C.ink; ctx.fillText(pt ? T.signs[pt.sign].name : 'time needed', x, y0 + 160);
    });
    const s = chart.summary;
    ctx.font = font(500, 32, F.body); ctx.fillStyle = C.ink2; ctx.textAlign = 'center';
    ctx.fillText(`element — ${T.elements[s.topElement].name.toLowerCase()} · strongest planet — ${T.planets[s.dominant[0]].name}`, W / 2, y0 + 232);
    await footer(ctx, W, 1600, 'Build your chart for free', true);
    return cv;
  }

  // ---------- сторис: совместимость ----------
  async function storySynastry(nA, nB, S) {
    await fontsReady();
    const W = 1080, H = 1920, cv = canvas(W, H), ctx = cv.getContext('2d');
    nightBg(ctx, W, H, S.total * 97 + 5);
    zodiacRing(ctx, W / 2, 820, 470, C.gold, 0.16, 0.2);
    handTitle(ctx, 'our compatibility', W / 2, 330, 78, C.gold, -3);
    ctx.font = font(600, 78, F.display, true); ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    const names = `${nA}  &  ${nB}`;
    let ns = 78;
    while (ctx.measureText(names).width > 940 && ns > 34) { ns -= 4; ctx.font = font(600, ns, F.display, true); }
    ctx.fillText(names, W / 2, 450);
    // кольцо
    const cx = W / 2, cy = 770, R = 230;
    ctx.lineWidth = 34; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    const g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R); g.addColorStop(0, C.gold); g.addColorStop(1, C.hot);
    ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (S.total / 100)); ctx.stroke();
    ctx.font = font(600, 190, F.display); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(S.total), cx, cy - 6);
    ctx.textBaseline = 'alphabetic'; ctx.font = font(700, 24, F.body); spaced(ctx, 6); ctx.fillStyle = C.ink3; ctx.fillText('OUT OF 100', cx, cy + 110); spaced(ctx, 0);
    // сферы
    let y = 1110;
    for (const [k, v] of Object.entries(S.spheres)) {
      ctx.textAlign = 'left'; ctx.font = font(600, 32, F.body); ctx.fillStyle = C.ink; ctx.fillText(T.synSpheres[k].name, 150, y);
      ctx.textAlign = 'right'; ctx.fillStyle = C.gold; ctx.fillText(String(v), 930, y);
      rr(ctx, 150, y + 18, 780, 14, 7); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
      const gg = ctx.createLinearGradient(150, 0, 930, 0); gg.addColorStop(0, '#9db4d6'); gg.addColorStop(1, C.hot);
      rr(ctx, 150, y + 18, Math.max(14, 780 * v / 100), 14, 7); ctx.fillStyle = gg; ctx.fill();
      y += 82;
    }
    await footer(ctx, W, 1600, 'Check your couple', true);
    return cv;
  }

  // ---------- сторис: нумерология “Мои числа” ----------
  // r — результат со страницы нумерологии: lp, bd, nm, py, name. Дату рождения на карточку не пишем.
  async function storyNumbers(r) {
    await fontsReady();
    const NT = window.NUMEROLOGY_TEXTS;
    const W = 1080, H = 1920, cv = canvas(W, H), ctx = cv.getContext('2d');
    nightBg(ctx, W, H, r.lp.value * 131 + r.bd.value * 7 + 3);
    handTitle(ctx, 'my numbers', W / 2, 330, 84, C.gold, -3);
    const first = (r.name || '').split(/\s+/).filter(Boolean);
    // “Фамилия Имя Отчество” → имя; одно-два слова → первое
    const shown = first.length >= 3 ? first[1] : first[0] || '';
    if (shown) { ctx.font = font(600, 72, F.display, true); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText(shown, W / 2, 430); }
    // главное число — в золотом кольце
    const cx = W / 2, cy = 720, R = 205;
    const halo = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.6);
    halo.addColorStop(0, 'rgba(232, 198, 127, 0.22)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, cy - R * 1.7, W, R * 3.4);
    ctx.lineWidth = 10; ctx.strokeStyle = C.gold; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 2; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(cx, cy, R + 26, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
    // цифры — шрифтом Manrope: у Cormorant на холсте старинные цифры (“1” похожа на “I”)
    ctx.font = font(500, r.lp.value > 9 ? 170 : 210, F.body); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(r.lp.value), cx, cy + 8); ctx.textBaseline = 'alphabetic';
    ctx.font = font(700, 24, F.body); spaced(ctx, 6); ctx.fillStyle = C.ink3; ctx.fillText('LIFE PATH NUMBER', cx, cy + R + 80); spaced(ctx, 0);
    const t = NT.numbers[r.lp.value];
    ctx.font = font(600, 70, F.display, true); ctx.fillStyle = C.gold; ctx.fillText(t.name, cx, cy + R + 160);
    ctx.font = font(500, 32, F.body); ctx.fillStyle = C.ink2; ctx.fillText(t.keys, cx, cy + R + 215);
    // остальные числа
    const tiles = [['birthday', r.bd.value]];
    if (r.nm) { tiles.push(['name', r.nm.expression.value]); if (r.nm.soul) tiles.push(['soul', r.nm.soul.value]); if (r.nm.personality) tiles.push(['personality', r.nm.personality.value]); }
    tiles.push([`${new Date().getFullYear()}`, r.py.value]);
    const show = tiles.slice(0, 4), gap = 220, x0 = cx - ((show.length - 1) * gap) / 2, ty = 1310;
    show.forEach(([label, v], i) => {
      const x = x0 + i * gap;
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(x, ty, 72, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(232, 198, 127, 0.7)'; ctx.stroke();
      ctx.font = font(500, 64, F.body); ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(v), x, ty + 4); ctx.textBaseline = 'alphabetic';
      ctx.font = font(700, 22, F.body); spaced(ctx, 3); ctx.fillStyle = C.ink3; ctx.fillText(label.toUpperCase(), x, ty + 112); spaced(ctx, 0);
    });
    await footer(ctx, W, 1600, 'Find your numbers', true);
    return cv;
  }

  // ---------- сторис: Луна сегодня ----------
  async function storyMoon(date, city) {
    await fontsReady();
    date = date || new Date();
    city = city || UI.defaultCity();
    const W = 1080, H = 1920, cv = canvas(W, H), ctx = cv.getContext('2d');
    nightBg(ctx, W, H, date.getDate() * 131 + date.getMonth());
    handTitle(ctx, 'Moon today', W / 2, 330, 92, C.gold, -3);
    ctx.font = font(600, 50, F.display); ctx.fillStyle = C.ink2; ctx.textAlign = 'center';
    ctx.fillText(`${fmt.DOW_LONG[date.getDay()]}, ${fmt.MONTHS_GEN[date.getMonth()]} ${date.getDate()}`, W / 2, 410);
    const ms = AC.moonState(date);
    const mimg = await svgImg(UI.moonSVG(ms.angle, { darkColor: 'rgba(8, 6, 22, 0.6)' }));
    const halo = ctx.createRadialGradient(W / 2, 680, 60, W / 2, 680, 330);
    halo.addColorStop(0, 'rgba(255, 236, 200, 0.35)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo; ctx.fillRect(0, 340, W, 700);
    if (mimg) ctx.drawImage(mimg, W / 2 - 230, 450, 460, 460);
    let ld = null; try { ld = AC.lunarDay(date, city.lat, city.lon); } catch (e) { ld = null; }
    const ph = T.moonPhaseNow[ms.phase8];
    ctx.font = font(400, 64, F.glyph); ctx.fillStyle = C.gold; ctx.fillText(T.signs[ms.sign].glyph, W / 2, 1010);
    ctx.font = font(600, 78, F.display); ctx.fillStyle = C.ink; ctx.fillText(`Moon ${T.signs[ms.sign].loc}`, W / 2, 1100);
    ctx.font = font(600, 36, F.body); ctx.fillStyle = C.gold;
    ctx.fillText(`${ph.name.toLowerCase()} · ${Math.round(ms.illum * 100)}% illuminated${ld ? ` · lunar day ${ld.day}` : ''}`, W / 2, 1165);
    let y = 1240;
    ctx.font = font(500, 34, F.body); ctx.fillStyle = C.ink2;
    y = wrap(ctx, ld ? `“${T.lunarDays[ld.day].sym}”. ${T.lunarDays[ld.day].text}` : ph.tip, W / 2, y, 860, 48);
    const mis = T.moonInSign[ms.sign];
    y += 18;
    ctx.font = font(700, 32, F.body); ctx.fillStyle = '#9cc192'; y = wrap(ctx, `Good for: ${mis.good}`, W / 2, y, 880, 44);
    ctx.fillStyle = '#f2a9c9'; y = wrap(ctx, `Better to postpone: ${mis.avoid}`, W / 2, y, 880, 44);
    ctx.font = font(500, 24, F.body); ctx.fillStyle = C.ink3; ctx.textAlign = 'center';
    ctx.fillText(`times and lunar days for: ${city.name}`, W / 2, Math.min(y + 14, 1500));
    await footer(ctx, W, 1600, 'Moon calendar on the site', true);
    return cv;
  }

  // ---------- подарочный сертификат ----------
  function corner(ctx, x, y, sx, sy, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 90); ctx.quadraticCurveTo(0, 0, 90, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, 90); ctx.quadraticCurveTo(22, 22, 90, 22); ctx.stroke();
    const star = (cx, cy, r) => { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr2 = i % 2 ? r * 0.28 : r; ctx.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); };
    star(44, 44, 18); star(112, 10, 7); star(10, 112, 7);
    ctx.restore();
  }

  /** data: { number, recipient, from, title, message, validUntil (Date), style: 'velvet'|'paper' } */
  async function certificate(d) {
    await fontsReady();
    const W = 2000, H = 1414, cv = canvas(W, H), ctx = cv.getContext('2d');
    const dark = d.style !== 'paper';
    const col = { ink: dark ? C.ink : C.plum, ink2: dark ? C.ink2 : C.plum3, gold: dark ? C.gold : C.goldInk, accent: dark ? C.gold : C.plum2 };
    if (dark) nightBg(ctx, W, H, (d.number || 'x').length * 977); else paperBg(ctx, W, H, 5);
    zodiacRing(ctx, W - 300, H / 2 + 40, 560, col.gold, dark ? 0.13 : 0.16, 0.3);
    // рамка
    ctx.strokeStyle = col.gold; ctx.lineWidth = 3; rr(ctx, 54, 54, W - 108, H - 108, 18); ctx.stroke();
    ctx.lineWidth = 1.5; rr(ctx, 78, 78, W - 156, H - 156, 12); ctx.stroke();
    corner(ctx, 96, 96, 1, 1, col.gold); corner(ctx, W - 96, 96, -1, 1, col.gold); corner(ctx, 96, H - 96, 1, -1, col.gold); corner(ctx, W - 96, H - 96, -1, -1, col.gold);
    ctx.textAlign = 'center';
    ctx.font = font(700, 34, F.body); spaced(ctx, 14); ctx.fillStyle = col.gold; ctx.fillText('GIFT CERTIFICATE', W / 2, 250); spaced(ctx, 0);
    ctx.font = font(500, 46, F.body); ctx.fillStyle = col.ink2; ctx.fillText(d.amount ? 'for a reading worth' : 'for a reading', W / 2, 330);
    // услуга или сумма
    let size = 104; ctx.font = font(500, size, F.display, true);
    const title = d.amount ? fmt.money(d.amount) : (d.title || 'Astrology reading');
    while (ctx.measureText(title).width > 1500) { size -= 6; ctx.font = font(500, size, F.display, true); }
    ctx.fillStyle = col.ink; ctx.fillText(title, W / 2, 470);
    // кому
    if (d.recipient) { ctx.save(); ctx.translate(W / 2, 640); ctx.rotate(-2 * Math.PI / 180); ctx.font = font(700, 120, F.hand); ctx.fillStyle = col.accent; ctx.fillText(`for ${d.recipient}`, 0, 0); ctx.restore(); }
    // пожелание
    ctx.font = font(500, 40, F.body); ctx.fillStyle = col.ink2;
    let y = wrap(ctx, d.message || '', W / 2, 760, 1300, 56);
    if (d.from) { ctx.font = font(600, 64, F.hand); ctx.fillStyle = col.gold; ctx.fillText(`with love, ${d.from}`, W / 2, Math.max(y + 30, 880)); }
    // низ: астролог, номер, срок
    const av = await loadImg(SITE.avatar || 'assets/img/avatar.webp');
    const by = H - 230;
    if (av) { ctx.save(); ctx.beginPath(); ctx.arc(250, by, 62, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(av, 188, by - 62, 124, 124); ctx.restore(); ctx.strokeStyle = col.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(250, by, 67, 0, Math.PI * 2); ctx.stroke(); }
    ctx.textAlign = 'left'; ctx.font = font(600, 50, F.display); ctx.fillStyle = col.ink; ctx.fillText(SITE.name, 340, by - 6);
    ctx.font = font(600, 28, F.body); ctx.fillStyle = col.ink2;
    const c = SITE.contacts || {};
    const contact = c.telegram ? 'Telegram: @' + c.telegram.replace(/^@/, '') : c.phone || c.email || SITE.siteUrl || 'astrologer';
    ctx.fillText(contact, 340, by + 40);
    ctx.textAlign = 'right'; ctx.font = font(700, 30, F.body); spaced(ctx, 3); ctx.fillStyle = col.gold; ctx.fillText(`No. ${d.number || '—'}`, W - 190, by - 10); spaced(ctx, 0);
    ctx.font = font(600, 28, F.body); ctx.fillStyle = col.ink2;
    if (d.validUntil) ctx.fillText(`valid until ${fmt.date(new Date(d.validUntil))}`, W - 190, by + 36);
    ctx.textAlign = 'center'; ctx.font = font(500, 26, F.body); ctx.fillStyle = col.ink2;
    ctx.fillText('To redeem, write to Iris and mention the certificate number', W / 2, H - 120);
    return cv;
  }

  // ---------- показ результата ----------
  function toBlob(cv) { return new Promise((r) => cv.toBlob((b) => r(b), 'image/png')); }

  async function show(cv, filename, title, hint) {
    const blob = await toBlob(cv);
    if (!blob) { UI.toast('Couldn’t draw the image', 'info'); return; }
    const url = URL.createObjectURL(blob);
    const portrait = cv.height > cv.width;
    const file = (typeof File !== 'undefined') ? new File([blob], filename, { type: 'image/png' }) : null;
    const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
    const inArtifact = !!window.ARTIFACT_PREVIEW;
    const m = UI.modal(`
      <h3 style="margin-bottom:6px">${esc(title)}</h3>
      <p class="small muted">${hint || ''}</p>
      <div class="card-preview ${portrait ? 'portrait' : 'landscape'}"><img src="${url}" alt="${esc(title)}"></div>
      <div class="row" style="margin-top:16px;justify-content:center">
        ${canShare ? `<button class="btn btn-primary btn-sm" type="button" data-c="share">${icon('upload')} Share</button>` : ''}
        ${inArtifact ? '' : `<button class="btn ${canShare ? 'btn-ghost' : 'btn-primary'} btn-sm" type="button" data-c="save">${icon('download')} Save image</button>`}
      </div>
      <p class="tiny muted center" style="margin:10px 0 0">${inArtifact ? 'To save it: right-click the image → “Save image as”; on a phone, press and hold the image.' : 'On a phone you can send the image straight to your stories with “Share”.'}</p>`, { wide: !portrait, onClose: () => setTimeout(() => URL.revokeObjectURL(url), 1000) });
    m.el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      if (b.dataset.c === 'save') UI.download(filename, blob);
      if (b.dataset.c === 'share') { try { await navigator.share({ files: [file], title }); } catch (err) { /* отменено */ } }
    });
  }

  window.Cards = { storyNatal, storySynastry, storyMoon, storyNumbers, certificate, show, fontsReady };
})();
