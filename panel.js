/* panel.js — 注入式悬浮面板 UI */
(function () {
  'use strict';

  const t = (k, v) => window.WBS_I18N.t(k, v);
  let root = null;
  const handlers = {};
  const els = {};

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function btn(id, label, cls) {
    const b = el('button', 'wbs-btn' + (cls ? ' ' + cls : ''), label);
    b.id = 'wbs-' + id;
    b.addEventListener('click', () => handlers[id] && handlers[id]());
    return b;
  }

  function numInput(id, value, min, max, step) {
    const i = document.createElement('input');
    i.type = 'number';
    i.id = 'wbs-set-' + id;
    i.value = value;
    i.min = min; i.max = max;
    if (step) i.step = step;
    return i;
  }

  function build() {
    if (root) return root;

    root = el('div');
    root.id = 'wbs-panel';

    // header
    const header = el('div', 'wbs-header');
    const title = el('span', 'wbs-title', t('panelTitle'));
    els.mode = el('span', 'wbs-badge-mode', t('modeSubscribe'));
    const gear = el('button', 'wbs-icon-btn', '⚙');
    gear.title = t('settings');
    gear.addEventListener('click', () => els.settings.classList.toggle('wbs-open'));
    const logExp = el('button', 'wbs-icon-btn', '⇩');
    logExp.title = t('exportLog');
    logExp.addEventListener('click', () => handlers['exportLog'] && handlers['exportLog']());
    const logTgl = el('button', 'wbs-icon-btn', '≡');
    logTgl.title = t('log');
    logTgl.addEventListener('click', () => els.log.classList.toggle('wbs-open'));
    const collapse = el('button', 'wbs-icon-btn', '—');
    collapse.title = t('collapse');
    collapse.addEventListener('click', () => {
      const collapsed = root.classList.toggle('wbs-collapsed');
      collapse.textContent = collapsed ? '□' : '—';
    });
    header.append(title, els.mode, logExp, logTgl, gear, collapse);

    // body
    const body = el('div', 'wbs-body');
    const statusLine = el('div', 'wbs-status-line');
    els.status = el('span', 'wbs-status', t('statusIdle'));
    els.found = el('span', '', '');
    statusLine.append(els.status, els.found);

    const track = el('div', 'wbs-progress-track');
    els.fill = el('div', 'wbs-progress-fill');
    track.appendChild(els.fill);

    const row1 = el('div', 'wbs-btn-row');
    els.subPage = btn('subscribePage', t('subscribePage'), 'wbs-btn-green');
    els.subPages = btn('subscribePages', t('subscribePages'));
    els.unsub = btn('unsubscribePage', t('unsubscribePage'), 'wbs-btn-red');
    row1.append(els.subPage, els.subPages, els.unsub);

    const row2 = el('div', 'wbs-btn-row');
    els.pause = btn('pause', t('pause'));
    els.cancel = btn('cancel', t('cancel'));
    els.retry = btn('retryFailed', t('retryFailed'));
    row2.append(els.pause, els.cancel, els.retry);

    els.log = el('div', 'wbs-log');

    els.settings = el('div', 'wbs-settings');
    body.append(statusLine, track, row1, row2, els.log, els.settings);

    const footer = el('div', 'wbs-footer', t('disclaimer'));

    root.append(header, body, footer);
    document.body.appendChild(root);
    setRunning(false);
    return root;
  }

  function setRunning(running) {
    els.subPage.disabled = running;
    els.subPages.disabled = running;
    els.unsub.disabled = running;
    els.pause.disabled = !running;
    els.cancel.disabled = !running;
    els.retry.disabled = running;
  }

  window.WBS_Panel = {
    mount() { build(); },
    on(action, cb) { handlers[action] = cb; },
    setFound(n) {
      els.found.textContent = n > 0 ? `${n} ${t('itemsFound')}` : t('noItems');
    },
    setStatus(key, vars, warn) {
      els.status.textContent = t(key, vars);
      els.status.classList.toggle('wbs-warn', !!warn);
    },
    setProgress(done, total) {
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      els.fill.style.width = pct + '%';
    },
    setMode(mode) {
      els.mode.textContent = t(mode === 'unsubscribe' ? 'modeUnsubscribe' : 'modeSubscribe');
      els.mode.classList.toggle('wbs-mode-unsub', mode === 'unsubscribe');
    },
    setPauseLabel(paused) {
      els.pause.textContent = paused ? t('resume') : t('pause');
    },
    log(msg, cls, ts) {
      const d = new Date(ts || Date.now());
      const p = (n) => String(n).padStart(2, '0');
      const stamp = `[${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}]`;
      const line = el('div', cls ? 'wbs-log-' + cls : '');
      line.append(el('span', 'wbs-log-ts', stamp), document.createTextNode(' ' + msg));
      els.log.appendChild(line);
      while (els.log.children.length > 200) els.log.removeChild(els.log.firstChild);
      els.log.scrollTop = els.log.scrollHeight;
    },
    restoreLogs(entries) {
      for (const e of entries) this.log(e.msg, e.cls, e.ts);
    },
    clearLog() { els.log.innerHTML = ''; },
    renderSettings(s, onSave) {
      els.settings.innerHTML = '';
      const rows = [
        ['delayMin', t('settingDelay') + ' (min)', s.delayMin, 1, 30, 0.5],
        ['delayMax', t('settingDelay') + ' (max)', s.delayMax, 1, 60, 0.5],
        ['batchSize', t('settingBatch'), s.batchSize, 1, 50, 1],
        ['cooldownMin', t('settingCooldown') + ' (min)', s.cooldownMin, 5, 300, 1],
        ['cooldownMax', t('settingCooldown') + ' (max)', s.cooldownMax, 5, 600, 1],
        ['maxRetries', t('settingRetry'), s.maxRetries, 0, 10, 1],
        ['maxPages', t('settingMaxPages'), s.maxPages, 1, 100, 1]
      ];
      for (const [id, label, val, min, max, step] of rows) {
        const l = document.createElement('label');
        l.append(el('span', '', label), numInput(id, val, min, max, step));
        els.settings.appendChild(l);
      }
      const save = el('button', 'wbs-btn', t('save'));
      save.addEventListener('click', () => {
        const next = {};
        for (const [id] of rows) {
          next[id] = parseFloat(document.getElementById('wbs-set-' + id).value);
        }
        onSave(next);
        save.textContent = t('saved');
        setTimeout(() => { save.textContent = t('save'); }, 1200);
      });
      els.settings.appendChild(save);
    },
    setRunning
  };
})();
