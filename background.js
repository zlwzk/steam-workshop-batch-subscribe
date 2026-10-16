/* background.js — action 角标 + 登录态/会话 Cookie 查询（HttpOnly 也可读） */
'use strict';

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'wbs:badge') {
    const text = msg.text || '';
    chrome.action.setBadgeText({ text });
    if (text) {
      chrome.action.setBadgeBackgroundColor({ color: msg.color || '#5c7e10' });
    }
    return;
  }

  // steamLoginSecure 是 HttpOnly Cookie，内容脚本的 document.cookie 读不到，
  // 必须通过 chrome.cookies API 在后台查询。
  if (msg.type === 'wbs:auth') {
    (async () => {
      try {
        const [login, sess] = await Promise.all([
          chrome.cookies.get({ url: 'https://steamcommunity.com', name: 'steamLoginSecure' }),
          chrome.cookies.get({ url: 'https://steamcommunity.com', name: 'sessionid' })
        ]);
        sendResponse({
          loggedIn: !!(login && login.value),
          sessionId: sess && sess.value ? sess.value : null
        });
      } catch (e) {
        sendResponse({ loggedIn: null, sessionId: null, error: String(e) });
      }
    })();
    return true; // 异步 sendResponse
  }
});
