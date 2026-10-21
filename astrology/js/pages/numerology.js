/* Нумерология: дата и имя → главные числа, квадрат Пифагора, личный год; основы, значения чисел, вопросы.
   Расчёты — js/numerology.js, тексты — js/numerology-data.js.
   Премиум (js/premium.js → зашифрованный _private/numerology-pro.js): личные месяцы, календарь личных дней,
   личный день сегодня и следующий год. Без доступа во вкладке “Личный год” — сам год и цикл, остальное закрыто. */
(function () {
  'use strict';
  const UI = window.UI, N = window.Numerology, TX = window.NUMEROLOGY_TEXTS;
  const { esc, fmt, icon } = UI;
  const $ = (id) => document.getElementById(id);
  const LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  const pl = (n, a, b, c) => fmt.plural(n, a, b, c);
  let res = null, tile = 'birthday', cell = 1;

  // ---------- помощники вида ----------
  /** Число в кольце: размер s — 'xl' | 'm' | 's'. */
  const orb = (v, s) => `<span class="num-orb ${s || ''}${TX.numbers[v] && TX.numbers[v].master ? ' master' : ''}" aria-hidden="true">${v}</span>`;
  const chips = (arr, cls) => `<div class="num-chips">${arr.map((x) => `<span class="num-chip ${cls || ''}">${esc(x)}</span>`).join('')}</div>`;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const chainText = (c) => c.join(' → ');
  const level = (k, v) => { const t = TX.lines[k].t; return v <= t[0] ? 'weak' : v <= t[1] ? 'mid' : 'strong'; };
  const LEVEL = { weak: 'gently expressed', mid: 'moderately expressed', strong: 'strongly expressed' };

  // ---------- расчёт ----------
  function calc(name, iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const now = new Date();
    const lp = N.lifePath(y, m, d), bd = N.birthday(d), nm = N.nameNumbers(name);
    const py = N.personalYear(m, d, now.getFullYear());
    return {
      name: name.trim(), iso, y, m, d, lp, bd, nm, py,
      pyNext: N.personalYear(m, d, now.getFullYear() + 1),
      sq: N.pythagoras(y, m, d), year: now.getFullYear(), month: now.getMonth() + 1,
    };
  }

  // ---------- вкладка “Главные числа” ----------
  function lifeHero(r) {
    const t = TX.numbers[r.lp.value];
    const L = r.lp;
    const how = `Day ${String(r.d).padStart(2, '0')} → ${chainText(L.day.chain)} · month ${String(r.m).padStart(2, '0')} → ${chainText(L.month.chain)} · year ${chainText(L.year.chain)} · ${L.day.value} + ${L.month.value} + ${L.year.value} = ${chainText(L.chain)}`;
    return `<div class="num-hero">
        ${orb(r.lp.value, 'xl')}
        <div class="num-hero-text">
          <span class="num-label">Life Path number${t.master ? ' · master number' : ''}</span>
          <h3>${esc(t.name)}</h3>
          <p class="num-keys">${esc(t.keys)}</p>
          <p>${esc(t.essence)}</p>
        </div>
      </div>
      <div class="grid grid-2 num-sw">
        <div><h4>${icon('star')} Strengths</h4>${chips(t.strengths)}</div>
        <div><h4>${icon('leaf')} Room to grow</h4>${chips(t.growth, 'soft')}</div>
      </div>
      <p class="num-advice">${esc(t.advice)}</p>
      <details class="details-adv num-how"><summary>How it’s calculated</summary><p class="small">${how}.</p>
        <p class="small muted">The day, month and year are each reduced to one digit, then added together. The master numbers 11, 22 and 33 aren’t reduced.</p></details>`;
  }
  const TILES = [
    ['birthday', 'cake', 'Birthday', (r) => r.bd.value, (r) => TX.numbers[r.bd.value].keys],
    ['expression', 'signature', 'Expression number', (r) => r.nm && r.nm.expression.value, (r) => r.nm && TX.numbers[r.nm.expression.value].keys],
    ['soul', 'heart', 'Soul number', (r) => r.nm && r.nm.soul && r.nm.soul.value, (r) => r.nm && r.nm.soul && TX.numbers[r.nm.soul.value].keys],
    ['personality', 'mask', 'Personality number', (r) => r.nm && r.nm.personality && r.nm.personality.value, (r) => r.nm && r.nm.personality && TX.numbers[r.nm.personality.value].keys],
    ['year', 'calendar-repeat', `Personal year ${new Date().getFullYear()}`, (r) => r.py.value, (r) => TX.years[r.py.value].title.toLowerCase()],
  ];
  function tilesHTML(r) {
    return `<div class="num-tiles" role="group" aria-label="Numbers">${TILES.map(([k, ic, title, val, keys]) => {
      const v = val(r);
      return `<button type="button" class="num-tile${tile === k ? ' sel' : ''}${v ? '' : ' empty'}" data-tile="${k}" aria-pressed="${tile === k}">
        ${v ? orb(v, 's') : `<span class="num-orb s ghost" aria-hidden="true">?</span>`}
        <span class="nt-text"><span class="nt-title">${icon(ic)}${title}</span><span class="nt-keys">${v ? esc(keys(r)) : 'add your name'}</span></span>
      </button>`;
    }).join('')}</div><div class="num-detail" id="numDetail">${tileDetail(r)}</div>`;
  }
  function lettersHTML(nm) {
    return nm.words.map((w) => `<span class="nl-word">${w.letters.map((l) => `<span class="nl${l.vowel ? ' v' : ''}" title="${l.vowel ? 'vowel' : 'consonant'}">${esc(l.ch)}<sub>${l.v}</sub></span>`).join('')}<span class="nl-sum">= ${w.sum}</span></span>`).join('');
  }
  function tileDetail(r) {
    const askName = `<p class="muted">Name numbers are calculated from the letters of your full name at birth. <button type="button" class="bk-link" data-focus-name>Add your name</button></p>`;
    if (tile === 'birthday') {
      const t = TX.numbers[r.bd.value];
      return `<h4>${orb(r.bd.value, 's')} Birthday number — ${esc(t.name)}</h4>
        <p>The gift of your birthday is ${esc(t.day)}. This number adds a shade to your life path: <i>${esc(t.keys)}</i>.</p>
        <p class="small muted">Calculated from the day of the month: ${r.d}${r.bd.chain.length > 1 ? ' → ' + chainText(r.bd.chain.slice(1)) : ''}.</p>`;
    }
    if (tile === 'year') {
      const y = TX.years[r.py.value];
      return `<h4>${orb(r.py.value, 's')} Personal year ${r.year} — ${esc(y.title)}</h4><p>${esc(y.text)}</p>
        <p><button type="button" class="bk-link" data-go-tab="tab-year">Months and today →</button></p>`;
    }
    if (!r.nm) return askName;
    const nm = r.nm;
    if (tile === 'expression') {
      const t = TX.numbers[nm.expression.value];
      return `<h4>${orb(nm.expression.value, 's')} Expression number — ${esc(t.name)}</h4>
        <p>This is how you show up in the world and in your work. Your talent is ${esc(t.talent)}. Key words: <i>${esc(t.keys)}</i>.</p>
        <div class="num-letters-row">${lettersHTML(nm)}</div>
        <p class="small muted">Sum of all letters: ${nm.expression.sum} → ${chainText(nm.expression.chain.slice(1)) || nm.expression.value}.</p>`;
    }
    if (tile === 'soul') {
      if (!nm.soul) return '<p class="muted">There are no vowels in the name — the soul number isn’t calculated.</p>';
      const t = TX.numbers[nm.soul.value];
      return `<h4>${orb(nm.soul.value, 's')} Soul number — ${esc(t.name)}</h4>
        <p>What drives you from within. Deep down, what matters to you is ${esc(t.desire)}.</p>
        <p class="small muted">Calculated from the vowels (highlighted): ${nm.soul.sum}${nm.soul.chain.length > 1 ? ' → ' + chainText(nm.soul.chain.slice(1)) : ''}.</p>
        <div class="num-letters-row only-v">${lettersHTML(nm)}</div>`;
    }
    if (!nm.personality) return '<p class="muted">There are no consonants in the name — the personality number isn’t calculated.</p>';
    const t = TX.numbers[nm.personality.value];
    return `<h4>${orb(nm.personality.value, 's')} Personality number — ${esc(t.name)}</h4>
      <p>The first impression you make. When people meet you, they often see you as ${esc(t.image)}.</p>
      <p class="small muted">Calculated from the consonants: ${nm.personality.sum}${nm.personality.chain.length > 1 ? ' → ' + chainText(nm.personality.chain.slice(1)) : ''}.</p>
      <div class="num-letters-row only-c">${lettersHTML(nm)}</div>`;
  }

  // ---------- вкладка “Квадрат Пифагора” ----------
  const GRID = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
  const DIG_NAME = { 1: ['one', 'ones', 'ones'], 2: ['two', 'twos', 'twos'], 3: ['three', 'threes', 'threes'], 4: ['four', 'fours', 'fours'], 5: ['five', 'fives', 'fives'], 6: ['six', 'sixes', 'sixes'], 7: ['seven', 'sevens', 'sevens'], 8: ['eight', 'eights', 'eights'], 9: ['nine', 'nines', 'nines'] };
  const countName = (dgt, c) => (c ? `${c} ${pl(c, ...DIG_NAME[dgt])}` : `no ${DIG_NAME[dgt][2]}`);
  function squareHTML(r) {
    const sq = r.sq;
    const cells = GRID.map((row) => row.map((dgt) => {
      const c = sq.counts[dgt];
      return `<button type="button" class="pq-cell${cell === dgt ? ' sel' : ''}${c ? '' : ' zero'}" data-cell="${dgt}" aria-pressed="${cell === dgt}" aria-label="${TX.cells[dgt].title}: ${countName(dgt, c)}">
        <span class="pq-digits">${c ? (c > 5 ? `${dgt}<small>×${c}</small>` : String(dgt).repeat(c)) : '—'}</span><span class="pq-name">${TX.cells[dgt].grid || TX.cells[dgt].title}</span></button>`;
    }).join('')).join('');
    const groups = [['row', 'Rows — areas of life'], ['column', 'Columns — supports'], ['diagonal', 'Diagonals — inner drive']];
    const lines = groups.map(([kind, head]) => `<h4 class="pq-lines-h">${head}</h4>` + Object.entries(TX.lines).filter(([, l]) => l.kind === kind).map(([k, l]) => {
      const v = sq.lines[k], lv = level(k, v);
      return `<div class="pq-line ${lv}"><div class="pq-line-top"><b>${l.name}</b><span class="pq-meter" role="img" aria-label="${LEVEL[lv]}"><i></i><i></i><i></i></span></div><span class="pq-line-meta">cells ${N.LINES[k].join(', ')} · ${v} ${pl(v, 'digit', 'digits', 'digits')} · ${LEVEL[lv]}</span><p class="small">${esc(l[lv])}</p></div>`;
    }).join('')).join('');
    const w = sq.work;
    return `<div class="pq-wrap">
        <div><div class="pq-grid" role="group" aria-label="Pythagorean square">${cells}</div>
          <p class="tiny muted center" style="margin:10px 0 0">Tap a cell — the meaning appears alongside</p></div>
        <div class="pq-side" id="pqSide">${cellDetail(r)}</div>
      </div>
      <details class="details-adv num-how" style="margin-top:16px"><summary>Working numbers: ${w.join(' · ')} — how they’re calculated</summary>
        <p class="small">1) sum of all digits of the date = <b>${w[0]}</b>; 2) sum of the digits of the first number = <b>${w[1]}</b>; 3) the first number minus twice the first digit of the day (${sq.firstDayDigit} × 2) = <b>${w[2]}</b>${sq.negative3 ? ' (the result was negative — we drop the minus)' : ''}; 4) sum of the digits of the third = <b>${w[3]}</b>. The digits of the date and the working numbers are placed into the cells; zeros don’t count. Alexandrov’s method.</p>
        ${r.y >= 2000 ? '<p class="small muted">For people born after 2000, the calculation is the same as for everyone. Some numerologists add corrections — those are individual methods, and there’s no single rule.</p>' : ''}</details>
      <div class="pq-lines">${lines}</div>`;
  }
  function cellDetail(r) {
    const c = r.sq.counts[cell], t = TX.cells[cell];
    const txt = t.texts[Math.min(c, t.texts.length - 1)];
    return `<span class="num-label">Cell ${cell} · ${esc(t.about)}</span>
      <h4>${esc(t.title)} — ${countName(cell, c)}</h4><p>${esc(txt)}</p>
      ${cell === 4 ? '<p class="tiny muted">This symbolizes stamina — it isn’t a medical assessment.</p>' : ''}`;
  }

  // ---------- вкладка “Личный год” ----------
  function yearHTML(r) {
    const y = TX.years[r.py.value];
    const cycle = Array.from({ length: 9 }, (_, i) => i + 1).map((k) => `<span class="cy${k === r.py.value ? ' now' : k < r.py.value ? ' past' : ''}" title="${esc(TX.years[k].title)}">${k}</span>`).join('');
    return `<div class="num-hero">
        ${orb(r.py.value, 'xl')}
        <div class="num-hero-text"><span class="num-label">Personal year ${r.year}</span><h3>${esc(y.title)}</h3><p>${esc(y.text)}</p>${chips(y.focus)}</div>
      </div>
      <div class="num-cycle" aria-label="Nine-year cycle: step ${r.py.value} of 9">${cycle}</div>
      <p class="tiny muted center" style="margin:6px 0 0">Your nine-year cycle: step ${r.py.value} of 9. Your personal year changes on January 1.</p>
      <div id="numYearPro">${yearMore(r)}</div>`;
  }
  /** Без доступа: месяцы видны, их числа и календарь дней — закрыты (расчёта на странице нет). */
  function yearMore(r) {
    const P = window.Premium;
    if (!P) return '';
    const months = fmt.MONTHS.map((mn, i) => `<span class="pmo-l${i + 1 === r.month ? ' cur' : ''}"><span>${mn.slice(0, 3)}</span>${icon('lock')}</span>`).join('');
    return `<h4 style="margin-top:22px">Personal months</h4>
      <div class="pm-grid pm-locked" aria-hidden="true">${months}</div>
      <div class="locked-list" style="margin-top:14px">
        ${P.locked('Personal day calendar: what each day of the month is good for', { lines: 2 })}
        ${P.locked(`Today — your personal day and a tip for it · ${r.year + 1} — what your next personal year will be like`, { lines: 1 })}
      </div>
      <div style="margin-top:16px">${P.paywall({ feature: 'numerology', compact: true, title: 'Personal months and days are part of premium access' })}</div>`;
  }
  async function yearUpgrade() {
    const r = res;
    if (!window.Premium || !(await window.Premium.ensure(['numerology-pro'])) || !window.NumerologyPro || res !== r) return;
    const box = $('numYearPro');
    if (!box) return;
    box.innerHTML = window.NumerologyPro.html(r);
    window.NumerologyPro.bind(box, () => res);
  }

  // ---------- результат ----------
  function render(focus) {
    const r = res;
    const [y, m, d] = [r.y, r.m, r.d];
    // на узком экране подписи короче — все три вкладки помещаются
    const tabs = [['tab-main', '<span class="tl">Main numbers</span><span class="ts">Numbers</span>'], ['tab-square', '<span class="tl">Pythagorean square</span><span class="ts">Square</span>'], ['tab-year', '<span class="tl">Personal year</span><span class="ts">Year</span>']];
    const box = $('numResult');
    box.innerHTML = `<div class="card">
        <div class="result-head">
          <div><span class="eyebrow" style="margin-bottom:8px">Numerology</span><h2>${esc(r.name || 'Your numbers')}</h2>
            <p class="muted small" style="margin:6px 0 0">${fmt.MONTHS_GEN[m - 1]} ${d}, ${y}</p></div>
          <div class="row no-print"><button class="btn btn-primary btn-sm" type="button" data-act="story">${icon('sparkle')} “My numbers” story</button></div>
        </div>
        <div class="tabs" role="tablist" aria-label="Sections">${tabs.map(([id, t], i) => `<button role="tab" id="${id}-btn" aria-controls="${id}" aria-selected="${i === 0}" tabindex="${i ? -1 : 0}">${t}</button>`).join('')}</div>
        <div style="margin-top:22px">
          <div class="tab-panel" role="tabpanel" id="tab-main">${lifeHero(r)}<h4 style="margin:24px 0 12px">Other numbers</h4>${tilesHTML(r)}</div>
          <div class="tab-panel" role="tabpanel" id="tab-square" hidden>${squareHTML(r)}</div>
          <div class="tab-panel" role="tabpanel" id="tab-year" hidden>${yearHTML(r)}</div>
        </div>
      </div>
      <div class="card note-card" style="margin-top:20px">${UI.alinaNote('Numbers are the first strokes of a portrait. In a reading I combine numerology with your birth chart: that shows not only “who you are” but also when it’s best to act.', '<button class="btn btn-primary btn-sm" type="button" data-book="numerology">Explore them with Iris</button><a class="btn btn-ghost btn-sm" href="natal.html">Birth chart</a>')}</div>`;
    UI.tabs(box);
    showMeaning(r.lp.value);
    yearUpgrade();
    if (focus) { UI.fadeIn(box); if (window.innerWidth < 1000) box.scrollIntoView({ behavior: UI.reduceMotion() ? 'auto' : 'smooth', block: 'start' }); }
  }

  // ---------- справочник, основы, вопросы ----------
  let meaning = 1;
  function showMeaning(v) {
    meaning = v;
    $('numSeg').querySelectorAll('[data-n]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.n === v)));
    const t = TX.numbers[v];
    $('numMeaning').innerHTML = `<div class="num-hero">${orb(v, 'm')}<div class="num-hero-text"><span class="num-label">${t.master ? 'master number' : 'number ' + v}</span><h3>${esc(t.name)}</h3><p class="num-keys">${esc(t.keys)}</p><p>${esc(t.essence)}</p></div></div>
      <div class="grid grid-2 num-sw"><div><h4>${icon('star')} Strengths</h4>${chips(t.strengths)}</div><div><h4>${icon('leaf')} Room to grow</h4>${chips(t.growth, 'soft')}</div></div>
      <p class="num-advice">${esc(t.advice)}</p>`;
  }
  function staticBlocks() {
    $('numBasicsGrid').innerHTML = TX.basics.map((b, i) => `<div class="card num-basic reveal" style="--d:${(i % 3) * 0.06}s"><span class="nb-ic">${icon(b.icon)}</span><h3>${esc(b.title)}</h3><p class="muted">${esc(b.text)}</p></div>`).join('');
    $('numSeg').innerHTML = LIST.map((v) => `<button type="button" data-n="${v}" aria-pressed="${v === meaning}">${v}</button>`).join('');
    showMeaning(meaning);
    const rows = [[], [], [], []];
    const AB = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    Array.from(AB).forEach((ch, i) => rows[Math.floor(i / 9)].push(ch));
    $('numLetters').innerHTML = `<table class="table num-letters-table"><thead><tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => `<th>${k}</th>`).join('')}</tr></thead><tbody>${rows.filter((r) => r.length).map((r) => `<tr>${Array.from({ length: 9 }, (_, i) => `<td>${r[i] || ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    $('numFaqList').innerHTML = TX.faq.map((f, i) => `<details class="acc-item reveal" style="--d:${i * 0.04}s"><summary>${esc(f.q)}<span class="pm">${icon('plus')}</span></summary><div class="acc-body">${esc(f.a)}</div></details>`).join('');
    $('numNote').innerHTML = UI.alinaNote('Want to understand how your numbers play out in your life? Write to me — we’ll look at them together with your birth chart, calmly and without rushing.', '<button class="btn btn-primary btn-sm" type="button" data-book="numerology">Book</button>');
    const now = new Date(), u = N.universalDay(now.getFullYear(), now.getMonth() + 1, now.getDate());
    $('numToday').innerHTML = `${orb(u, 's')}<span><b>Number of the day — ${u}</b><span class="small">good for ${esc(TX.tips[u])}</span></span>`;
  }

  // ---------- форма ----------
  function readForm() {
    const iso = document.querySelector('#nmDateBox .dob-iso').value;
    if (!iso) {
      const t = document.querySelector('#nmDateBox .dob-text');
      t.classList.add('invalid'); t.focus();
      UI.toast(t.value.trim() ? 'Check your date of birth: MM/DD/YYYY' : 'Enter your date of birth', 'calendar');
      return null;
    }
    return { iso, name: $('nmName').value.trim() };
  }
  function setForm(name, iso) {
    $('nmName').value = name || '';
    const di = document.querySelector('#nmDateBox .dob-iso');
    if (iso) { di.value = iso; di.dispatchEvent(new Event('change')); }
  }
  async function run(input, focus) {
    res = calc(input.name, input.iso);
    if (window.NumerologyPro) window.NumerologyPro.reset();
    UI.store.set('numerology', input);
    // по нажатию — короткое “волшебство”, при открытии страницы (прошлые числа) — сразу
    if (focus && !(await UI.conjure($('numResult'), { kind: 'numbers' }))) return;
    render(focus);
  }

  let picked = null; // человек из “Моих карт” — ему запоминаем ФИО при рождении
  document.addEventListener('DOMContentLoaded', () => {
    $('nmDateBox').innerHTML = UI.dobHTML('nmDate', '');
    UI.enhanceDob($('nmDateBox'));
    // “Мои карты”: нажали на человека — дата и ФИО подставились, числа посчитались
    const ppBox = document.getElementById('nmPeople');
    if (ppBox) UI.peopleChips(ppBox, (it) => {
      picked = it.person || null;
      const iso = `${it.p.y}-${String(it.p.mo).padStart(2, '0')}-${String(it.p.d).padStart(2, '0')}`;
      setForm(it.fullName || it.p.name || '', iso);
      run({ name: it.fullName || it.p.name || '', iso }, true);
    });
    staticBlocks();
    // код доступа введён — открыть месяцы и дни без повторного ввода
    document.addEventListener('premiumchange', () => { if (res) render(); });
    $('numForm').addEventListener('submit', (e) => {
      e.preventDefault(); const i = readForm(); if (!i) return;
      // ФИО полностью (2+ слова) — запомним выбранному человеку, чтобы в следующий раз не вводить
      if (picked && i.name.split(/\s+/).length >= 2 && UI.people.get(picked.id)) UI.people.update(picked.id, { fullName: i.name });
      run(i, true);
    });
    $('numSeg').addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (b) { showMeaning(+b.dataset.n); UI.fadeIn($('numMeaning'), 6); } });
    $('numResult').addEventListener('click', async (e) => {
      const t = e.target.closest('[data-tile]');
      if (t) { tile = t.dataset.tile; $('numResult').querySelectorAll('[data-tile]').forEach((b) => { const on = b === t; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', String(on)); }); $('numDetail').innerHTML = tileDetail(res); UI.fadeIn($('numDetail'), 6); return; }
      const c = e.target.closest('[data-cell]');
      if (c) { cell = +c.dataset.cell; $('numResult').querySelectorAll('[data-cell]').forEach((b) => { const on = b === c; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', String(on)); }); $('pqSide').innerHTML = cellDetail(res); UI.fadeIn($('pqSide'), 6); if (window.innerWidth < 700) $('pqSide').scrollIntoView({ behavior: UI.reduceMotion() ? 'auto' : 'smooth', block: 'nearest' }); return; }
      const g = e.target.closest('[data-go-tab]');
      if (g) { const b = document.getElementById(g.dataset.goTab + '-btn'); if (b) { b.click(); b.focus(); } return; }
      if (e.target.closest('[data-focus-name]')) { $('nmName').focus(); $('nmName').scrollIntoView({ behavior: UI.reduceMotion() ? 'auto' : 'smooth', block: 'center' }); return; }
      const st = e.target.closest('[data-act="story"]');
      if (st && window.Cards && window.Cards.storyNumbers) {
        st.disabled = true;
        try { const cv = await window.Cards.storyNumbers(res); await window.Cards.show(cv, 'my-numbers.png', '“My numbers” story', 'No date of birth — just your numbers.'); } catch (er) { console.error(er); UI.toast('Couldn’t draw the card', 'info'); }
        st.disabled = false;
      }
    });
    // клиент из кабинета Алики, затем последний расчёт, затем последняя натальная карта
    const q = new URLSearchParams(location.search);
    const cl = q.get('client') && UI.clients.get(q.get('client'));
    const last = UI.store.get('numerology', null);
    const rec = (UI.recent.list() || [])[0];
    const pad = (n) => String(n).padStart(2, '0');
    const pp = q.get('person') && UI.people.get(q.get('person'));
    if (pp && pp.birth) { picked = pp; const nm = pp.fullName || pp.name || ''; const iso = `${pp.birth.y}-${pad(pp.birth.mo)}-${pad(pp.birth.d)}`; setForm(nm, iso); run({ name: nm, iso }); }
    else if (cl && cl.birth) { setForm(cl.name, `${cl.birth.y}-${pad(cl.birth.mo)}-${pad(cl.birth.d)}`); run({ name: cl.name, iso: `${cl.birth.y}-${pad(cl.birth.mo)}-${pad(cl.birth.d)}` }); }
    else if (last && last.iso) { setForm(last.name, last.iso); run(last); }
    else if (rec && rec.y) setForm(rec.name || '', `${rec.y}-${pad(rec.mo)}-${pad(rec.d)}`);
    UI.reveal();
  });
})();
