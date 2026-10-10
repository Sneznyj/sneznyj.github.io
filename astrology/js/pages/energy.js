/* “Энергетическая работа” (energy.html): что такое энергетическое / духовное выравнивание, как проходит, что даёт —
   и предварительная запись: человек выбирает дату и время (сессия 30 минут, часы — content.js → energy.schedule
   по поясу Алины, показ — по часам посетителя). Заявка уходит в кабинет Алины (ящик заявок) или в Telegram;
   время Алина подтверждает сама. Оплата — донейшн. Тексты — content.js → energy. */
(function () {
  'use strict';
  const UI = window.UI, SITE = window.SITE, BC = window.BookingCore;
  const { esc, fmt, icon } = UI;
  const $ = (id) => document.getElementById(id);
  const E = SITE.energy || {};
  const tz = (UI.browserTz && BC.validTz(UI.browserTz)) ? UI.browserTz : (E.schedule && E.schedule.timezone) || 'Europe/Minsk';
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let days = new Map(), dayKey = null, pick = null;

  function staticBlocks() {
    if (E.title) { const [a, b] = E.title.split('/'); $('enTitle').innerHTML = b ? `${esc(a.trim())} / ${esc(b.trim().split(' ')[0])} <em class="accent">${esc(b.trim().split(' ').slice(1).join(' '))}</em>` : esc(E.title); }
    $('enLead').textContent = E.lead || '';
    $('enFacts').innerHTML = [['clock', `${E.duration || 30} minutes`], ['world', 'online, from anywhere'], ['heart-handshake', 'pay by donation']].map(([ic, t]) => `<li>${icon(ic)}${esc(t)}</li>`).join('');
    $('enWhat').innerHTML = (E.what || []).map((p) => `<p>${esc(p)}</p>`).join('');
    $('enWho').textContent = E.whoFor || '';
    $('enSteps').innerHTML = (E.how || []).map(([ic, t, d], i) => `<div class="step reveal" style="--d:${(i * 0.1).toFixed(1)}s"><div class="dot">${icon(ic)}<span class="num">${i + 1}</span></div><h4>${esc(t)}</h4><p>${esc(d)}</p></div>`).join('');
    $('enGives').innerHTML = (E.gives || []).map(([ic, t, d], i) => `<div class="card en-give reveal" style="--d:${((i % 3) * 0.08).toFixed(2)}s"><span class="card-icon ${['', 'gold', 'rose'][i % 3]}">${icon(ic)}</span><div><h4>${esc(t)}</h4><p class="small muted">${esc(d)}</p></div></div>`).join('');
    $('enImportant').innerHTML = `${icon('info')}<span><b>Please note.</b> ${esc(E.important || '')}</span>`;
    $('enDonation').textContent = E.donation || '';
    $('enFaq').innerHTML = (E.faq || []).map(([q, a]) => `<details class="acc-item"><summary><span>${esc(q)}</span><span class="pm">${icon('plus')}</span></summary><div class="acc-body"><p>${esc(a)}</p></div></details>`).join('');
  }

  // ---------- выбор даты и времени ----------
  function compute() {
    const list = BC.slots(E.schedule || {}, E.duration || 30);
    days = BC.byDay(list, tz);
  }
  const dayLabel = (key) => { const [y, m, d] = key.split('-').map(Number); const dt = new Date(Date.UTC(y, m - 1, d)); return { dow: DOW[dt.getUTCDay()], d, mon: fmt.MONTHS_SHORT[m - 1], long: `${fmt.DOW_LONG[dt.getUTCDay()]}, ${fmt.MONTHS_GEN[m - 1]} ${d}` }; };
  function whenText(s) { const p = BC.partsIn(s.start, tz), dl = dayLabel(p.key); return `${dl.long}, ${BC.hmShow(p.min)}`; }
  function renderPicker() {
    const keys = Array.from(days.keys());
    if (!dayKey || !days.has(dayKey)) dayKey = keys[0] || null;
    const slots = dayKey ? days.get(dayKey) : [];
    const slotsHTML = slots.length ? slots.map((s) => `<button type="button" class="en-slot${pick && pick.start === s.start ? ' on' : ''}" data-slot="${s.start}" aria-pressed="${!!(pick && pick.start === s.start)}">${BC.hmShow(s.local.min)}</button>`).join('') : '<p class="small muted">No free time on this day.</p>';
    $('enPicker').innerHTML = keys.length ? `<div class="en-days" role="group" aria-label="Date">${keys.map((k) => { const dl = dayLabel(k); return `<button type="button" class="en-day${k === dayKey ? ' on' : ''}" data-day="${k}" aria-pressed="${k === dayKey}"><small>${dl.dow}</small><b>${dl.d}</b><small>${dl.mon}</small></button>`; }).join('')}</div>
      <p class="label" style="margin:12px 0 6px">Time <small class="muted">— in your time (${esc(UI.tzLabel(tz))})</small></p>
      <div class="en-slots" role="group" aria-label="Time">${slotsHTML}</div>
      <p class="en-chosen" id="enChosen">${pick ? `${icon('calendar-check')} You chose: <b>${esc(whenText(pick))}</b>` : 'Choose a time — a session lasts ' + (E.duration || 30) + ' minutes.'}</p>`
      : '<p class="notice">No free time in the coming weeks — write to me and we’ll find a time that works.</p>';
  }
  function form() {
    $('enForm').innerHTML = `<h3 style="margin:0 0 10px">${icon('calendar-time')} Date and time</h3><div id="enPicker"></div>
      <form class="form ix" id="enIntake" novalidate style="margin-top:16px">
        <div class="field"><label for="enQ">What you’d like help with <small class="ix-opt">— optional</small></label><textarea class="textarea" id="enQ" name="question" rows="2" maxlength="1500" placeholder="What’s worrying you, or what you’d like: calm, energy, clarity…"></textarea></div>
        <div class="form-row ix-contact">
          <div class="field"><label for="enName">Your name *</label><input class="input" id="enName" name="name" required autocomplete="given-name"></div>
          <div class="field"><label for="enContact">Telegram or phone *</label><input class="input" id="enContact" name="contact" required placeholder="@@handle or +1…" autocomplete="tel"></div>
        </div>
        <input class="ix-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="check ix-consent"><input type="checkbox" name="consent" required> <span>I agree to the <a href="privacy.html" target="_blank">processing of my data</a></span></label>
        <button class="btn btn-primary btn-block" type="submit">${icon('send')} Book an alignment session</button>
        <p class="tiny muted center" style="margin:0">This is a provisional booking: I’ll confirm the time and send you the details. Payment is by donation, after the session.</p>
      </form>`;
    renderPicker();
    // имя и контакт с прошлой анкеты (только на этом устройстве) — чтобы не вводить заново
    const prefill = () => { const me = UI.store.get('ixMe', null); if (!me) return; if (!$('enName').value) $('enName').value = me.name || ''; if (!$('enContact').value) $('enContact').value = me.contact || ''; };
    prefill();
    $('enForm').addEventListener('click', (e) => {
      const d = e.target.closest('[data-day]');
      if (d) { dayKey = d.dataset.day; if (pick && BC.partsIn(pick.start, tz).key !== dayKey) pick = null; renderPicker(); UI.fadeIn($('enPicker').querySelector('.en-slots'), 4); return; }
      const s = e.target.closest('[data-slot]');
      if (s) { pick = days.get(dayKey).find((x) => x.start === +s.dataset.slot) || null; renderPicker(); }
    });
    $('enIntake').addEventListener('input', (e) => e.target.classList && e.target.classList.remove('invalid'));
    $('enIntake').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (!pick) { UI.toast('Choose a date and time', 'calendar'); $('enPicker').scrollIntoView({ behavior: UI.reduceMotion() ? 'auto' : 'smooth', block: 'center' }); return; }
      for (const k of ['name', 'contact']) { const el = f.querySelector(`[name=${k}]`); if (!el.value.trim()) { el.classList.add('invalid'); el.focus(); UI.toast(k === 'name' ? 'What should I call you?' : 'Leave a contact so I can reply', 'user'); return; } }
      if (!f.querySelector('[name=consent]').checked) { UI.toast('Please tick the consent to data processing', 'info'); return; }
      const g = (k) => String(f.querySelector(`[name=${k}]`).value || '').trim();
      try { UI.store.set('ixMe', { name: g('name'), contact: g('contact') }); } catch (x) { /* без памяти браузера */ }
      const alinaTz = (E.schedule && E.schedule.timezone) || 'Europe/Minsk';
      const mine = whenText(pick), hers = `${BC.hmShow(BC.partsIn(pick.start, alinaTz).min)} Iris’s time`;
      const text = ['Hi Iris! I’d like to book an energy alignment session ✨', `Name: ${g('name')}`, `Contact: ${g('contact')}`, 'Service: Energy alignment', `Preferred time: ${mine} (my time)${alinaTz !== tz ? ' — ' + hers : ''}`, g('question') ? `Question: ${g('question')}` : '', `My time zone: ${tz} (${UI.tzLabel(tz)})`].filter(Boolean).join('\n');
      const data = { name: g('name'), contact: g('contact'), service: 'Energy alignment', serviceId: 'energy', question: g('question'), birth: '', partner: '', fullname: '', format: '', timezone: tz, slot: new Date(pick.start).toISOString(), prefer: `${mine} (client’s time)` };
      const btn = f.querySelector('[type=submit]'), label = btn.innerHTML;
      btn.disabled = true; btn.innerHTML = `${icon('refresh')} Sending…`;
      UI.goal('energy');
      await UI.submitIntake({ data, text, hp: g('website'), when: `Provisionally: ${mine}` });
      btn.disabled = false; btn.innerHTML = label;
      f.reset(); pick = null; renderPicker(); prefill();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (E.enabled === false) { $('main').innerHTML = '<section class="page-hero"><div class="container"><h1>Coming soon</h1><p class="lead">This page will appear later.</p></div></section>'; return; }
    staticBlocks();
    compute();
    form();
    UI.reveal();
  });
})();
