/* Демо-сервер в браузере: ящик заявок и облако кабинета без настоящего сервера.
   Перехватывает запросы к SITE.api.url (в демо — https://demo-inbox.local) и отвечает так же, как server/core.mjs:
     POST /v1/inbox {v,kid,epk,iv,ct,hp} → 201 {ok,id}     GET /v1/inbox → {items:[{id,at,body}]}
     DELETE /v1/inbox/:id → {ok}    GET /v1/count → {inbox}
     GET /v1/vault → {ver,at,body}  PUT /v1/vault {body} + If-Match → {ok,ver} | 409 {ver,at,body}
   Анкета шифруется в браузере так же, как на живом сайте, и лежит в localStorage этого посетителя —
   никуда не уходит. Подключается сразу после content.js и только при SITE.demo.enabled. */
(function () {
  'use strict';
  const SITE = window.SITE || {};
  if (!SITE.demo || !SITE.demo.enabled || !SITE.api || !SITE.api.url || !window.fetch) return;
  const BASE = String(SITE.api.url).replace(/\/+$/, '');
  const K_IN = 'demo_inbox', K_VAULT = 'demo_vault';
  const mem = {};
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return k in mem ? mem[k] : d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { mem[k] = v; } };
  const json = (obj, status, headers) => new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}) });
  const rid = () => { const a = new Uint8Array(9); crypto.getRandomValues(a); return Array.from(a, (x) => x.toString(16).padStart(2, '0')).join(''); };

  async function handle(method, path, headers, raw) {
    if (path === '/v1/inbox' && method === 'POST') {
      let b; try { b = JSON.parse(raw || ''); } catch (e) { return json({ error: 'bad_json' }, 400); }
      if (!b || !b.epk || !b.iv || !b.ct) return json({ error: 'bad_request' }, 400);
      if (b.hp) return json({ ok: true, id: rid() }, 201); // ловушка для ботов — как на сервере
      const list = get(K_IN, []);
      const id = rid();
      list.push({ id, at: new Date().toISOString(), body: { v: b.v, kid: b.kid, epk: b.epk, iv: b.iv, ct: b.ct } });
      put(K_IN, list.slice(-60));
      return json({ ok: true, id }, 201);
    }
    if (path === '/v1/inbox' && method === 'GET') return json({ items: get(K_IN, []) });
    const del = /^\/v1\/inbox\/([a-z0-9-]{6,40})$/.exec(path);
    if (del && method === 'DELETE') { put(K_IN, get(K_IN, []).filter((x) => x.id !== del[1])); return json({ ok: true }); }
    if (path === '/v1/count' && method === 'GET') return json({ inbox: get(K_IN, []).length });
    if (path === '/v1/vault' && method === 'GET') {
      const v = get(K_VAULT, null);
      return v ? json(v, 200, { ETag: String(v.ver) }) : json({ ver: 0, at: null, body: null }, 200, { ETag: '0' });
    }
    if (path === '/v1/vault' && method === 'PUT') {
      let b; try { b = JSON.parse(raw || ''); } catch (e) { return json({ error: 'bad_json' }, 400); }
      if (!b || typeof b.body !== 'object' || !b.body) return json({ error: 'bad_request' }, 400);
      const cur = get(K_VAULT, null), want = headers.get('If-Match') || '';
      if (cur ? want !== String(cur.ver) : want !== '*' && want !== '0') return json(cur || { ver: 0 }, 409);
      const ver = (cur ? cur.ver : 0) + 1;
      put(K_VAULT, { ver, at: new Date().toISOString(), body: b.body });
      return json({ ok: true, ver }, 200, { ETag: String(ver) });
    }
    return json({ error: 'not_found' }, 404);
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    if (!url.startsWith(BASE + '/')) return realFetch(input, init);
    init = init || {};
    const method = String(init.method || (input && input.method) || 'GET').toUpperCase();
    const path = url.slice(BASE.length).split('?')[0];
    const headers = new Headers(init.headers || {});
    // небольшая задержка — как у настоящей сети, чтобы было видно состояния «отправляю…»
    return new Promise((res) => setTimeout(res, 260)).then(() => handle(method, path, headers, init.body));
  };
  window.DemoApi = {
    base: BASE,
    inbox: () => get(K_IN, []),
    reset() { try { localStorage.removeItem(K_IN); localStorage.removeItem(K_VAULT); } catch (e) { delete mem[K_IN]; delete mem[K_VAULT]; } },
  };
})();
