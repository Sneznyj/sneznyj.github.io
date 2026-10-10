/* Общие блоки отображения карты: таблицы, толкования, аспекты, баланс стихий. */
(function () {
  'use strict';
  const AC = window.AstroCore, T = window.ASTRO_TEXTS, UI = window.UI;
  const { esc, fmt } = UI;
  const PL_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'chiron', 'lilith', 'asc', 'mc', 'fortune'];
  const g = (id) => `<span class="g glyph">${T.planets[id] ? T.planets[id].glyph : ''}</span>`;
  const sg = (sign) => `<span class="glyph" style="color:var(--gold)">${T.signs[sign].glyph}</span>`;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  function planetTable(chart) {
    const rows = PL_ORDER.map((id) => chart.byId[id]).filter(Boolean).map((p) => {
      const pl = T.planets[p.id];
      return `<tr><td>${g(p.id)} ${esc(pl.name)}${p.retro ? '<span class="retro-mark" title="retrograde">R</span>' : ''}</td>
        <td>${AC.fmtDeg(p.lon)} ${sg(p.sign)} ${T.signs[p.sign].name}</td>
        <td>${p.house ? ROMAN[p.house - 1] : '—'}</td>
        <td>${p.dignity ? `<span class="badge ${p.dignity === 'domicile' || p.dignity === 'exaltation' ? 'ok' : 'warn'}">${T.dignity[p.dignity]}</span>` : ''}</td>
        <td class="muted small">${p.speed != null ? (p.speed >= 0 ? '' : '−') + Math.abs(p.speed).toFixed(p.id === 'moon' ? 2 : 3) + '°/day' : ''}</td></tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Planet</th><th>Position</th><th>House</th><th>Status</th><th>Speed</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function housesTable(chart) {
    if (!chart.houses) return '<p class="muted">Houses not calculated: birth time unknown.</p>';
    const h = chart.houses;
    const rows = h.cusps.map((c, i) => {
      const sign = AC.signOf(c);
      const ruler = AC.RULER[sign];
      return `<tr><td><b>${ROMAN[i]}</b> · ${T.houses[i + 1].title}</td><td>${AC.fmtDeg(c)} ${sg(sign)} ${T.signs[sign].name}</td><td>${g(ruler)} ${T.planets[ruler].name}</td></tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="table"><thead><tr><th>House</th><th>Cusp</th><th>Ruler</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="tiny muted" style="margin-top:8px">House system: ${AC.HOUSE_SYSTEMS[h.system]}${h.fallback ? ' (above the polar circle Placidus and Koch don’t work — Porphyry is used instead)' : ''}. ${chart.houses.dayChart != null ? T.dayRule[chart.houses.dayChart ? 'day' : 'night'] + '.' : ''}</p>`;
  }

  function big3(chart) {
    const items = [['sun', 'Sun', 'essence and will'], ['moon', 'Moon', 'feelings and needs'], ['asc', 'Ascendant', 'image and approach to life']];
    return `<div class="big3">${items.map(([id, k, sub]) => {
      const p = chart.byId[id];
      if (!p) return `<div class="card b3"><div class="g glyph">?</div><div class="k">${k}</div><div class="v">time needed</div><div class="tiny muted">${sub}</div></div>`;
      return `<div class="card b3 hover"><div class="g glyph">${T.signs[p.sign].glyph}</div><div class="k">${k}</div><div class="v">${T.signs[p.sign].name}</div><div class="tiny muted">${sub}</div></div>`;
    }).join('')}</div>`;
  }

  function item(icon, title, tags, paras) {
    return `<article class="interp-item reveal"><div class="ig glyph">${icon}</div><div><h4>${title}</h4>${tags.length ? `<div class="tags">${tags.join('')}</div>` : ''}${paras.filter(Boolean).map((p) => `<p>${p}</p>`).join('')}</div></article>`;
  }

  /** Бесплатное толкование: планеты в знаках. Полное (дома, управитель, кармические точки, MC, аспекты) —
      в премиум-доступе: зашифрованный модуль _private/natal-pro.js (NatalPro.interpretation). */
  function interpretation(chart) {
    const out = [];
    const tagSign = (p) => `<span class="badge">${AC.fmtDeg(p.lon)} ${T.signs[p.sign].name}</span>`;
    const tagHouse = (p) => (p.house ? `<span class="badge gold">House ${ROMAN[p.house - 1]}</span>` : '');
    const tagDig = (p) => (p.dignity ? `<span class="badge ${p.dignity === 'domicile' || p.dignity === 'exaltation' ? 'ok' : 'warn'}">${T.dignity[p.dignity]}</span>` : '');
    const tagR = (p) => (p.retro ? '<span class="badge rose">retrograde</span>' : '');
    out.push('<h3 style="margin-top:6px">The big three</h3>');
    for (const id of ['sun', 'moon', 'asc']) {
      const p = chart.byId[id];
      if (!p) { out.push(item('AC', 'Ascendant', [], ['To find your Ascendant and houses, you need a birth time. If it’s unknown, it can be recovered through rectification.'])); continue; }
      out.push(item(T.planets[id].glyph, `${T.planets[id].name} ${T.signs[p.sign].loc}`, [tagSign(p), tagHouse(p), tagDig(p)], [T.planetInSign(id, p.sign)]));
    }
    out.push('<h3>Personal planets</h3>');
    for (const id of ['mercury', 'venus', 'mars']) {
      const p = chart.byId[id];
      out.push(item(T.planets[id].glyph, `${T.planets[id].name} ${T.signs[p.sign].loc}`, [tagSign(p), tagHouse(p), tagDig(p), tagR(p)], [T.planetInSign(id, p.sign)]));
    }
    out.push('<h3>Social and outer planets</h3>');
    for (const id of ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto']) {
      const p = chart.byId[id];
      out.push(item(T.planets[id].glyph, `${T.planets[id].name} ${T.signs[p.sign].loc}`, [tagSign(p), tagHouse(p), tagDig(p), tagR(p)], [T.planetInSign(id, p.sign)]));
    }
    return `<div class="interp">${out.join('')}</div>`;
  }

  function balance(chart) {
    const s = chart.summary;
    const el = Object.entries(s.elements).map(([k, v]) => `<div class="bar"><span>${T.elements[k].name}</span><span class="track"><span class="fill" data-w="${v}" style="background:${T.elements[k].color}"></span></span><span class="pct">${v}%</span></div>`).join('');
    const mo = Object.entries(s.modalities).map(([k, v]) => `<div class="bar"><span>${T.modalities[k].short}</span><span class="track"><span class="fill" data-w="${v}" style="background:linear-gradient(90deg,var(--lav),var(--rose-strong))"></span></span><span class="pct">${v}%</span></div>`).join('');
    const st = s.stelliums.map((x) => `<li><b>Stellium ${x.kind === 'sign' ? T.signs[x.where].loc : 'at ' + ROMAN[x.where - 1] + ' house'}:</b> ${x.planets.map((id) => T.planets[id].name).join(', ')} — ${x.kind === 'sign' ? 'the sign’s qualities are very strongly expressed' : 'the area of “' + T.houses[x.where].topic + '” — is one of the main ones in life'}.</li>`).join('');
    const ph = T.moonPhase8[s.moonPhase];
    return `
      <div class="grid grid-2">
        <div class="card"><h4>Elements</h4><div class="bars">${el}</div>
          <p class="small" style="margin-top:14px">${T.elements[s.topElement].high}</p>
          ${s.elements[s.lowElement] <= 12 ? `<p class="small muted">${T.elements[s.lowElement].low}</p>` : ''}</div>
        <div class="card"><h4>Modalities</h4><div class="bars">${mo}</div>
          <p class="small" style="margin-top:14px">${T.modalities[s.topModality].high}</p></div>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <div class="card"><h4>Strongest planets</h4>
          <div class="row" style="margin:10px 0">${s.dominant.map((id) => `<span class="chip"><span class="glyph" style="color:var(--lav-strong);font-size:1.2rem">${T.planets[id].glyph}</span>${T.planets[id].name}</span>`).join('')}</div>
          <p class="small muted">The planets that color your personality most: by rulership of the Sun, Moon and Ascendant, placement on the chart’s angles, dignities and number of aspects.</p></div>
        <div class="card"><h4>Lunar phase at birth</h4>
          <div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="width:64px;flex-shrink:0">${UI.moonSVG(s.elongation)}</div><div><b>${ph.name}</b><p class="small" style="margin:4px 0 0">${ph.birth}</p></div></div></div>
      </div>
      ${st || s.retro.length ? `<div class="card" style="margin-top:16px"><h4>Chart features</h4><ul class="small" style="margin:8px 0 0;padding-left:1.1em">${st}${s.retro.length ? `<li><b>Retrograde planets:</b> ${s.retro.map((id) => T.planets[id].name).join(', ')} — their themes are lived thoughtfully, “from the inside”, often returning to past experience.</li>` : ''}</ul></div>` : ''}`;
  }

  function animateBars(root) {
    requestAnimationFrame(() => setTimeout(() => root.querySelectorAll('.fill[data-w]').forEach((f) => { f.style.width = f.dataset.w + '%'; }), 60));
  }

  function aspectGrid(chart) {
    const ids = PL_ORDER.filter((id) => chart.byId[id] && id !== 'fortune');
    const find = (a, b) => chart.aspects.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    let h = '<div style="overflow-x:auto"><table class="asp-grid">';
    ids.forEach((row, i) => {
      h += '<tr>';
      for (let j = 0; j < i; j++) {
        const x = find(ids[j], row);
        if (x) {
          const col = getComputedStyle(document.documentElement).getPropertyValue(x.type === 'conj' ? '--conj-asp' : x.nature === 'soft' ? '--soft-asp' : '--hard-asp');
          h += `<td class="a" style="color:${col}" title="${T.planets[ids[j]].name} — ${T.aspects[x.type].name.toLowerCase()} — ${T.planets[row].name}, orb ${x.orb.toFixed(1)}°">${T.aspects[x.type].glyph}</td>`;
        } else h += '<td></td>';
      }
      h += `<td class="h" title="${T.planets[row].name}">${T.planets[row].glyph.length > 3 ? '' : T.planets[row].glyph}</td></tr>`;
    });
    h += '</table></div>';
    return h;
  }

  function aspectList(chart) {
    if (!chart.aspects.length) return '<p class="muted">No aspects found.</p>';
    const rows = chart.aspects.map((a) => {
      const asp = T.aspects[a.type];
      return `<tr><td>${g(a.a)} ${T.planets[a.a].name}</td><td><span class="glyph" style="color:${asp.color};font-size:1.1rem">${asp.glyph}</span> ${asp.name}</td><td>${g(a.b)} ${T.planets[a.b].name}</td><td>${a.orb.toFixed(2)}°</td><td class="muted small">${a.applying == null ? '' : a.applying ? 'applying' : 'separating'}</td></tr>`;
    }).join('');
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Planet</th><th>Aspect</th><th>Planet</th><th>Orb</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function legend() {
    return `<div class="legend" style="justify-content:center;margin-top:12px"><span><i style="background:var(--soft-asp)"></i>trine, sextile</span><span><i style="background:var(--hard-asp)"></i>square, opposition</span><span><i style="background:var(--conj-asp)"></i>chart angles</span><span><b style="color:#c96b8f;font-size:.75rem">R</b> retrograde</span></div>`;
  }

  function chartOpts() {
    const s = UI.settings;
    return { houseSystem: s.houseSystem, meanNode: s.meanNode, minor: s.minor, orbMult: s.orbMult };
  }

  function settingsForm(onChange) {
    const s = UI.settings;
    const box = document.createElement('details');
    box.className = 'details-adv';
    box.innerHTML = `<summary>Calculation settings</summary>
      <div class="form" style="gap:12px;margin-top:6px">
        <div class="field"><label>House system</label><select class="select" data-k="houseSystem">${Object.entries(AC.HOUSE_SYSTEMS).map(([k, v]) => `<option value="${k}"${s.houseSystem === k ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="field"><label>Lunar nodes</label><select class="select" data-k="meanNode"><option value="0"${!s.meanNode ? ' selected' : ''}>True node</option><option value="1"${s.meanNode ? ' selected' : ''}>Mean node</option></select></div>
        <div class="field"><label>Aspect orbs</label><select class="select" data-k="orbMult"><option value="0.75"${s.orbMult == 0.75 ? ' selected' : ''}>Tight</option><option value="1"${s.orbMult == 1 ? ' selected' : ''}>Standard</option><option value="1.2"${s.orbMult == 1.2 ? ' selected' : ''}>Wide</option></select></div>
        <label class="switch"><input type="checkbox" data-k="minor"${s.minor ? ' checked' : ''}> Minor aspects</label>
      </div>`;
    box.addEventListener('change', (e) => {
      const k = e.target.dataset.k; if (!k) return;
      const v = k === 'minor' ? e.target.checked : k === 'meanNode' ? e.target.value === '1' : k === 'orbMult' ? parseFloat(e.target.value) : e.target.value;
      UI.saveSettings({ [k]: v });
      if (onChange) onChange();
    });
    return box;
  }

  window.ChartView = { planetTable, housesTable, big3, interpretation, balance, animateBars, aspectGrid, aspectList, legend, chartOpts, settingsForm, PL_ORDER, ROMAN };
})();
