/* Профи-инструменты на страницах: натальная карта (вкладка “Профи”), прогноз (дирекции, лунар, фирдарии, динамика),
   небо (эфемериды), лунный календарь (планетные часы), карта момента (хорар). Расчёты — js/pro.js (бесплатно всем);
   толкования к ним — премиум-модуль _private/pro-texts.js (window.ProTexts): Алике и клиентам с кодом доступа.
   Вызовы: ProView.natal(блок, карта, параметры) · ProView.forecast(блок, карта, параметры) · ProView.ephemeris(блок)
   · ProView.hours(блок, город) · ProView.horaryCard(карта, город). */
(function () {
  'use strict';
  // язык и формат времени сайта (content.js → locale, clock): 'en-US' и 12 часов по умолчанию
  const LOC = (window.SITE && window.SITE.locale) || 'en-US', H12 = !(window.SITE && window.SITE.clock === '24h');
  const AC = window.AstroCore, T = window.ASTRO_TEXTS, UI = window.UI, P = window.ProAstro;
  const { esc, fmt, icon } = UI;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const gl = (id) => `<span class="glyph pv-g">${id === 'southNode' ? '☋' : T.planets[id] ? T.planets[id].glyph : ''}</span>`;
  const pn = (id) => (id === 'southNode' ? 'South Node' : id === 'node' ? 'North Node' : T.planets[id] ? T.planets[id].name : id);
  const sg = (si) => `<span class="glyph" style="color:var(--gold)">${T.signs[typeof si === 'number' ? AC.SIGNS[si] : si].glyph}</span>`;
  const pos = (lon) => `${AC.fmtDeg(lon)} ${sg(AC.signIndex(lon))}`;
  const ASP_W = { conj: 'conjunction', sextile: 'sextile', square: 'square', trine: 'trine', opp: 'opposition' };
  const aspG = (t) => `<span class="glyph" style="color:${T.aspects[t].color}">${T.aspects[t].glyph}</span>`;
  const month = (d) => `${fmt.MONTHS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
  const PT = () => window.ProTexts || null;
  const premiumChip = () => (window.Premium && window.Premium.chip ? window.Premium.chip() : '');

  /** Есть ли доступ к толкованиям: подгружаем премиум-модуль один раз. */
  let textsP = null;
  function loadTexts() {
    if (window.ProTexts) return Promise.resolve(true);
    if (!window.Premium || !window.Premium.ensure) return Promise.resolve(false);
    return textsP || (textsP = window.Premium.ensure(['pro-texts']).then((ok) => !!(ok && window.ProTexts)).catch(() => false));
  }
  /** Блок толкования: с доступом — текст, без доступа — закрытая карточка с названием. */
  function interp(title, text) {
    if (text) return `<div class="pv-interp"><b>${esc(title)}</b><p>${text}</p></div>`;
    return window.Premium && window.Premium.locked ? window.Premium.locked(esc(title), { lines: 2, meta: 'premium' }) : '';
  }
  const lockNote = () => (PT() ? '' : `<p class="tiny muted pv-note">${icon('crown')} Calculations are open to everyone. Their interpretations are part of <a href="premium.html">premium access</a>.</p>`);

  // ---------- инструменты натальной карты ----------
  const DIG = { domicile: ['domicile', '+5'], exaltation: ['exaltation', '+4'], triplicity: ['triplicity', '+3'], term: ['term', '+2'], face: ['face', '+1'], detriment: ['detriment', '−5'], fall: ['fall', '−4'] };
  function dignitiesHTML(c) {
    const rows = P.dignities(c);
    const rec = P.receptions(c);
    const t = PT();
    return `<p class="small muted">Essential dignities after Ptolemy (Lilly’s scores): how “comfortable” a planet is in its sign. Traditional rulers (no outer planets); triplicities after Dorotheus${c.houses ? `, chart ${c.houses.dayChart ? 'day' : 'night'}` : ' (time unknown — using the day rulers)'}.</p>
      <div class="table-wrap"><table class="table pv-dig"><thead><tr><th>Planet</th><th>Position</th><th>Ruler</th><th>Exalt.</th><th>Tripl.</th><th>Term</th><th>Face</th><th>Dignities</th><th>Score</th></tr></thead><tbody>
      ${rows.map((d) => `<tr><td>${gl(d.id)} ${pn(d.id)}${d.retro ? ' <span class="retro-mark">R</span>' : ''}</td><td>${pos(d.lon)}</td><td>${gl(d.ruler)}</td><td>${d.exaltation ? gl(d.exaltation) : '—'}</td><td>${gl(d.triplicity)}</td><td>${gl(d.term)}</td><td>${gl(d.face)}</td>
        <td class="wrap">${d.has.map((h) => `<span class="badge ${DIG[h][1][0] === '+' ? 'ok' : 'warn'}">${DIG[h][0]} ${DIG[h][1]}</span>`).join(' ')}${d.peregrine ? '<span class="badge warn">peregrine −5</span>' : ''}</td>
        <td><b class="${d.score > 0 ? 'pv-plus' : d.score < 0 ? 'pv-minus' : ''}">${d.score > 0 ? '+' : ''}${d.score}</b></td></tr>`).join('')}</tbody></table></div>
      ${rec.length ? `<p class="small" style="margin-top:12px"><b>Mutual receptions:</b> ${rec.map((r) => `${gl(r.a)} ${pn(r.a)} ↔ ${gl(r.b)} ${pn(r.b)} (${r.kind === 'domicile' ? 'by domicile' : 'by exaltation'})`).join('; ')} — the planets are each other’s “guests” and help each other.</p>` : ''}
      ${t ? `<div class="pv-interps">${rows.filter((d) => d.score >= 5 || d.score <= -5).map((d) => interp(`${pn(d.id)}: ${d.score > 0 ? 'a strong planet' : 'a planet under strain'}`, t.dignity(d))).join('')}</div>` : lockNote()}`;
  }
  function dispositorsHTML(c) {
    const ds = P.dispositors(c), t = PT();
    const chain = (path) => path.map((id, i) => `${i ? '<span class="pv-arr">→</span>' : ''}<span class="pv-ch">${gl(id)}${pn(id)}</span>`).join('');
    return `<p class="small muted">Chains of rulership: planet → the ruler of the sign it’s in → that ruler’s ruler… Where the chains converge is the chart’s “main” planet.</p>
      <div class="pv-chains">${ds.chains.map((p) => `<div>${chain(p)}</div>`).join('')}</div>
      <div class="grid grid-2" style="margin-top:14px">
        <div class="card pv-mini"><span class="eyebrow">Final dispositor</span><h4>${ds.final ? `${gl(ds.final)} ${pn(ds.final)}` : 'none'}</h4><p class="small muted">${ds.final ? 'All the chains converge on this planet — it sets the overall tone.' : ds.loops.length ? 'The chains close into a loop — several equal centers.' : 'Several planets in their own domicile — the chart has several anchors.'}</p></div>
        <div class="card pv-mini"><span class="eyebrow">In domicile</span><h4>${ds.self.length ? ds.self.map((id) => `${gl(id)} ${pn(id)}`).join(', ') : '—'}</h4>${ds.loops.length ? `<p class="small muted">Loops: ${ds.loops.map((l) => l.map(pn).join(' ↔ ')).join('; ')}</p>` : ''}</div>
      </div>
      ${t ? interp(ds.final ? `Final dispositor — ${pn(ds.final)}` : 'Several centers in the chart', t.dispositor(ds)) : lockNote()}`;
  }
  const PAT = { grandTrine: ['Grand Trine', '△'], tSquare: ['T-square', '⊤'], grandCross: ['Grand Cross', '✚'], yod: ['Yod (“finger of fate”)', 'Y'], kite: ['Kite', '◇'], mysticRectangle: ['Mystic Rectangle', '▭'], stellium: ['Stellium', '✦'] };
  const JONES = { bundle: 'Bundle', bowl: 'Bowl', bucket: 'Bucket', locomotive: 'Locomotive', seesaw: 'Seesaw', splay: 'Splay', splash: 'Splash' };
  const JONES_ABOUT = { bundle: 'all planets within a third of the circle', bowl: 'all planets within half the circle', bucket: 'a bowl plus one “handle” planet opposite', locomotive: 'planets across two thirds of the circle, one third empty', seesaw: 'two groups of planets facing each other', splay: 'several uneven groups', splash: 'planets scattered all around the circle' };
  function patternsHTML(c) {
    const ps = P.patterns(c), js = P.jonesShape(c), hs = P.houseStrength(c), t = PT();
    return `<div class="grid grid-2">
        <div class="card pv-mini"><span class="eyebrow">Chart shape · after Marc Edmund Jones</span><h4>${JONES[js.shape]}</h4><p class="small muted">${JONES_ABOUT[js.shape]}${js.handle ? ` · handle — ${gl(js.handle)} ${pn(js.handle)}` : ''}${js.leader ? ` · leading planet — ${gl(js.leader)} ${pn(js.leader)}` : ''}</p></div>
        ${hs ? `<div class="card pv-mini"><span class="eyebrow">House strength</span><h4>strong: ${hs.strong.map((h) => ROMAN[h - 1]).join(', ')}</h4><p class="small muted">weakest: ${hs.weak.map((h) => ROMAN[h - 1]).join(', ')} · by planets in the house, the strength of its ruler and angularity</p></div>` : '<div class="card pv-mini"><span class="eyebrow">House strength</span><p class="small muted">A birth time is needed.</p></div>'}
      </div>
      <h4 style="margin-top:18px">Aspect patterns</h4>
      ${ps.length ? `<div class="pv-pats">${ps.map((p) => `<div class="pv-pat"><span class="pv-pat-i">${PAT[p.type][1]}</span><div><b>${PAT[p.type][0]}</b>${p.element ? ` <span class="badge">${T.elements[p.element].name}</span>` : ''}${p.where ? ` <span class="badge">${p.kind === 'sign' ? T.signs[p.where].loc : ROMAN[p.where - 1] + ' house'}</span>` : ''}<div class="small">${p.planets.map((id) => `${gl(id)} ${pn(id)}${p.apex === id ? ' <small class="muted">(apex)</small>' : ''}`).join(' · ')}</div>${t ? `<p class="small pv-pat-t">${t.pattern(p, c)}</p>` : ''}</div></div>`).join('')}</div>` : '<p class="small muted">No major patterns — a chart without rigid “structures”: the energy is spread more freely.</p>'}
      ${hs ? `<details class="details-adv" style="margin-top:14px"><summary>All houses by strength</summary><div class="table-wrap"><table class="table"><thead><tr><th>House</th><th>Cusp</th><th>Ruler</th><th>Planets</th><th>Strength</th></tr></thead><tbody>${hs.list.map((h) => `<tr><td><b>${ROMAN[h.house - 1]}</b> · ${esc(T.houses[h.house].title)}</td><td>${sg(h.sign)} ${esc(T.signs[h.sign].name)}</td><td>${gl(h.ruler)}${h.rulerHouse ? ' at ' + ROMAN[h.rulerHouse - 1] : ''}</td><td>${h.planets.map(gl).join('') || '—'}</td><td><span class="pv-bar"><i style="width:${Math.max(4, Math.min(100, h.score * 9))}%"></i></span> ${h.score}</td></tr>`).join('')}</tbody></table></div></details>` : ''}
      ${t ? interp(`The “${JONES[js.shape]}” shape`, t.jones(js, c)) + (hs ? interp('Strong and weak houses', t.houses(hs, c)) : '') : lockNote()}`;
  }
  function midpointsHTML(c) {
    const mp = P.midpoints(c), t = PT();
    const angW = { 0: 'on the midpoint', 90: 'square', 180: 'opposite' };
    return `<p class="small muted">Midpoints (Hamburg School, Ebertin): the point halfway between two planets is a sensitive point. A “planetary picture” A = B/C: a planet sits on the midpoint (or square/opposite it, orb 1.5°).</p>
      ${mp.pictures.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Picture</th><th>How</th><th>Orb</th>${t ? '<th>Meaning</th>' : ''}</tr></thead><tbody>${mp.pictures.slice(0, 24).map((x) => `<tr><td>${gl(x.planet)} = ${gl(x.a)}/${gl(x.b)} <span class="small muted">${pn(x.planet)} = ${pn(x.a)}/${pn(x.b)}</span></td><td class="small">${angW[x.angle]}</td><td>${x.orb.toFixed(2)}°</td>${t ? `<td class="wrap small">${t.midpoint(x)}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : '<p class="small muted">No exact pictures.</p>'}
      <details class="details-adv" style="margin-top:12px"><summary>All midpoints (${mp.list.length})</summary><div class="pv-mlist">${mp.list.map((m) => `<span>${gl(m.a)}/${gl(m.b)} <b>${pos(m.lon)}</b></span>`).join('')}</div></details>
      ${t ? '' : lockNote()}`;
  }
  function starsHTML(c) {
    const fs = P.fixedStars(c), t = PT();
    return `<p class="small muted">Conjunctions of planets and chart angles with bright fixed stars (orb 1.5° for the lights and angles, 1° for planets). Star positions are adjusted for precession to the birth year.</p>
      ${fs.length ? `<div class="pv-stars">${fs.map((s) => `<div class="pv-star"><span class="pv-star-i">✦</span><div><b>${esc(s.name)}</b> ${gl(s.planet)} ${pn(s.planet)} <span class="small muted">· star ${pos(s.starLon)} · orb ${s.orb.toFixed(2)}°</span>${t ? `<p class="small" style="margin:4px 0 0">${t.star(s.star, s.planet)}</p>` : ''}</div></div>`).join('')}</div>` : '<p class="small muted">No tight conjunctions with the major stars.</p>'}
      ${t ? '' : lockNote()}`;
  }
  function firdariaHTML(c) {
    const fd = P.firdaria(c), t = PT(), now = new Date();
    const cur = fd.periods.find((x) => x.current);
    const sub = cur && cur.subs.find((s) => s.current);
    return `<p class="small muted">Firdaria — the Persian system of life periods: each planet rules its own years (${fd.day === false ? 'night chart: the Moon begins' : 'day chart: the Sun begins'}${fd.unknownTime ? ' — birth time unknown, treated as a day chart' : ''}), with 7 sub-periods inside.</p>
      ${cur ? `<div class="card pv-now"><span class="eyebrow">Now</span><h4>${gl(cur.id)} Period of ${pn(cur.id)}${sub ? ` · sub-period of ${gl(sub.id)} ${pn(sub.id)}` : ''}</h4><p class="small muted">${fmt.date(cur.start)} — ${fmt.date(cur.end)}${sub ? ` · sub-period until ${fmt.date(sub.end)}` : ''}</p>${t ? `<p class="small">${t.firdaria(cur.id, sub && sub.id, c)}</p>` : ''}</div>` : ''}
      <div class="pv-fird">${fd.periods.filter((p) => p.end > new Date(now.getFullYear() - 30, 0, 1) && p.start < new Date(now.getFullYear() + 40, 0, 1)).map((p) => `<details class="pv-fp${p.current ? ' cur' : ''}"${p.current ? ' open' : ''}><summary>${gl(p.id)} <b>${pn(p.id)}</b> <span class="small muted">${p.start.getFullYear()}–${p.end.getFullYear()} · ${p.years} ${fmt.plural(p.years, 'year', 'years', 'years')}</span></summary>${p.subs.length ? `<div class="pv-subs">${p.subs.map((s) => `<span class="${s.current ? 'cur' : ''}">${gl(s.id)} ${fmt.dateShort(s.start)} ${s.start.getFullYear()}</span>`).join('')}</div>` : '<p class="small muted" style="margin:6px 0 0">A nodal period with no sub-periods.</p>'}</details>`).join('')}</div>
      ${t ? '' : lockNote()}`;
  }
  function timeHTML(c, params) {
    if (!c.timeKnown) return '<p class="muted">No birth time given — nothing to check. If it’s approximate (“morning”, “around 3 am”), enter it, and you’ll see here how the Ascendant shifts.</p>';
    const tw = P.timeWindow(params, 120, window.ChartView ? window.ChartView.chartOpts() : {});
    const base = tw.base;
    const tz = params.zone;
    const tm = (d) => { try { return new Intl.DateTimeFormat(LOC, { timeZone: tz, hour: H12 ? 'numeric' : '2-digit', minute: '2-digit', hour12: H12 }).format(d); } catch (e) { return fmt.time(d); } };
    const WHAT = { asc: 'Ascendant', mc: 'MC', moon: 'Moon' };
    const show = tw.rows.filter((r, i) => i % 3 === 0);
    return `<p class="small muted">If the birth time is approximate: how the Ascendant, MC and Moon change when the time moves 2 hours either way. It shows how much precision matters and where to start rectification.</p>
      ${tw.changes.length ? `<div class="pv-changes">${tw.changes.map((ch) => `<div class="pv-change"><b>${tm(ch.date)}</b> ${WHAT[ch.what]}: ${sg(ch.from)} ${esc(T.signs[ch.from].name)} → ${sg(ch.to)} ${esc(T.signs[ch.to].name)} <span class="small muted">(${ch.min > 0 ? '+' : '−'}${Math.abs(ch.min)} min)</span></div>`).join('')}</div>` : `<p class="small"><b>Within ±2 hours, the signs of the Ascendant, MC and Moon don’t change</b> — an approximate time is enough for them. The Ascendant degree and house cusps still shift.</p>`}
      <div class="table-wrap" style="margin-top:12px"><table class="table pv-tw"><thead><tr><th>Time</th><th>Ascendant</th><th>MC</th><th>Moon</th></tr></thead><tbody>${show.map((r) => `<tr class="${r.min === 0 ? 'cur' : ''}"><td><b>${tm(r.date)}</b> <small class="muted">${r.min === 0 ? 'given' : (r.min > 0 ? '+' : '−') + Math.abs(r.min) + ' min'}</small></td><td>${pos(r.asc)}</td><td>${pos(r.mc)}</td><td>${pos(r.moon)}</td></tr>`).join('')}</tbody></table></div>
      <p class="tiny muted" style="margin-top:8px">Given time: ${tm(base.date)} (${esc(tz)}).</p>`;
  }
  function relocHTML(c, params) {
    return `<p class="small muted">Relocation is the same birth chart calculated for another city: the planets stay the same, but the houses and angles change. It’s used to look at where a person might live, work or rest. Below are the cities where natal planets fall on the chart’s angles (astrocartography lines ASC, DSC, MC, IC).</p>
      <div id="pvRelocCity" style="max-width:360px"></div><div id="pvReloc" style="margin-top:12px"></div>
      <h4 style="margin-top:18px">Planet lines near cities <small class="muted">— from the site’s list, orb 3°</small></h4><div id="pvAcg" class="pv-acg"><p class="small muted">Calculating…</p></div>`;
  }
  function relocBind(box, c, params) {
    if (!c.timeKnown) { box.innerHTML = '<p class="muted">Relocation needs a birth time.</p>'; return; }
    const draw = (place) => {
      const rc = P.relocate(c, place, window.ChartView ? window.ChartView.chartOpts() : {});
      const el = box.querySelector('#pvReloc');
      const ang = (id) => (rc.byId[id] ? `${sg(rc.byId[id].signIndex)} ${esc(T.signs[rc.byId[id].sign].name)} ${AC.fmtDeg(rc.byId[id].lon)}` : '—');
      const moved = AC.PLANETS.filter((id) => c.byId[id].house && rc.byId[id].house !== c.byId[id].house);
      el.innerHTML = `<div class="grid grid-2"><div class="card pv-mini"><span class="eyebrow">${esc(place.name)}</span><p class="small" style="margin:6px 0 0">Ascendant: <b>${ang('asc')}</b><br>MC: <b>${ang('mc')}</b></p></div>
        <div class="card pv-mini"><span class="eyebrow">Planets changing houses</span><p class="small" style="margin:6px 0 0">${moved.length ? moved.map((id) => `${gl(id)} ${ROMAN[c.byId[id].house - 1]} → <b>${ROMAN[rc.byId[id].house - 1]}</b>`).join(' · ') : 'The houses are almost the same as in the birth chart.'}</p></div></div>
        <div class="wheel-box" id="pvRelocWheel" style="max-width:420px;margin-top:12px">${window.Wheel.svg(rc, { animate: false, mode: 'natal' })}</div>`;
      window.Wheel.attach(el.querySelector('#pvRelocWheel'));
    };
    UI.cityField(box.querySelector('#pvRelocCity'), { label: 'City for relocation', value: null, placeholder: 'Start typing a city', onPick: draw });
    setTimeout(() => {
      const list = P.angularCities(c, UI.CITIES, 3);
      const byPlanet = {};
      for (const x of list) (byPlanet[x.planet] = byPlanet[x.planet] || []).push(x);
      const A = { asc: 'ASC — rising', dsc: 'DSC — setting', mc: 'MC — at the zenith', ic: 'IC — at the nadir' };
      box.querySelector('#pvAcg').innerHTML = Object.keys(byPlanet).length ? AC.PLANETS.filter((id) => byPlanet[id]).map((id) => `<div class="pv-acg-row">${gl(id)} <b>${pn(id)}</b> <span class="small">${byPlanet[id].slice(0, 6).map((x) => `${esc(x.city.name)} <small class="muted">${A[x.angle].split(' —')[0]}</small>`).join(' · ')}</span></div>`).join('') : '<p class="small muted">In the cities from the site’s list, no planets fall exactly on the angles — check a specific city above.</p>';
    }, 30);
  }

  /** Вкладка “Профи” натальной карты. tools — какие показать (по умолчанию все). */
  const NATAL_TOOLS = [['dig', 'Dignities'], ['disp', 'Dispositors'], ['pat', 'Patterns & houses'], ['mid', 'Midpoints'], ['stars', 'Fixed stars'], ['fird', 'Firdaria'], ['time', 'Birth time'], ['reloc', 'Relocation']];
  function natal(box, c, params, opts) {
    opts = opts || {};
    const tools = NATAL_TOOLS.filter(([k]) => !opts.only || opts.only.includes(k));
    let cur = opts.start || tools[0][0];
    box.innerHTML = `<div class="pv"><div class="row between pv-top"><div class="seg pv-seg" role="group" aria-label="Pro tools">${tools.map(([k, t]) => `<button type="button" data-pv="${k}" aria-pressed="${k === cur}">${t}</button>`).join('')}</div>${premiumChip()}</div><div class="pv-panel"></div></div>`;
    const panel = box.querySelector('.pv-panel');
    const render = () => {
      const html = { dig: dignitiesHTML, disp: dispositorsHTML, pat: patternsHTML, mid: midpointsHTML, stars: starsHTML, fird: firdariaHTML, time: (x) => timeHTML(x, params), reloc: (x) => relocHTML(x, params) }[cur](c);
      panel.innerHTML = html;
      if (cur === 'reloc') relocBind(panel, c, params);
      UI.fadeIn(panel, 4);
    };
    box.querySelector('.pv-seg').addEventListener('click', (e) => { const b = e.target.closest('[data-pv]'); if (!b) return; cur = b.dataset.pv; box.querySelectorAll('[data-pv]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render(); });
    render();
    loadTexts().then((ok) => { if (ok && box.isConnected) render(); });
  }

  // ---------- прогностика ----------
  function directionsHTML(c) {
    const now = new Date();
    const from = new Date(now.getFullYear() - 1, now.getMonth(), 1), to = new Date(now.getFullYear() + 5, 11, 31);
    const sa = P.solarArc(c, from, to, now);
    const t = PT();
    const near = sa.events.filter((e) => Math.abs(e.date - now) < 365 * 86400000);
    return `<p class="small muted">Solar arc directions: every point in the chart moves forward by the arc of the progressed Sun (≈ 1° a year). When a directed planet makes an exact aspect to a natal one, that’s a milestone of the year. The current arc is ${sa.arcNow.toFixed(2)}°. The orb of effect is about a year either side of the date.</p>
      ${sa.events.length ? `<div class="pv-dirs">${sa.events.map((e) => `<div class="pv-dir${Math.abs(e.date - now) < 365 * 86400000 ? ' now' : ''}${e.date < now ? ' past' : ''}"><div class="pv-dir-d"><b>${fmt.MONTHS_SHORT[e.date.getMonth()]} ${e.date.getFullYear()}</b></div><div>${gl(e.directed)} dir. ${pn(e.directed)} ${aspG(e.type)} ${gl(e.natal)} natal ${pn(e.natal)} <span class="badge">${ASP_W[e.type]}</span>${t ? `<p class="small" style="margin:4px 0 0">${t.direction(e, c)}</p>` : ''}</div></div>`).join('')}</div>` : '<p class="small muted">No exact directions in the coming years.</p>'}
      ${!t && near.length ? interp(`What ${near.length} ${fmt.plural(near.length, 'direction', 'directions', 'directions')} this year mean`, '') : ''}${t ? '' : lockNote()}`;
  }
  function lunarHTML(c, place) {
    const lr = P.lunarReturn(c, new Date(Date.now() - 2 * 86400000), place, window.ChartView ? window.ChartView.chartOpts() : {});
    const t = PT();
    const asc = lr.byId.asc, moon = lr.byId.moon;
    return `<p class="small muted">The lunar return is the chart for the moment the Moon returns to its natal position (every ~27.3 days). It describes the emotional backdrop and themes of the coming month.</p>
      <div class="grid grid-2" style="align-items:start"><div class="wheel-box" id="pvLunarWheel" style="max-width:420px">${window.Wheel.svg(lr, { animate: false, mode: 'solar' })}</div>
      <div><div class="card pv-mini"><span class="eyebrow">Lunar return</span><h4>${fmt.dateTime(lr.returnDate)}</h4><p class="small muted">${esc(place ? place.name : (c.params.place || 'birthplace'))} · until the next ≈ ${fmt.date(new Date(lr.returnDate.getTime() + 27.32 * 86400000))}</p></div>
        <p class="small" style="margin:12px 0 4px">The month’s Ascendant: <b>${sg(asc.signIndex)} ${esc(T.signs[asc.sign].name)}</b></p>
        <p class="small" style="margin:0 0 4px">Moon in house ${ROMAN[moon.house - 1]} — <b>${esc(T.houses[moon.house].title.toLowerCase())}</b></p>
        <p class="small" style="margin:0">The month’s Sun in house ${ROMAN[lr.byId.sun.house - 1]} — ${esc(T.houses[lr.byId.sun.house].topic)}</p>
        ${t ? `<div class="pv-interps">${t.lunar(lr, c)}</div>` : interp('The month’s themes by lunar return', '')}</div></div>${t ? '' : lockNote()}`;
  }
  function dynamicsHTML(c) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const dy = P.dynamics(c, start, 52);
    const max = Math.max(1, ...dy.series.map((w) => Math.max(w.hard, w.soft)));
    const W = 720, H = 180, bw = W / dy.series.length;
    const bars = dy.series.map((w, i) => { const hs = (w.soft / max) * (H / 2 - 8), hh = (w.hard / max) * (H / 2 - 8); return `<rect x="${(i * bw + 1).toFixed(1)}" y="${(H / 2 - hs).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${hs.toFixed(1)}" rx="2" fill="var(--soft-asp)"><title>${fmt.dm(w.start)}: support ${w.soft.toFixed(1)}</title></rect><rect x="${(i * bw + 1).toFixed(1)}" y="${H / 2}" width="${(bw - 2).toFixed(1)}" height="${hh.toFixed(1)}" rx="2" fill="var(--hard-asp)"><title>${fmt.dm(w.start)}: tension ${w.hard.toFixed(1)}</title></rect>`; }).join('');
    const months = dy.series.map((w, i) => (i === 0 || w.start.getDate() <= 7) ? `<text x="${(i * bw + 2).toFixed(1)}" y="${H + 14}" font-size="10" fill="var(--ink-3)">${fmt.MONTHS_SHORT[w.start.getMonth()]}</text>` : '').join('');
    const peaks = dy.series.map((w, i) => ({ w, i })).sort((a, b) => b.w.hard - a.w.hard).slice(0, 3).filter((x) => x.w.hard > 0);
    const best = dy.series.map((w, i) => ({ w, i })).sort((a, b) => (b.w.soft - b.w.hard) - (a.w.soft - a.w.hard)).slice(0, 3);
    return `<p class="small muted">Transit dynamics: how active the slow transits (Mars to Pluto) to the chart are, week by week, for a year ahead. Up — harmonious (support); down — challenging (tests).</p>
      <div class="pv-dyn"><svg viewBox="0 -4 ${W} ${H + 22}" role="img" aria-label="Transit dynamics for the year"><line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" stroke="var(--line-2)"/>${bars}${months}</svg></div>
      <div class="grid grid-2" style="margin-top:12px"><div class="card pv-mini"><span class="eyebrow">Most intense weeks</span><p class="small" style="margin:6px 0 0">${peaks.map((x) => `from ${fmt.dm(x.w.start)}`).join(' · ') || '—'}</p></div><div class="card pv-mini"><span class="eyebrow">Easiest weeks</span><p class="small" style="margin:6px 0 0">${best.map((x) => `from ${fmt.dm(x.w.start)}`).join(' · ')}</p></div></div>`;
  }
  const FORECAST_TOOLS = [['dir', 'Directions'], ['lunar', 'Lunar return'], ['fird', 'Firdaria'], ['dyn', 'Dynamics']];
  function forecast(box, c, params, opts) {
    opts = opts || {};
    let cur = opts.start || 'dir', place = null;
    box.innerHTML = `<div class="pv"><div class="row between pv-top"><div class="seg pv-seg" role="group" aria-label="Forecasting methods">${FORECAST_TOOLS.map(([k, t]) => `<button type="button" data-pv="${k}" aria-pressed="${k === cur}">${t}</button>`).join('')}</div>${premiumChip()}</div><div class="pv-panel"></div></div>`;
    const panel = box.querySelector('.pv-panel');
    const render = () => {
      if (cur === 'lunar' && !c.timeKnown) { panel.innerHTML = '<p class="muted">A lunar return needs a birth time.</p>'; return; }
      panel.innerHTML = cur === 'dir' ? directionsHTML(c) : cur === 'lunar' ? `<div id="pvLunarCity" style="max-width:360px;margin-bottom:10px"></div><div id="pvLunarBody">${lunarHTML(c, place)}</div>` : cur === 'fird' ? firdariaHTML(c) : dynamicsHTML(c);
      if (cur === 'lunar') {
        window.Wheel.attach(panel.querySelector('#pvLunarWheel'));
        UI.cityField(panel.querySelector('#pvLunarCity'), { label: 'Where the person is now (for the lunar return houses)', value: place, placeholder: 'Empty — birth city', onPick: (p) => { place = p; render(); } });
      }
      UI.fadeIn(panel, 4);
    };
    box.querySelector('.pv-seg').addEventListener('click', (e) => { const b = e.target.closest('[data-pv]'); if (!b) return; cur = b.dataset.pv; box.querySelectorAll('[data-pv]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); render(); });
    render();
    loadTexts().then((ok) => { if (ok && box.isConnected) render(); });
  }

  // ---------- хорар (карта момента) ----------
  const STRICT = { ascEarly: 'Ascendant in the first 3° of a sign — the question may have been asked too early; the situation hasn’t ripened yet', ascLate: 'Ascendant in the last 3° of a sign — a late question; much has already been decided', saturnAngle1: 'Saturn in the 1st house — obstacles on the querent’s side', saturnAngle7: 'Saturn in the 7th house — the astrologer should be especially careful in judgment', viaCombusta: 'Moon in the “via combusta” (15° Libra – 15° Scorpio) — the situation is unstable', moonLate: 'Moon in the last degrees of a sign — the situation is changing' };
  function horaryCard(c, place) {
    let hrs = null;
    try { hrs = place ? P.planetaryHours(c.date, place.lat, place.lon, place.tz || place.zone) : null; } catch (e) { hrs = null; }
    const h = P.horary(c, hrs);
    const t = PT();
    const tz = (place && (place.tz || place.zone)) || undefined;
    const tm = (d) => { try { return new Intl.DateTimeFormat(LOC, { timeZone: tz, day: 'numeric', month: 'short', hour: H12 ? 'numeric' : '2-digit', minute: '2-digit', hour12: H12 }).format(d); } catch (e) { return fmt.dmTime(d); } };
    return `<div class="card pv-horary"><div class="row between"><h3 style="margin:0">${icon('message-question')} Horary: indicators of the moment</h3>${premiumChip()}</div>
      <div class="grid grid-3" style="margin-top:12px">
        <div class="pv-mini card"><span class="eyebrow">Moon</span><h4>${sg(h.moonSign)} ${esc(T.signs[h.moonSign].loc)}</h4><p class="small muted">${h.voc ? `<b style="color:var(--bad)">void of course</b> until ${tm(h.leave)}` : `in course · next aspect: ${aspG(h.next.type)} ${gl(h.next.id)} ${pn(h.next.id)} at ${tm(h.next.date)}`}</p></div>
        <div class="pv-mini card"><span class="eyebrow">The Moon’s last aspect</span><h4>${h.last ? `${aspG(h.last.type)} ${gl(h.last.id)} ${pn(h.last.id)}` : '—'}</h4><p class="small muted">${h.last ? tm(h.last.date) + ' — what has already happened' : 'no aspects in this sign yet'}</p></div>
        <div class="pv-mini card"><span class="eyebrow">Ruler of the day and hour</span><h4>${hrs ? `${gl(hrs.dayRuler)} ${pn(hrs.dayRuler)} · ${hrs.current ? gl(hrs.current.ruler) + ' ' + pn(hrs.current.ruler) : '—'}` : '—'}</h4><p class="small muted">${h.radical ? (h.radical.ok ? 'the hour ruler agrees with the Ascendant — the chart is “radical”' : 'the hour ruler doesn’t agree with the Ascendant') : 'a city is needed'}</p></div>
      </div>
      ${h.final && !h.voc ? `<p class="small" style="margin:12px 0 0">The Moon goes void of course after ${aspG(h.final.type)} ${pn(h.final.id)} — ${tm(h.final.date)}, until it changes sign at ${tm(h.leave)}.</p>` : ''}
      ${h.strictures.length ? `<div class="notice" style="margin-top:12px">${icon('info')}<span><b>Considerations before judgment (Lilly):</b> ${h.strictures.map((s) => esc(STRICT[s])).join('; ')}.</span></div>` : '<p class="small muted" style="margin:12px 0 0">No classical considerations — the chart is fit to be judged.</p>'}
      <p class="tiny muted" style="margin:10px 0 0">The Moon’s aspects — to the seven classical planets (as in traditional horary).</p>
      ${t ? interp('A pointer for judgment', t.horary(h, c)) : ''}</div>`;
  }

  // ---------- планетные часы ----------
  function hours(box, city) {
    const draw = (place) => {
      const ph = P.planetaryHours(new Date(), place.lat, place.lon, place.tz);
      if (!ph) { box.querySelector('.pv-hours-body').innerHTML = '<p class="muted">This city is in polar day or night right now — there are no planetary hours.</p>'; return; }
      const tm = (d) => { try { return new Intl.DateTimeFormat(LOC, { timeZone: place.tz, hour: H12 ? 'numeric' : '2-digit', minute: '2-digit', hour12: H12 }).format(d); } catch (e) { return fmt.time(d); } };
      box.querySelector('.pv-hours-body').innerHTML = `<p class="small">Today is the day of <b>${gl(ph.dayRuler)} ${pn(ph.dayRuler)}</b> · sunrise ${tm(ph.rise)}, sunset ${tm(ph.set)}${ph.current ? ` · the current hour is <b>${gl(ph.current.ruler)} ${pn(ph.current.ruler)}</b> (until ${tm(ph.current.end)})` : ''}</p>
        <div class="pv-hours">${ph.hours.map((h) => `<div class="${h.current ? 'cur' : ''}${h.day ? '' : ' night'}"><small>${tm(h.start)}</small>${gl(h.ruler)}<span>${pn(h.ruler)}</span></div>`).join('')}</div>
        <p class="tiny muted" style="margin:8px 0 0">A day runs from sunrise to sunrise; 12 daytime and 12 nighttime hours of unequal length, in the Chaldean order of planets. Times — ${esc(place.name)}.</p>`;
    };
    box.innerHTML = `<div class="row between" style="align-items:flex-end;gap:12px"><h3 style="margin:0">${icon('clock-hour-4')} Day and hour rulers</h3><div class="pv-hours-city" style="min-width:220px;max-width:320px;flex:1"></div></div><div class="pv-hours-body" style="margin-top:10px"></div>`;
    UI.cityField(box.querySelector('.pv-hours-city'), { label: 'City', value: city, onPick: draw });
    draw(city);
  }

  // ---------- эфемериды ----------
  function ephemeris(box) {
    const now = new Date();
    let y = now.getFullYear(), m = now.getMonth() + 1;
    const ids = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];
    const cell = (p) => `${String(Math.floor(p.lon % 30)).padStart(2, '0')}°${String(Math.floor((p.lon % 1) * 60)).padStart(2, '0')}′${T.signs[AC.signOf(p.lon)].glyph}${p.retro ? '<sup class="pv-r">R</sup>' : ''}`;
    const draw = () => {
      const rows = P.ephemeris(y, m);
      box.querySelector('.pv-eph-title').textContent = `${fmt.MONTHS[m - 1]} ${y}`;
      box.querySelector('.pv-eph-body').innerHTML = `<div class="table-wrap pv-eph"><table class="table"><thead><tr><th>Day</th>${ids.map((id) => `<th title="${pn(id)}">${gl(id)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr class="${r.d === now.getDate() && m === now.getMonth() + 1 && y === now.getFullYear() ? 'cur' : ''}"><td><b>${r.d}</b> <small class="muted">${fmt.DOW[r.date.getUTCDay()]}</small></td>${r.pts.map((p) => `<td>${cell(p)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    };
    box.innerHTML = `<div class="row between" style="gap:10px"><h3 style="margin:0">${icon('table')} Ephemeris · <span class="pv-eph-title"></span></h3><div class="row" style="gap:6px"><button class="btn btn-ghost btn-xs" type="button" data-eph="-1">${icon('chevron-left')} Month</button><button class="btn btn-ghost btn-xs" type="button" data-eph="0">Now</button><button class="btn btn-ghost btn-xs" type="button" data-eph="1">Month ${icon('chevron-right')}</button></div></div>
      <p class="small muted" style="margin:6px 0 10px">Positions at 0:00 UT each day, tropical zodiac, true node. R — retrograde motion.</p><div class="pv-eph-body"></div>`;
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-eph]'); if (!b) return; const k = +b.dataset.eph; if (!k) { y = now.getFullYear(); m = now.getMonth() + 1; } else { m += k; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } } draw(); UI.fadeIn(box.querySelector('.pv-eph-body'), 4); });
    draw();
  }

  window.ProView = { natal, forecast, horaryCard, hours, ephemeris, loadTexts, NATAL_TOOLS, FORECAST_TOOLS };
})();
