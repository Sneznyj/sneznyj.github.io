/* Лендинг студии: тема, шапка при прокрутке, меню языков, видео-превью работ, бриф (письмо или копия), подсказка о версии на языке посетителя. */
(function () {
  'use strict';
  const doc = document.documentElement, body = document.body;
  const lang = body.dataset.lang || 'en';
  const ru = lang === 'ru';
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

  // ---------- меню языков: закрыть щелчком мимо и по Esc ----------
  const lng = document.querySelector('.lng');
  if (lng) {
    document.addEventListener('click', (e) => { if (lng.open && !lng.contains(e.target)) lng.open = false; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lng.open) { lng.open = false; lng.querySelector('summary').focus(); } });
  }

  // ---------- видео-превью работ: файл грузится и играет, пока ролик на экране; кнопка — пауза и пуск ----------
  // при «уменьшить движение» и экономии трафика сам не запускается — только по кнопке
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || !!(navigator.connection && navigator.connection.saveData);
  const vids = [...document.querySelectorAll('.vid')];
  const load = (v) => { if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src; };
  const mark = (box, on) => { const b = box.querySelector('.vid-btn'); box.classList.toggle('paused', !on); b.setAttribute('aria-label', on ? b.dataset.pause : b.dataset.play); };
  vids.forEach((box) => {
    const v = box.querySelector('video');
    mark(box, false);
    box.querySelector('.vid-btn').addEventListener('click', () => {
      if (v.paused) { box.dataset.user = ''; load(v); v.play().catch(() => { /* браузер не дал */ }); } else { box.dataset.user = 'paused'; v.pause(); }
    });
    v.addEventListener('play', () => mark(box, true));
    v.addEventListener('pause', () => mark(box, false));
  });
  if (!still && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      const v = e.target.querySelector('video');
      if (e.isIntersecting) { if (e.target.dataset.user !== 'paused') { load(v); v.play().catch(() => { /* браузер не дал */ }); } } else if (!v.paused) v.pause();
    }), { threshold: 0.35 });
    vids.forEach((box) => io.observe(box));
  }
  // ролики: одновременно играет только один
  document.addEventListener('play', (e) => {
    if (e.target.closest && e.target.closest('.reels')) document.querySelectorAll('.reels video').forEach((v) => { if (v !== e.target) v.pause(); });
  }, true);

  // ---------- кнопка тарифа → бриф с выбранным пакетом ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-plan]');
    if (!a) return;
    const sel = document.querySelector('#briefForm [name=plan]');
    if (sel) [...sel.options].forEach((o) => { if (o.text === a.dataset.plan) sel.value = o.value; });
  });

  // ---------- бриф (подписи в письме — по-русски или по-английски: письмо читает студия) ----------
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

  // ---------- версия на языке посетителя: мягкая подсказка на его языке, без автоматического перехода ----------
  const HINT = {
    en: ['This page is also in <a>English</a>.', 'Close'],
    ru: ['Есть <a>версия на русском</a>.', 'Закрыть'],
    de: ['Diese Seite gibt es auch <a>auf Deutsch</a>.', 'Schließen'],
    es: ['Esta página también está <a>en español</a>.', 'Cerrar'],
    fr: ['Cette page existe aussi <a>en français</a>.', 'Fermer'],
    it: ['Questa pagina è disponibile anche <a>in italiano</a>.', 'Chiudi'],
    pt: ['Esta página também está disponível <a>em português</a>.', 'Fechar'],
    tr: ['Bu sayfanın <a>Türkçe</a> sürümü de var.', 'Kapat'],
  };
  const want = (navigator.languages || [navigator.language || '']).map((x) => String(x).toLowerCase().split('-')[0]).map((x) => (/^(uk|be|kk)$/.test(x) ? 'ru' : x));
  const pick = want.find((x) => HINT[x]);
  const alt = pick && pick !== lang && document.querySelector(`.lng-menu a[hreflang="${pick}"]`);
  if (alt && store.get('nv_lang_hint') !== '1') {
    const box = document.createElement('div');
    box.className = 'lang-hint'; box.setAttribute('role', 'note'); box.lang = pick;
    const span = document.createElement('span'); span.innerHTML = HINT[pick][0];
    const a = span.querySelector('a'); a.href = alt.getAttribute('href'); a.hreflang = pick;
    const x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', HINT[pick][1]); x.textContent = '×';
    x.addEventListener('click', () => { store.set('nv_lang_hint', '1'); box.remove(); });
    box.append(span, x); document.body.appendChild(box);
  }
})();
