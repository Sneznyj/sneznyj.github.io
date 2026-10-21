/* Главная: живое небо, услуги с акцией, пакеты, отзывы, вопросы, запись. */
(function () {
  'use strict';
  const AC = window.AstroCore, T = window.ASTRO_TEXTS, UI = window.UI, SITE = window.SITE;
  const { esc, fmt, icon } = UI;
  const $ = (id) => document.getElementById(id);
  const money = (n, code) => UI.money(n, code);

  // ---------- живое небо ----------
  function skyStrip() {
    const now = new Date();
    const city = UI.defaultCity();
    const sky = UI.skyNow(now);
    const ms = sky.moon;
    const ph = T.moonPhaseNow[ms.phase8];
    const nextIng = AC.ingresses('moon', now, AC.addDays(now, 3), 0.25)[0];
    let ld = null;
    try { ld = AC.lunarDay(now, city.lat, city.lon); } catch (e) { ld = null; }
    let voc = null;
    try { voc = AC.voidOfCourse(AC.addDays(now, -1), AC.addDays(now, 3)).find((v) => v.end > now) || null; } catch (e) { voc = null; }
    const vocNow = !!(voc && voc.start <= now);
    const sun = sky.pts[0];
    const retro = sky.retro.filter((id) => id !== 'sun' && id !== 'moon');
    const personalRetro = retro.filter((id) => ['mercury', 'venus', 'mars'].includes(id));
    $('skyDate').textContent = '· ' + fmt.date(now);
    const cells = [
      `<div class="sky-cell"><span style="width:40px;flex-shrink:0">${UI.moonSVG(ms.angle)}</span><div><div class="k">Phase</div><div class="v">${ph.name}</div><div class="s">${Math.round(ms.illum * 100)}% illuminated</div></div></div>`,
      `<div class="sky-cell"><span class="big-glyph glyph">${T.signs[ms.sign].glyph}</span><div><div class="k">Moon</div><div class="v">${T.signs[ms.sign].loc}</div><div class="s">${nextIng ? 'until ' + fmt.dmTime(nextIng.date) : ''}</div></div></div>`,
      SITE.homeLunarDay ? `<div class="sky-cell"><span class="big-glyph" style="font-family:var(--ff-display);font-weight:600">${ld ? ld.day : '—'}</span><div><div class="k">Lunar day</div><div class="v">${ld ? T.lunarDays[ld.day].sym : ''}</div><div class="s">${ld && ld.end ? 'until ' + fmt.dmTime(ld.end) + ' · ' + esc(city.name) : ''}</div></div></div>`
        : `<div class="sky-cell"><span class="big-glyph" style="font:italic 400 1.5rem var(--ff-display)">v/c</span><div><div class="k">Void of course</div><div class="v">${vocNow ? 'The Moon is void now' : voc ? 'Next void Moon' : 'Not today'}</div><div class="s">${vocNow ? 'until ' + fmt.dmTime(voc.end) : voc ? fmt.dmTime(voc.start) + ' – ' + fmt.time(voc.end) : ''}</div></div></div>`,
      `<div class="sky-cell"><span class="big-glyph glyph">${T.signs[AC.signOf(sun.lon)].glyph}</span><div><div class="k">Sun</div><div class="v">${T.signs[AC.signOf(sun.lon)].loc}</div><div class="s">${AC.fmtDeg(sun.lon)}</div></div></div>`,
      `<div class="sky-cell"><span class="big-glyph glyph" style="color:${personalRetro.length ? 'var(--rose-strong)' : 'var(--ok)'}">${personalRetro.length ? T.planets[personalRetro[0]].glyph : '✓'}</span><div><div class="k">Retrograde</div><div class="v glyph" style="font-size:1.25rem;letter-spacing:.12em;color:var(--lav-strong)" title="${retro.map((id) => T.planets[id].name).join(', ')}">${retro.length ? retro.map((id) => T.planets[id].glyph).join(' ') : '—'}</div><div class="s">${personalRetro.length ? personalRetro.map((id) => T.planets[id].name).join(', ') + ': double-check arrangements' : retro.length ? retro.map((id) => T.planets[id].name).join(', ') : 'all planets direct'}</div></div></div>`,
    ];
    $('skyStrip').innerHTML = cells.join('');
    if ($('fcMoonIco')) {
      $('fcMoonIco').innerHTML = UI.moonSVG(ms.angle);
      $('fcMoonTitle').textContent = 'Moon ' + T.signs[ms.sign].loc;
      $('fcMoonSub').textContent = `${ph.name.toLowerCase()} · ${Math.round(ms.illum * 100)}% lit`;
    }
    const ev = nextEvent(now);
    if (ev && $('fcEventIco')) { $('fcEventIco').innerHTML = icon(ev.icon); $('fcEventTitle').textContent = ev.title; $('fcEventSub').textContent = ev.sub; }
  }

  function nextEvent(now) {
    const end = AC.addDays(now, 45);
    const cand = [];
    for (const e of AC.eclipses(now, AC.addDays(now, 40))) cand.push({ date: e.date, icon: 'sun-moon', title: (e.type === 'solar' ? 'Solar' : 'Lunar') + ' eclipse', sub: fmt.dm(e.date) + ' · ' + T.signs[AC.signOf(e.lon)].loc, w: 0 });
    for (const st of AC.stations(['mercury', 'venus', 'mars'], now, end)) cand.push({ date: st.date, icon: 'planet', title: T.planets[st.id].name + (st.kind === 'retro' ? (st.id === 'venus' ? ' turns retrograde' : ' turns retrograde') : (st.id === 'venus' ? ' turns direct' : ' turns direct')), sub: 'from ' + fmt.dm(st.date), w: 1 });
    for (const p of AC.moonPhases(now, AC.addDays(now, 16))) if (p.phase === 0 || p.phase === 2) cand.push({ date: p.date, icon: p.phase === 0 ? 'moon-stars' : 'moon', title: p.phase === 0 ? 'New Moon' : 'Full Moon', sub: fmt.dm(p.date) + ' · ' + T.signs[AC.signOf(p.lon)].loc, w: 2 });
    cand.sort((a, b) => a.date - b.date);
    const soon = cand.filter((c) => c.date - now < 10 * 86400000 && c.w < 2);
    return soon[0] || cand[0];
  }

  // ---------- цены и акция ----------
  function priceHTML(svc, big) {
    const p = UI.priceFor(svc);
    if (!svc.price) return '<div class="price">on request</div>';
    if (p.old) return `<div class="price-row"><span class="price-old">${money(p.old, p.code)}</span><span class="price">${money(p.now, p.code)}</span><span class="sticker sm">−${p.percent}%</span></div><div class="price-note">on your first reading</div>`;
    return `<div class="price">${money(p.now, p.code)}</div>`;
  }

  function hero() {
    const pr = UI.promoInfo();
    const from = UI.minPrice();
    $('priceHint').innerHTML = `${icon('ticket')}<span>Readings from <b>${money(from)}</b></span>` + (pr ? ` <span class="sticker sm">−${pr.percent}% ${esc(pr.short)}</span> <span class="small muted">until ${fmt.MONTHS_GEN[pr.end.getMonth()]} ${pr.end.getDate()}</span>` : '');
    if (pr) { const st = $('heroSticker'); st.hidden = false; st.innerHTML = `−${pr.percent}%<small>${esc(pr.short)}</small>`; st.setAttribute('role', 'note'); }
  }

  function needs() {
    $('needsGrid').innerHTML = SITE.needs.map((n, i) => `<li class="need reveal" style="--d:${(i % 2) * 0.06}s"><span class="need-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div></li>`).join('');
  }

  // ---------- валюта ----------
  function curSwitch() {
    const box = $('curSwitch');
    if (!box) return;
    // одна валюта (сейчас только рубли) — переключатель не нужен
    if (Object.keys(SITE.currencies || {}).length < 2) { box.hidden = true; box.innerHTML = ''; return; }
    const cur = UI.currency();
    const names = { RUB: 'rubles', USD: 'dollars', EUR: 'euros' };
    box.innerHTML = '<span class="small muted">Prices in</span><div class="seg" role="group" aria-label="Currency">' +
      Object.entries(SITE.currencies || {}).map(([code, sign]) => `<button type="button" data-cur="${code}" aria-pressed="${code === cur}">${sign} ${names[code] || code}</button>`).join('') + '</div>';
  }
  document.addEventListener('currencychange', () => {
    curSwitch(); hero(); services(); offers(); academy();
    document.querySelectorAll('#servicesGrid .reveal, #offersGrid .reveal, #acFormats .reveal').forEach((el) => el.classList.add('in'));
  });

  function services() {
    const tag = (s) => (s.tag ? `<span class="pl-tag ${s.tagType || ''}">${esc(s.tag)}</span>` : '');
    const row = (s, i) => `
      <article class="pl-row reveal${s.featured ? ' pl-featured' : ''}" style="--d:${(i % 4) * 0.05}s">
        <div class="pl-main">
          <h3>${esc(s.title)} ${tag(s)}</h3>
          <p>${esc(s.text)}</p>
          <ul class="pl-inc">${s.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
        <div class="pl-side">
          <span class="pl-dur">${esc(s.duration)}</span>
          <div class="pl-price">${priceHTML(s)}</div>
          <button class="btn ${s.featured ? 'btn-primary' : 'btn-ghost'} btn-sm" type="button" data-book="${s.id}">Book</button>
        </div>
      </article>`;
    $('servicesGrid').innerHTML = SITE.services.map(row).join('');
  }

  function offers() {
    const byId = Object.fromEntries(SITE.services.map((s) => [s.id, s]));
    const cards = (SITE.bundles || []).map((b, i) => {
      const bp = UI.priceOf(b);
      const old = b.items.reduce((a, id) => a + (byId[id] ? UI.priceOf(byId[id]).n : 0), 0);
      const pct = old ? Math.round((1 - bp.n / old) * 100) : 0;
      return `<article class="card hover offer-card reveal" style="--d:${i * 0.08}s">
        ${pct > 0 ? `<span class="sticker corner">−${pct}%</span>` : ''}
        ${b.tag ? `<span class="tag gold" style="align-self:flex-start;margin-bottom:12px">${icon('star-filled')}${esc(b.tag)}</span>` : ''}
        <h3>${esc(b.title)}</h3>
        <div class="plus">${b.items.map((id) => byId[id] ? `<span class="pi">${icon(byId[id].icon)}${esc(byId[id].title)}</span>` : '').join('<span class="muted">+</span>')}</div>
        <p class="muted">${esc(b.text)}</p>
        <div class="foot"><div><div class="price-row"><span class="price-old">${money(old, bp.code)}</span><span class="price">${money(bp.n, bp.code)}</span></div><span class="save">you save ${money(old - bp.n, bp.code)}</span></div>
        <button class="btn btn-primary btn-sm" type="button" data-book="${b.items[0]}">I’d like this bundle</button></div>
      </article>`;
    });
    const g = SITE.gift;
    if (g && g.enabled) cards.push(`<article class="card hover offer-card gift-card reveal" style="--d:.16s">
      <span class="tag gift" style="align-self:flex-start;margin-bottom:12px;background:rgba(255,255,255,.18);box-shadow:none">${icon('gift')}As a gift</span>
      <svg class="gift-bow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">${(window.ICONS || {}).gift || ''}</svg>
      <div class="gift-preview" id="giftPreview" aria-hidden="true"></div>
      <h3>${esc(g.title)}</h3>
      <p>${esc(g.text)}</p>
      <div class="foot"><div><div class="price">from ${money(UI.priceOf(g, 'from').n, UI.priceOf(g, 'from').code)}</div><span class="small" style="color:#e7dcff">for any reading</span></div>
      <button class="btn btn-light btn-sm" type="button" data-book="other">${icon('gift')} Give as a gift</button></div>
    </article>`);
    $('offersGrid').innerHTML = cards.join('');
    if (!cards.length) $('offers').hidden = true;
    const gp = $('giftPreview');
    if (gp && window.Cards) setTimeout(async () => {
      try {
        const cv = await window.Cards.certificate({ number: 'AM-0000', recipient: 'you', title: SITE.services[0].title, message: 'May the stars show you the most beautiful path', style: 'paper', validUntil: AC.addDays(new Date(), 365) });
        cv.toBlob((b) => { if (b) gp.innerHTML = `<img src="${URL.createObjectURL(b)}" alt="">`; }, 'image/png');
      } catch (e) { /* превью не обязательно */ }
    }, 400);
  }

  function tools() {
    const tones = ['', 'gold', 'rose'];
    const d = { 'natal.html': 'The chart wheel, planets in signs and houses, aspects and a detailed interpretation.', 'synastry.html': 'Synastry of two charts: attraction, emotions, communication and how solid the bond is.', 'forecast.html': 'Transits to your chart month by month, the solar return, progressions and the annual profection.', 'horoscope.html': 'For today, tomorrow and the month — based on where the planets actually are.', 'moon.html': 'Phases, lunar days for your city, the void-of-course Moon and tips for the day.', 'sky.html': 'Retrograde planets with their shadow periods, eclipses, New Moons.', 'numerology.html': 'Your life path number, the Pythagorean square, your personal year and your name numbers.', 'astro.html': 'For astrologers: saved charts, natal, forecast, numbers, horoscope and compatibility for each person in one place.' };
    $('toolsGrid').innerHTML = UI.TOOLS.map(([h, t, ic], i) => `
      <a class="ti-row reveal" style="--d:${(i % 4) * 0.04}s" href="${h}">
        <span class="ti-n">${String(i + 1).padStart(2, '0')}</span>
        <span class="ti-ic">${icon(ic)}</span>
        <span class="ti-t"><b>${t}</b><span>${d[h] || ''}</span></span>
        <span class="ti-go">Open ${icon('arrow')}</span>
      </a>`).join('');
    // премиум-доступ: подробные разделы по коду (js/premium.js, content.js → premium)
    const P = SITE.premium;
    if (P && P.enabled !== false && !$('premiumBand')) {
      const from = Math.min(...(P.plans || []).map((p) => p.price));
      $('toolsGrid').insertAdjacentHTML('afterend', `<a class="premium-band reveal" id="premiumBand" href="premium.html">
        <span class="pw-crown" aria-hidden="true">${icon('crown')}</span>
        <div><span class="kicker" style="margin-bottom:4px">${esc(P.name || 'Premium access')}</span>
          <h3>Want more depth? Dated forecasts and full readings</h3>
          <p class="muted">${(P.features || []).map((f) => esc(f.title)).join(' · ')}</p></div>
        <span class="premium-band-go">${isFinite(from) ? 'from ' + fmt.money(from) : ''}<b>Learn more ${icon('arrow')}</b></span>
      </a>`);
    }
  }

  function about() {
    const a = SITE.about;
    const fn = SITE.firstName || '';
    $('aboutTitle').innerHTML = fn ? esc(a.title).replace(esc(fn), `<em>${esc(fn)}</em>`) : esc(a.title);
    $('aboutText').innerHTML = a.paragraphs.map((p, i) => `<p class="${i === 0 ? 'lead' : ''}">${esc(p)}</p>`).join('');
    $('aboutStory').innerHTML = a.story ? `<div class="story">${esc(a.story)}</div>` : '';
    $('aboutValues').innerHTML = a.values.map((v) => `<div class="value"><dt>${esc(v.title)}</dt><dd>${esc(v.text)}</dd></div>`).join('');
    $('aboutSign').textContent = a.signature;
    $('aboutCaption').textContent = a.photoCaption || '';
  }

  function academy() {
    const ac = SITE.academy;
    // обучение скрыто (academy.enabled: false) — ни блока, ни кнопки “Уроки астрологии” в “Обо мне”
    if (!UI.academyOn) {
      $('academy').hidden = true;
      document.querySelectorAll('#about a[href="academy.html"]').forEach((a) => a.remove());
      return;
    }
    $('acTitle').innerHTML = esc(ac.title);
    $('acText').textContent = ac.text;
    $('acFormats').innerHTML = ac.formats.map((f, i) => `
      <div class="card ac-card reveal" style="--d:${i * 0.08}s">
        <span class="ac-ic">${icon(['book', 'user-heart', 'users'][i % 3])}</span>
        <h3 style="margin-top:10px">${esc(f.title)}</h3>
        <p>${esc(f.text)}</p>
        ${f.note ? `<p class="small ac-note">${esc(f.note)}</p>` : ''}
        <div class="row between ac-foot">
          <span class="price">${f.price ? money(UI.priceOf(f).n, UI.priceOf(f).code) + (f.unit ? ` <small class="ac-unit">${esc(f.unit)}</small>` : '') : (f.href ? 'free' : '')}</span>
          ${f.href ? `<a class="btn btn-light btn-sm" href="${f.href}">${esc(f.cta)}</a>` : `<button class="btn btn-light btn-sm" type="button" data-book="${f.service}">${esc(f.cta)}</button>`}
        </div>
      </div>`).join('');
  }

  function reviews() {
    const list = SITE.reviews || [];
    if (!list.length) { $('reviews').hidden = true; return; }
    const sample = list.some((r) => r.sample);
    $('reviewsList').innerHTML = list.map((r, i) => `
      <figure class="review reveal" style="--d:${i * 0.06}s">
        ${r.sample ? '<span class="sample-tag">Sample review</span>' : ''}
        <blockquote class="quote">${esc(r.text)}</blockquote>
        <figcaption class="who"><b>${esc(r.name)}</b><span>${esc(r.service || '')}</span></figcaption>
      </figure>`).join('');
    if (sample && !$('reviewsNote')) $('reviewsList').insertAdjacentHTML('afterend', '<p class="tiny muted reviews-note" id="reviewsNote">This is a demo site: the reviews above show the layout — they aren’t from real clients. A live site publishes genuine reviews only.</p>');
  }

  function faq() {
    $('faqList').innerHTML = SITE.faq.map((f, i) => `<details class="acc-item reveal" style="--d:${i * 0.04}s"${i === 0 ? ' open' : ''}><summary>${esc(f.q)}<span class="pm">${icon('plus')}</span></summary><div class="acc-body">${esc(f.a)}</div></details>`).join('');
  }

  function booking() {
    const pr = UI.promoInfo();
    const promo = pr ? `<div class="promo-inline"><span class="sticker">−${pr.percent}%</span><span><b>${esc(pr.title)}</b><br><small>until ${fmt.MONTHS_GEN[pr.end.getMonth()]} ${pr.end.getDate()} — the discount applies automatically</small></span></div>` : '';
    // анкета: сразу попадает в кабинет Алики (или уходит в Telegram), время она предлагает сама
    $('bookingCard').innerHTML = promo + UI.bookingFormHTML('hb');
    UI.bindBooking($('bookingCard').querySelector('form'));
    const links = UI.contactLinks();
    $('bookingContacts').innerHTML = links.map((l) => `<a class="contact-line" href="${esc(l.href)}" target="_blank" rel="noopener">${icon(l.k)}<span>${esc(l.label)}</span></a>`).join('');
  }

  function media() {
    const m = SITE.media || {};
    let calm = false;
    try { calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData); } catch (e) { calm = false; }
    if (m.heroVideo && !calm) {
      const v = document.createElement('video');
      Object.assign(v, { src: m.heroVideo, muted: true, loop: true, autoplay: true, playsInline: true, preload: 'auto' });
      v.className = 'scene-video'; v.setAttribute('aria-hidden', 'true'); v.setAttribute('muted', '');
      document.querySelector('.scene-bg').prepend(v);
      v.play().catch(() => {});
    }
    if (m.greetingVideo) {
      const fig = document.querySelector('.polaroid');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'greet';
      b.innerHTML = `<video src="${esc(m.greetingVideo)}" muted loop autoplay playsinline preload="metadata" aria-hidden="true"></video><span class="greet-play">${icon('play-filled')}</span><span class="greet-label">${esc(m.greetingTitle || 'Video about me')}</span>`;
      fig.appendChild(b);
      b.addEventListener('click', () => UI.modal(`<video class="greet-full" src="${esc(m.greetingVideo)}" controls autoplay playsinline></video>`));
    }
  }

  // ---------- натальная карта прямо на главной: сначала — небо сейчас, после ввода — карта человека ----------
  function natalHome() {
    const box = $('nhResult'), formBox = $('nhForm');
    if (!box || !formBox || !window.Wheel) return;
    const W = window.Wheel, CV = window.ChartView;
    let form = null, last = null;
    function show(c, p, sample) {
      last = [c, p, sample];
      const b3 = ['sun', 'moon', 'asc'].filter((id) => c.byId[id]).map((id) => `<span><span class="glyph" style="color:var(--lav-strong)">${T.planets[id].glyph}</span>${T.planets[id].name}: <b>${T.signs[c.byId[id].sign].name}</b></span>`).join('');
      const q = new URLSearchParams({ y: p.y, mo: p.mo, d: p.d, h: p.h, mi: p.mi, tk: p.timeKnown === false ? 0 : 1, lat: (+p.lat).toFixed(4), lon: (+p.lon).toFixed(4), tz: typeof p.zone === 'string' ? p.zone : '', place: p.place || '', name: p.name || '' });
      box.innerHTML = `<div class="wheel-box" id="nhWheel">${W.svg(c, { minor: UI.settings.minor })}</div>
        <p class="nh-cap small muted">${sample ? `This is the sky right now${p.place ? ' · ' + esc(p.place) : ''}. Hover over the lines and planets for tooltips; enter your details and I’ll build your chart.` : `${esc(p.name || 'Your chart')} · ${fmt.birth(p)}${p.place ? ' · ' + esc(p.place) : ''}`}</p>
        ${sample ? '' : `<div class="nh-b3">${b3}</div><div class="nh-go"><a class="btn btn-primary btn-sm" href="natal.html?${q.toString()}">${icon('chart')} Interpretation and all sections</a>${p.personId ? `<a class="btn btn-ghost btn-sm" href="astro.html#p=${encodeURIComponent(p.personId)}">${icon('address-book')} Forecast, numbers, compatibility</a>` : `<a class="btn btn-ghost btn-sm" href="astro.html">${icon('address-book')} Chart studio</a>`}</div>`}`;
      W.attach($('nhWheel'));
      if (!sample) UI.fadeIn(box, 6);
    }
    async function build(p) {
      let c;
      try { c = AC.chart(p, CV ? CV.chartOpts() : {}); } catch (e) { UI.toast('Couldn’t calculate the chart — please check the details', 'info'); return; }
      UI.recent.add(p);
      if (!(await UI.conjure(box, { kind: 'natal' }))) return;
      show(c, p, false);
      if (window.innerWidth < 900) box.scrollIntoView({ behavior: UI.reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    }
    form = UI.birthForm(formBox, { onPick: (it) => build(Object.assign({}, it.p, it.person ? { personId: it.person.id } : {})) });
    $('nhGo').addEventListener('click', () => { const p = form.get(); if (p) build(p); });
    formBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input:not([role=combobox])')) { const p = form.get(); if (p) build(p); } });
    // пока данных нет — карта текущего момента для города посетителя (видно, что сайт считает по-настоящему)
    const city = UI.defaultCity(), d = new Date();
    const now = { name: 'The sky right now', y: d.getFullYear(), mo: d.getMonth() + 1, d: d.getDate(), h: d.getHours(), mi: d.getMinutes(), timeKnown: true, lat: city.lat, lon: city.lon, zone: UI.browserTz || city.tz, place: city.name };
    try { show(AC.chart(now, CV ? CV.chartOpts() : {}), now, true); } catch (e) { console.error(e); }
    // смена темы — колесо перерисовываем в новых цветах
    document.addEventListener('themechange', () => { if (last) show(last[0], last[1], last[2]); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    try { natalHome(); } catch (e) { console.error(e); }
    media();
    hero(); needs(); curSwitch(); services(); offers(); tools(); about(); academy(); reviews(); faq(); booking();
    UI.reveal();
    setTimeout(() => { try { skyStrip(); } catch (e) { console.error(e); } }, 30);
  });
})();
