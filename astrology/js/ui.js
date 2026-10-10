/* Общий интерфейс сайта: шапка, подвал, тема, звёзды, формы, город, запись, хранилище. */
(function () {
  'use strict';
  const SITE = window.SITE, T = window.ASTRO_TEXTS, AC = window.AstroCore;

  // ---------- иконки ----------
  const ICONS = window.ICONS || {}, ICONS_F = window.ICONS_FILLED || {};
  const icon = (n, cls) => (ICONS_F[n]
    ? `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${ICONS_F[n]}</svg>`
    : `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`);

  // ---------- хранилище (безопасно: в приватном режиме может не работать) ----------
  const store = {
    get(k, def) { try { const v = localStorage.getItem('am_' + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('am_' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem('am_' + k); } catch (e) { /* ничего */ } },
  };

  const settings = Object.assign({ houseSystem: 'placidus', meanNode: false, minor: false, orbMult: 1 }, store.get('settings', {}));
  function saveSettings(s) { Object.assign(settings, s); store.set('settings', settings); }

  // ---------- формат ----------
  // Демо — для англоязычной аудитории (США): «June 14, 1997», 12-часовое время «2:30 PM», цены «$180».
  // SITE.clock: '12h' | '24h' (content.js), по умолчанию 12h.
  const MONTHS_GEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MONTHS = MONTHS_GEN.slice();
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const H12 = SITE.clock !== '24h';
  /** Сумма с символом валюты: $, €, £ — перед числом («$1,200»), остальные — после. */
  function moneyStr(n, sym) { const num = Math.round(n).toLocaleString('en-US'); return /^[$€£]$/.test(sym) ? sym + num : `${num} ${sym}`; }
  /** Часы и минуты → «2:30 PM» (или «14:30» при clock: '24h'). */
  const hm12 = (h, mi) => (H12 ? `${(h % 12) || 12}:${pad(mi)} ${h < 12 ? 'AM' : 'PM'}` : `${pad(h)}:${pad(mi)}`);
  const fmt = {
    date: (d) => `${MONTHS_GEN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    dateShort: (d) => `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`,
    dm: (d) => `${MONTHS_GEN[d.getMonth()]} ${d.getDate()}`,
    time: (d) => hm12(d.getHours(), d.getMinutes()),
    dateTime: (d) => `${MONTHS_GEN[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, ${hm12(d.getHours(), d.getMinutes())}`,
    dmTime: (d) => `${MONTHS_GEN[d.getMonth()]} ${d.getDate()}, ${hm12(d.getHours(), d.getMinutes())}`,
    ymd: (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    birth: (p) => `${MONTHS_GEN[p.mo - 1]} ${p.d}, ${p.y}` + (p.timeKnown !== false ? `, ${hm12(+p.h, +p.mi)}` : ', time unknown'),
    hm: hm12,
    money: (n) => (n ? moneyStr(n, SITE.currency || '$') : ''),
    /** Английское множественное число: few и many — одна форма («days»). */
    plural: (n, one, few, many) => (Math.abs(n) === 1 ? one : many || few),
    deg: (lon) => AC.fmtDeg(lon),
    pos: (lon) => `${AC.fmtDeg(lon)} ${T.signs[AC.signOf(lon)].glyph}`,
    posText: (lon) => `${AC.fmtDeg(lon)} ${T.signs[AC.signOf(lon)].loc}`,
    MONTHS, MONTHS_GEN, MONTHS_SHORT, DOW, DOW_LONG, pad,
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const glyph = (id) => (T.planets[id] ? T.planets[id].glyph : T.signs[id] ? T.signs[id].glyph : '');
  const pname = (id) => (T.planets[id] ? T.planets[id].name : id);

  // ---------- движение ----------
  const reduceMotion = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const EASE_OUT = 'cubic-bezier(.2,.8,.2,1)', EASE_IN_OUT = 'cubic-bezier(.4,0,.2,1)';
  /** Мягкое появление блока после смены содержимого (урок, знак, день календаря, раздел кабинета). */
  function fadeIn(el, dy) {
    if (!el || !el.animate || reduceMotion()) return;
    el.animate({ opacity: [0, 1], translate: ['0 ' + (dy == null ? 10 : dy) + 'px', '0 0'] }, { duration: 460, easing: EASE_OUT });
  }

  // ---------- “волшебство” перед результатом расчёта ----------
  // Пока “звёзды складываются”: круг зодиака оживает, планеты собираются по орбитам и соединяются линиями, под кругом —
  // 3 фразы о том, что сейчас считается. Первый расчёт за визит — 3 с (просьба Павла), следующие — 2 с; без анимаций
  // (prefers-reduced-motion) — сразу. conjure(box, { kind, sign }) кладёт сцену в box и через это время отвечает true —
  // тогда страница рисует результат на её месте; false — пока шла анимация, начали новый расчёт (этот не рисовать).
  const CONJ_LINES = {
    natal: ['Checking the planets’ positions', 'Drawing the houses and angles', 'Connecting the aspects'],
    synastry: ['Comparing the two charts', 'Looking for points of attraction', 'Calculating compatibility'],
    forecast: ['Following where the planets are heading', 'Building the chart of your year', 'Marking the important dates'],
    numbers: ['Adding up the numbers of your date', 'Working out your path and your name', 'Laying out the square'],
    horo: ['Looking at the sky over your sign', 'Checking the Moon and planets', 'Putting your horoscope together'],
  };
  const ZOD = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map((g) => g + '︎');
  let conjCount = 0, conjSeq = 0;
  function conjure(box, opts) {
    opts = opts || {};
    if (!box || reduceMotion()) return Promise.resolve(true);
    const id = ++conjSeq;
    box.dataset.conj = id;
    const ms = opts.ms || (conjCount++ ? 2000 : 3000);
    const lines = (opts.lines || CONJ_LINES[opts.kind] || CONJ_LINES.natal).slice(0, ms < 1000 ? 2 : 3);
    const ring = opts.kind === 'numbers' ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11', '22', '33'] : ZOD;
    const R = 76, rnd = (a, b) => a + Math.random() * (b - a), f1 = (x) => x.toFixed(1);
    // планеты: каждая прилетает по своей орбите с поворотом, в конце — “созвездие” из линий между ними
    const pts = Array.from({ length: 7 }, (_, i) => ({ r: [30, 40, 50, 58, 34, 46, 54][i], a: rnd(0, 360), spin: rnd(140, 260) * (i % 2 ? -1 : 1), c: ['gold', 'lav', 'rose'][i % 3] }));
    const xy = (p) => [p.r * Math.sin(p.a * Math.PI / 180), -p.r * Math.cos(p.a * Math.PI / 180)];
    const pairs = [[0, 3], [1, 4], [2, 6], [3, 5], [0, 5], [1, 6]];
    box.innerHTML = `<div class="conj" role="status" style="--ms:${ms}ms">
        <svg class="conj-orb" viewBox="-100 -100 200 200" aria-hidden="true">
          <circle class="conj-glow" r="62"/>
          <g class="conj-ring" style="--end:${opts.sign >= 0 ? -(opts.sign * 30 + 15) : 15}deg"><circle class="conj-c1" r="${R + 12}"/><circle class="conj-c2" r="${R - 12}"/>
            ${ring.map((g, i) => { const a = (i * 30 + 15) * Math.PI / 180; return `<text class="conj-g${opts.kind === 'numbers' ? ' num' : ''}${opts.sign === i ? ' on' : ''}" style="--i:${i}" x="${f1(R * Math.sin(a))}" y="${f1(-R * Math.cos(a))}">${g}</text>`; }).join('')}</g>
          <g class="conj-lines">${pairs.map(([a, b], i) => { const [x1, y1] = xy(pts[a]), [x2, y2] = xy(pts[b]); return `<line pathLength="1" style="--i:${i}" x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}"/>`; }).join('')}</g>
          ${pts.map((p, i) => `<g class="conj-pl" style="--a:${f1(p.a)}deg;--s:${f1(p.spin)}deg;--i:${i}"><circle class="${p.c}" cx="0" cy="${-p.r}" r="${i === 0 ? 4.2 : 3.2}"/></g>`).join('')}
          <path class="conj-star" d="M0,-15 C2,-3 3,-2 15,0 C3,2 2,3 0,15 C-2,3 -3,2 -15,0 C-3,-2 -2,-3 0,-15Z"/>
        </svg>
        <p class="conj-text">${lines.map((t, i) => `<span style="--i:${i};--n:${lines.length}">${esc(t)}…</span>`).join('')}</p>
        <span class="conj-bar" aria-hidden="true"><i></i></span>
      </div>`;
    box.setAttribute('aria-busy', 'true');
    // на телефоне результат ниже формы — показываем волшебство там, куда человек смотрит
    const r = box.getBoundingClientRect();
    if (r.top > innerHeight - 160 || r.bottom < 80) box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return new Promise((res) => setTimeout(() => {
      const live = String(box.dataset.conj) === String(id);
      if (live) { box.removeAttribute('aria-busy'); delete box.dataset.conj; }
      res(live);
    }, ms));
  }

  // ---------- тема ----------
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    store.set('theme', t);
    $$('.theme-toggle').forEach((b) => { b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon'); b.setAttribute('aria-label', t === 'dark' ? 'Light theme' : 'Dark theme'); });
    document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  }
  const savedTheme = store.get('theme', null);
  let sysDark = false;
  try { sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { /* нет */ }
  document.documentElement.setAttribute('data-theme', savedTheme || (sysDark ? 'dark' : 'light'));
  /** Переключение темы: новая тема раскрывается кругом от кнопки; без View Transitions — плавно перетекает. */
  function switchTheme(btn) {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (reduceMotion()) { applyTheme(next); return; }
    if (document.startViewTransition && root.animate) {
      const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      root.classList.add('theme-vt');
      try {
        const vt = document.startViewTransition(() => applyTheme(next));
        vt.ready.then(() => root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${rad}px at ${x}px ${y}px)`] }, { duration: 720, easing: EASE_IN_OUT, pseudoElement: '::view-transition-new(root)' })).catch(() => {});
        vt.finished.catch(() => {}).then(() => root.classList.remove('theme-vt'));
        return;
      } catch (e) { root.classList.remove('theme-vt'); }
    }
    root.classList.add('theme-fade');
    applyTheme(next);
    setTimeout(() => root.classList.remove('theme-fade'), 560);
  }

  // ---------- шапка и подвал ----------
  const TOOLS = [
    ['natal.html', 'Birth chart', 'planet', 'your chart at birth'],
    ['astro.html', 'Chart studio', 'address-book', 'my charts and every calculation'],
    ['synastry.html', 'Compatibility', 'heart-handshake', 'a couple’s synastry'],
    ['horoscope.html', 'Horoscope', 'sparkle', 'for today and the month'],
    ['moon.html', 'Moon calendar', 'moon-stars', 'lunar days'],
    ['sky.html', 'Sky events', 'telescope', 'retrogrades, eclipses'],
    ['numerology.html', 'Numerology', 'numerology', 'numbers from your date and name'],
  ];
  // пункт “Отзывы” в меню — только когда в content.js есть отзывы (иначе блок на главной скрыт)
  const hasReviews = !!(SITE.reviews && SITE.reviews.length);
  // обучение можно скрыть целиком: academy.enabled: false в content.js
  const academyOn = !!(SITE.academy && SITE.academy.enabled !== false);
  // премиум-доступ (платные разделы по коду, js/premium.js): premium.enabled: false в content.js — ссылки не показываются
  const premOn = !!(SITE.premium && SITE.premium.enabled !== false);
  // Алина вошла в кабинет на этом устройстве (ключ хранит js/admin.js) — показываем ей ссылки на кабинет
  const isAlina = () => { try { return !!(localStorage.getItem('am_adminKey') || sessionStorage.getItem('am_adminKey')); } catch (e) { return false; } };
  const isPreview = location.protocol === 'file:' || /^(localhost|127\.|192\.168\.|\[::1\])/.test(location.hostname);

  /** Действующая акция или null (после даты окончания — исчезает сама). */
  function promoInfo() {
    const p = SITE.promo;
    if (!p || !p.enabled || !p.until) return null;
    const end = new Date(p.until + 'T23:59:59');
    const now = new Date();
    if (isNaN(end) || now > end) return null;
    return Object.assign({}, p, { end, days: Math.max(1, Math.ceil((end - now) / 86400000)) });
  }
  // ---------- валюта по стране посетителя (по часовому поясу браузера) ----------
  // Базовая валюта цен — SITE.baseCurrency (в демо USD): поле price — в ней, prices.EUR / prices.GBP — другие валюты.
  const BASE = SITE.baseCurrency || 'USD';
  const CUR = SITE.currencies || { [BASE]: SITE.currency || '$' };
  const browserTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();
  function currencyForZone(tz) {
    for (const [code, zones] of SITE.currencyRules || []) if (zones.some((z) => tz === z || (z.endsWith('/') && String(tz).startsWith(z)))) return code;
    return SITE.currencyFallback || BASE;
  }
  function currency() { const c = store.get('currency', null); return c && CUR[c] ? c : (CUR[currencyForZone(browserTz)] ? currencyForZone(browserTz) : BASE); }
  function setCurrency(code) { if (!CUR[code]) return; store.set('currency', code); document.dispatchEvent(new CustomEvent('currencychange', { detail: code })); }
  const CUR_NAMES = { USD: ['US dollars', 'US dollars'], EUR: ['Euros', 'euros'], GBP: ['British pounds', 'British pounds'], RUB: ['Rubles', 'rubles'] };
  // любой элемент с data-cur (шапка, переключатель над ценами) меняет валюту
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-cur]');
    if (!b || b.dataset.cur === currency()) return;
    setCurrency(b.dataset.cur);
    if (b.closest('.cur-panel') && !document.getElementById('servicesGrid')) toast(`Prices on the site are in ${(CUR_NAMES[b.dataset.cur] || ['', b.dataset.cur])[1]}`, 'money');
  });
  /** Цена объекта в текущей валюте: price — базовая валюта, prices.EUR / prices.GBP — другие. Нет цены в валюте — базовая. */
  function priceOf(o, field) {
    const code = currency();
    const base = +(o && o[field || 'price']) || 0;
    const other = o && o[field ? field + 'Prices' : 'prices'];
    if (code !== BASE && other && other[code] != null) return { n: +other[code], code };
    return { n: base, code: BASE };
  }
  function money(n, code) { return n || n === 0 ? moneyStr(n, CUR[code || currency()] || '$') : ''; }

  /** Цена услуги с учётом акции (в текущей валюте), округление до $5. */
  function priceFor(svc) {
    const pr = promoInfo();
    const { n, code } = priceOf(svc);
    if (pr && n && (pr.services || []).includes(svc.id)) {
      const step = 5;
      return { now: Math.round((n * (1 - pr.percent / 100)) / step) * step, old: n, percent: pr.percent, code };
    }
    return { now: n, code };
  }
  const minPrice = () => Math.min(...SITE.services.filter((x) => x.price).map((x) => priceFor(x).now));
  /** Город по часовому поясу посетителя (для лунного календаря и “Неба сегодня”). */
  function cityForZone() {
    const def = CITIES.find((c) => c.name === SITE.defaultCity);
    if (def && def.tz === browserTz) return def;
    return CITIES.find((c) => c.tz === browserTz) || null;
  }

  function contactLinks() {
    const c = SITE.contacts || {};
    const out = [];
    if (c.telegram) out.push({ k: 'telegram', label: 'Telegram', href: 'https://t.me/' + c.telegram.replace(/^@/, '') });
    if (c.telegramChannel) out.push({ k: 'telegram', label: 'Telegram channel', href: 'https://t.me/' + c.telegramChannel.replace(/^@/, '') });
    if (c.telegramBot) out.push({ k: 'message-heart', label: 'Telegram bot: horoscope and Moon of the day', href: botHref('src_site') });
    if (c.whatsapp) out.push({ k: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/' + c.whatsapp.replace(/\D/g, '') });
    if (c.instagram) out.push({ k: 'instagram', label: 'Instagram', href: 'https://instagram.com/' + c.instagram.replace(/^@/, '') });
    if (c.tiktok) out.push({ k: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@' + c.tiktok.replace(/^@/, '') });
    if (c.vk) out.push({ k: 'vk', label: 'VK', href: 'https://vk.com/' + c.vk });
    if (c.youtube) out.push({ k: 'youtube', label: 'YouTube', href: c.youtube });
    if (c.email) out.push({ k: 'mail', label: c.email, href: 'mailto:' + c.email });
    if (c.phone) out.push({ k: 'phone', label: c.phone, href: 'tel:' + c.phone.replace(/[^\d+]/g, '') });
    return out;
  }

  /** Ссылка на Telegram-бота Алины с меткой (start=src_site__natal и т. п.). Пусто, если бот не указан. */
  function botHref(payload) {
    const b = (SITE.contacts || {}).telegramBot;
    return b ? `https://t.me/${b.replace(/^@/, '')}${payload ? '?start=' + payload : ''}` : '';
  }
  /** Плашка “получать в Telegram” под инструментом. */
  function botCta(payload, text) {
    const href = botHref(payload);
    return href ? `<a class="bot-cta" href="${esc(href)}" target="_blank" rel="noopener">${icon('telegram')}<span>${text}</span><span class="arr">→</span></a>` : '';
  }

  // ---------- Яндекс Метрика (только на опубликованном сайте) ----------
  const metrikaId = SITE.analytics && String(SITE.analytics.metrikaId || '').trim();
  if (metrikaId && !isPreview && !window.ARTIFACT_PREVIEW) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = 1 * new Date();
    const s = document.createElement('script');
    s.async = true; s.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.appendChild(s);
    window.ym(+metrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }
  function goal(name) { try { if (metrikaId && window.ym) window.ym(+metrikaId, 'reachGoal', name); } catch (e) { /* без аналитики */ } }
  document.addEventListener('click', (e) => { const a = e.target.closest && e.target.closest('a[href^="https://t.me/"]'); if (a) goal('telegram'); });

  /** Записка от Алины с фото — для страниц-инструментов. */
  function alinaNote(text, cta) {
    return `<div class="alina-note"><img src="${esc(SITE.avatar || 'assets/img/avatar.webp')}" alt="${esc(SITE.firstName || SITE.name)}" width="56" height="56" loading="lazy"><div class="bubble"><span class="note-who">${esc(SITE.firstName || SITE.name)}</span><p>${text}</p>${cta ? `<div class="row" style="gap:10px">${cta}</div>` : ''}</div></div>`;
  }

  /** Полоса «демо-сайт»: кто сделал, пароль кабинета, код премиума, сброс демо-данных. Включается content.js → demo. */
  function demoBar() {
    const D = SITE.demo, bar = document.createElement('div');
    bar.className = 'demo-bar';
    bar.innerHTML = `<div class="container demo-inner">
        <span class="demo-tag">Demo</span>
        <span class="demo-text">A sample site for a fictional astrologer, built by <a href="${esc(D.studioUrl)}" target="_blank" rel="noopener">${esc(D.studio)}</a>. Everything works — forms stay in your browser.</span>
        <details class="demo-more">
          <summary>Try everything</summary>
          <div class="demo-pop">
            <p><b>Astrologer’s dashboard</b> — clients, inquiries, schedule, gift certificates.<br>
              <a href="cabinet.html">Open the dashboard</a> · password <code>${esc(D.password)}</code> <button type="button" class="demo-copy" data-copy="${esc(D.password)}">copy</button></p>
            ${D.premiumLink ? `<p><b>Premium sections</b> — dated forecasts, in-depth synastry, the full chart.<br><button type="button" class="demo-copy demo-premium">Unlock premium in this browser</button></p>` : ''}
            <p><b>Booking form</b> — send yourself a test inquiry from any “Book” button; it lands encrypted in the dashboard’s Inquiries.</p>
            <p class="demo-fine">${esc(SITE.name)}, the clients and the reviews on this site are fictional. Photos: Unsplash.</p>
            <button type="button" class="demo-reset">Reset demo data</button>
          </div>
        </details>
      </div>`;
    bar.addEventListener('click', async (e) => {
      const c = e.target.closest('.demo-copy');
      if (c) { try { await navigator.clipboard.writeText(c.dataset.copy); toast('Password copied', 'check'); } catch (er) { toast(c.dataset.copy, 'info'); } }
      // премиум — кодом из демо-ссылки прямо здесь (в просмотре по ссылке #k=… в адресе может не дойти до страницы)
      if (e.target.closest('.demo-premium') && window.Premium) {
        const r = await window.Premium.activate(window.Premium.extract(SITE.demo.premiumLink)).catch(() => ({}));
        toast(r && r.ok ? 'Premium is open in this browser' : 'Couldn’t unlock premium here', r && r.ok ? 'crown' : 'info');
        if (r && r.ok) setTimeout(() => location.reload(), 900);
      }
      if (e.target.closest('.demo-reset')) {
        try { Object.keys(localStorage).filter((k) => /^(am_|demo_)/.test(k)).forEach((k) => localStorage.removeItem(k)); sessionStorage.clear(); } catch (er) { /* нет хранилища */ }
        location.reload();
      }
    });
    return bar;
  }

  function renderChrome() {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const onTool = TOOLS.some(([h]) => h === page);
    const showCur = page !== 'cabinet.html' && Object.keys(CUR).length > 1;
    const pr = promoInfo();
    let closedPromo = false; try { closedPromo = sessionStorage.getItem('am_promo_closed') === '1'; } catch (e) { /* нет */ }
    if (pr && !closedPromo && page !== 'cabinet.html') {
      const bar = document.createElement('div');
      bar.className = 'promo-bar';
      bar.innerHTML = `<div class="container promo-inner">
          <span class="promo-flame">${icon('flame-filled')}</span>
          <span class="promo-text"><b>−${pr.percent}%</b> ${esc(pr.short)} <span class="promo-until">until ${fmt.MONTHS_GEN[pr.end.getMonth()]} ${pr.end.getDate()} · ${pr.days} ${fmt.plural(pr.days, 'day', 'days', 'days')} left</span></span>
          <button class="promo-btn" type="button" data-book>Book</button>
          <button class="promo-x" type="button" aria-label="Hide">${icon('close')}</button></div>`;
      document.body.prepend(bar);
      bar.querySelector('.promo-x').addEventListener('click', () => {
        try { sessionStorage.setItem('am_promo_closed', '1'); } catch (e) { /* нет */ }
        if (reduceMotion() || !bar.animate) { bar.remove(); return; }
        // полоса плавно складывается, страница не дёргается
        bar.style.overflow = 'hidden';
        bar.animate({ height: [bar.offsetHeight + 'px', '0px'], opacity: [1, 0] }, { duration: 420, easing: EASE_IN_OUT }).onfinish = () => bar.remove();
      });
    }
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container header-inner">
        <a class="brand" href="index.html" aria-label="${esc(SITE.name)} — home">
          <span class="brand-mark"><img src="${esc(SITE.avatar || 'assets/img/avatar.webp')}" alt="" width="40" height="40"></span>
          <span><span class="brand-name">${esc(SITE.name)}</span><span class="brand-role">${esc(SITE.role)}</span></span>
        </a>
        <nav class="nav" aria-label="Main menu">
          <a href="index.html#services">Sessions</a>
          <a href="energy.html"${page === 'energy.html' ? ' aria-current="page"' : ''}>Energy work</a>
          <div class="nav-drop">
            <button type="button" class="nav-drop-btn${onTool ? ' active' : ''}" aria-expanded="false" aria-haspopup="true">Tools ${icon('chevron-down', 'chev')}</button>
            <div class="nav-panel" role="menu">
              ${TOOLS.map(([h, t, ic, d]) => `<a role="menuitem" href="${h}"${page === h ? ' aria-current="page"' : ''}><span class="np-ic">${icon(ic)}</span><span><b>${t}</b><small>${d}</small></span></a>`).join('')}
            </div>
          </div>
          ${premOn ? `<a class="nav-premium" data-premium-link href="premium.html"${page === 'premium.html' ? ' aria-current="page"' : ''}>${icon('crown')}Premium</a>` : ''}
          ${academyOn ? `<a href="academy.html"${page === 'academy.html' ? ' aria-current="page"' : ''}>Lessons</a>` : ''}
          <a href="index.html#about">About</a>
          ${hasReviews ? '<a href="index.html#reviews">Reviews</a>' : ''}
        </nav>
        <div class="header-actions">
          ${SITE.media && SITE.media.ambientSound ? `<button class="icon-btn sound-toggle" type="button" aria-pressed="false" aria-label="Turn on background sound" title="Background sound">${icon('volume-off')}</button>` : ''}
          ${showCur ? `<div class="cur-drop">
            <button type="button" class="cur-btn" aria-haspopup="menu" aria-expanded="false" title="Price currency"><span class="cur-sign"></span><span class="cur-code"></span>${icon('chevron-down', 'chev')}</button>
            <div class="cur-panel" role="menu" aria-label="Price currency">
              <div class="cur-title">Show prices in</div>
              ${Object.keys(CUR).map((code) => `<button type="button" role="menuitemradio" aria-checked="false" data-cur="${code}" tabindex="-1"><span class="cs">${CUR[code]}</span><span>${(CUR_NAMES[code] || [code])[0]}</span>${icon('check', 'ck')}</button>`).join('')}
            </div>
          </div>` : ''}
          <button class="icon-btn theme-toggle" type="button"></button>
          <button class="btn btn-primary btn-sm" type="button" data-book>Book</button>
          <button class="icon-btn burger" type="button" aria-label="Menu" aria-expanded="false">${icon('menu')}</button>
        </div>
      </div>`;
    const promoBar = document.querySelector('.promo-bar');
    if (promoBar) promoBar.after(header); else document.body.prepend(header);
    const skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = '#main'; skip.textContent = 'Skip to content';
    document.body.prepend(skip);
    if (SITE.demo && SITE.demo.enabled) skip.after(demoBar());

    // фоновый звук — только по нажатию
    const snd = header.querySelector('.sound-toggle');
    if (snd) {
      let audio = null, fadeT = null;
      const set = (on) => { snd.setAttribute('aria-pressed', String(on)); snd.innerHTML = icon(on ? 'volume' : 'volume-off'); snd.setAttribute('aria-label', on ? 'Turn off background sound' : 'Turn on background sound'); };
      snd.addEventListener('click', () => {
        const on = snd.getAttribute('aria-pressed') !== 'true';
        if (!audio) { audio = new Audio(SITE.media.ambientSound); audio.loop = true; audio.volume = 0; }
        clearInterval(fadeT);
        if (on) { audio.play().catch(() => set(false)); fadeT = setInterval(() => { audio.volume = Math.min(0.28, audio.volume + 0.02); if (audio.volume >= 0.28) clearInterval(fadeT); }, 80); }
        else { fadeT = setInterval(() => { audio.volume = Math.max(0, audio.volume - 0.03); if (audio.volume <= 0) { clearInterval(fadeT); audio.pause(); } }, 60); }
        set(on);
      });
    }

    const drop = header.querySelector('.nav-drop'), dropBtn = header.querySelector('.nav-drop-btn');
    const setDrop = (o) => { drop.classList.toggle('open', o); dropBtn.setAttribute('aria-expanded', String(o)); };
    dropBtn.addEventListener('click', (e) => { e.stopPropagation(); setDrop(!drop.classList.contains('open')); });
    document.addEventListener('click', (e) => { if (!drop.contains(e.target)) setDrop(false); });
    drop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setDrop(false); dropBtn.focus(); } });

    // валюта справа сверху
    const cur = header.querySelector('.cur-drop');
    if (cur) {
      const cBtn = cur.querySelector('.cur-btn'), opts = $$('[data-cur]', cur);
      const sync = () => {
        const c = currency();
        cur.querySelector('.cur-sign').textContent = CUR[c];
        cur.querySelector('.cur-code').textContent = c;
        cBtn.setAttribute('aria-label', `Price currency: ${(CUR_NAMES[c] || [c])[0].toLowerCase()}`);
        opts.forEach((o) => o.setAttribute('aria-checked', String(o.dataset.cur === c)));
      };
      const setCur = (o, focus) => {
        cur.classList.toggle('open', o); cBtn.setAttribute('aria-expanded', String(o));
        if (o && focus) (opts.find((x) => x.getAttribute('aria-checked') === 'true') || opts[0]).focus();
      };
      sync();
      document.addEventListener('currencychange', sync);
      cBtn.addEventListener('click', (e) => setCur(!cur.classList.contains('open'), e.detail === 0));
      document.addEventListener('click', (e) => { if (!cur.contains(e.target)) setCur(false); }, true);
      cur.querySelector('.cur-panel').addEventListener('click', (e) => { if (e.target.closest('[data-cur]')) { setCur(false); cBtn.focus(); } });
      cur.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { setCur(false); cBtn.focus(); return; }
        if (e.target === cBtn) { if (e.key === 'ArrowDown') { e.preventDefault(); setCur(true, true); } return; }
        const i = opts.indexOf(document.activeElement);
        if (i < 0) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); opts[(i + (e.key === 'ArrowDown' ? 1 : opts.length - 1)) % opts.length].focus(); }
        if (e.key === 'Tab') setCur(false);
      });
    }

    const mm = document.createElement('div');
    mm.className = 'mobile-menu'; mm.setAttribute('role', 'dialog'); mm.setAttribute('aria-label', 'Menu');
    mm.innerHTML = `
      <div class="close-row">
        <a class="brand" href="index.html"><span class="brand-mark"><img src="${esc(SITE.avatar || 'assets/img/avatar.webp')}" alt="" width="40" height="40"></span><span class="brand-name">${esc(SITE.name)}</span></a>
        <button class="icon-btn" type="button" data-close-menu aria-label="Close menu">${icon('close')}</button>
      </div>
      <nav class="mm-main">${[['index.html', 'Home'], ['index.html#services', 'Readings and prices'], ['energy.html', 'Energy work'], ['index.html#about', 'About'], ...(hasReviews ? [['index.html#reviews', 'Reviews']] : []), ...(academyOn ? [['academy.html', 'Astrology lessons']] : [])].map(([h, t], i) => `<a href="${h}" style="transition-delay:${0.04 * i}s">${t}</a>`).join('')}</nav>
      <p class="mm-label">Free tools on the site</p>
      <div class="mm-tools">${TOOLS.map(([h, t, ic]) => `<a href="${h}">${icon(ic)}<span>${t}</span></a>`).join('')}</div>
      ${premOn ? `<a class="mm-premium" data-premium-link href="premium.html">${icon('crown')}<span><b>Premium access</b><small>dated forecasts and in-depth readings</small></span>${icon('arrow')}</a>` : ''}
      <div style="margin-top:22px;display:grid;gap:10px">
        <button class="btn btn-primary btn-block" type="button" data-book>Book a reading</button>
        ${pr ? `<p class="small center" style="margin:0"><span class="sticker sm">−${pr.percent}%</span> ${esc(pr.short)} until ${fmt.MONTHS_GEN[pr.end.getMonth()]} ${pr.end.getDate()}</p>` : ''}
      </div>
      ${isAlina() ? `<a class="mm-cabinet" href="cabinet.html">${icon('lock')} Astrologer’s dashboard</a>` : ''}`;
    document.body.appendChild(mm);
    const burger = $('.burger', header);
    const openMenu = (o) => { mm.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; };
    burger.addEventListener('click', () => openMenu(true));
    $('[data-close-menu]', mm).addEventListener('click', () => openMenu(false));
    mm.addEventListener('click', (e) => { if (e.target.closest('a') || e.target.closest('[data-book]')) openMenu(false); });

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // закреплённая кнопка записи на телефоне
    if (page !== 'cabinet.html') {
      const cta = document.createElement('div');
      cta.className = 'mobile-cta';
      cta.innerHTML = `<img src="${esc(SITE.avatar || 'assets/img/avatar.webp')}" alt="" width="40" height="40"><div class="mc-text"><b>A reading with Iris</b><small>${pr ? `<span class="sticker xs">−${pr.percent}%</span> ${esc(pr.short)}` : 'online, wherever you are'}</small></div><button class="btn btn-primary btn-sm" type="button" data-book>Book</button>`;
      document.body.appendChild(cta);
      const toggleCta = () => {
        const bk = document.getElementById('booking');
        const nearBooking = bk && bk.getBoundingClientRect().top < window.innerHeight && bk.getBoundingClientRect().bottom > 0;
        const footerEl = document.querySelector('.site-footer');
        const nearFooter = footerEl && footerEl.getBoundingClientRect().top < window.innerHeight;
        cta.classList.toggle('show', window.scrollY > 520 && !nearBooking && !nearFooter);
      };
      window.addEventListener('scroll', toggleCta, { passive: true }); toggleCta();
    }

    const links = contactLinks();
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <a class="brand" href="index.html"><span class="brand-mark"><img src="${esc(SITE.avatar || 'assets/img/avatar.webp')}" alt="" width="40" height="40" loading="lazy"></span><span><span class="brand-name">${esc(SITE.name)}</span><span class="brand-role">${esc(SITE.role)}</span></span></a>
            <p class="hand-sign">${esc(SITE.about && SITE.about.signature ? SITE.about.signature : '')}</p>
            <p class="muted small" style="max-width:34ch">${esc(SITE.tagline)}. Readings online, wherever you are.</p>
            <div class="socials">${links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener" aria-label="${esc(l.label)}" title="${esc(l.label)}">${icon(l.k)}</a>`).join('')}</div>
          </div>
          <div><h4>Tools</h4>${TOOLS.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
          <div><h4>Sessions</h4>${SITE.services.slice(0, 6).map((s) => `<a href="index.html#services">${esc(s.title)}</a>`).join('')}</div>
          <div><h4>Site</h4><a href="energy.html">Energy work</a><a href="astro.html">Chart studio · my charts</a>${academyOn ? '<a href="academy.html">Astrology lessons</a>' : ''}<a href="index.html#about">About</a><a href="index.html#faq">FAQ</a><a href="index.html#booking">Book</a>${premOn ? '<a href="premium.html">Premium access</a>' : ''}<a href="privacy.html">Privacy policy</a>${isAlina() ? '<a href="cabinet.html" class="muted">Astrologer’s dashboard</a>' : ''}</div>
        </div>
        <p class="disclaimer">Astrology is a tool for self-knowledge. It doesn’t replace medical, psychological, legal or financial help. Calculations: tropical zodiac, astronomy-engine ephemeris based on NASA JPL data; positions accurate to about one arcminute.</p>
        <div class="footer-bottom"><span>© ${new Date().getFullYear()} ${esc(SITE.name)}</span>${(SITE.credits || []).length ? `<span class="credits">Photos: ${SITE.credits.map((c) => `<a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.who)}</a>`).join(', ')} on Unsplash · Icons: Tabler</span>` : '<span>Icons — Tabler Icons</span>'}${SITE.demo && SITE.demo.enabled ? `<a class="made-by" href="${esc(SITE.demo.studioUrl)}" target="_blank" rel="noopener">Demo site by ${esc(SITE.demo.studio)}</a>` : ''}</div>
      </div>`;
    document.body.appendChild(footer);

    if (window.ARTIFACT_PREVIEW) document.documentElement.classList.add('in-artifact');

    $$('.theme-toggle').forEach((b) => b.addEventListener('click', () => switchTheme(b)));
    applyTheme(document.documentElement.getAttribute('data-theme'));
  }

  // ---------- звёздное небо ----------
  function starfield() {
    const wrap = document.createElement('div'); wrap.className = 'sky-bg'; wrap.setAttribute('aria-hidden', 'true');
    const cv = document.createElement('canvas'); wrap.appendChild(cv);
    const au = document.createElement('div'); au.className = 'aurora'; au.setAttribute('aria-hidden', 'true'); au.innerHTML = '<i></i><i></i><i></i>';
    document.body.prepend(wrap); document.body.prepend(au);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, stars = [], shoot = null, last = 0, prevT = 0, color = '#fff', gold = '#f3d9a0';
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Звёзды — искорки ✦. Каждая форма рисуется один раз в маленький холст-спрайт, а в кадре только копируется:
    // так сотня мерцающих искорок не нагружает телефон.
    const SPR = 64, sprites = {};
    function sparklePath(g, cx, cy, R, pinch) {
      const k = R * (pinch || 0.12); // насколько “втянуты” бока между лучами: меньше — тоньше лучи
      g.beginPath(); g.moveTo(cx, cy - R);
      g.quadraticCurveTo(cx + k, cy - k, cx + R, cy); g.quadraticCurveTo(cx + k, cy + k, cx, cy + R);
      g.quadraticCurveTo(cx - k, cy + k, cx - R, cy); g.quadraticCurveTo(cx - k, cy - k, cx, cy - R);
      g.closePath();
    }
    function sprite(col, big) {
      const key = col + (big ? '*' : '');
      if (sprites[key]) return sprites[key];
      const c = document.createElement('canvas'); c.width = c.height = SPR;
      const g = c.getContext('2d'), m = SPR / 2;
      // Мягкий блюр: искорка рисуется за краем холста, а в спрайт попадает только её размытая “тень”.
      // Звёзды остаются фоном и не спорят с текстом; размытие считается один раз, а не каждый кадр.
      const OFF = SPR * 4;
      g.fillStyle = col; g.shadowColor = col; g.shadowOffsetX = OFF;
      if (big) {
        g.shadowBlur = SPR * 0.3; g.globalAlpha = 0.55; sparklePath(g, m - OFF, m, SPR * 0.3, 0.16); g.fill(); // ореол
        g.shadowBlur = SPR * 0.12; g.globalAlpha = 0.9; sparklePath(g, m - OFF, m, SPR * 0.26, 0.12); g.fill();
      } else {
        g.shadowBlur = SPR * 0.13; sparklePath(g, m - OFF, m, SPR * 0.24, 0.2); g.fill();
      }
      return (sprites[key] = c);
    }
    function readColors() {
      const cs = getComputedStyle(document.documentElement);
      color = cs.getPropertyValue('--star').trim() || '#fff';
      gold = cs.getPropertyValue('--star-gold').trim() || '#f3d9a0';
    }
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.max(38, Math.round((W * H) / 13000));
      let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      stars = Array.from({ length: n }, () => {
        const r = rnd();
        const big = r < 0.05;
        const size = big ? 18 + rnd() * 9 : r < 0.26 ? 11 + rnd() * 4 : 7.5 + rnd() * 3; // ширина искорки, px (мельче — уже не видно формы)
        return { x: rnd() * W, y: rnd() * H, size, big, gold: rnd() < 0.22, rot: (rnd() - 0.5) * 0.5, p: rnd() * Math.PI * 2, s: 0.4 + rnd() * 1.4 };
      });
      readColors();
    }
    function draw(t) {
      // мерцание медленное — хватает ~30 кадров в секунду (под стеклянными карточками небо размывается, и каждый кадр стоит дороже);
      // падающую звезду рисуем на полной частоте
      if (!reduce && !shoot && t - prevT < 30) { requestAnimationFrame(draw); return; }
      const dt = Math.min(64, t - prevT || 16.7); prevT = t;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      for (const s of stars) {
        const tw = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p); // мерцание 0…1
        ctx.globalAlpha = (0.3 + 0.7 * tw) * (dark ? 0.42 : 0.3); // едва заметные: фон не мешает чтению
        const size = s.size * 1.7 * (reduce ? 1 : 0.85 + 0.25 * tw); // размытый спрайт крупнее — видимый размер тот же
        const a = s.rot + (reduce ? 0 : Math.sin(t / 5000 + s.p) * 0.22); // лёгкое покачивание лучей
        const cos = Math.cos(a) * dpr, sin = Math.sin(a) * dpr;
        ctx.setTransform(cos, sin, -sin, cos, s.x * dpr, s.y * dpr);
        ctx.drawImage(sprite(s.gold ? gold : color, s.big), -size / 2, -size / 2, size, size);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!reduce && dark) {
        if (!shoot && t - last > 7000 && Math.random() < 0.02) { shoot = { x: Math.random() * W * 0.7 + W * 0.2, y: Math.random() * H * 0.3, l: 0 }; last = t; }
        if (shoot) {
          shoot.l += 0.84 * dt; const len = 120;
          const g = ctx.createLinearGradient(shoot.x - shoot.l, shoot.y + shoot.l * 0.45, shoot.x - shoot.l + len, shoot.y + shoot.l * 0.45 - len * 0.45);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,245,225,0.9)');
          ctx.globalAlpha = Math.max(0, 1 - shoot.l / 600) * 0.45; ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(255,245,225,.8)'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.moveTo(shoot.x - shoot.l, shoot.y + shoot.l * 0.45); ctx.lineTo(shoot.x - shoot.l + len, shoot.y + shoot.l * 0.45 - len * 0.45); ctx.stroke();
          ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
          if (shoot.l > 600) shoot = null;
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce && !document.hidden) requestAnimationFrame(draw);
    }
    resize(); window.addEventListener('resize', resize);
    document.addEventListener('themechange', () => { readColors(); if (reduce) draw(0); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduce) requestAnimationFrame(draw); });
    requestAnimationFrame(draw);
  }

  // ---------- появление при прокрутке ----------
  // Один наблюдатель на всю страницу; блоки, добавленные позже (результаты, вкладки, кабинет), подхватываются сами.
  // threshold 0: даже очень высокий блок не останется невидимым.
  const revealIO = ('IntersectionObserver' in window) && !reduceMotion()
    ? new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); } }), { threshold: 0, rootMargin: '0px 0px -40px 0px' })
    : null;
  if (revealIO) document.documentElement.classList.add('reveal-on');
  // запасной путь: при очень быстрой прокрутке или прыжке по ссылке (“Запись”) наблюдатель может проскочить блок
  // целиком — такие блоки (уже выше экрана) показываем сразу, чтобы при возврате наверх не было пустых мест
  let revealLate = null;
  if (revealIO) addEventListener('scroll', () => {
    if (revealLate) return;
    revealLate = setTimeout(() => {
      revealLate = null;
      document.querySelectorAll('.reveal:not(.in)').forEach((e) => { if (e.offsetParent && e.getBoundingClientRect().bottom < 0) { e.classList.add('in'); revealIO.unobserve(e); } });
    }, 250);
  }, { passive: true });
  function reveal(root) {
    const els = $$('.reveal:not(.in)', root);
    if (root && root.matches && root.matches('.reveal:not(.in)')) els.push(root);
    if (!revealIO) { els.forEach((e) => e.classList.add('in')); return; }
    els.forEach((e) => revealIO.observe(e));
  }
  // ---------- скользящая подсветка у вкладок и переключателей (.tabs, .seg) ----------
  // Под выбранной кнопкой — одна плашка, она переезжает к новой кнопке. Если переключатель перерисовали целиком
  // (гороскоп, валюта, кабинет), плашка стартует с того места, где стояла у прежнего — и тоже едет.
  const sliderMem = {}, sliderBoxes = [];
  const isOn = (b) => b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-pressed') === 'true';
  function setInd(ind, r, animate) {
    if (!animate) ind.style.transition = 'none';
    ind.style.transform = `translate(${r.x}px, ${r.y}px)`; ind.style.width = r.w + 'px'; ind.style.height = r.h + 'px'; ind.style.opacity = '1';
    if (!animate) { void ind.offsetWidth; ind.style.transition = ''; }
  }
  function placeSlider(box, animate) {
    const ind = box._ind; if (!ind || !box.isConnected) return;
    const btn = Array.from(box.children).find((b) => b.tagName === 'BUTTON' && isOn(b));
    if (!btn || !box.offsetWidth) { ind.style.opacity = '0'; return; }
    const r = { x: btn.offsetLeft, y: btn.offsetTop, w: btn.offsetWidth, h: btn.offsetHeight };
    setInd(ind, r, animate && !reduceMotion());
    sliderMem[box._key] = r;
    // в узкой прокручиваемой полосе вкладок выбранная плавно выезжает в центр
    if (animate && box.scrollWidth > box.clientWidth + 2) box.scrollTo({ left: r.x - (box.clientWidth - r.w) / 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
  function initSlider(box) {
    if (box._ind) return;
    const btns = Array.from(box.children).filter((b) => b.tagName === 'BUTTON');
    if (btns.length < 2) return;
    const ind = document.createElement('span'); ind.className = 'tab-ind'; ind.setAttribute('aria-hidden', 'true');
    box.prepend(ind); box._ind = ind; box.classList.add('has-ind'); sliderBoxes.push(box);
    box._key = btns.map((b) => b.textContent.trim()).join('|');
    const mem = sliderMem[box._key];
    if (mem && box.offsetWidth && !reduceMotion()) { setInd(ind, mem, false); requestAnimationFrame(() => placeSlider(box, true)); }
    else placeSlider(box, false);
    new MutationObserver(() => placeSlider(box, true)).observe(box, { attributes: true, subtree: true, attributeFilter: ['aria-selected', 'aria-pressed'] });
    if ('ResizeObserver' in window) {
      box._w = box.offsetWidth;
      new ResizeObserver(() => { const w = box.offsetWidth; if (w === box._w) return; box._w = w; placeSlider(box, false); }).observe(box);
    }
  }
  function sliders(root) {
    if (root && root.matches && root.matches('.tabs, .seg')) initSlider(root);
    $$('.tabs, .seg', root).forEach(initSlider);
  }
  // шрифты догрузились — ширина кнопок могла измениться
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => sliderBoxes.forEach((b) => placeSlider(b, false)));

  // новые блоки на странице (результаты, вкладки, кабинет): появление при прокрутке и подсветка переключателей
  function watchDom() {
    if (!('MutationObserver' in window)) return;
    new MutationObserver((muts) => {
      for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1 && !n.classList.contains('tab-ind')) { if (revealIO) reveal(n); sliders(n); }
    }).observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener('beforeprint', () => $$('.reveal:not(.in)').forEach((e) => e.classList.add('in')));

  // ---------- переходы между страницами: запасной вариант ----------
  // Где браузер умеет View Transitions между страницами, всё делает CSS (@view-transition).
  // Иначе (класс pt-fallback ставит скрипт в <head>): по клику содержимое тает, потом открывается новая страница, там — проявляется.
  if (document.documentElement.classList.contains('pt-fallback')) {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      let url; try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // якорь на этой же странице — просто прокрутка
      e.preventDefault();
      document.documentElement.classList.add('pt-leave');
      setTimeout(() => { location.href = url.href; }, 240);
    });
    // “Назад” из кэша браузера возвращает страницу как была — снимаем затухание
    window.addEventListener('pageshow', (e) => { if (e.persisted) document.documentElement.classList.remove('pt-leave'); });
  }

  // ---------- плавные аккордеоны (<details>) ----------
  // Браузер открывает <details> мгновенно; здесь высота плавно меняется, а содержимое проявляется.
  // Работает для всех details на сайте (вопросы, инструкции, “координаты вручную”, настройки расчёта).
  function detailsHeight(d, open) { const was = d.open; d.open = open; const h = d.getBoundingClientRect().height; d.open = was; return h; }
  function toggleDetails(d) {
    const st = d._acc;
    const target = !(st ? st.target : d.open);
    const from = d.getBoundingClientRect().height;
    const kids = Array.from(d.children).filter((k) => k.tagName !== 'SUMMARY');
    const kidOp = kids.map((k) => +getComputedStyle(k).opacity);
    if (st) { st.anim.onfinish = null; st.anim.cancel(); st.fades.forEach((a) => a.cancel()); }
    d.open = true;
    const to = target ? d.getBoundingClientRect().height : detailsHeight(d, false);
    d.classList.toggle('is-closing', !target);
    d.style.overflow = 'hidden';
    const dur = Math.round(Math.min(620, Math.max(300, 240 + Math.abs(to - from) * 0.55)));
    const anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: dur, easing: target ? EASE_OUT : EASE_IN_OUT });
    const fades = kids.map((k, i) => k.animate(
      target ? { opacity: [st ? kidOp[i] : 0, 1], translate: [st ? '0 0' : '0 -6px', '0 0'] } : { opacity: [kidOp[i], 0] },
      { duration: target ? dur : Math.round(dur * 0.55), easing: 'ease', fill: 'forwards' }));
    d._acc = { target, anim, fades };
    anim.onfinish = () => {
      d._acc = null;
      if (!target) d.open = false;
      fades.forEach((a) => a.cancel());
      d.classList.remove('is-closing');
      d.style.overflow = '';
    };
  }
  document.addEventListener('click', (e) => {
    const s = e.target.closest && e.target.closest('summary');
    if (!s || e.defaultPrevented) return;
    const d = s.parentElement;
    if (!d || d.tagName !== 'DETAILS' || d.querySelector(':scope > summary') !== s || !d.animate || reduceMotion()) return;
    e.preventDefault();
    toggleDetails(d);
  });

  // ---------- тосты и модалки ----------
  function toast(msg, ic) {
    let box = $('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = icon(ic || 'sparkle') + `<span>${esc(msg)}</span>`;
    box.appendChild(t); setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 380); }, 3200);
  }
  // открыто окно — страница под ним не прокручивается (счётчик: окна могут открываться одно за другим)
  let scrollLocks = 0;
  function lockScroll(on) {
    scrollLocks = Math.max(0, scrollLocks + (on ? 1 : -1));
    document.body.classList.toggle('scroll-lock', scrollLocks > 0);
  }
  function modal(html, opts) {
    opts = opts || {};
    const back = document.createElement('div'); back.className = 'modal-back';
    back.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''} ${opts.cls || ''}" role="dialog" aria-modal="true"><button class="icon-btn x" type="button" aria-label="Close">${icon('close')}</button>${html}</div>`;
    document.body.appendChild(back);
    const prevFocus = document.activeElement;
    requestAnimationFrame(() => back.classList.add('open'));
    lockScroll(true);
    let closed = false;
    const close = () => { if (closed) return; closed = true; lockScroll(false); back.classList.remove('open'); document.removeEventListener('keydown', onKey); setTimeout(() => back.remove(), 300); if (prevFocus && prevFocus.focus) prevFocus.focus(); if (opts.onClose) opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    $('.x', back).addEventListener('click', close);
    setTimeout(() => { const f = $('input, select, textarea, button:not(.x)', back); if (f) f.focus(); }, 60);
    return { el: $('.modal', back), close };
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } ta.remove(); return ok;
    }
  }
  function download(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ---------- Луна: рисунок фазы ----------
  let moonUid = 0;
  function moonSVG(angle, opts) {
    opts = opts || {};
    const r = 45, cx = 50, cy = 50, id = 'mg' + (++moonUid);
    const a = ((angle % 360) + 360) % 360;
    const k = (1 - Math.cos(a * Math.PI / 180)) / 2;
    const rx = Math.abs(Math.cos(a * Math.PI / 180)) * r;
    const waxing = a < 180;
    let path;
    if (k < 0.01) path = '';
    else if (k > 0.99) path = `M${cx},${cy - r}A${r},${r} 0 1,1 ${cx - 0.01},${cy - r}Z`;
    else if (waxing) path = `M${cx},${cy - r}A${r},${r} 0 0,1 ${cx},${cy + r}A${rx},${r} 0 0,${k < 0.5 ? 0 : 1} ${cx},${cy - r}Z`;
    else path = `M${cx},${cy - r}A${r},${r} 0 0,0 ${cx},${cy + r}A${rx},${r} 0 0,${k < 0.5 ? 1 : 0} ${cx},${cy - r}Z`;
    const dark = opts.darkColor || (document.documentElement.getAttribute('data-theme') === 'dark' ? (SITE.moonShade || ['rgba(10, 8, 25, 0.55)'])[1] || 'rgba(10, 8, 25, 0.55)' : (SITE.moonShade || ['rgba(92, 74, 160, 0.26)'])[0]);
    return `<svg xmlns="http://www.w3.org/2000/svg" class="${opts.cls || ''}" viewBox="0 0 100 100" role="img" aria-label="Moon phase: ${Math.round(k * 100)}% illuminated">
      <defs><radialGradient id="${id}" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".65" stop-color="#f6e7c8"/><stop offset="1" stop-color="#e4cfa4"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark}" stroke="rgba(184,147,90,.6)" stroke-width="1.5"/>
      ${path ? `<path d="${path}" fill="url(#${id})"/>` : ''}
      ${k > 0.15 ? `<g fill="#c9b48a" opacity="${0.18 * Math.min(1, k * 1.5)}" clip-path="none"><circle cx="40" cy="38" r="7"/><circle cx="60" cy="56" r="9"/><circle cx="47" cy="66" r="4.5"/><circle cx="64" cy="33" r="4"/></g>` : ''}
    </svg>`;
  }

  // ---------- города ----------
  // Встроенные города (подсказка без интернета; остальное ищет геокодер Open-Meteo): США, Канада, Британия, Ирландия,
  // Австралия, Новая Зеландия, Европа и крупные города мира. [название, штат/страна, широта, долгота, часовой пояс]
  const CITIES = [
    ['New York', 'NY, USA', 40.7128, -74.006, 'America/New_York'], ['Brooklyn', 'NY, USA', 40.6782, -73.9442, 'America/New_York'], ['Los Angeles', 'CA, USA', 34.0522, -118.2437, 'America/Los_Angeles'],
    ['Chicago', 'IL, USA', 41.8781, -87.6298, 'America/Chicago'], ['Houston', 'TX, USA', 29.7604, -95.3698, 'America/Chicago'], ['Phoenix', 'AZ, USA', 33.4484, -112.074, 'America/Phoenix'],
    ['Philadelphia', 'PA, USA', 39.9526, -75.1652, 'America/New_York'], ['San Antonio', 'TX, USA', 29.4241, -98.4936, 'America/Chicago'], ['San Diego', 'CA, USA', 32.7157, -117.1611, 'America/Los_Angeles'],
    ['Dallas', 'TX, USA', 32.7767, -96.797, 'America/Chicago'], ['Austin', 'TX, USA', 30.2672, -97.7431, 'America/Chicago'], ['San Jose', 'CA, USA', 37.3382, -121.8863, 'America/Los_Angeles'],
    ['San Francisco', 'CA, USA', 37.7749, -122.4194, 'America/Los_Angeles'], ['Oakland', 'CA, USA', 37.8044, -122.2712, 'America/Los_Angeles'], ['Sacramento', 'CA, USA', 38.5816, -121.4944, 'America/Los_Angeles'],
    ['Seattle', 'WA, USA', 47.6062, -122.3321, 'America/Los_Angeles'], ['Portland', 'OR, USA', 45.5152, -122.6784, 'America/Los_Angeles'], ['Denver', 'CO, USA', 39.7392, -104.9903, 'America/Denver'],
    ['Boulder', 'CO, USA', 40.015, -105.2705, 'America/Denver'], ['Salt Lake City', 'UT, USA', 40.7608, -111.891, 'America/Denver'], ['Las Vegas', 'NV, USA', 36.1699, -115.1398, 'America/Los_Angeles'],
    ['Albuquerque', 'NM, USA', 35.0844, -106.6504, 'America/Denver'], ['Santa Fe', 'NM, USA', 35.687, -105.9378, 'America/Denver'], ['Tucson', 'AZ, USA', 32.2226, -110.9747, 'America/Phoenix'],
    ['Sedona', 'AZ, USA', 34.8697, -111.761, 'America/Phoenix'], ['Boston', 'MA, USA', 42.3601, -71.0589, 'America/New_York'], ['Washington', 'DC, USA', 38.9072, -77.0369, 'America/New_York'],
    ['Baltimore', 'MD, USA', 39.2904, -76.6122, 'America/New_York'], ['Richmond', 'VA, USA', 37.5407, -77.436, 'America/New_York'], ['Atlanta', 'GA, USA', 33.749, -84.388, 'America/New_York'],
    ['Savannah', 'GA, USA', 32.0809, -81.0912, 'America/New_York'], ['Miami', 'FL, USA', 25.7617, -80.1918, 'America/New_York'], ['Orlando', 'FL, USA', 28.5383, -81.3792, 'America/New_York'],
    ['Tampa', 'FL, USA', 27.9506, -82.4572, 'America/New_York'], ['Asheville', 'NC, USA', 35.5951, -82.5515, 'America/New_York'], ['Charlotte', 'NC, USA', 35.2271, -80.8431, 'America/New_York'],
    ['Raleigh', 'NC, USA', 35.7796, -78.6382, 'America/New_York'], ['Nashville', 'TN, USA', 36.1627, -86.7816, 'America/Chicago'], ['Memphis', 'TN, USA', 35.1495, -90.049, 'America/Chicago'],
    ['New Orleans', 'LA, USA', 29.9511, -90.0715, 'America/Chicago'], ['Detroit', 'MI, USA', 42.3314, -83.0458, 'America/Detroit'], ['Minneapolis', 'MN, USA', 44.9778, -93.265, 'America/Chicago'],
    ['Milwaukee', 'WI, USA', 43.0389, -87.9065, 'America/Chicago'], ['St. Louis', 'MO, USA', 38.627, -90.1994, 'America/Chicago'], ['Kansas City', 'MO, USA', 39.0997, -94.5786, 'America/Chicago'],
    ['Columbus', 'OH, USA', 39.9612, -82.9988, 'America/New_York'], ['Cleveland', 'OH, USA', 41.4993, -81.6944, 'America/New_York'], ['Cincinnati', 'OH, USA', 39.1031, -84.512, 'America/New_York'],
    ['Indianapolis', 'IN, USA', 39.7684, -86.1581, 'America/Indiana/Indianapolis'], ['Pittsburgh', 'PA, USA', 40.4406, -79.9959, 'America/New_York'], ['Newark', 'NJ, USA', 40.7357, -74.1724, 'America/New_York'],
    ['Honolulu', 'HI, USA', 21.3069, -157.8583, 'Pacific/Honolulu'], ['Anchorage', 'AK, USA', 61.2181, -149.9003, 'America/Anchorage'], ['San Juan', 'Puerto Rico', 18.4655, -66.1057, 'America/Puerto_Rico'],
    ['Toronto', 'ON, Canada', 43.6532, -79.3832, 'America/Toronto'], ['Montreal', 'QC, Canada', 45.5017, -73.5673, 'America/Toronto'], ['Ottawa', 'ON, Canada', 45.4215, -75.6972, 'America/Toronto'],
    ['Vancouver', 'BC, Canada', 49.2827, -123.1207, 'America/Vancouver'], ['Calgary', 'AB, Canada', 51.0447, -114.0719, 'America/Edmonton'], ['Edmonton', 'AB, Canada', 53.5461, -113.4938, 'America/Edmonton'],
    ['Winnipeg', 'MB, Canada', 49.8951, -97.1384, 'America/Winnipeg'], ['Halifax', 'NS, Canada', 44.6488, -63.5752, 'America/Halifax'], ['Mexico City', 'Mexico', 19.4326, -99.1332, 'America/Mexico_City'],
    ['Guadalajara', 'Mexico', 20.6597, -103.3496, 'America/Mexico_City'], ['Bogotá', 'Colombia', 4.711, -74.0721, 'America/Bogota'], ['Lima', 'Peru', -12.0464, -77.0428, 'America/Lima'],
    ['Buenos Aires', 'Argentina', -34.6037, -58.3816, 'America/Argentina/Buenos_Aires'], ['São Paulo', 'Brazil', -23.5505, -46.6333, 'America/Sao_Paulo'], ['Rio de Janeiro', 'Brazil', -22.9068, -43.1729, 'America/Sao_Paulo'],
    ['Santiago', 'Chile', -33.4489, -70.6693, 'America/Santiago'], ['London', 'England, UK', 51.5074, -0.1278, 'Europe/London'], ['Manchester', 'England, UK', 53.4808, -2.2426, 'Europe/London'],
    ['Birmingham', 'England, UK', 52.4862, -1.8904, 'Europe/London'], ['Bristol', 'England, UK', 51.4545, -2.5879, 'Europe/London'], ['Leeds', 'England, UK', 53.8008, -1.5491, 'Europe/London'],
    ['Liverpool', 'England, UK', 53.4084, -2.9916, 'Europe/London'], ['Brighton', 'England, UK', 50.8225, -0.1372, 'Europe/London'], ['Glasgow', 'Scotland, UK', 55.8642, -4.2518, 'Europe/London'],
    ['Edinburgh', 'Scotland, UK', 55.9533, -3.1883, 'Europe/London'], ['Cardiff', 'Wales, UK', 51.4816, -3.1791, 'Europe/London'], ['Belfast', 'Northern Ireland, UK', 54.5973, -5.9301, 'Europe/London'],
    ['Dublin', 'Ireland', 53.3498, -6.2603, 'Europe/Dublin'], ['Cork', 'Ireland', 51.8985, -8.4756, 'Europe/Dublin'], ['Sydney', 'NSW, Australia', -33.8688, 151.2093, 'Australia/Sydney'],
    ['Melbourne', 'VIC, Australia', -37.8136, 144.9631, 'Australia/Melbourne'], ['Brisbane', 'QLD, Australia', -27.4698, 153.0251, 'Australia/Brisbane'], ['Perth', 'WA, Australia', -31.9505, 115.8605, 'Australia/Perth'],
    ['Adelaide', 'SA, Australia', -34.9285, 138.6007, 'Australia/Adelaide'], ['Auckland', 'New Zealand', -36.8485, 174.7633, 'Pacific/Auckland'], ['Wellington', 'New Zealand', -41.2866, 174.7756, 'Pacific/Auckland'],
    ['Paris', 'France', 48.8566, 2.3522, 'Europe/Paris'], ['Berlin', 'Germany', 52.52, 13.405, 'Europe/Berlin'], ['Munich', 'Germany', 48.1351, 11.582, 'Europe/Berlin'],
    ['Hamburg', 'Germany', 53.5511, 9.9937, 'Europe/Berlin'], ['Amsterdam', 'Netherlands', 52.3676, 4.9041, 'Europe/Amsterdam'], ['Brussels', 'Belgium', 50.8503, 4.3517, 'Europe/Brussels'],
    ['Madrid', 'Spain', 40.4168, -3.7038, 'Europe/Madrid'], ['Barcelona', 'Spain', 41.3851, 2.1734, 'Europe/Madrid'], ['Lisbon', 'Portugal', 38.7223, -9.1393, 'Europe/Lisbon'],
    ['Rome', 'Italy', 41.9028, 12.4964, 'Europe/Rome'], ['Milan', 'Italy', 45.4642, 9.19, 'Europe/Rome'], ['Vienna', 'Austria', 48.2082, 16.3738, 'Europe/Vienna'],
    ['Zurich', 'Switzerland', 47.3769, 8.5417, 'Europe/Zurich'], ['Geneva', 'Switzerland', 46.2044, 6.1432, 'Europe/Zurich'], ['Prague', 'Czechia', 50.0755, 14.4378, 'Europe/Prague'],
    ['Warsaw', 'Poland', 52.2297, 21.0122, 'Europe/Warsaw'], ['Budapest', 'Hungary', 47.4979, 19.0402, 'Europe/Budapest'], ['Copenhagen', 'Denmark', 55.6761, 12.5683, 'Europe/Copenhagen'],
    ['Stockholm', 'Sweden', 59.3293, 18.0686, 'Europe/Stockholm'], ['Oslo', 'Norway', 59.9139, 10.7522, 'Europe/Oslo'], ['Helsinki', 'Finland', 60.1699, 24.9384, 'Europe/Helsinki'],
    ['Athens', 'Greece', 37.9838, 23.7275, 'Europe/Athens'], ['Istanbul', 'Türkiye', 41.0082, 28.9784, 'Europe/Istanbul'], ['Kyiv', 'Ukraine', 50.4501, 30.5234, 'Europe/Kiev'],
    ['Moscow', 'Russia', 55.7558, 37.6173, 'Europe/Moscow'], ['Tbilisi', 'Georgia', 41.7151, 44.8271, 'Asia/Tbilisi'], ['Tel Aviv', 'Israel', 32.0853, 34.7818, 'Asia/Jerusalem'],
    ['Dubai', 'UAE', 25.2048, 55.2708, 'Asia/Dubai'], ['Cairo', 'Egypt', 30.0444, 31.2357, 'Africa/Cairo'], ['Lagos', 'Nigeria', 6.5244, 3.3792, 'Africa/Lagos'],
    ['Nairobi', 'Kenya', -1.2921, 36.8219, 'Africa/Nairobi'], ['Johannesburg', 'South Africa', -26.2041, 28.0473, 'Africa/Johannesburg'], ['Cape Town', 'South Africa', -33.9249, 18.4241, 'Africa/Johannesburg'],
    ['Mumbai', 'India', 19.076, 72.8777, 'Asia/Kolkata'], ['Delhi', 'India', 28.7041, 77.1025, 'Asia/Kolkata'], ['Bangalore', 'India', 12.9716, 77.5946, 'Asia/Kolkata'],
    ['Singapore', 'Singapore', 1.3521, 103.8198, 'Asia/Singapore'], ['Hong Kong', 'China', 22.3193, 114.1694, 'Asia/Hong_Kong'], ['Bangkok', 'Thailand', 13.7563, 100.5018, 'Asia/Bangkok'],
    ['Denpasar (Bali)', 'Indonesia', -8.6705, 115.2126, 'Asia/Makassar'], ['Manila', 'Philippines', 14.5995, 120.9842, 'Asia/Manila'], ['Seoul', 'South Korea', 37.5665, 126.978, 'Asia/Seoul'],
    ['Tokyo', 'Japan', 35.6762, 139.6503, 'Asia/Tokyo'], ['Beijing', 'China', 39.9042, 116.4074, 'Asia/Shanghai'], ['Shanghai', 'China', 31.2304, 121.4737, 'Asia/Shanghai'],
  ].map(([name, country, lat, lon, tz]) => ({ name, country, lat, lon, tz }));
  const normName = (s) => s.toLowerCase().replace(/ё/g, 'е').trim();
  /** Город по умолчанию: выбранный посетителем, иначе из content.js (Минск). */
  function defaultCity() { return store.get('moonCity', null) || cityForZone() || CITIES.find((c) => c.name === SITE.defaultCity) || CITIES[0]; }
  const geoCache = {};
  async function searchCities(q) {
    const nq = normName(q);
    const local = CITIES.filter((c) => normName(c.name).startsWith(nq)).slice(0, 6);
    let remote = [];
    if (nq.length >= 2) {
      try {
        if (!geoCache[nq]) {
          const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=' + encodeURIComponent(q.trim()));
          const j = await r.json();
          geoCache[nq] = (j.results || []).filter((x) => x.timezone).map((x) => ({ name: x.name, country: [x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude, tz: x.timezone }));
        }
        remote = geoCache[nq];
      } catch (e) { remote = []; }
    }
    const seen = new Set(local.map((c) => normName(c.name) + Math.round(c.lat)));
    return local.concat(remote.filter((c) => !seen.has(normName(c.name) + Math.round(c.lat)))).slice(0, 10);
  }
  let tzList = null;
  function timeZones() {
    if (tzList) return tzList;
    try { tzList = Intl.supportedValuesOf('timeZone'); } catch (e) { tzList = Array.from(new Set(CITIES.map((c) => c.tz))).sort(); }
    if (!tzList.includes('America/New_York')) tzList.push('America/New_York');
    return tzList;
  }
  const fmtCoord = (lat, lon) => `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;

  // ---------- дата рождения: набор цифрами (точки ставятся сами) и выбор “год → месяц → день” ----------
  // Видимое поле — текст “ДД.ММ.ГГГГ”; рядом скрытое <input type="date"> со значением ГГГГ-ММ-ДД: его читают формы
  // (FormData, birthForm), и если записать в него значение с событием input/change — видимое поле обновится само.
  // Порядок полей даты: SITE.dateOrder 'mdy' (США, по умолчанию) или 'dmy'; разделитель — «/» или «.».
  const ORDER = SITE.dateOrder === 'dmy' ? 'dmy' : 'mdy';
  const DSEP = ORDER === 'mdy' ? '/' : '.';
  const DPH = ORDER === 'mdy' ? 'MM/DD/YYYY' : 'DD.MM.YYYY';
  const MONTH_STEMS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const SEP = /[.\/\-\s,]/;
  /** Две пары цифр поля → [день, месяц] с учётом порядка. */
  const dmOf = (a, b) => (ORDER === 'mdy' ? [b, a] : [a, b]);
  /** Видимый текст даты из д, м, г. */
  const dtxt = (d, m, y) => (ORDER === 'mdy' ? `${pad(m)}${DSEP}${pad(d)}${DSEP}${y}` : `${pad(d)}${DSEP}${pad(m)}${DSEP}${y}`);
  const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  const MONTHS_LOC = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function dobHTML(id, name) {
    return `<div class="dob" data-dob>
      <input class="input dob-text" id="${id}" type="text" inputmode="numeric" autocomplete="bday" placeholder="${DPH}" spellcheck="false" aria-describedby="${id}-h">
      <button class="dob-btn" type="button" aria-label="Choose a date in the calendar" aria-haspopup="dialog" aria-expanded="false">${icon('calendar')}</button>
      <input class="dob-iso" type="date" ${name ? `name="${name}" ` : ''}hidden tabindex="-1" aria-hidden="true">
      <span class="dob-hint" id="${id}-h" aria-live="polite"></span>
    </div>`;
  }
  /** Поле любой даты (не рождения) — так же удобно: цифрами с точками или календарём. Значение ГГГГ-ММ-ДД — в скрытом
      поле с id = id (его читает код страницы: document.getElementById(id).value), видимое поле — id + 'Txt' (для label for).
      opts: value (ГГГГ-ММ-ДД), min (ГГГГ-ММ-ДД, раньше нельзя), name. После вставки в страницу — UI.enhanceDob(блок). */
  function dateHTML(id, opts) {
    opts = opts || {};
    return `<div class="dob" data-dob data-mode="any"${opts.min ? ` data-min="${opts.min}"` : ''}>
      <input class="input dob-text" id="${id}Txt" type="text" inputmode="numeric" autocomplete="off" placeholder="${DPH}" spellcheck="false" aria-describedby="${id}-h">
      <button class="dob-btn" type="button" aria-label="Choose a date in the calendar" aria-haspopup="dialog" aria-expanded="false">${icon('calendar')}</button>
      <input class="dob-iso" id="${id}" type="date" ${opts.name ? `name="${opts.name}" ` : ''}value="${opts.value || ''}" hidden tabindex="-1" aria-hidden="true">
      <span class="dob-hint" id="${id}-h" aria-live="polite"></span>
    </div>`;
  }
  /** Разбор того, что вставили целиком: «1997-06-14», «June 14, 1997», «14 June 1997», «Jun 14 97». → [д, м, г] или null. */
  function parseLooseDate(s) {
    s = String(s || '').trim().toLowerCase();
    let m = /^(\d{4})[-./](\d{1,2})[-./](\d{1,2})/.exec(s);
    if (m) return [+m[3], +m[2], +m[1]];
    const mon = (w) => MONTH_STEMS.findIndex((st) => w.startsWith(st));
    m = /^([a-z]+)\.?\s*(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{2,4})/.exec(s);
    if (m && mon(m[1]) >= 0) return [+m[2], mon(m[1]) + 1, +m[3]];
    m = /^(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?([a-z]+)\.?,?\s*(\d{2,4})/.exec(s);
    if (m && mon(m[2]) >= 0) return [+m[1], mon(m[2]) + 1, +m[3]];
    return null;
  }
  const fullYear = (yy) => (yy >= 100 ? yy : yy + (2000 + yy <= new Date().getFullYear() ? 2000 : 1900));
  /** Проверка даты: { iso, text } или { err }. mode 'any' — любая дата (вместо возраста “через 3 дня”), min — не раньше ГГГГ-ММ-ДД. */
  function checkDate(d, m, y, mode, min) {
    if (!(m >= 1 && m <= 12)) return { err: 'Month must be 01–12' };
    if (!(y >= 1900 && y <= 2099)) return { err: 'Year must be 1900–2099' };
    if (!(d >= 1 && d <= daysIn(y, m))) return { err: `There’s no such day: ${MONTHS_LOC[m - 1]} ${y} has ${daysIn(y, m)} ${fmt.plural(daysIn(y, m), 'day', 'days', 'days')}` };
    const dt = new Date(y, m - 1, d), now = new Date();
    const iso = `${y}-${pad(m)}-${pad(d)}`;
    if (min && iso < min) { const mn = min.split('-').map(Number); return { err: `No earlier than ${MONTHS_GEN[mn[1] - 1]} ${mn[2]}, ${mn[0]}` }; }
    if (mode === 'any') {
      const days = Math.round((dt - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
      const rel = days === 0 ? 'today' : days === 1 ? 'tomorrow' : days === -1 ? 'yesterday' : days > 0 ? `in ${days} ${fmt.plural(days, 'day', 'days', 'days')}` : `${-days} ${fmt.plural(-days, 'day', 'days', 'days')} ago`;
      return { iso, text: `${DOW_LONG[dt.getDay()]}, ${MONTHS_GEN[m - 1]} ${d}, ${y} · ${rel}` };
    }
    let age = now.getFullYear() - y - (now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d) ? 1 : 0);
    const text = `${DOW_LONG[dt.getDay()]}, ${MONTHS_GEN[m - 1]} ${d}, ${y}${dt <= now && age >= 0 ? ` · age ${age}` : ''}`;
    return { iso, text };
  }
  /** Оживить поля даты внутри root (повторный вызов безопасен). */
  function enhanceDob(root) {
    $$('[data-dob]:not([data-ready])', root).forEach((box) => {
      box.dataset.ready = '1';
      const txt = $('.dob-text', box), iso = $('.dob-iso', box), hint = $('.dob-hint', box), btn = $('.dob-btn', box);
      const mode = box.dataset.mode || 'birth', min = box.dataset.min || '';
      const check = (d, m, y) => checkDate(d, m, y, mode, min);
      let syncing = false, pop = null;
      const setHint = (t, kind) => { hint.textContent = t || ''; hint.className = 'dob-hint' + (kind ? ' ' + kind : ''); };
      function commit(final) {
        const dg = txt.value.replace(/\D/g, '');
        let res = null;
        if (dg.length === 8) { const [d, m] = dmOf(+dg.slice(0, 2), +dg.slice(2, 4)); res = check(d, m, +dg.slice(4)); }
        else if (final && dg.length === 6) { const y = fullYear(+dg.slice(4)); const [d, m] = dmOf(+dg.slice(0, 2), +dg.slice(2, 4)); txt.value = dtxt(d, m, y); res = check(d, m, y); }
        else if (final && dg.length) res = { err: `Enter the full date — ${DPH}` };
        const value = res && res.iso ? res.iso : '';
        if (res && res.iso) setHint(res.text, 'ok');
        else if (res && res.err) setHint(res.err, 'bad');
        else setHint('');
        txt.classList.toggle('invalid', !!(res && res.err));
        txt.setAttribute('aria-invalid', res && res.err ? 'true' : 'false');
        if (iso.value !== value) { syncing = true; iso.value = value; iso.dispatchEvent(new Event('change', { bubbles: true })); syncing = false; }
      }
      function show(isoVal) {
        const [y, m, d] = String(isoVal || '').split('-');
        txt.value = y && m && d ? dtxt(+d, +m, y) : '';
        commit(true);
      }
      txt.addEventListener('input', () => {
        const raw = txt.value, caretEnd = txt.selectionStart >= raw.length;
        const loose = /[a-z]/i.test(raw) || /^\s*\d{4}[-./]/.test(raw) ? parseLooseDate(raw) : null;
        if (loose) { const [d, m, y] = loose; txt.value = dtxt(d, m, fullYear(y)); commit(true); return; }
        // “1.” → “01.”, “14.6.” → “14.06.”: день и месяц одной цифрой с точкой
        const r = raw.replace(/^(\d)(?=[.\/\-\s,])/, '0$1').replace(/^(\d\d)[.\/\-\s,]+(\d)(?=[.\/\-\s,])/, '$1' + DSEP + '0$2');
        const dg = r.replace(/\D/g, '').slice(0, 8);
        let out = dg.slice(0, 2);
        if (dg.length > 2) out += DSEP + dg.slice(2, 4);
        if (dg.length > 4) out += DSEP + dg.slice(4);
        if (SEP.test(r.slice(-1)) && (dg.length === 2 || dg.length === 4)) out += DSEP;
        if (out !== raw) {
          const before = r.slice(0, txt.selectionStart + (r.length - raw.length)).replace(/\D/g, '').length;
          txt.value = out;
          let pos = out.length;
          if (!caretEnd) { pos = 0; let seen = 0; while (pos < out.length && seen < before) { if (/\d/.test(out[pos])) seen++; pos++; } }
          try { txt.setSelectionRange(pos, pos); } catch (e) { /* не во всех браузерах */ }
        }
        commit(false);
      });
      txt.addEventListener('blur', () => commit(true));
      // значение записали в скрытое поле снаружи (недавние карты, клиент, проверки) — показываем его
      iso.addEventListener('input', () => { if (!syncing) show(iso.value); });
      iso.addEventListener('change', () => { if (!syncing) show(iso.value); });

      // ---- выбор в календаре: год и месяц списками, день — сеткой ----
      function closePop() {
        if (!pop) return;
        pop.remove(); pop = null; btn.setAttribute('aria-expanded', 'false');
        document.removeEventListener('mousedown', outside, true); document.removeEventListener('keydown', onEsc, true);
      }
      function outside(e) { if (pop && !box.contains(e.target)) closePop(); }
      function onEsc(e) { if (e.key === 'Escape' && pop) { e.stopPropagation(); closePop(); btn.focus(); } }
      function renderPop(y, m) {
        const now = new Date();
        const cur = iso.value ? iso.value.split('-').map(Number) : null;
        const lead = new Date(y, m - 1, 1).getDay();
        let cells = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => `<span class="dw">${d}</span>`).join('');
        for (let i = 0; i < lead; i++) cells += '<span></span>';
        for (let d = 1; d <= daysIn(y, m); d++) {
          const sel = cur && cur[0] === y && cur[1] === m && cur[2] === d;
          const today = now.getFullYear() === y && now.getMonth() === m - 1 && now.getDate() === d;
          const off = min && `${y}-${pad(m)}-${pad(d)}` < min;
          cells += `<button type="button" data-d="${d}" class="${sel ? 'sel' : ''}${today ? ' today' : ''}" aria-label="${MONTHS_GEN[m - 1]} ${d}, ${y}"${sel ? ' aria-pressed="true"' : ''}${off ? ' disabled' : ''}>${d}</button>`;
        }
        const years = []; for (let yy = now.getFullYear() + (mode === 'any' ? 10 : 1); yy >= 1900; yy--) years.push(yy);
        pop.innerHTML = `<div class="dob-pop-head">
            <button type="button" class="dob-nav" data-step="-1" aria-label="Previous month">${icon('chevron-left')}</button>
            <select class="select" data-pm aria-label="Month">${MONTHS.map((t, i) => `<option value="${i + 1}"${i + 1 === m ? ' selected' : ''}>${t}</option>`).join('')}</select>
            <select class="select" data-py aria-label="Year">${years.map((yy) => `<option${yy === y ? ' selected' : ''}>${yy}</option>`).join('')}</select>
            <button type="button" class="dob-nav" data-step="1" aria-label="Next month">${icon('chevron-right')}</button>
          </div><div class="dob-grid">${cells}</div>`;
        pop.dataset.y = y; pop.dataset.m = m;
      }
      function openPop() {
        if (pop) { closePop(); return; }
        const cur = iso.value ? iso.value.split('-').map(Number) : null;
        const now = new Date();
        pop = document.createElement('div');
        pop.className = 'dob-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choose a date');
        box.appendChild(pop);
        renderPop(cur ? cur[0] : now.getFullYear() - (mode === 'any' ? 0 : 30), cur ? cur[1] : now.getMonth() + 1);
        // не вылезать за правый край экрана
        const r = box.getBoundingClientRect();
        if (r.left + pop.offsetWidth > window.innerWidth - 8) pop.classList.add('right');
        btn.setAttribute('aria-expanded', 'true');
        document.addEventListener('mousedown', outside, true); document.addEventListener('keydown', onEsc, true);
        fadeIn(pop, -4);
        const f = $(cur ? '.dob-grid .sel' : '[data-py]', pop); if (f) f.focus();
        pop.addEventListener('change', (e) => { if (e.target.matches('[data-pm],[data-py]')) { renderPop(+$('[data-py]', pop).value, +$('[data-pm]', pop).value); const s = $(e.target.matches('[data-pm]') ? '[data-pm]' : '[data-py]', pop); if (s) s.focus(); } });
        pop.addEventListener('click', (e) => {
          const nav = e.target.closest('[data-step]');
          if (nav) { let y = +pop.dataset.y, m = +pop.dataset.m + +nav.dataset.step; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } if (y >= 1900 && y <= new Date().getFullYear() + (mode === 'any' ? 10 : 1)) renderPop(y, m); const n = $(`[data-step="${nav.dataset.step}"]`, pop); if (n) n.focus(); return; }
          const day = e.target.closest('[data-d]');
          if (day) { show(`${pop.dataset.y}-${pad(+pop.dataset.m)}-${pad(+day.dataset.d)}`); closePop(); txt.focus(); }
        });
      }
      btn.addEventListener('click', openPop);
      if (iso.value) show(iso.value);
    });
  }

  // ---------- поиск города: набираете название — список (встроенные города + геокодер Open-Meteo) ----------
  /** Оживить поле города. input — текстовое поле, list — .ac-list рядом, onPick(place) — выбран город.
      Если набрали название целиком и не выбрали из списка — при уходе с поля подставится совпадение. */
  function cityAutocomplete(input, list, onPick) {
    let items = [], active = -1, timer = null, picked = false;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-autocomplete', 'list');
    if (list.id) input.setAttribute('aria-controls', list.id);
    function pick(p) { picked = true; input.value = p.name; list.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); input.classList.remove('invalid'); onPick(p); }
    function renderList() {
      list.innerHTML = items.length ? items.map((c, i) => `<div class="ac-item${i === active ? ' active' : ''}" role="option" data-i="${i}"><span>${esc(c.name)}</span><small>${esc(c.country)}</small></div>`).join('') : '<div class="ac-item"><small>Nothing found — check the spelling or choose the nearest big city</small></div>';
      list.classList.add('open'); input.setAttribute('aria-expanded', 'true');
    }
    input.addEventListener('input', () => {
      picked = false;
      clearTimeout(timer);
      const q = input.value;
      if (q.trim().length < 1) { list.classList.remove('open'); return; }
      timer = setTimeout(async () => { items = await searchCities(q); active = -1; if (input.value === q && document.activeElement === input) renderList(); }, 220);
    });
    input.addEventListener('keydown', (e) => {
      if (!list.classList.contains('open')) return;
      if (e.key === 'ArrowDown') { active = Math.min(items.length - 1, active + 1); renderList(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); renderList(); e.preventDefault(); }
      if (e.key === 'Enter' && items[active >= 0 ? active : 0]) { pick(items[active >= 0 ? active : 0]); e.preventDefault(); }
      if (e.key === 'Escape') list.classList.remove('open');
    });
    list.addEventListener('mousedown', (e) => { const it = e.target.closest('[data-i]'); if (it) { e.preventDefault(); pick(items[+it.dataset.i]); } });
    input.addEventListener('blur', () => setTimeout(() => {
      list.classList.remove('open'); input.setAttribute('aria-expanded', 'false');
      // набрали “Минск” и ушли с поля — берём первое совпадение с тем же названием
      if (!picked && items.length && normName(items[0].name) === normName(input.value)) pick(items[0]);
    }, 150));
    return { pick, isPicked: () => picked };
  }
  let cityUid = 0;
  /** Поле “Город” с поиском (подбор дат, соляр, лунный календарь). opts: label, value (город), onPick(город), hint. */
  function cityField(container, opts) {
    opts = opts || {};
    const u = 'cf' + (++cityUid);
    container.innerHTML = `<div class="field city-field"><label for="${u}">${esc(opts.label || 'City')}</label>
      <input class="input" id="${u}" autocomplete="off" placeholder="${esc(opts.placeholder || 'Start typing a city')}" value="${esc(opts.value ? opts.value.name : '')}">
      <div class="ac-list" id="${u}l" role="listbox"></div>
      <div class="place-meta" id="${u}m"></div></div>`;
    const input = container.querySelector('#' + u), meta = container.querySelector('#' + u + 'm');
    let place = opts.value || null;
    const showMeta = (p) => { meta.textContent = p ? `${p.country ? p.country + ' · ' : ''}${tzLabel(p.tz)}` : (opts.hint || ''); };
    showMeta(place);
    const ac = cityAutocomplete(input, container.querySelector('#' + u + 'l'), (p) => { place = p; showMeta(p); if (opts.onPick) opts.onPick(p); });
    input.addEventListener('focus', () => input.select());
    // набрали и бросили, не выбрав, — возвращаем прежний город, чтобы поле не врало
    input.addEventListener('blur', () => setTimeout(() => { if (!ac.isPicked() && place && input.value.trim() !== place.name) { input.value = place.name; showMeta(place); } }, 220));
    return { get: () => place, set(p) { place = p; input.value = p ? p.name : ''; showMeta(p); }, input };
  }

  // ---------- форма данных рождения ----------
  let formUid = 0;
  function birthForm(container, opts) {
    opts = opts || {};
    const u = 'bf' + (++formUid);
    container.innerHTML = `
      <div class="form" data-bf>
        ${opts.title ? `<h3 style="margin:0">${opts.title}</h3>` : ''}
        ${opts.noPicker ? '' : '<div class="pp-box" data-pp-box hidden></div>'}
        <div class="field"><label for="${u}n">Name</label><input class="input" id="${u}n" autocomplete="off" placeholder="${opts.namePlaceholder || 'What’s your name?'}"></div>
        <div class="form-row dob-row">
          <div class="field"><label for="${u}d">Date of birth</label>${dobHTML(u + 'd')}</div>
          <div class="field"><label for="${u}t">Time</label><input class="input" id="${u}t" type="time" value="12:00"></div>
        </div>
        <label class="check"><input type="checkbox" id="${u}u"> I don’t know the birth time</label>
        <div class="field">
          <label for="${u}c">Place of birth</label>
          <input class="input" id="${u}c" autocomplete="off" placeholder="Start typing a city" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="${u}l">
          <div class="ac-list" id="${u}l" role="listbox"></div>
          <div class="place-meta" id="${u}m"></div>
        </div>
        <details class="details-adv">
          <summary>Enter coordinates and time zone manually</summary>
          <div class="form-row" style="margin-top:6px">
            <div class="field"><label for="${u}la">Latitude</label><input class="input" id="${u}la" inputmode="decimal" placeholder="55.75"></div>
            <div class="field"><label for="${u}lo">Longitude</label><input class="input" id="${u}lo" inputmode="decimal" placeholder="37.62"></div>
          </div>
          <div class="field" style="margin-top:12px"><label for="${u}z">Time zone</label><select class="select" id="${u}z">${timeZones().map((z) => `<option>${z}</option>`).join('')}</select>
          <span class="hint">Historical daylight saving and standard time changes are handled automatically.</span></div>
        </details>
        ${opts.noSave ? '' : `<label class="check pp-save"><input type="checkbox" id="${u}s"${store.get('ppSave', true) ? ' checked' : ''}> Save to “My charts” — next time it’s one tap</label>`}
      </div>`;
    const el = (s) => container.querySelector('#' + u + s);
    enhanceDob(container);
    const dobIso = () => $('.dob-iso', el('d').parentNode);
    const city = el('c'), list = el('l'), meta = el('m'), unk = el('u'), time = el('t');
    let place = null;
    el('z').value = defaultCity().tz;
    unk.addEventListener('change', () => { time.disabled = unk.checked; });
    function setPlace(p) {
      place = p;
      city.value = p.name;
      el('la').value = (+p.lat).toFixed(4); el('lo').value = (+p.lon).toFixed(4);
      if (timeZones().includes(p.tz)) el('z').value = p.tz; else { const o = document.createElement('option'); o.textContent = p.tz; el('z').appendChild(o); el('z').value = p.tz; }
      meta.textContent = `${p.country ? p.country + ' · ' : ''}${fmtCoord(+p.lat, +p.lon)} · ${p.tz}`;
      list.classList.remove('open'); city.setAttribute('aria-expanded', 'false'); city.classList.remove('invalid');
    }
    city.addEventListener('input', () => { place = null; meta.textContent = ''; });
    cityAutocomplete(city, list, setPlace);

    const api = {
      get() {
        const ds = dobIso().value;
        if (!ds) { el('d').classList.add('invalid'); el('d').focus(); toast(el('d').value.trim() ? `Check your date of birth: ${DPH}` : 'Enter your date of birth', 'calendar'); return null; }
        el('d').classList.remove('invalid');
        const [y, mo, d] = ds.split('-').map(Number);
        const tk = !unk.checked;
        const [h, mi] = (time.value || '12:00').split(':').map(Number);
        const lat = parseFloat(String(el('la').value).replace(',', '.')), lon = parseFloat(String(el('lo').value).replace(',', '.'));
        if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
          city.classList.add('invalid'); city.focus(); toast('Choose a city from the list or enter coordinates', 'pin'); return null;
        }
        const params = { name: el('n').value.trim(), y, mo, d, h: tk ? h : 12, mi: tk ? mi : 0, timeKnown: tk, lat, lon, zone: el('z').value, place: city.value.trim() || fmtCoord(lat, lon) };
        // “Мои карты”: запомнить человека, чтобы в другой раз подставить одним нажатием
        const sv = el('s');
        if (sv && sv.checked) { const sp = people.remember(params); if (sp) params.personId = sp.id; }
        return params;
      },
      set(p) {
        if (!p) return;
        el('n').value = p.name || '';
        const di = dobIso(); di.value = `${p.y}-${pad(p.mo)}-${pad(p.d)}`; di.dispatchEvent(new Event('change'));
        unk.checked = p.timeKnown === false; time.disabled = unk.checked;
        time.value = `${pad(p.h != null ? p.h : 12)}:${pad(p.mi || 0)}`;
        setPlace({ name: p.place || '', country: '', lat: p.lat, lon: p.lon, tz: p.zone });
      },
      focus() { el('n').focus(); },
    };
    const sv = el('s');
    if (sv) sv.addEventListener('change', () => store.set('ppSave', sv.checked));
    const ppBox = container.querySelector('[data-pp-box]');
    if (ppBox) peopleChips(ppBox, (it) => { api.set(it.p); if (opts.onPick) opts.onPick(it); }, { clients: opts.clients });
    return api;
  }

  // недавние карты
  const recent = {
    list: () => store.get('recent', []),
    add(p) {
      const key = (x) => [x.name, x.y, x.mo, x.d, x.h, x.mi, x.lat].join('|');
      const l = recent.list().filter((x) => key(x) !== key(p));
      l.unshift(p); store.set('recent', l.slice(0, 8));
    },
  };
  // клиенты (кабинет)
  const clients = {
    all: () => store.get('clients', []),
    save(list) { store.set('clients', list); },
    add(c) {
      const list = clients.all();
      c.id = c.id || 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      c.created = c.created || new Date().toISOString();
      list.unshift(c); clients.save(list); return c;
    },
    get: (id) => clients.all().find((c) => c.id === id),
  };

  // ---------- “Мои карты”: люди, чьи данные уже вводили ----------
  // Хранятся только в этом браузере (am_people). Формы данных рождения предлагают их одним нажатием и (если стоит
  // галочка “Сохранить в Мои карты”) запоминают новых. Алине на страницах сайта — ещё и клиенты кабинета.
  const PKEY = (b) => [b.y, b.mo, b.d, b.timeKnown === false ? '-' : `${+b.h}:${+b.mi}`, (+b.lat).toFixed(2), (+b.lon).toFixed(2)].join('|');
  const birthOf = (p) => ({ y: +p.y, mo: +p.mo, d: +p.d, h: p.timeKnown === false ? 12 : +p.h, mi: p.timeKnown === false ? 0 : +p.mi, timeKnown: p.timeKnown !== false, lat: +p.lat, lon: +p.lon, zone: p.zone, place: p.place || '' });
  const pid = () => 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  let peopleReady = false;
  function migratePeople() {
    if (peopleReady) return;
    peopleReady = true;
    if (store.get('people', null) !== null) return;
    // первый раз: “Недавние карты” становятся “Моими картами” — то, что человек уже вводил, не пропадает
    const now = new Date().toISOString(), seen = new Set(), l = [];
    for (const r of store.get('recent', [])) {
      if (!r || r.lat == null || !r.y) continue;
      const b = birthOf(r), k = PKEY(b) + '|' + normName(r.name || '');
      if (seen.has(k)) continue;
      seen.add(k);
      l.push({ id: pid(), name: r.name || '', fullName: '', note: '', tags: [], birth: b, created: now, updated: now });
    }
    store.set('people', l);
  }
  const people = {
    all() { migratePeople(); return store.get('people', []); },
    get: (id) => people.all().find((p) => p.id === id),
    save(list) { store.set('people', list); document.dispatchEvent(new CustomEvent('peoplechange')); },
    add(p) {
      const now = new Date().toISOString();
      const x = Object.assign({ id: pid(), name: '', fullName: '', note: '', tags: [], created: now }, p, { updated: now });
      const l = people.all(); l.unshift(x); people.save(l); return x;
    },
    update(id, patch) { const l = people.all(); const i = l.findIndex((x) => x.id === id); if (i < 0) return null; l[i] = Object.assign({}, l[i], patch, { updated: new Date().toISOString() }); people.save(l); return l[i]; },
    remove(id) { people.save(people.all().filter((x) => x.id !== id)); },
    /** Запомнить данные из формы: тот же человек (дата, время, место, имя) — обновить, иначе добавить. */
    remember(params) {
      if (!params || params.lat == null || !params.y) return null;
      const b = birthOf(params), k = PKEY(b), name = String(params.name || '').trim();
      const same = people.all().find((x) => x.birth && PKEY(x.birth) === k && (!name || !x.name || normName(x.name) === normName(name)));
      if (same) return people.update(same.id, Object.assign({ birth: b, used: new Date().toISOString() }, name && !same.name ? { name } : {}));
      return people.add({ name, birth: b, used: new Date().toISOString() });
    },
    label: (p) => p.name || (p.birth ? dtxt(p.birth.d, p.birth.mo, p.birth.y) : 'No name'),
    /** Данные для формы: { name, y, mo, d, h, mi, timeKnown, lat, lon, zone, place }. */
    params: (p) => Object.assign({ name: p.name || '' }, p.birth),
  };
  /** Кого предложить: “Мои карты” (свежие сверху) и — Алине — клиенты кабинета. */
  function pickList(opts) {
    opts = opts || {};
    const out = people.all().filter((p) => p.birth && p.birth.y).sort((a, b) => String(b.used || b.updated || '').localeCompare(String(a.used || a.updated || ''))).map((p) => ({ key: 'p:' + p.id, group: 'My charts', name: people.label(p), p: people.params(p), fullName: p.fullName || '', person: p }));
    if (opts.clients !== false && isAlina()) for (const c of clients.all()) if (c.birth && c.birth.y) out.push({ key: 'c:' + c.id, group: 'Dashboard clients', name: c.name || 'Client', p: Object.assign({}, c.birth, { name: c.name }), fullName: c.fullName || '', client: c });
    return out;
  }
  const dShort = (p) => dtxt(p.d, p.mo, String(p.y).slice(2));
  /** Чипы “Мои карты” в блоке box: onPick(item) — item.p (данные рождения), item.person / item.client.
      opts: max (сколько чипов видно), sub(item) — подпись, clients — показывать ли клиентов кабинета, label. */
  function peopleChips(box, onPick, opts) {
    opts = opts || {};
    const max = opts.max || 5;
    let pop = null, active = '';
    function draw() {
      const list = pickList(opts);
      box.hidden = !list.length;
      if (!list.length) { box.innerHTML = ''; return; }
      const sub = (it) => esc(opts.sub ? opts.sub(it) : dShort(it.p));
      box.innerHTML = `<div class="pp"><span class="pp-label">${icon('address-book')}${esc(opts.label || 'My charts')}</span><div class="pp-chips">${list.slice(0, max).map((it) => `<button type="button" class="pp-chip${it.key === active ? ' on' : ''}" data-pp-pick="${esc(it.key)}" title="${esc(it.name)} · ${fmt.birth(it.p)}${it.p.place ? ' · ' + esc(it.p.place) : ''}"><b>${esc(it.name)}</b><small>${sub(it)}</small></button>`).join('')}${list.length > max || opts.alwaysAll ? `<button type="button" class="pp-chip more" data-pp-more aria-expanded="false">${list.length > max ? 'All · ' + list.length : 'All'}</button>` : ''}</div></div>`;
    }
    function closePop() { if (pop) { pop.remove(); pop = null; const m = box.querySelector('[data-pp-more]'); if (m) m.setAttribute('aria-expanded', 'false'); document.removeEventListener('mousedown', outside, true); } }
    function outside(e) { if (pop && !box.contains(e.target)) closePop(); }
    function openPop() {
      if (pop) { closePop(); return; }
      const list = pickList(opts);
      pop = document.createElement('div'); pop.className = 'pp-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choose a person');
      const render = (q) => {
        const nq = normName(q || '');
        const items = list.filter((it) => !nq || normName(it.name + ' ' + (it.p.place || '')).includes(nq));
        const groups = Array.from(new Set(items.map((it) => it.group)));
        pop.querySelector('.pp-list').innerHTML = groups.map((g) => `<div class="pp-g">${esc(g)}</div>${items.filter((it) => it.group === g).map((it) => `<button type="button" data-pp-pick="${esc(it.key)}"><b>${esc(it.name)}</b><small>${fmt.birth(it.p)}${it.p.place ? ' · ' + esc(it.p.place) : ''}</small></button>`).join('')}`).join('') || '<p class="small muted" style="margin:8px">Nobody found.</p>';
      };
      pop.innerHTML = `<input class="input pp-q" type="search" placeholder="Search by name or city" aria-label="Search saved charts"><div class="pp-list"></div>${opts.manage === false ? '' : '<a class="pp-manage" href="astro.html">All my charts →</a>'}`;
      box.querySelector('.pp').appendChild(pop);
      render('');
      pop.querySelector('.pp-q').addEventListener('input', (e) => render(e.target.value));
      box.querySelector('[data-pp-more]').setAttribute('aria-expanded', 'true');
      document.addEventListener('mousedown', outside, true);
      fadeIn(pop, -4);
      setTimeout(() => { const q = pop && pop.querySelector('.pp-q'); if (q && !matchMedia('(hover: none)').matches) q.focus(); }, 30);
    }
    box.addEventListener('click', (e) => {
      if (e.target.closest('[data-pp-more]')) { openPop(); return; }
      const b = e.target.closest('[data-pp-pick]');
      if (!b) return;
      const it = pickList(opts).find((x) => x.key === b.dataset.ppPick);
      closePop();
      if (!it) return;
      active = it.key;
      box.querySelectorAll('.pp-chip').forEach((c) => c.classList.toggle('on', c.dataset.ppPick === it.key));
      onPick(it);
    });
    box.addEventListener('keydown', (e) => { if (e.key === 'Escape' && pop) { e.stopPropagation(); closePop(); } });
    document.addEventListener('peoplechange', () => { if (!pop && box.isConnected) draw(); });
    draw();
    return { redraw: draw };
  }

  // ---------- анкета на консультацию ----------
  // Календаря для клиентов нет: клиент заполняет анкету, она шифруется и сразу попадает в кабинет Алины (ящик заявок,
  // content.js → api.url); если сервер недоступен — уходит Алине в Telegram готовым сообщением
  // (или в WhatsApp, на почту). Алина отвечает сама, уточняет детали и предлагает время из кабинета (“Заявки”).
  const INTAKE = SITE.intake || {};
  // ящик заявок (content.js → api.url): анкета шифруется в браузере и сразу попадает в кабинет Алины.
  // Копия сайта на компьютере разработки и превью не пишут в боевой ящик (только в локальный сервер для проверок).
  const localApi = (u) => /^https?:\/\/(localhost|127\.|\[::1\])/.test(String(u || '')) || !!(window.DemoApi && String(u || '').replace(/\/+$/, '') === window.DemoApi.base);
  const inboxOn = !!(SITE.api && SITE.api.url && window.crypto && crypto.subtle && window.fetch && ((!isPreview && !window.ARTIFACT_PREVIEW) || localApi(SITE.api.url)));
  let inboxP = null;
  const loadInbox = () => (window.Inbox ? Promise.resolve() : inboxP || (inboxP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'js/inbox.js'; s.onload = res; s.onerror = () => { inboxP = null; rej(new Error('inbox.js')); }; document.body.appendChild(s); })));
  function serviceOptions() {
    return SITE.services.map((s) => ({ id: s.id, title: s.title })).concat(academyOn ? [{ id: 'lessons', title: 'One-to-one astrology lessons' }, { id: 'course', title: '“Astrology from Scratch” course' }] : [], [{ id: 'numerology', title: 'Numerology: your numbers' }], SITE.energy && SITE.energy.enabled !== false ? [{ id: 'energy', title: 'Energy alignment' }] : [], [{ id: 'gift', title: 'Gift certificate' }, { id: 'other', title: 'Something else / not sure yet' }]);
  }
  const intakeOf = (id) => (INTAKE.services || {})[id] || {};
  /** “Берлин, UTC+2”: город по часовому поясу и смещение от UTC сейчас. */
  function tzLabel(tz) {
    if (!tz) return '';
    let off = 0;
    try {
      const o = {};
      for (const p of new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date())) o[p.type] = p.value;
      off = Math.round((Date.UTC(+o.year, o.month - 1, +o.day, +o.hour % 24, +o.minute) - Math.floor(Date.now() / 60000) * 60000) / 60000);
    } catch (e) { return tz; }
    const c = CITIES.find((x) => x.tz === tz);
    const a = Math.abs(off);
    return `${c ? c.name : tz.split('/').pop().replace(/_/g, ' ')}, UTC${off ? (off > 0 ? '+' : '−') + Math.floor(a / 60) + (a % 60 ? ':' + pad(a % 60) : '') : ''}`;
  }
  /** Подпись услуги в анкете: длительность или формат, цена (с учётом акции). */
  function serviceMeta(id) {
    const svc = SITE.services.find((s) => s.id === id);
    const fa = ((SITE.academy || {}).formats || []).find((f) => f.service === id);
    let price = '';
    if (svc && svc.price) { const p = priceFor(svc); price = `${p.old ? `<s>${money(p.old, p.code)}</s> ` : ''}<b>${money(p.now, p.code)}</b>`; }
    else if (fa && fa.price) { const p = priceOf(fa); price = `<b>${money(p.n, p.code)}</b>${fa.unit ? ' ' + esc(fa.unit) : ''}`; }
    const what = svc ? esc(svc.duration || '') : id === 'gift' ? 'a beautiful certificate for any reading' : id === 'numerology' ? 'your numbers from your date of birth and name' : id === 'energy' ? `${(SITE.energy && SITE.energy.duration) || 30} minutes online · pay by donation · <a href="energy.html">details and time slots</a>` : '';
    return what || price ? `${icon('info')}<span>${what}${what && price ? ' · ' : ''}${price}</span>` : '';
  }
  /** Какие данные рождения нужны для услуги: 'full' — дата, время (или “не знаю”) и город обязательны: по ним Алина сразу
      видит карту человека; 'optional' — по желанию; 'none' — не нужны. content.js → intake.services[id].birth;
      по умолчанию — 'full' для консультаций, 'optional' для экспресс-ответа, уроков и “другого”, 'none' для сертификата,
      курса и энергетического выравнивания. */
  function birthNeed(id) {
    const c = intakeOf(id);
    if (c.birth) return c.birth;
    if (c.noBirth || ['gift', 'course', 'energy'].includes(id)) return 'none';
    return ['express', 'lessons', 'other'].includes(id) ? 'optional' : 'full';
  }
  const lastPart = (s) => String(s || '').split(',').pop().trim();
  /** “14.06.1997, 08:30, Минск, Беларусь” — строка для Telegram и кабинета (её же разбирает “Вставить анкету”). */
  const birthLine = (p) => `${MONTHS_GEN[p.mo - 1]} ${p.d}, ${p.y}, ${p.timeKnown ? hm12(+p.h, +p.mi) : 'time unknown'}${p.place ? `, ${p.place}${p.country && p.country !== p.place ? ', ' + p.country : ''}` : ''}`;
  /** Блок “человек” в анкете: “Мои карты”, имя, дата (календарь), время или “не знаю”, город (поиск). k: 'me' | 'pt' (партнёр). */
  function ixPersonHTML(u, k) {
    const me = k === 'me', id = u + k;
    return `<div class="ix-person" data-ix="${k}"${me ? '' : ' hidden'}>
        <p class="ix-legend"><span data-ix="${k}Title">${me ? 'Your details' : 'Partner’s details'}</span> <small class="ix-opt" data-ix="${k}Opt" hidden>— optional</small></p>
        <div class="ix-pp" data-ix="${k}Pp"><div class="pp-box" data-pp-box hidden></div></div>
        <div class="form-row ix-row" data-ix="${k}Row">
          <div class="field"><label for="${id}n"><span data-ix="${k}NameLabel">${me ? 'Your name' : 'Partner’s name'}</span>${me ? ' *' : ''}</label><input class="input" id="${id}n" name="${me ? 'name' : 'ptname'}"${me ? ' required autocomplete="given-name"' : ' autocomplete="off"'} maxlength="80"></div>
          <div class="field" data-ix="${k}Date"><label for="${id}d">Date of birth<span data-ix="star"> *</span></label>${dobHTML(id + 'd', k + 'date')}</div>
        </div>
        <div class="form-row ix-row" data-ix="${k}Birth">
          <div class="field"><label for="${id}t">Birth time<span data-ix="star"> *</span></label><input class="input" id="${id}t" name="${k}time" type="time">
            <label class="check ix-unk"><input type="checkbox" name="${k}unk"> I don’t know the exact time</label></div>
          <div class="field city-field"><label for="${id}c">City of birth<span data-ix="star"> *</span></label><input class="input" id="${id}c" name="${k}city" autocomplete="off" placeholder="Start typing a city"><div class="ac-list" id="${id}l" role="listbox"></div><div class="place-meta" id="${id}m"></div></div>
        </div>
      </div>`;
  }
  /** Анкета: услуга, данные человека (из “Моих карт” одним нажатием, дата — календарём, город — поиском), вопрос по желанию,
      контакт. Обязательное зависит от услуги (birthNeed). opts.note — подпись под кнопкой. */
  function bookingFormHTML(prefix, preset, opts) {
    const u = prefix;
    opts = opts || {};
    const svcs = serviceOptions();
    const sel = svcs.some((s) => s.id === preset) ? preset : svcs[0].id;
    return `
      <form class="form ix" data-booking novalidate>
        <div class="field"><label for="${u}service">What are you interested in</label><select class="select" id="${u}service" name="service">${svcs.map((s) => `<option value="${s.id}"${sel === s.id ? ' selected' : ''}>${esc(s.title)}</option>`).join('')}</select><span class="hint ix-meta" data-ix="meta"></span></div>
        ${ixPersonHTML(u, 'me')}
        ${ixPersonHTML(u, 'pt')}
        <div class="field" data-ix="fullName" hidden><label for="${u}fn">Full name at birth *</label><input class="input" id="${u}fn" name="fullname" placeholder="As on the birth certificate" autocomplete="off" maxlength="120"><span class="hint">It’s used to calculate your expression, soul and personality numbers.</span></div>
        <div class="field"><label for="${u}q"><span data-ix="qlabel">Your question</span> <small class="ix-opt">— optional</small></label><textarea class="textarea" id="${u}q" name="question" rows="2" maxlength="1500"></textarea></div>
        ${(INTAKE.formats || []).length ? `<div class="field" data-ix="formatBox"><span class="label" id="${u}fl">Preferred format <small class="ix-opt">— optional</small></span><div class="ix-chips" role="group" aria-labelledby="${u}fl">${INTAKE.formats.map((f) => `<button type="button" class="ix-chip" data-format="${esc(f.title)}" aria-pressed="false" title="${esc(f.title + (f.text ? ' — ' + f.text : ''))}">${icon(f.icon || 'sparkle')}${esc(f.short || f.title)}</button>`).join('')}</div></div>` : ''}
        <div class="form-row ix-contact one" data-ix="contactRow">
          <div class="field" data-ix="parent" hidden><label for="${u}pn">Your name *</label><input class="input" id="${u}pn" name="parent" autocomplete="given-name" maxlength="80"></div>
          <div class="field"><label for="${u}contact">${esc((SITE.intake || {}).contactLabel || 'Telegram or phone')} *</label><input class="input" id="${u}contact" name="contact" required placeholder="${esc((SITE.intake || {}).contactPlaceholder || '@handle or +1…')}" autocomplete="${esc((SITE.intake || {}).contactAutocomplete || 'tel')}" maxlength="120"></div>
        </div>
        <input class="ix-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="check pp-save" data-ix="save"><input type="checkbox" name="ppsave"${store.get('ppSave', true) ? ' checked' : ''}> <span>Save these details to “My charts” — next time it’s one tap</span></label>
        <label class="check ix-consent"><input type="checkbox" name="consent" required> <span>I agree to the <a href="privacy.html" target="_blank">processing of my data</a></span></label>
        <button class="btn btn-primary btn-block" type="submit">${inboxOn ? `${icon('send')} Send my form to Iris` : `${icon('telegram')} Send to Iris on Telegram`}</button>
        <p class="tiny muted center" style="margin:0">${opts.note ? esc(opts.note) : `Fields with an asterisk are required; the question is optional. ${inboxOn ? 'Your form comes straight to me — I’ll reply' : 'I’ll reply'} ${esc(INTAKE.replyTime || 'within a day')} and suggest a time myself.`}</p>
      </form>`;
  }
  /** Показать поля под выбранную услугу: чьи данные (свои или ребёнка), что обязательно, партнёр, ФИО, формат — только для встреч. */
  function intakeApply(form) {
    const id = form.querySelector('[name=service]').value, cfg = intakeOf(id), need = birthNeed(id), kid = cfg.birthOf || '';
    const q = (k) => form.querySelector(`[data-ix="${k}"]`);
    const set = (k, on) => { const el = q(k); if (el) el.hidden = !on; };
    q('meta').innerHTML = serviceMeta(id);
    form.querySelector('[name=question]').placeholder = cfg.ask || 'What feels important right now?';
    q('qlabel').textContent = id === 'gift' ? 'Who it’s for and what you’re giving' : 'Your question';
    q('meTitle').textContent = kid ? `About ${kid}` : need === 'none' ? 'About you' : 'Your details';
    q('meNameLabel').textContent = kid ? `Name (${kid})` : 'Your name';
    form.querySelector('[name=name]').setAttribute('autocomplete', kid ? 'off' : 'given-name');
    set('meOpt', need === 'optional');
    for (const k of ['mePp', 'meDate', 'meBirth']) set(k, need !== 'none');
    q('meRow').classList.toggle('one', need === 'none');
    form.querySelectorAll('[data-ix="me"] [data-ix="star"]').forEach((s) => { s.hidden = need !== 'full'; });
    set('pt', !!cfg.partner);
    set('parent', !!kid);
    q('contactRow').classList.toggle('one', !kid);
    set('fullName', !!cfg.fullName);
    set('formatBox', id !== 'gift' && !cfg.written);
    set('save', need !== 'none' || !!cfg.partner);
  }
  /** Текст анкеты (для Telegram — и “Вставить анкету” в кабинете его разберёт) и данные для ящика: строкой и точно
      (birthData / partnerData — дата, время, координаты и пояс города: кабинет строит карту без догадок). */
  function intakeText(form, me, pt) {
    const f = new FormData(form);
    const g = (k) => String(f.get(k) || '').trim();
    const id = g('service'), cfg = intakeOf(id), svc = serviceOptions().find((s) => s.id === id), kid = cfg.birthOf || '';
    const fmtB = form.querySelector('[data-format][aria-pressed="true"]');
    const format = fmtB && id !== 'gift' && !cfg.written ? fmtB.dataset.format : '';
    const who = kid ? g('parent') : g('name');
    const ptLine = pt ? `${pt.name ? pt.name + ', ' : ''}${birthLine(pt)}` : '';
    const tz = browserTz;
    const lines = [
      id === 'gift' ? `Hi ${SITE.firstName || SITE.name}! I’d like a gift certificate.` : `Hi ${SITE.firstName || SITE.name}! I’d like to book a reading.`,
      `Name: ${who}`,
      `Contact: ${g('contact')}`,
      `Service: ${svc ? svc.title : ''}`,
      g('question') ? `Question: ${g('question')}` : '',
      kid ? `Child: ${g('name')}` : '',
      me ? `Date of birth${kid ? ' ' + kid : ''}: ${birthLine(me)}` : '',
      pt ? `Partner: ${ptLine}` : '',
      cfg.fullName && g('fullname') ? `Full name at birth: ${g('fullname')}` : '',
      format ? `Format: ${format}` : '',
      tz ? `My time zone: ${tz} (${tzLabel(tz)})` : '',
    ].filter(Boolean);
    const pack = (p) => (p ? { name: p.name || '', y: p.y, mo: p.mo, d: p.d, h: p.h, mi: p.mi, timeKnown: p.timeKnown, lat: p.lat, lon: p.lon, zone: p.zone, place: p.place || '', country: p.country || '' } : null);
    const data = { name: who, contact: g('contact'), service: svc && svc.title, serviceId: id, question: g('question'), birth: me ? birthLine(me) : '', birthData: pack(me), childName: kid ? g('name') : '', partner: ptLine, partnerData: pack(pt), fullname: cfg.fullName ? g('fullname') : '', format, timezone: tz };
    return { text: lines.join('\n'), data, hp: g('website') };
  }
  /** Город, набранный, но не выбранный из списка: берём точное совпадение названия (встроенный список, затем геокодер). */
  async function resolvePlace(text) {
    const n = normName(text);
    if (n.length < 2) return null;
    try { return (await searchCities(text)).find((c) => normName(c.name) === n) || null; } catch (e) { return null; }
  }
  /** Анкета: “Мои карты” одним нажатием, дата календарём, город поиском, формат одной кнопкой; проверка и отправка. */
  function bindBooking(form, onDone) {
    const q = (n) => form.querySelector(`[name="${n}"]`);
    const S = { me: { place: null }, pt: { place: null } };
    enhanceDob(form);
    for (const k of ['me', 'pt']) {
      const city = q(k + 'city'), meta = city.parentNode.querySelector('.place-meta'), time = q(k + 'time'), unk = q(k + 'unk');
      const showPlace = (p) => { meta.textContent = p ? `${lastPart(p.country) ? lastPart(p.country) + ' · ' : ''}${fmtCoord(+p.lat, +p.lon)}` : ''; };
      S[k].set = (p) => { S[k].place = p; city.value = p ? p.name : ''; city.classList.remove('invalid'); showPlace(p); };
      city.addEventListener('input', () => { S[k].place = null; showPlace(null); });
      cityAutocomplete(city, city.parentNode.querySelector('.ac-list'), (p) => { S[k].place = p; showPlace(p); });
      unk.addEventListener('change', () => { time.disabled = unk.checked; if (unk.checked) time.classList.remove('invalid'); });
      peopleChips(form.querySelector(`[data-ix="${k}"] [data-pp-box]`), (it) => fillPerson(k, it), { clients: false, manage: false, max: 4 });
    }
    /** Человек из “Моих карт” → имя, дата, время, город (и ФИО при рождении, если сохранено). */
    function fillPerson(k, it) {
      const p = it.p;
      q(k === 'me' ? 'name' : 'ptname').value = p.name || '';
      const iso = q(k + 'date'); iso.value = `${p.y}-${pad(p.mo)}-${pad(p.d)}`; iso.dispatchEvent(new Event('change'));
      const unk = q(k + 'unk'), time = q(k + 'time');
      unk.checked = p.timeKnown === false; time.disabled = unk.checked;
      time.value = p.timeKnown === false ? '' : `${pad(+p.h)}:${pad(+p.mi)}`;
      S[k].set(p.lat != null && isFinite(+p.lat) && isFinite(+p.lon) ? { name: p.place || fmtCoord(+p.lat, +p.lon), country: '', lat: +p.lat, lon: +p.lon, tz: p.zone } : null);
      if (k === 'me' && it.fullName && !q('fullname').value.trim()) q('fullname').value = it.fullName;
      form.querySelectorAll(`[data-ix="${k}"] .invalid`).forEach((e) => e.classList.remove('invalid'));
    }
    /** Данные человека из полей. need: 'full' | 'optional', whose — “ребёнка”, “партнёра” для подсказок. → { p } или { err: [поле, текст, иконка] }. */
    async function readPerson(k, need, whose) {
      const of = whose ? ' ' + whose : '';
      const iso = q(k + 'date'), txt = iso.closest('[data-dob]').querySelector('.dob-text');
      const time = q(k + 'time'), unk = q(k + 'unk'), city = q(k + 'city');
      const p = { name: q(k === 'me' ? 'name' : 'ptname').value.trim() };
      if (!iso.value) {
        if (txt.value.trim()) return { err: [txt, `Check the date of birth${of}: MM/DD/YYYY`, 'calendar'] };
        if (need === 'full') return { err: [txt, `Enter the date of birth${of} — in numbers or using the calendar`, 'calendar'] };
        return { p: null };
      }
      [p.y, p.mo, p.d] = iso.value.split('-').map(Number);
      if (new Date(p.y, p.mo - 1, p.d) > new Date()) return { err: [txt, `The date of birth${of} hasn’t happened yet — check the year`, 'calendar'] };
      if (unk.checked || (!time.value && need !== 'full')) Object.assign(p, { h: 12, mi: 0, timeKnown: false });
      else if (time.value) { const [h, mi] = time.value.split(':').map(Number); Object.assign(p, { h, mi, timeKnown: true }); }
      else return { err: [time, `Enter the time of birth${of} — or tick “I don’t know the exact time”`, 'clock'] };
      let pl = S[k].place;
      if (!pl && city.value.trim()) { pl = await resolvePlace(city.value); if (pl) S[k].set(pl); }
      if (pl) Object.assign(p, { lat: +pl.lat, lon: +pl.lon, zone: pl.tz, place: pl.name, country: lastPart(pl.country) });
      else if (city.value.trim()) return { err: [city, `Choose the city of birth${of} from the list — if it isn’t there, the nearest big city`, 'pin'] };
      else if (need === 'full') return { err: [city, `Enter the city of birth${of} — start typing and pick from the list`, 'pin'] };
      return { p };
    }
    // имя и контакт с прошлой анкеты (только на этом устройстве) — чтобы не вводить заново
    const mine = store.get('ixMe', null);
    function prefill() {
      if (!mine) return;
      if (!q('contact').value) q('contact').value = mine.contact || '';
      if (!q('parent').value) q('parent').value = mine.name || '';
      if (!q('name').value && !intakeOf(q('service').value).birthOf) q('name').value = mine.name || '';
    }
    prefill();
    intakeApply(form);
    q('service').addEventListener('change', () => {
      const kid = !!intakeOf(q('service').value).birthOf, n = q('name');
      if (mine && mine.name) { if (kid && n.value === mine.name) n.value = ''; else if (!kid && !n.value) n.value = mine.name; }
      intakeApply(form); fadeIn(form, 4);
    });
    q('ppsave').addEventListener('change', (e) => store.set('ppSave', e.target.checked));
    form.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-format]');
      if (!chip) return;
      const on = chip.getAttribute('aria-pressed') !== 'true';
      form.querySelectorAll('[data-format]').forEach((b) => b.setAttribute('aria-pressed', String(on && b === chip)));
    });
    /** Проверка по порядку полей: что обязательно — зависит от услуги. → { me, pt } или null (подсказка уже показана). */
    async function validate() {
      const id = q('service').value, cfg = intakeOf(id), need = birthNeed(id), kid = cfg.birthOf || '';
      const fail = (el, msg, ic) => { if (el) { el.classList.add('invalid'); el.focus(); } toast(msg, ic || 'info'); return null; };
      if (!q('name').value.trim()) return fail(q('name'), kid ? `What’s ${kid}’s name?` : 'What should I call you?', 'user');
      let me = null, pt = null, r;
      if (need !== 'none') { r = await readPerson('me', need, kid); if (r.err) return fail(...r.err); me = r.p; }
      if (cfg.partner) { r = await readPerson('pt', 'full', 'of your partner'); if (r.err) return fail(...r.err); pt = r.p; }
      if (cfg.fullName && !q('fullname').value.trim()) return fail(q('fullname'), 'Please enter the full name at birth — it’s used to calculate the name numbers', 'user');
      if (kid && !q('parent').value.trim()) return fail(q('parent'), 'What should I call you?', 'user');
      if (!q('contact').value.trim()) return fail(q('contact'), 'Leave a contact so I can reply', 'user');
      if (!q('consent').checked) return fail(null, 'Please tick the consent to data processing', 'info');
      return { me, pt };
    }
    /** После отправки: запомнить на этом устройстве имя, контакт и людей (“Мои карты”). */
    function remember(me, pt) {
      const kid = !!intakeOf(q('service').value).birthOf;
      try { store.set('ixMe', { name: q(kid ? 'parent' : 'name').value.trim(), contact: q('contact').value.trim() }); } catch (e) { /* без памяти браузера */ }
      if (!q('ppsave').checked) return;
      const fn = q('fullname').value.trim(), cfg = intakeOf(q('service').value);
      for (const p of [me, pt]) {
        if (!p || p.lat == null) continue;
        const sp = people.remember(p);
        if (sp && p === me && cfg.fullName && fn && !sp.fullName) people.update(sp.id, { fullName: fn });
      }
    }
    function clear() {
      form.reset();
      for (const k of ['me', 'pt']) { S[k].set(null); q(k + 'date').dispatchEvent(new Event('change')); q(k + 'time').disabled = false; }
      form.querySelectorAll('[data-format]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      form.querySelectorAll('.pp-chip.on').forEach((b) => b.classList.remove('on'));
      prefill(); intakeApply(form);
    }
    let busy = false;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      const btn = form.querySelector('[type=submit]'), label = btn.innerHTML;
      try {
        const v = await validate();
        if (!v) return;
        goal('booking');
        const { text, data, hp } = intakeText(form, v.me, v.pt);
        remember(v.me, v.pt);
        if (inboxOn) {
          btn.disabled = true; btn.innerHTML = `${icon('refresh')} Sending…`;
          try {
            await loadInbox();
            const code = window.Inbox.code();
            await window.Inbox.send({ v: 1, code, at: new Date().toISOString(), data, text, page: location.pathname.split('/').pop() || 'index.html', lang: navigator.language || '' }, { hp });
            btn.disabled = false; btn.innerHTML = label;
            clear();
            if (onDone) onDone();
            goal('booking_inbox');
            sentToInbox(code, data);
            return;
          } catch (err) { btn.disabled = false; btn.innerHTML = label; /* сервер недоступен — анкета уйдёт через мессенджер */ }
        }
        if (SITE.bookingEndpoint) {
          try {
            const r = await fetch(SITE.bookingEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ message: text }, data)) });
            if (r.ok) { clear(); if (onDone) onDone(); thanks(); return; }
          } catch (err) { /* упадём в мессенджеры */ }
        }
        chooseChannel(text);
        if (onDone) onDone();
      } finally { busy = false; }
    });
    form.addEventListener('input', (e) => e.target.classList && e.target.classList.remove('invalid'));
  }
  const nextSteps = () => `<ol class="ix-next">
      <li>I’ll read your form and reply ${esc(INTAKE.replyTime || 'within a day')}.</li>
      <li>If needed, I’ll check a couple of details — it makes the reading more precise.</li>
      <li>I’ll suggest times in your time zone and send the payment details.</li></ol>`;
  /** Анкета уже в кабинете Алины: спокойно рассказываем, что дальше; написать в Telegram — по желанию. */
  /** Отправить заявку со своей формы (например, “Энергетическая работа”): в ящик Алины, иначе — окно мессенджеров.
      o: { data, text, hp, when } — when: строка “Предварительно: …” для окна благодарности. */
  async function submitIntake(o) {
    if (inboxOn) {
      try {
        await loadInbox();
        const code = window.Inbox.code();
        await window.Inbox.send({ v: 1, code, at: new Date().toISOString(), data: o.data, text: o.text, page: location.pathname.split('/').pop() || 'index.html', lang: navigator.language || '' }, { hp: o.hp || '' });
        goal('booking_inbox');
        sentToInbox(code, o.data, o);
        return true;
      } catch (e) { /* сервер недоступен — через мессенджер */ }
    }
    chooseChannel(o.text);
    return false;
  }
  function sentToInbox(code, data, o) {
    o = o || {};
    const c = SITE.contacts || {};
    const tg = /(?:t\.me\/|@)([A-Za-z0-9_]{4,})/.exec(data.contact || '');
    const how = tg ? `I’ll message you on Telegram — @${esc(tg[1])}` : `get in touch with you: ${esc(data.contact || '')}`;
    const note = `Hi Iris! I sent a form from your site, no. ${code} ✨`;
    const m = modal(`<div class="center"><div style="font-size:3rem;color:var(--gold);line-height:1">✦</div>
        <h3 style="margin:8px 0 4px">Thank you${data.name ? ', ' + esc(data.name.split(' ')[0]) : ''}! Your form is with me</h3>
        <p class="muted" style="margin:0">Form number: <b class="ix-code">${esc(code)}</b></p></div>
      ${o.when ? `<p class="center" style="margin:10px 0 0"><span class="badge gold">${esc(o.when)}</span></p>` : ''}
      <ol class="ix-next">
        <li>I’ll read your form calmly and ${how} ${esc(INTAKE.replyTime || 'within a day')}.</li>
        <li>If needed, I’ll check a couple of details — it makes the reading more precise.</li>
        <li>${o.when ? 'I’ll confirm the time and send you how to prepare, plus the payment details.' : 'I’ll suggest times in your time zone and send the payment details.'}</li></ol>
      <div style="display:grid;gap:10px;margin-top:6px">
        <a class="btn btn-primary btn-block" href="natal.html">Meanwhile — my birth chart</a>
        ${c.telegram ? `<a class="btn btn-ghost btn-block" target="_blank" rel="noopener" href="https://t.me/${esc(c.telegram.replace(/^@/, ''))}?text=${encodeURIComponent(note)}">${icon('telegram')} Message me on Telegram — optional</a>` : ''}
      </div>
      <p class="tiny muted center" style="margin:12px 0 0">No need to write separately — your form is already with me. Your details are encrypted and visible only to me.</p>`);
    return m;
  }
  function thanks() {
    modal(`<div class="center"><div style="font-size:3rem;color:var(--gold)">✦</div><h3>Thank you! Your form is with me</h3><p class="muted">What happens next:</p></div>${nextSteps()}<div class="center"><a class="btn btn-primary" href="natal.html">Meanwhile — my birth chart</a></div>`);
  }
  function chooseChannel(text) {
    const c = SITE.contacts || {};
    const btns = [];
    // ?text= подставляет анкету прямо в поле сообщения, остаётся нажать “Отправить”; на всякий случай текст ещё и копируем
    if (c.telegram) btns.push(`<a class="btn btn-primary btn-block" data-ch="tg" target="_blank" rel="noopener" href="https://t.me/${esc(c.telegram.replace(/^@/, ''))}?text=${encodeURIComponent(text)}">${icon('telegram')} Send via Telegram</a>`);
    if (c.whatsapp) btns.push(`<a class="btn btn-ghost btn-block" target="_blank" rel="noopener" href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}">${icon('whatsapp')} Send via WhatsApp</a>`);
    if (c.email) btns.push(`<a class="btn btn-ghost btn-block" href="mailto:${esc(c.email)}?subject=${encodeURIComponent('Reading request')}&body=${encodeURIComponent(text)}">${icon('mail')} Send by email</a>`);
    const m = modal(`
      <h3>Your form is ready ✨</h3>
      <p class="muted">${c.telegram ? 'Press “Send via Telegram” — the text will already be in the message field; you just send it.' : 'Choose where to send your form — the text is already written.'}</p>
      <pre class="ix-pre">${esc(text)}</pre>
      <div style="display:grid;gap:10px;margin-top:14px">${btns.join('')}<button class="btn btn-gold btn-block" type="button" data-ch="copy">${icon('copy')} Copy text</button></div>
      ${btns.length ? '' : '<p class="notice info" style="margin-top:14px">' + icon('info') + '<span>Copy the form text and send it to Iris however suits you.</span></p>'}
      <h4 style="margin:20px 0 6px">What happens next</h4>${nextSteps()}`);
    m.el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-ch]'); if (!b) return;
      if (b.dataset.ch === 'copy') { if (await copyText(text)) toast('Form text copied', 'check'); }
      if (b.dataset.ch === 'tg') { copyText(text); toast('If the message field is empty, paste the text — it’s already copied', 'telegram'); }
    });
  }
  function openBooking(preset) {
    const pr = promoInfo();
    const m = modal(`<div class="booking-head"><img src="${esc(SITE.avatar || 'assets/img/avatar.webp')}" alt="" width="64" height="64"><div><span class="eyebrow" style="margin:0">intake form</span><h3 style="margin:2px 0 0">A reading with Iris</h3></div></div>
      <p class="muted small" style="margin:0 0 14px">Add your birth details — and your form ${inboxOn ? 'comes straight to me together with your chart' : 'comes to me on Telegram'}. I reply personally, usually ${esc(INTAKE.replyTime || 'within a day')}.</p>
      ${pr ? `<div class="promo-inline"><span class="sticker">−${pr.percent}%</span><span><b>${esc(pr.title)}</b><br><small>valid until ${fmt.MONTHS_GEN[pr.end.getMonth()]} ${pr.end.getDate()}</small></span></div>` : ''}
      ${bookingFormHTML('bm', preset)}`, { cls: 'booking-modal' });
    bindBooking(m.el.querySelector('form'), () => m.close());
    return m;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-book]');
    if (b) { e.preventDefault(); openBooking(b.dataset.book || ''); }
  });

  // ---------- вкладки ----------
  function tabs(root) {
    $$('[role="tablist"]', root).forEach((tl) => {
      const btns = $$('[role="tab"]', tl);
      const show = (b) => {
        btns.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
        tl.dispatchEvent(new CustomEvent('tabchange', { detail: b.getAttribute('aria-controls') }));
      };
      btns.forEach((b, i) => {
        b.addEventListener('click', () => show(b));
        b.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length]; n.focus(); show(n); } });
      });
    });
  }

  // ---------- небо сейчас ----------
  function skyNow(date) {
    date = date || new Date();
    const ms = AC.moonState(date);
    const pts = AC.PLANETS.map((id) => AC.body(id, date));
    const retro = pts.filter((p) => p.retro).map((p) => p.id);
    const sunSign = AC.signOf(pts[0].lon);
    return { date, moon: ms, sunSign, retro, pts };
  }

  window.UI = { conjure, submitIntake, birthLine, birthNeed, people, peopleChips, pickList, localApi, dateHTML, cityField, cityAutocomplete, searchCities, checkDate, premOn, currency, setCurrency, priceOf, money, browserTz, botHref, botCta, goal, defaultCity, promoInfo, priceFor, minPrice, alinaNote, isPreview, TOOLS, icon, store, settings, saveSettings, fmt, esc, $, $$, glyph, pname, toast, modal, copyText, download, moonSVG, birthForm, recent, clients, openBooking, serviceOptions, academyOn, isAlina, bookingFormHTML, bindBooking, tzLabel, dobHTML, enhanceDob, reveal, fadeIn, reduceMotion, tabs, skyNow, contactLinks, CITIES, fmtCoord, timeZones };

  // Шапку, подвал и небо рисуем сразу (скрипт стоит в конце <body>, разметка страницы уже есть), а не по DOMContentLoaded:
  // так первый кадр страницы — и плавный переход между страницами — уже с шапкой, без мигания.
  let booted = false;
  function boot() {
    if (booted) return; booted = true;
    $$('[data-ic]').forEach((el) => { el.outerHTML = icon(el.dataset.ic); });
    $$('[data-note]').forEach((el) => { el.innerHTML = alinaNote(esc(el.dataset.note), el.dataset.noteCta || ''); });
    renderChrome();
    if (SITE.starfield !== false) starfield();
  }
  if (document.body && document.querySelector('main')) boot();
  document.addEventListener('DOMContentLoaded', () => {
    boot();
    reveal();
    watchDom();
    tabs();
    sliders();
  });
})();
