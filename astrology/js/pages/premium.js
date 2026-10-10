/* Страница “Премиум-доступ”: статус доступа, что входит, тарифы, как оформить, ввод кода, вопросы и условия.
   Тарифы и тексты возможностей — js/content.js → premium. Логика кодов — js/premium.js. */
(function () {
  'use strict';
  const UI = window.UI, SITE = window.SITE, Pm = window.Premium;
  const { esc, fmt, icon } = UI;
  const P = SITE.premium || {};
  const $ = (id) => document.getElementById(id);
  const site = () => 'https://' + String(SITE.siteUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

  const FAQ = [
    ['Is this a subscription? Will I be charged automatically?', 'No. You pay once for the period you choose — 7 days, a month or a year. Nothing renews automatically: when it ends, you can extend it if you like.'],
    ['How do I get access?', 'After payment, Iris sends you a personal link. Open it and the premium sections unlock right away — no sign-up, no passwords.'],
    ['Can I use it on my phone and my computer?', 'Yes. Open the same link on each of your devices. Keep the message with the link — you’ll need it if you clear your browser or get a new phone.'],
    ['Can I look at forecasts and readings for people close to me?', 'Yes: enter anyone’s birth details — your mom’s, your partner’s, your child’s. Access unlocks the sections, not a single chart.'],
    ['How is this different from a reading?', 'Premium gives you precise calculations and automatic interpretations of each part of the chart. In a reading, Iris brings them together into one picture that’s truly about you and answers your questions. Each complements the other.'],
    ['Can I give it as a gift?', 'Yes. Tick “It’s a gift” in your request — Iris will send a link you can forward to the recipient.'],
    ['What if my access doesn’t open?', 'Write to Iris and send the link from your message — she’ll check it and help.'],
  ];
  const STEPS = [
    ['sparkle', 'Choose a plan', 'A week, a month or a year — every plan includes all premium sections.'],
    ['send', 'Send a request', 'The message writes itself — you just send it to Iris.'],
    ['receipt', 'Pay', 'Iris replies with the easiest way to pay and sends a receipt.'],
    ['key', 'Open your link', 'Your personal link unlocks everything at once — on any of your devices until the end of the term.'],
  ];

  function status() {
    const s = Pm.state() || {};
    const box = $('pmStatus');
    if (s.kind === 'alina') {
      box.innerHTML = `<div class="card pm-status">${icon('crown')}<div><b>Iris, everything is open to you</b><span>Client codes are in the dashboard, under “Access codes”.</span></div><a class="btn btn-primary btn-sm" href="cabinet.html#access">Issue access</a></div>`;
    } else if (s.kind === 'active') {
      const left = s.info.to - Pm.todayNum();
      box.innerHTML = `<div class="card pm-status on">${icon('crown')}<div><b>${s.info.name ? esc(s.info.name) + ', your access is open' : 'Your access is open'}</b><span>until ${fmt.date(Pm.dateOf(s.info.to))}, inclusive · ${left === 0 ? 'last day' : 'left: ' + left + ' ' + fmt.plural(left, 'day', 'days', 'days')}</span></div>
        <button class="btn btn-ghost btn-sm" type="button" data-pm="link">${icon('link')} Link for another device</button></div>`;
    } else if (s.kind === 'expired') {
      box.innerHTML = `<div class="card pm-status off">${icon('hourglass')}<div><b>Your access ended on ${fmt.date(Pm.dateOf(s.info.to))}</b><span>Extend it and everything opens again.</span></div><a class="btn btn-primary btn-sm" href="#plans">Extend</a></div>`;
    } else if (s.kind === 'notyet') {
      box.innerHTML = `<div class="card pm-status">${icon('calendar')}<div><b>Your access starts on ${fmt.date(Pm.dateOf(s.info.from))}</b><span>Your link is saved — everything will open on that day by itself.</span></div></div>`;
    } else {
      box.innerHTML = `<div class="hero-cta" style="margin-top:6px"><a class="btn btn-primary" href="#plans">Choose a plan</a><button class="btn btn-ghost" type="button" data-pw="code">${icon('key')} I have a code</button></div>`;
    }
  }

  function features() {
    const open = Pm.isOpen();
    $('pmFeatures').innerHTML = (P.features || []).map((f, i) => `
      <a class="card hover pm-feat reveal" style="--d:${(i % 2) * 0.08}s" href="${esc(f.href)}">
        <span class="card-icon ${['', 'rose', 'gold', ''][i % 4]}">${icon(f.icon)}</span>
        <h3>${esc(f.title)}</h3><p class="muted">${esc(f.text)}</p>
        <span class="link-arrow">${open ? 'Open' : 'See what’s free'} ${icon('arrow')}</span>
      </a>`).join('');
  }

  function plans() {
    $('pmPlans').innerHTML = `<div class="pm-paywall" data-paywall="">${Pm.planCards()}
      <div class="pw-foot" style="justify-content:center"><button type="button" class="btn btn-ghost btn-sm" data-pw="code">${icon('key')} I have a code</button></div></div>`;
  }

  function steps() {
    $('pmSteps').innerHTML = STEPS.map(([ic, t, d], i) => `<li class="card reveal" style="--d:${i * 0.06}s" data-n="${i + 1}"><span class="pm-step-ic">${icon(ic)}</span><b>${t}</b><span class="small muted">${d}</span></li>`).join('');
    $('pmActivate').innerHTML = `<div class="pm-act-head">${icon('key')}<div><h3 style="margin:0">Already have a link or code?</h3><p class="small muted" style="margin:2px 0 0">Paste it here — access will open on this device.</p></div></div>
      <form class="pm-act-form" novalidate><textarea class="textarea" id="pmCode" rows="2" spellcheck="false" autocomplete="off" placeholder="https://…/premium.html#k=…" aria-label="Access link or code"></textarea>
      <button class="btn btn-primary" type="submit">${icon('lock-open')} Open</button></form><p class="lock-err small" role="alert" id="pmErr"></p>`;
    const ta = $('pmCode'), err = $('pmErr');
    ta.addEventListener('input', () => { err.textContent = ''; ta.classList.remove('invalid'); });
    $('pmActivate').querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = Pm.extract(ta.value);
      if (!code) { err.textContent = 'That doesn’t look like an access code. Copy the whole link from Iris’s message.'; ta.classList.add('invalid'); return; }
      const btn = e.target.querySelector('[type=submit]'); btn.disabled = true;
      const r = await Pm.activate(code);
      btn.disabled = false;
      if (r.ok) { ta.value = ''; Pm.welcome(r.info); return; }
      err.textContent = Pm.whyText(r);
      if (r.why !== 'notyet') ta.classList.add('invalid');
    });
  }

  function faq() {
    $('pmFaq').innerHTML = FAQ.map(([q, a], i) => `<details class="acc-item reveal" style="--d:${i * 0.04}s"><summary>${esc(q)}<span class="pm">${icon('plus')}</span></summary><div class="acc-body">${esc(a)}</div></details>`).join('');
    const terms = [
      'Premium access unlocks the site sections listed above for the chosen period — up to and including the date in your link. There are no automatic charges: to extend, simply pay again.',
      'Access is personal: use your link on any of your own devices, but please don’t publish it. Iris can deactivate a published link.',
      'Calculations and interpretations are for information and self-reflection. They don’t replace the help of a doctor, therapist, lawyer or financial professional.',
      'Questions about payment or access — write to Iris; contacts are at the bottom of the page.',
    ];
    $('pmTerms').innerHTML = `<h3 style="margin-top:0">Terms</h3><ul class="small" style="margin:0;padding-left:1.1em;display:grid;gap:6px">${terms.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>${P.seller ? `<p class="small muted" style="margin:12px 0 0">${esc(P.seller)}</p>` : ''}`;
    $('pmNote').innerHTML = UI.alinaNote('Premium is for people who love to dig in themselves: dates, aspects, numbers. And if you ever want to talk about your chart in person — I’m here.', '<button class="btn btn-primary btn-sm" type="button" data-book>Book a reading</button>');
  }

  function render() { status(); features(); }

  document.addEventListener('DOMContentLoaded', async () => {
    plans(); steps(); faq();
    await Pm.ready();
    render();
    UI.reveal(document.getElementById('main'));
    document.addEventListener('premiumchange', render);
    document.getElementById('pmStatus').addEventListener('click', async (e) => {
      if (!e.target.closest('[data-pm="link"]')) return;
      const s = Pm.state();
      if (s && s.code && (await UI.copyText(`${site()}/premium.html#k=${s.code}`))) UI.toast('Link copied — open it on your other device', 'link');
    });
  });
})();
