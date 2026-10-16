/* background.js — 仅负责 action 角标 */
'use strict';

chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || msg.type !== 'wbs:badge') return;
  const text = msg.text || '';
  chrome.action.setBadgeText({ text });
  if (text) {
    chrome.action.setBadgeBackgroundColor({ color: msg.color || '#5c7e10' });
  }
});
