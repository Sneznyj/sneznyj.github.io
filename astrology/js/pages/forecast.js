/* Личный прогноз: форма и расчёт транзитов — открыто всем.
   Подробный вид (главные темы и календарь с толкованием, соляр, прогрессии с профекцией, небо на дату) — премиум:
   зашифрованный модуль _private/forecast.js (ForecastPro), открывается кодом доступа или входом Алины (js/premium.js).
   Без доступа — превью: сколько транзитов и каких, главная тема периода целиком, остальное закрытыми карточками и тарифы. */
(function () {
  'use strict';
  const AC = window.AstroCore, T = window.ASTRO_TEXTS, UI = window.UI, CV = window.ChartView;
  const { esc, fmt, icon } = UI;
  const $ = (id) => document.getElementById(id);
  let form, ctx = null;

  // вес транзита для выбора главных тем: медленная планета × важная точка карты × сильный аспект
  const PW = { pluto: 5, neptune: 4.5, uranus: 4.5, saturn: 4, jupiter: 3, node: 2, mars: 1.5, sun: 1, venus: 1, mercury: 1 };
  const NW = { sun: 3, moon: 3, asc: 3, mc: 3, venus: 2, mars: 2, mercury: 2, jupiter: 1.2, saturn: 1.2, node: 1, uranus: 0.8, neptune: 0.8, pluto: 0.8 };
  const AW = { conj: 1.2, opp: 1, square: 1, trine: 0.8, sextile: 0.6 };
  const natureOf = (type) => (type === 'conj' ? 'conj' : ['trine', 'sextile'].includes(type) ? 'soft' : 'hard');
  const colorOf = (type) => (type === 'conj' ? 'var(--conj-asp)' : natureOf(type) === 'soft' ? 'var(--soft-asp)' : 'var(--hard-asp)');
  const pair = (e) => `<span class="gl">${T.planets[e.transiting].glyph}</span> ${T.planets[e.transiting].name} <span class="gl" style="color:${colorOf(e.type)}">${T.aspects[e.type].glyph}</span> <span class="gl">${T.planets[e.natal].glyph}</span> ${T.planets[e.natal].name}`;
  const when = (e) => `${e.openStart ? 'already active' : 'from ' + fmt.dm(e.start)} — ${e.openEnd ? 'beyond this period' : 'until ' + fmt.dm(e.end)}`;

  function topThemes(events, n) {
    const seen = new Set();
    return events.map((e) => ({ e, w: (PW[e.transiting] || 1) * (NW[e.natal] || 1) * (AW[e.type] || 0.5) })).sort((a, b) => b.w - a.w)
      .filter((x) => { const k = x.e.transiting + x.e.natal + x.e.type; if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, n).map((x) => x.e);
  }

  /** Превью без доступа: числа, главная тема целиком, остальное — закрыто (толкований на странице нет). */
  function teaser() {
    const { natal, params, events, range } = ctx;
    const P = window.Premium;
    const box = $('result');
    const cnt = { soft: 0, hard: 0, conj: 0 };
    events.forEach((e) => { cnt[natureOf(e.type)]++; });
    const top = topThemes(events, 4);
    const first = top[0], tt = first && T.transitText(first.transiting, first.natal, first.type);
    const byMonth = {};
    for (const e of events) { const d = e.exact[0] || (e.start < range.start ? range.start : e.start); const k = d.getFullYear() * 12 + d.getMonth(); byMonth[k] = (byMonth[k] || 0) + 1; }
    const months = Object.keys(byMonth).map(Number).sort((a, b) => a - b);
    box.innerHTML = `
      <div class="card">
        <div class="result-head"><div><span class="eyebrow" style="margin-bottom:8px">Forecast</span><h2>${esc(params.name || 'Your forecast')}</h2>
          <p class="muted small" style="margin:6px 0 0">${fmt.date(range.start)} — ${fmt.date(range.end)}</p></div></div>
        ${!natal.timeKnown ? `<div class="notice" style="margin-bottom:14px">${icon('clock')}<span>Without a birth time, transits to the Ascendant, MC and Moon aren’t precise.</span></div>` : ''}
        ${events.length ? `
        <div class="fc-stats">
          <div class="fc-stat"><b>${events.length}</b><span>${fmt.plural(events.length, 'transit', 'transits', 'transits')} in this period</span></div>
          <div class="fc-stat hard"><b>${cnt.hard}</b><span>challenging — a time of testing</span></div>
          <div class="fc-stat soft"><b>${cnt.soft}</b><span>harmonious — a time of opportunity</span></div>
          <div class="fc-stat conj"><b>${cnt.conj}</b><span>conjunctions — new cycles</span></div>
        </div>
        <h3 style="margin-top:24px">The period’s main theme</h3>
        <div class="card fc-main" style="border-left:4px solid ${colorOf(first.type)}">
          <p class="fc-pair">${pair(first)} <span class="badge">${T.aspects[first.type].name.toLowerCase()}</span></p>
          <h4 style="margin:8px 0 4px">${tt.title}</h4>
          <p class="small muted" style="margin:0 0 8px">${when(first)}${first.exact.length ? ' · exact: ' + first.exact.map((d) => fmt.dm(d)).join(', ') : ''}</p>
          <p style="margin:0">${tt.text}</p>
        </div>
        ${top.length > 1 ? `<h3 style="margin-top:24px">${top.length - 1} more ${fmt.plural(top.length - 1, 'main theme', 'main themes', 'main themes')}</h3>
        <div class="grid grid-${Math.min(3, top.length - 1)} locked-grid">${top.slice(1).map((e) => `<div class="locked-card theme" style="border-left:4px solid ${colorOf(e.type)}">
          <div class="lk-head">${icon('lock')}<span>${pair(e)}</span></div><small class="muted">${when(e)}</small>
          <div class="lk-lines" aria-hidden="true"><i style="width:94%"></i><i style="width:80%"></i><i style="width:62%"></i></div></div>`).join('')}</div>` : ''}
        <h3 style="margin-top:24px">Transit calendar</h3>
        <div class="fc-months">${months.map((k) => `<div class="fc-month"><b>${fmt.MONTHS[k % 12]} ${Math.floor(k / 12)}</b><span>${byMonth[k]} ${fmt.plural(byMonth[k], 'transit', 'transits', 'transits')}</span>${icon('lock')}</div>`).join('')}</div>
        <p class="small muted" style="margin:10px 0 0">Premium access includes every transit with its interpretation, active window and exact dates (including triple passes caused by retrogrades).</p>`
          : '<p class="muted">No notable transits from the selected planets in this period. Try a longer period or include the fast planets.</p>'}
        <h3 style="margin-top:24px">Also in your forecast</h3>
        <div class="locked-list">
          ${P.locked('Solar return — the chart of your year: the year’s Ascendant, Sun and Moon', { lines: 2 })}
          ${P.locked('Progressions and the annual profection: inner ripening and the lord of the year', { lines: 2 })}
          ${P.locked('The sky on any date: your chart and transits on the chosen day', { lines: 2 })}
        </div>
      </div>
      <div style="margin-top:20px">${P.paywall({ feature: 'forecast', title: 'The full forecast is part of premium access', text: 'Every transit with interpretations and exact dates, the solar return, progressions and the sky on any date — for you and the people you love.' })}</div>
      <div class="card note-card" style="margin-top:20px">${UI.alinaNote('Transits are like a weather forecast: it’s not just “what’s coming” but “how to make the most of it”. In a reading, I’ll put together a plan for your year, with dates and pointers.', '<button class="btn btn-primary btn-sm" type="button" data-book="forecast">Book a year-ahead reading with Iris</button>')}</div>`;
    UI.reveal(box);
    UI.fadeIn(box);
  }

  async function show() {
    const c = ctx;
    if (window.Premium && (await window.Premium.ensure(['forecast'])) && window.ForecastPro) { if (ctx === c) window.ForecastPro.render(c); return; }
    if (ctx === c) teaser();
  }

  function calc(p) {
    const params = p || form.get(); if (!params) return;
    const natal = AC.chart(params, CV.chartOpts());
    const sm = $('startMonth').value;
    const [y, m] = (sm || fmt.ymd(new Date()).slice(0, 7)).split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const months = +$('period').value;
    const end = new Date(y, m - 1 + months, 0, 23, 59);
    // транзитный Хирон не рассматриваем в прогностике
    const tIds = ['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'].concat($('fastToggle').checked ? ['sun', 'mercury', 'venus'] : []);
    const nIds = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc', 'mc'];
    const btn = $('calcBtn');
    btn.disabled = true; btn.textContent = 'Calculating…';
    setTimeout(async () => {
      try {
        const events = AC.transits(natal, start, end, { transiting: tIds, natal: natal.timeKnown ? nIds : nIds.filter((x) => !['asc', 'mc', 'moon'].includes(x)) })
          .filter((e) => !(e.transiting === e.natal && ['node', 'chiron'].includes(e.transiting)))
          .filter((e) => !(['node', 'chiron'].includes(e.transiting) && !['conj', 'opp', 'square'].includes(e.type)));
        // транзиты посчитаны — короткое “волшебство”, потом прогноз (SVG-анимация не должна замирать на расчёте)
        if (!(await UI.conjure($('result'), { kind: 'forecast' }))) return; // начали новый расчёт — кнопку вернёт он
        ctx = { natal, params, events, range: { start, end } };
        UI.recent.add(params);
        await show();
        // методы для астрологов (дирекции, лунар, фирдарии, динамика): расчёты всем, толкования — в премиуме
        const pf = $('proForecast');
        if (pf && window.ProView) { pf.hidden = false; pf.innerHTML = '<div class="card"><h3 style="margin:0 0 4px">Other forecasting methods</h3><p class="small muted" style="margin:0 0 14px">For those who know astrology: solar arc directions, the lunar return, firdaria and the year’s transit dynamics.</p><div id="proForecastBox"></div></div>'; window.ProView.forecast($('proForecastBox'), natal, params); }
        if (window.innerWidth < 1000) $('result').scrollIntoView({ behavior: 'smooth' });
      } catch (err) { console.error(err); UI.toast('Couldn’t calculate the forecast', 'info'); }
      btn.disabled = false; btn.textContent = 'Calculate forecast';
    }, 30);
  }

  document.addEventListener('DOMContentLoaded', () => {
    form = UI.birthForm($('birthForm'));
    // из астропроцессора: forecast.html?person=<id>
    const pq = new URLSearchParams(location.search).get('person');
    const pp = pq && UI.people.get(pq);
    if (pp && pp.birth) setTimeout(() => { form.set(UI.people.params(pp)); calc(UI.people.params(pp)); }, 0);
    $('startMonth').value = fmt.ymd(new Date()).slice(0, 7);
    $('calcBtn').addEventListener('click', () => calc());
    // код доступа введён (или вход Алины) — показать полный прогноз без повторного расчёта
    document.addEventListener('premiumchange', () => { if (ctx) show(); });
    const q = new URLSearchParams(location.search);
    const c = q.get('client') && UI.clients.get(q.get('client'));
    if (c && c.birth) { form.set(c.birth); calc(c.birth); } else { const r = UI.recent.list(); if (r[0]) form.set(r[0]); }
  });
})();
