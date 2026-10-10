/* Лендинг студии: тема, шапка при прокрутке, бриф (письмо или копия), подсказка о версии на другом языке. */
(function () {
  'use strict';
  const doc = document.documentElement, body = document.body;
  const ru = body.dataset.lang === 'ru';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* без памяти браузера */ } },
  };

  // ---------- тема ----------
  const dark = () => (doc.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  const themeBtn = document.querySelector('.theme');
  if (themeBtn) themeBtn.addEventListener('click', () => { const t = dark() ? 'light' : 'dark'; doc.setAttribute('data-theme', t); store.set('nv_theme', t); });

  // ---------- шапка ----------
  const top = document.querySelector('.top');
  const onScroll = () => top && top.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- кнопка тарифа → бриф с выбранным пакетом ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-plan]');
    if (!a) return;
    const sel = document.querySelector('#briefForm [name=plan]');
    if (sel) [...sel.options].forEach((o) => { if (o.text === a.dataset.plan) sel.value = o.value; });
  });

  // ---------- бриф ----------
  const form = document.getElementById('briefForm');
  if (form) {
    const status = form.querySelector('.status');
    const email = body.dataset.email;
    const L = ru
      ? { name: 'Имя', email: 'Почта', field: 'Чем занимаюсь', site: 'Сайт', needs: 'Нужно', plan: 'Пакет', when: 'Запуск', msg: 'Ещё' }
      : { name: 'Name', email: 'Email', field: 'What I do', site: 'Website', needs: 'Needs', plan: 'Package', when: 'Launch', msg: 'Notes' };
    const text = () => {
      const f = new FormData(form), g = (k) => String(f.get(k) || '').trim();
      const needs = f.getAll('needs').join(', ');
      return [
        `${L.name}: ${g('name')}`, `${L.email}: ${g('email')}`,
        g('field') && `${L.field}: ${g('field')}`, g('site') && `${L.site}: ${g('site')}`,
        needs && `${L.needs}: ${needs}`, `${L.plan}: ${g('plan')}`, `${L.when}: ${g('when')}`,
        g('msg') && `\n${L.msg}:\n${g('msg')}`,
        `\n— ${location.href.split('#')[0]}`,
      ].filter(Boolean).join('\n');
    };
    const valid = () => {
      const n = form.elements.name, m = form.elements.email;
      const okN = !!n.value.trim(), okM = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value.trim());
      n.classList.toggle('invalid', !okN); m.classList.toggle('invalid', !okM);
      if (!okN || !okM) { status.textContent = form.dataset.need; (okN ? m : n).focus(); return false; }
      status.textContent = ''; return true;
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!valid()) return;
      const subject = form.dataset.subject.replace('{who}', form.elements.name.value.trim());
      location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text())}`;
      if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: 'brief-mailto', event: true });
      const mid = +body.dataset.metrika; if (window.ym && mid) { try { window.ym(mid, 'reachGoal', 'brief'); } catch (er) { /* без счётчика */ } }
    });
    document.getElementById('briefCopy').addEventListener('click', async () => {
      if (!valid()) return;
      try { await navigator.clipboard.writeText(text()); status.textContent = form.dataset.copied; }
      catch (er) {
        const ta = document.createElement('textarea'); ta.value = text(); document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); status.textContent = form.dataset.copied; } catch (e2) { status.textContent = email; }
        ta.remove();
      }
    });
    form.addEventListener('input', (e) => e.target.classList.remove('invalid'));
  }

  // ---------- версия на языке посетителя: мягкая подсказка, без автоматического перехода ----------
  const want = (navigator.languages || [navigator.language || '']).map((x) => String(x).toLowerCase());
  const prefersRu = want.some((x) => /^(ru|uk|be|kk)\b/.test(x)), prefersEn = !prefersRu;
  if (store.get('nv_lang_hint') !== '1' && ((!ru && prefersRu) || (ru && prefersEn && want[0] && !/^ru/.test(want[0])))) {
    const alt = document.querySelector('.lang');
    if (alt) {
      const box = document.createElement('div');
      box.className = 'lang-hint'; box.setAttribute('role', 'note');
      box.innerHTML = ru ? `<span>This page is also in <a href="${alt.getAttribute('href')}" hreflang="en">English</a>.</span>` : `<span>Есть <a href="${alt.getAttribute('href')}" hreflang="ru">версия на русском</a>.</span>`;
      const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', ru ? 'Close' : 'Закрыть'); x.textContent = '×';
      x.addEventListener('click', () => { store.set('nv_lang_hint', '1'); box.remove(); });
      box.appendChild(x); document.body.appendChild(box);
    }
  }
})();
