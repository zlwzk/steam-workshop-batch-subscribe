# Workshop Batch Subscribe / Steam 创意工坊批量订阅

[English](#english) | [中文](#中文)

---

## 中文

一键订阅 Steam 创意工坊浏览页全部 Mod 的 Edge / Chrome 扩展（Manifest V3）。复用 Steam 原生订阅接口，配合拟人节奏（随机间隔 + 批次冷却 + 限流退避），避免触发官方频率限制。**所有数据仅保存在本地浏览器，零收集、零上报。**

### 功能

- 一键订阅当前页全部物品（Steam 侧幂等，已订阅不会重复）
- **全部页（自动翻页）**：本页订阅完后自动跳到下一页，直到工坊末页；可在设置中限定自动翻页上限（默认 20 页，可调 1–100）
- 批量退订当前页（红色二次确认）
- 拟人节奏：每项随机间隔、每批自动冷却、429/5xx 自动指数退避（尊重 `Retry-After`）
- 暂停 / 继续 / 取消，**失败项精准重试**（只重跑失败的物品，不再整页重扫）
- **操作日志**：每条带时间戳，跨翻页持久保留，可一键导出为 txt
- 登录状态自动识别（通过浏览器 Cookie 接口读取登录态，不接触账号密码）
- Steam 原生深色风格悬浮面板，可折叠，中英双语自动切换
- 任务进度角标；换游戏/换筛选时自动丢弃旧任务，防止串页

### 安装（Edge / Chrome）

1. 下载本仓库（或 Release 中的 zip 并解压）
2. 打开 `edge://extensions/`（Chrome 为 `chrome://extensions/`），开启「开发人员模式」
3. 点击「加载解压缩的扩展」，选择本文件夹
4. 打开任意创意工坊浏览页（如 `steamcommunity.com/workshop/browse/?appid=730`），右下角会出现「批量订阅」面板
5. 面板日志出现「已检测到 Steam 登录」即表示登录态识别正常；若提示未登录，请先在浏览器登录 Steam

### 使用

- **订阅本页全部**：只处理当前页
- **全部页（自动翻页）**：自动逐页处理直到末页；翻页中途不要手动切换到其他工坊页面
- **退订本页全部**：退订当前页所有物品（需确认）
- **≡** 展开/收起日志，**⇩** 导出日志，**—** 折叠面板，**⚙** 打开设置
- 设置项：每项间隔、每批数量、批次冷却、单项重试次数、自动翻页上限。默认值已按保守策略配置，**请勿把间隔调得过短**

### 权限说明

- `storage`：保存设置、跨页任务状态、日志（仅本地）
- `cookies`：读取 Steam 登录 Cookie 判断是否已登录。`steamLoginSecure` 是 HttpOnly Cookie，页面脚本无法直接读取，必须通过浏览器 Cookie 接口查询；不会读取或上传任何账号凭据
- `host_permissions: steamcommunity.com`：仅与 Steam 官方域名通信

### 隐私

- 无远程代码、无统计、无第三方请求（仅与 steamcommunity.com 同源通信）
- 不读取账号密码，仅使用浏览器中已存在的 Steam 会话
- 设置、任务状态、日志仅存于 `chrome.storage.local`

### 免责声明

仅供个人合理使用。批量操作创意工坊可能违反 Steam 服务条款，默认速率已按保守策略设置，请勿调得过快。使用本扩展产生的一切后果由使用者自行承担。

---

## English

A Manifest V3 Edge / Chrome extension to subscribe to all Steam Workshop items on a browse page with one click. It reuses Steam's own subscribe endpoint with human-like pacing (random delays, batch cooldowns, backoff on rate limits) to stay under official thresholds. **All data stays in your browser. No collection, no telemetry.**

### Features

- One-click subscribe to all items on the current page (idempotent on Steam's side)
- **All Pages (auto page-turn)**: finishes a page and automatically moves to the next, until the workshop's last page; a configurable cap (default 20, range 1–100) prevents runaway runs
- Batch unsubscribe (with confirmation)
- Human-like pacing: random per-item delay, batch cooldown, exponential backoff honoring `Retry-After` on 429/5xx
- Pause / resume / cancel, and **targeted retry** that re-runs only failed items
- **Timestamped operation log**, persisted across page turns, exportable to a txt file
- Automatic login detection via the browser cookie API (never touches your password)
- Steam-native dark floating panel, collapsible, auto EN/中文
- Badge progress counter; stale cross-page jobs are discarded when you switch games/filters

### Install (Edge / Chrome)

1. Download this repo (or unzip the Release package)
2. Open `edge://extensions/` (or `chrome://extensions/`), enable **Developer mode**
3. Click **Load unpacked**, select this folder
4. Open any Workshop browse page (e.g. `steamcommunity.com/workshop/browse/?appid=730`) — the panel appears at the bottom-right
5. "Steam login detected" in the log means auth works; if it says not logged in, sign in to Steam first

### Permissions

- `storage`: settings, cross-page job state, logs (local only)
- `cookies`: reads the Steam login cookie to detect login state. `steamLoginSecure` is HttpOnly and can only be queried through the browser cookie API — credentials are never read or uploaded
- `host_permissions: steamcommunity.com`: talks only to official Steam domains

### Privacy

- No remote code, no analytics, no third-party requests (same-origin with steamcommunity.com only)
- Never touches credentials; uses your existing browser session
- Settings, job state, and logs live in `chrome.storage.local` only

### Disclaimer

For personal use only. Bulk workshop actions may violate the Steam Terms of Service. Defaults are deliberately conservative — do not crank the speed up. Use at your own risk.

## License

MIT
