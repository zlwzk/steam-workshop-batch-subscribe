/* content.js — 扫描、队列引擎、拟人节奏、跨页恢复 */
(function () {
  'use strict';

  const t = (k, v) => window.WBS_I18N.t(k, v);
  const Panel = window.WBS_Panel;

  const DEFAULT_SETTINGS = {
    delayMin: 2.5,
    delayMax: 5,
    batchSize: 10,
    cooldownMin: 20,
    cooldownMax: 45,
    maxRetries: 3
  };

  const JOB_KEY = 'wbs_job';
  const SETTINGS_KEY = 'wbs_settings';

  const state = {
    running: false,
    paused: false,
    cancelled: false,
    mode: 'subscribe',
    queue: [],
    total: 0,
    done: 0,
    ok: 0,
    fail: 0,
    pagesLeft: 0,
    settings: { ...DEFAULT_SETTINGS }
  };

  /* ---------- 工具 ---------- */

  const rand = (min, max) => min + Math.random() * (max - min);

  function sleep(ms) {
    // 每 200ms 检查一次暂停/取消标志
    return new Promise((resolve) => {
      let waited = 0;
      const tick = () => {
        if (state.cancelled) return resolve(false);
        if (state.paused) return setTimeout(tick, 300);
        waited += 200;
        if (waited >= ms) return resolve(true);
        setTimeout(tick, 200);
      };
      tick();
    });
  }

  function getCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return m ? m[1] : null;
  }

  const isLoggedIn = () => !!getCookie('steamLoginSecure');
  const getSessionId = () => getCookie('sessionid');

  function getAppId() {
    const m = location.search.match(/[?&]appid=(\d+)/);
    return m ? m[1] : null;
  }

  function getPageNo() {
    const m = location.search.match(/[?&]p=(\d+)/);
    return m ? parseInt(m[1], 10) : 1;
  }

  function buildPageUrl(p) {
    const url = new URL(location.href);
    url.searchParams.set('p', String(p));
    return url.toString();
  }

  /* ---------- 页面扫描 ---------- */

  function scanItems() {
    const seen = new Set();
    const items = [];
    for (const a of document.querySelectorAll('a[href*="sharedfiles/filedetails/?id="]')) {
      const m = a.href.match(/filedetails\/\?id=(\d+)/);
      if (!m) continue;
      const id = m[1];
      if (seen.has(id)) continue;
      seen.add(id);
      const img = a.querySelector('img');
      const title = (img && img.alt) || a.textContent.trim() || id;
      items.push({ id, title, tries: 0 });
    }
    return items;
  }

  /* ---------- 订阅请求 ---------- */

  async function callSteam(id) {
    const endpoint = state.mode === 'unsubscribe'
      ? 'https://steamcommunity.com/sharedfiles/unsubscribe'
      : 'https://steamcommunity.com/sharedfiles/subscribe';
    const resp = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams({
        id,
        appid: getAppId(),
        sessionid: getSessionId()
      }).toString()
    });
    if (resp.redirected && /login/i.test(resp.url)) {
      const e = new Error('auth');
      e.auth = true;
      throw e;
    }
    if (resp.status === 429 || resp.status >= 500) {
      const e = new Error('http ' + resp.status);
      e.status = resp.status;
      e.retryAfter = parseInt(resp.headers.get('Retry-After') || '0', 10);
      throw e;
    }
    return resp.ok;
  }

  async function callWithRetries(item) {
    const max = state.settings.maxRetries;
    for (let attempt = 1; attempt <= max + 1; attempt++) {
      try {
        return await callSteam(item.id);
      } catch (e) {
        if (e.auth) {
          Panel.log(t('notLoggedIn'), 'fail');
          Panel.setStatus('statusBackoff', null, true);
          state.cancelled = true;
          return false;
        }
        if (attempt > max) return false;
        let waitSec = e.retryAfter > 0 ? Math.min(e.retryAfter, 300) : Math.pow(2, attempt) * 5;
        Panel.setStatus('statusBackoff', null, true);
        Panel.log(t('waitingRetry', { s: waitSec, n: attempt }), 'info');
        const cont = await sleep(waitSec * 1000);
        if (!cont) return false;
      }
    }
    return false;
  }

  /* ---------- 队列引擎 ---------- */

  function updateBadge() {
    const remaining = state.total - state.done;
    chrome.runtime.sendMessage({
      type: 'wbs:badge',
      text: state.running && remaining > 0 ? String(remaining) : '',
      color: state.mode === 'unsubscribe' ? '#c25050' : '#5c7e10'
    }).catch(() => {});
  }

  function refreshPanel() {
    Panel.setProgress(state.done, state.total);
    updateBadge();
  }

  async function runQueue() {
    state.running = true;
    state.cancelled = false;
    state.paused = false;
    Panel.setRunning(true);
    Panel.setPauseLabel(false);
    Panel.setMode(state.mode);
    Panel.setStatus('statusRunning');
    refreshPanel();

    const s = state.settings;
    let sinceBatch = 0;

    for (let i = 0; i < state.queue.length; i++) {
      if (state.cancelled) break;
      const item = state.queue[i];

      // 拟人间隔
      const cont = await sleep(rand(s.delayMin, s.delayMax) * 1000);
      if (!cont) break;

      const okItem = await callWithRetries(item);
      if (state.cancelled) break;

      state.done++;
      if (okItem) {
        state.ok++;
        Panel.log(`[${t('itemOk')}] ${item.title}`, 'ok');
      } else {
        state.fail++;
        Panel.log(`[${t('itemFail')}] ${item.title}`, 'fail');
      }
      refreshPanel();

      // 批次冷却
      sinceBatch++;
      if (sinceBatch >= s.batchSize && i < state.queue.length - 1 && !state.cancelled) {
        sinceBatch = 0;
        const cd = Math.round(rand(s.cooldownMin, s.cooldownMax));
        Panel.setStatus('statusCooldown', null, true);
        Panel.log(t('cooldownMsg', { s: cd }), 'info');
        const c = await sleep(cd * 1000);
        if (!c) break;
        Panel.setStatus('statusRunning');
      }
    }

    // 跨页
    if (!state.cancelled && state.pagesLeft > 1) {
      await saveJob();
      const next = getPageNo() + 1;
      Panel.log(t('nextPage', { p: next }), 'info');
      location.href = buildPageUrl(next);
      return; // 页面即将卸载
    }

    finish(state.cancelled ? 'statusCancelled' : 'statusDone');
  }

  function finish(statusKey) {
    state.running = false;
    Panel.setRunning(false);
    Panel.setStatus(statusKey);
    Panel.log(t('doneSummary', { ok: state.ok, fail: state.fail }), state.fail > 0 ? 'info' : 'ok');
    Panel.setProgress(state.done, state.total || 1);
    updateBadge();
    clearJob();
  }

  /* ---------- 跨页任务持久化 ---------- */

  async function saveJob() {
    const job = {
      active: true,
      mode: state.mode,
      pagesLeft: state.pagesLeft - 1,
      ok: state.ok,
      fail: state.fail
    };
    await chrome.storage.local.set({ [JOB_KEY]: job });
  }

  async function clearJob() {
    await chrome.storage.local.remove(JOB_KEY);
  }

  async function resumeJobIfAny() {
    const data = await chrome.storage.local.get(JOB_KEY);
    const job = data[JOB_KEY];
    if (!job || !job.active) return;
    if (!isLoggedIn()) {
      Panel.log(t('notLoggedIn'), 'fail');
      await clearJob();
      return;
    }
    const items = scanItems();
    if (items.length === 0) {
      Panel.log(t('noItems'), 'fail');
      await clearJob();
      return;
    }
    Panel.log(t('nextPage', { p: getPageNo() }), 'info');
    state.mode = job.mode;
    state.pagesLeft = job.pagesLeft;
    state.ok = job.ok;
    state.fail = job.fail;
    startQueue(items, job.pagesLeft);
  }

  /* ---------- 启动入口 ---------- */

  function startQueue(items, pagesLeft) {
    state.queue = items;
    state.total = items.length;
    state.done = 0;
    state.pagesLeft = pagesLeft || 1;
    runQueue();
  }

  function guardStart(mode, pagesLeft) {
    if (!isLoggedIn()) {
      Panel.log(t('notLoggedIn'), 'fail');
      Panel.setStatus('statusIdle');
      return;
    }
    const items = scanItems();
    if (items.length === 0) {
      Panel.log(t('noItems'), 'fail');
      return;
    }
    state.mode = mode;
    state.ok = 0;
    state.fail = 0;
    startQueue(items, pagesLeft || 1);
  }

  /* ---------- 设置 ---------- */

  async function loadSettings() {
    const data = await chrome.storage.local.get(SETTINGS_KEY);
    state.settings = { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
    Panel.renderSettings(state.settings, async (next) => {
      // 基本校正
      if (next.delayMax < next.delayMin) next.delayMax = next.delayMin;
      if (next.cooldownMax < next.cooldownMin) next.cooldownMax = next.cooldownMin;
      state.settings = { ...state.settings, ...next };
      await chrome.storage.local.set({ [SETTINGS_KEY]: state.settings });
    });
  }

  /* ---------- 初始化 ---------- */

  function init() {
    Panel.mount();
    Panel.setFound(scanItems().length);

    Panel.on('subscribePage', () => guardStart('subscribe', 1));
    Panel.on('subscribePages', () => {
      const input = window.prompt(t('pagesPrompt'), '3');
      if (input == null) return;
      const n = Math.max(1, Math.min(20, parseInt(input, 10) || 1));
      guardStart('subscribe', n);
    });
    Panel.on('unsubscribePage', () => {
      if (!window.confirm(t('unsubConfirm'))) return;
      guardStart('unsubscribe', 1);
    });
    Panel.on('pause', () => {
      if (!state.running) return;
      state.paused = !state.paused;
      Panel.setPauseLabel(state.paused);
      Panel.setStatus(state.paused ? 'statusPaused' : 'statusRunning');
    });
    Panel.on('cancel', () => {
      state.cancelled = true;
      state.paused = false;
    });
    Panel.on('retryFailed', () => {
      // 简化：重扫本页再跑一轮（Steam 侧幂等，已成功的不会产生副作用）
      guardStart(state.mode, 1);
    });

    loadSettings().then(resumeJobIfAny);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
