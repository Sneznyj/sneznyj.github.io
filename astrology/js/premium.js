/* Премиум-доступ: коды на срок, проверка прямо в браузере, блок с тарифами, заявка Алике.
   Код — подписанная Аликой запись (номер, тариф, срок, имя) + ключ доступа к премиум-разделам (зашифрованы в js/locked).
   Подпись проверяется открытым ключом из js/locked/meta.js: без ключа подписи (он только у Алики) код не подделать.
   Ссылка доступа: …/premium.html#k=<код> — часть после # на сервер не уходит; код запоминается в этом браузере (am_access).
   Формат кода — см. _dev/premium_token.js. Алике (вход в кабинет) открыто всё без кода. */
(function () {
  'use strict';
  const UI = window.UI, SITE = window.SITE, Admin = window.Admin;
  const { esc, fmt, icon } = UI;
  const P = SITE.premium || {};
  const STORE = 'am_access';
  const PLAN_BY_CODE = { 1: 'week', 2: 'month', 3: 'year', 4: 'custom', 5: 'gift' };
  const PLAN_NAMES = { week: '7 days', month: 'Month', year: 'Year', custom: 'Custom term', gift: 'Gift' };
  const DAY0 = Date.UTC(2020, 0, 1);
  const dayOf = (d) => Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - DAY0) / 86400000);
  const todayNum = () => dayOf(new Date());
  const dateOf = (n) => { const u = new Date(DAY0 + n * 86400000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
  const idText = (id) => id.toString(36).toUpperCase().padStart(7, '0');
  const b64urlDecode = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
  const b64urlEncode = (u8) => { let s = ''; for (const x of u8) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const plans = () => P.plans || [];
  const features = () => P.features || [];
  const days = (n) => `${n} ${fmt.plural(n, 'day', 'days', 'days')}`;

  const stored = () => { try { return localStorage.getItem(STORE) || ''; } catch (e) { return ''; } };
  const save = (code) => { try { localStorage.setItem(STORE, code); } catch (e) { /* приватный режим */ } };
  const forget = () => { try { localStorage.removeItem(STORE); } catch (e) { /* нет */ } };
  function loadScript(src) {
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => res(); s.onerror = () => rej(new Error('load ' + src)); document.body.appendChild(s); });
  }

  /** Код из текста: ссылка …#k=…, “k=…” или сам код. */
  function extract(text) {
    const t = String(text || '').trim();
    const m = /[#?&]k=([A-Za-z0-9_-]{40,})/.exec(t);
    if (m) return m[1];
    const c = t.replace(/\s+/g, '').replace(/^k=/, '');
    return /^[A-Za-z0-9_-]{100,}$/.test(c) ? c : '';
  }
  /** Разобрать код (без проверки подписи) или null. */
  function parse(code) {
    let b;
    try { b = b64urlDecode(String(code)); } catch (e) { return null; }
    if (b.length < 12 + 32 + 64 || b[0] !== 1) return null;
    const L = b[11];
    if (L > 40 || b.length !== 12 + L + 32 + 64) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let name = '';
    try { name = new TextDecoder('utf-8', { fatal: true }).decode(b.subarray(12, 12 + L)); } catch (e) { return null; }
    return { body: b.subarray(0, 12 + L + 32), sig: b.subarray(12 + L + 32), key: b.subarray(12 + L, 12 + L + 32), kid: b[1], id: dv.getUint32(2), plan: PLAN_BY_CODE[b[6]] || 'custom', from: dv.getUint16(7), to: dv.getUint16(9), name };
  }

  let revoked = null;
  async function revokedIds() {
    if (revoked) return revoked;
    // минута в адресе — отзыв срабатывает быстро, без долгого кэша
    if (!window.PREMIUM_REVOKED) { try { await loadScript('js/premium-revoked.js?m=' + Math.floor(Date.now() / 60000)); } catch (e) { /* нет файла — никто не отозван */ } }
    revoked = new Set(((window.PREMIUM_REVOKED || {}).ids || []).map((x) => String(x).toUpperCase()));
    return revoked;
  }

  /** Проверить код → { ok, why, info, key }. why: format | old | sig | revoked | expired | notyet | crypto */
  async function check(code) {
    if (!Admin.canCrypto()) return { ok: false, why: 'crypto' };
    const t = parse(code);
    if (!t) return { ok: false, why: 'format' };
    const pm = (await Admin.meta()).premium || {};
    const info = { id: t.id, idText: idText(t.id), plan: t.plan, from: t.from, to: t.to, name: t.name };
    if (t.kid !== pm.kid) return { ok: false, why: 'old', info };
    let good = false;
    try {
      const pub = await crypto.subtle.importKey('jwk', pm.pub, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
      good = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pub, t.sig, t.body);
    } catch (e) { good = false; }
    if (!good) return { ok: false, why: 'sig', info };
    if ((await revokedIds()).has(info.idText)) return { ok: false, why: 'revoked', info };
    const today = todayNum();
    if (t.to < today) return { ok: false, why: 'expired', info };
    if (t.from > today) return { ok: false, why: 'notyet', info };
    let key;
    try { key = await crypto.subtle.importKey('raw', t.key, 'AES-GCM', false, ['decrypt']); await Admin.decrypt(key, pm.check); } catch (e) { return { ok: false, why: 'sig', info }; }
    return { ok: true, info, key };
  }
  const WHY = {
    format: () => 'That doesn’t look like an access code. Copy the whole link from Iris’s message.',
    sig: () => 'This code doesn’t work — it was probably copied incompletely. Copy the whole link.',
    old: () => 'This code is from an earlier series and no longer works. Write to Iris — she’ll send you a new one.',
    revoked: () => 'This code has been deactivated. If that’s a mistake, write to Iris.',
    expired: (i) => `This code expired on ${fmt.date(dateOf(i.to))}. You can extend it right here — choose a plan.`,
    notyet: (i) => `Code saved — it starts working on ${fmt.date(dateOf(i.from))}.`,
    crypto: () => 'This browser can’t check codes — please open the site in Chrome, Safari or Firefox.',
  };
  const whyText = (r) => (WHY[r.why] || WHY.format)(r.info || {});

  // ---------- состояние доступа ----------
  // код из ссылки забираем сразу при загрузке и убираем из адресной строки (чтобы не попал в скриншоты и закладки)
  let pending = null, linkResult = null;
  (function takeHash() {
    const m = /(?:^#|&)k=([A-Za-z0-9_-]+)/.exec(location.hash);
    if (!m) return;
    pending = m[1];
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// */ }
  })();
  /** Сохранить новый код, если он не короче уже действующего. */
  async function keep(code, r) {
    const cur = stored();
    if (cur && cur !== code) {
      const c = parse(cur);
      if (c && c.to > r.info.to) { const rc = await check(cur); if (rc.ok) return false; }
    }
    save(code);
    return true;
  }
  async function compute() {
    if (pending) { const code = pending; pending = null; linkResult = await check(code); if (linkResult.ok || linkResult.why === 'notyet') await keep(code, linkResult); }
    if (Admin.has() && (await Admin.premiumKey())) return { kind: 'alina' };
    const code = stored();
    if (!code) return { kind: 'none' };
    const r = await check(code);
    if (r.ok) return { kind: 'active', info: r.info, key: r.key, code };
    if (r.why === 'expired') return { kind: 'expired', info: r.info };
    if (r.why === 'notyet') return { kind: 'notyet', info: r.info };
    if (r.why === 'crypto') return { kind: 'none' };
    forget(); // отозван, подделан или прежней серии — больше не проверяем
    return { kind: r.why === 'revoked' ? 'revoked' : 'none', info: r.info };
  }
  let state = null, readyP = null;
  function ready() {
    return readyP || (readyP = compute().catch((e) => { console.error(e); return { kind: 'none' }; }).then((s) => (state = s)));
  }
  const isOpen = (s) => !!s && (s.kind === 'alina' || s.kind === 'active');
  async function refresh() {
    readyP = null;
    const s = await ready();
    decorate();
    document.dispatchEvent(new CustomEvent('premiumchange', { detail: s }));
    return s;
  }
  /** Ключ премиум-разделов по коду клиента (для js/admin.js). Алике ключ даёт сам admin.js. */
  async function contentKey() { const s = await ready(); return s.kind === 'active' ? s.key : null; }
  /** Есть доступ — расшифровать и запустить модули (true), нет — false. */
  async function ensure(names) {
    const s = await ready();
    if (!isOpen(s)) return false;
    try { await Admin.run(names); return true; } catch (e) { console.error(e); return false; }
  }
  /** Ввести код (из окна “У меня есть код” или со страницы premium.html). */
  async function activate(code) {
    const r = await check(code);
    if (r.ok || r.why === 'notyet') { await keep(code, r); await refresh(); if (r.ok) UI.goal('premium_activate'); }
    return r;
  }

  // ---------- вид ----------
  const crown = () => `<span class="pw-crown" aria-hidden="true">${icon('crown')}</span>`;
  /** Метка над платным разделом: “Премиум до …” или “Алика: всё открыто”. */
  function chip() {
    const s = state;
    if (!s) return '';
    if (s.kind === 'alina') return `<span class="badge gold pw-chip">${icon('crown')} Iris: everything open</span>`;
    if (s.kind === 'active') return `<span class="badge gold pw-chip">${icon('crown')} Premium until ${fmt.date(dateOf(s.info.to))}</span>`;
    return '';
  }
  function planCards() {
    const ps = plans();
    const month = ps.find((p) => p.id === 'month');
    return `<div class="plan-grid">${ps.map((p) => {
      const perMonth = p.days >= 60 ? Math.round(p.price / (p.days / 30.4)) : 0;
      const off = month && p.days > month.days ? Math.round((1 - (p.price / p.days) / (month.price / month.days)) * 100) : 0;
      const tag = p.tag ? `<span class="plan-tag">${esc(p.tag)}</span>` : off >= 10 ? `<span class="plan-tag save">save ${off}%</span>` : '';
      return `<button type="button" class="plan${p.tag ? ' hit' : ''}" data-plan="${esc(p.id)}">${tag}
        <span class="plan-t">${esc(p.title)}</span>
        <span class="plan-p">${fmt.money(p.price)}</span>
        <span class="plan-n">${perMonth ? `≈ ${fmt.money(perMonth)} a month. ` : ''}${esc(p.note || '')}</span>
        <span class="plan-go">Choose ${icon('arrow')}</span></button>`;
    }).join('')}</div>`;
  }
  /** Блок с тарифами. o: { feature, title, text, compact } */
  function paywall(o) {
    o = o || {};
    const feats = features();
    const main = feats.find((f) => f.id === o.feature);
    const s = state;
    const expired = s && s.kind === 'expired' ? `<p class="notice pw-expired">${icon('hourglass')}<span>Your premium access ended on ${fmt.date(dateOf(s.info.to))}. Extend it and everything opens again.</span></p>` : '';
    const list = o.compact
      ? `<div class="pw-chips">${feats.map((f) => `<span class="chip${f.id === o.feature ? ' on' : ''}">${icon(f.icon)}${esc(f.title)}</span>`).join('')}</div>`
      : `<ul class="pw-feats">${feats.map((f) => `<li class="${f.id === o.feature ? 'on' : ''}">${icon(f.icon)}<span><b>${esc(f.title)}</b> ${esc(f.text)}</span></li>`).join('')}</ul>`;
    return `<div class="card paywall${o.compact ? ' compact' : ''}" data-paywall="${esc(o.feature || '')}">
        <div class="pw-head">${crown()}<div><span class="eyebrow">${esc(P.name || 'Premium access')}</span>
          <h3>${esc(o.title || (main ? main.title + ' — in premium access' : 'Unlock the in-depth readings'))}</h3>
          ${o.text ? `<p class="muted">${o.text}</p>` : ''}</div></div>
        ${expired}${list}${planCards()}
        <div class="pw-foot"><button type="button" class="btn btn-ghost btn-sm" data-pw="code">${icon('key')} I have a code</button>${location.pathname.endsWith('premium.html') ? '' : `<a class="btn btn-ghost btn-sm" href="premium.html">What’s included ${icon('arrow')}</a>`}</div>
        <p class="tiny muted pw-fine">One-time payment, no automatic renewals. One pass unlocks every premium section — on any of your devices, via your personal link.</p>
      </div>`;
  }
  /** Закрытая карточка-заглушка: заголовок виден, текст — нет (его нет и в коде страницы). */
  function locked(title, o) {
    o = o || {};
    const n = o.lines || 3;
    return `<div class="locked-card${o.cls ? ' ' + o.cls : ''}"><div class="lk-head">${icon('lock')}<span>${title}</span>${o.meta ? `<small>${o.meta}</small>` : ''}</div>
      <div class="lk-lines" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i style="width:${[96, 88, 72, 91, 64][i % 5]}%"></i>`).join('')}</div></div>`;
  }

  // ---------- заявка и ввод кода ----------
  function order(planId, feature) {
    const p = plans().find((x) => x.id === planId);
    if (!p) return;
    UI.goal('premium_order');
    if (p.payUrl) { window.open(p.payUrl, '_blank', 'noopener'); return; }
    const m = UI.modal(`
      <div class="pw-order-head">${crown()}<div><span class="eyebrow" style="margin:0">${esc(P.name || 'Premium access')}</span><h3 style="margin:2px 0 0">${esc(p.title)} — ${fmt.money(p.price)}</h3></div></div>
      <p class="muted small" style="margin-top:12px">Iris will reply with the easiest way to pay and send your personal link. Open it — and every premium section will be unlocked for ${days(p.days)}.</p>
      <form class="form pw-order" novalidate>
        <div class="field"><label for="poName">What should I call you</label><input class="input" id="poName" autocomplete="given-name" required></div>
        <div class="field"><label for="poContact">Where to send the link</label><input class="input" id="poContact" autocomplete="off" placeholder="@email, phone or messenger handle" required></div>
        <label class="check"><input type="checkbox" id="poGift"> <span>It’s a gift</span></label>
        <div class="field" id="poGiftBox" hidden><label for="poGiftTo">For</label><input class="input" id="poGiftTo" placeholder="Recipient’s name"></div>
        <button class="btn btn-primary btn-block" type="submit">${icon('send')} Prepare my request</button>
      </form>`);
    const f = m.el.querySelector('form');
    m.el.querySelector('#poGift').addEventListener('change', (e) => { m.el.querySelector('#poGiftBox').hidden = !e.target.checked; });
    f.addEventListener('input', (e) => e.target.classList && e.target.classList.remove('invalid'));
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = m.el.querySelector('#poName'), contact = m.el.querySelector('#poContact');
      const bad = [name, contact].filter((x) => !x.value.trim());
      if (bad.length) { bad.forEach((x) => x.classList.add('invalid')); bad[0].focus(); return; }
      const gift = m.el.querySelector('#poGift').checked, giftTo = m.el.querySelector('#poGiftTo').value.trim();
      const feat = features().find((x) => x.id === feature);
      const text = [
        `Hi Iris! I’d like ${(P.name || 'premium access').toLowerCase()} on your site ✨`,
        `Plan: ${p.title} (${days(p.days)}) — ${fmt.money(p.price)}`,
        `Name: ${name.value.trim()}`,
        `Contact: ${contact.value.trim()}`,
        gift ? `It’s a gift${giftTo ? ' for: ' + giftTo : ''}` : '',
        feat ? `Interested in: ${feat.title.toLowerCase()}` : '',
      ].filter(Boolean).join('\n');
      m.close();
      sendDialog(text);
    });
  }
  /** Куда отправить заявку: Telegram / WhatsApp / почта Алики или скопировать текст. */
  function sendDialog(text) {
    const c = SITE.contacts || {};
    const btns = [];
    if (c.telegram) btns.push(`<button class="btn btn-primary btn-block" type="button" data-send="tg">${icon('telegram')} Send via Telegram</button>`);
    if (c.whatsapp) btns.push(`<a class="btn btn-ghost btn-block" target="_blank" rel="noopener" href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}">${icon('whatsapp')} Send via WhatsApp</a>`);
    if (c.email) btns.push(`<a class="btn btn-ghost btn-block" href="mailto:${esc(c.email)}?subject=${encodeURIComponent(P.name || 'Premium access')}&body=${encodeURIComponent(text)}">${icon('mail')} Send by email</a>`);
    const m = UI.modal(`<h3>Almost done ✨</h3>
      <p class="muted">Your request is already written — just send it to Iris.</p>
      <pre class="pw-text">${esc(text)}</pre>
      <div class="pw-send">${btns.join('')}<button class="btn btn-gold btn-block" type="button" data-send="copy">${icon('copy')} Copy text</button></div>
      ${c.telegram ? '<p class="tiny muted" style="margin:10px 0 0">For Telegram, the text is copied automatically — a chat with Iris opens and you just paste it.</p>' : ''}`);
    m.el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-send]'); if (!b) return;
      if (b.dataset.send === 'copy') { if (await UI.copyText(text)) UI.toast('Request text copied', 'check'); return; }
      await UI.copyText(text);
      UI.toast('Text copied — paste it into the chat', 'check');
      UI.goal('telegram');
      window.open('https://t.me/' + c.telegram.replace(/^@/, ''), '_blank', 'noopener');
    });
  }
  function codeDialog() {
    const m = UI.modal(`
      <h3>${icon('key')} Access code</h3>
      <p class="muted small">Paste the link from Iris’s message (or just the code) — the premium sections will unlock on this device.</p>
      <form class="form" novalidate>
        <div class="field"><label for="pcCode">Link or code</label><textarea class="textarea" id="pcCode" rows="3" spellcheck="false" autocomplete="off" placeholder="https://…/premium.html#k=…"></textarea></div>
        <p class="lock-err small" role="alert"></p>
        <button class="btn btn-primary btn-block" type="submit">${icon('lock-open')} Unlock access</button>
      </form>`);
    const ta = m.el.querySelector('#pcCode'), err = m.el.querySelector('.lock-err'), btn = m.el.querySelector('[type=submit]');
    ta.addEventListener('input', () => { err.textContent = ''; ta.classList.remove('invalid'); });
    m.el.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = extract(ta.value);
      if (!code) { err.textContent = WHY.format(); ta.classList.add('invalid'); ta.focus(); return; }
      btn.disabled = true;
      const r = await activate(code);
      btn.disabled = false;
      if (r.ok) { m.close(); welcome(r.info); return; }
      err.textContent = whyText(r);
      if (r.why === 'notyet') { setTimeout(() => m.close(), 2200); return; }
      ta.classList.add('invalid');
    });
  }
  function welcome(info) {
    UI.modal(`<div class="center pw-welcome">${crown()}<h3>${info.name ? esc(info.name) + ', your access is open' : 'Access unlocked'} ✨</h3>
        <p class="muted">${esc(P.name || 'Premium access')} valid until ${fmt.date(dateOf(info.to))}, inclusive. Everything opens by itself — just use the site.</p></div>
      <div class="pw-links">${features().map((x) => `<a class="pw-link" href="${esc(x.href)}">${icon(x.icon)}<span>${esc(x.title)}</span>${icon('arrow')}</a>`).join('')}</div>
      <p class="tiny muted center" style="margin:14px 0 0">Keep the message with your link: it unlocks access on another phone or computer too.</p>`);
  }
  function linkFailed(r) {
    const m = UI.modal(`<h3>${icon('key')} Access link</h3><p class="notice">${icon('info')}<span>${esc(whyText(r))}</span></p>
      ${r.why === 'expired' ? planCards() : ''}`, { wide: r.why === 'expired' });
    return m;
  }

  // ---------- шапка и напоминание ----------
  function decorate() {
    const s = state, on = isOpen(s);
    document.querySelectorAll('[data-premium-link]').forEach((a) => {
      a.classList.toggle('on', on);
      a.title = s && s.kind === 'active' ? `Premium access until ${fmt.date(dateOf(s.info.to))}` : s && s.kind === 'alina' ? 'Everything is open to Iris' : '';
    });
    // скоро закончится — мягкое напоминание раз в день
    if (s && s.kind === 'active') {
      const left = s.info.to - todayNum();
      let seen = null; try { seen = localStorage.getItem('am_premiumWarn'); } catch (e) { /* нет */ }
      if (left <= 3 && seen !== String(todayNum())) {
        try { localStorage.setItem('am_premiumWarn', String(todayNum())); } catch (e) { /* нет */ }
        setTimeout(() => UI.toast(left === 0 ? 'Your premium access ends today — you can extend it on the “Premium” page' : `Your premium access ends in ${days(left)} — you can extend it on the “Premium” page`, 'hourglass'), 1600);
      }
    }
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-plan], [data-pw="code"]');
    if (!t) return;
    e.preventDefault();
    if (t.dataset.plan) { const box = t.closest('[data-paywall]'); order(t.dataset.plan, box && box.dataset.paywall); } else codeDialog();
  });
  window.addEventListener('hashchange', async () => {
    const m = /(?:^#|&)k=([A-Za-z0-9_-]+)/.exec(location.hash);
    if (!m) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* нет */ }
    const r = await activate(m[1]);
    if (r.ok) welcome(r.info); else linkFailed(r);
  });
  const boot = async () => {
    const s = await ready();
    decorate();
    if (linkResult) { const r = linkResult; linkResult = null; if (r.ok) welcome(r.info); else if (!(s.kind === 'alina')) linkFailed(r); document.dispatchEvent(new CustomEvent('premiumchange', { detail: s })); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.Premium = {
    ready, refresh, ensure, contentKey, check, parse, activate, extract, revoked: revokedIds, isOpen: () => isOpen(state), state: () => state,
    paywall, planCards, chip, locked, order, codeDialog, sendDialog, welcome, idText, dateOf, dayOf, todayNum, b64urlEncode, PLAN_NAMES, PLAN_BY_CODE, whyText,
  };
})();
