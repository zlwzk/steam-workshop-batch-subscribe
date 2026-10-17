# Workshop Batch Subscribe / Steam 创意工坊批量订阅

[English](#english) | [中文](#中文)

---

## 中文

一键订阅 Steam 创意工坊浏览页全部 Mod 的 Edge / Chrome 扩展（Manifest V3）。复用 Steam 原生订阅接口，配合拟人节奏（随机间隔 + 批次冷却 + 限流退避），避免触发官方频率限制。**所有数据仅保存在本地浏览器，零收集、零上报。**

### 功能

- 一键订阅当前页全部物品（Steam 侧幂等，已订阅不会重复）
- **全部页（自动翻页）**：本页订阅完后自动跳到下一页，直到工坊末页；分页探测更健壮（兼容 Steam 新旧版分页 UI），即使探测不到分页也会试探下一页并由重复页守卫自动停止；可在设置中限定自动翻页上限（默认 20 页，可调 1–100）
- 批量退订当前页（红色二次确认）
- 拟人节奏：每项随机间隔、每批自动冷却、429/5xx 自动指数退避（尊重 `Retry-After`）
- 暂停 / 继续 / 取消，**失败项精准重试**（只重跑失败的物品，不再整页重扫）
- **明细进度日志**：每条带时间戳，逐项显示 `3/29` 进度，每页完成时提示「第 N 页已完成（本页成功 x，失败 y）」，跨翻页持久保留，可一键导出为 txt
- **订阅范围**：可在面板填写当前页第几个开始、第几个结束（如 `2 – 10`），留空默认为本页全部；自动翻页时范围仅作用于起始页，后续页处理整页
- **面板刷新**（↻）：改完冷却等设置后重新扫描当前页并重载设置，不中断进行中的任务
- **版本显示与更新检查**：面板标题显示当前版本号；启动后每 12 小时静默检查一次 GitHub Release，也可点 ⇪ 手动检查；发现新版本时顶部横幅提示并给出下载链接
- 登录状态自动识别（通过浏览器 Cookie 接口读取登录态，不接触账号密码）
- Steam 原生深色风格悬浮面板，**可拖动**（按住标题栏移动，位置自动记忆）、可折叠，中英双语自动切换
- 任务进度角标；换游戏/换筛选时自动丢弃旧任务，防止串页

### 安装（Edge / Chrome）

本扩展是标准的 Chromium Manifest V3 扩展，**同一份文件同时支持 Edge 和 Chrome，无需下载不同版本**（Release 中带 `-chrome` 后缀的 zip 内容与标准版完全一致，仅为 Chrome 用户下载方便而提供）。

**Edge：**

1. 下载本仓库（或 Release 中的 zip 并解压）
2. 打开 `edge://extensions/`，开启「开发人员模式」
3. 点击「加载解压缩的扩展」，选择本文件夹
4. 打开任意创意工坊浏览页（如 `steamcommunity.com/workshop/browse/?appid=730`），右下角会出现「批量订阅」面板
5. 面板日志出现「已检测到 Steam 登录」即表示登录态识别正常；若提示未登录，请先在浏览器登录 Steam

**Chrome：**

1. 下载 Release 中的 `steam-workshop-batch-subscribe-chrome-vX.Y.Z.zip`（或标准版 zip）并解压
2. 打开 `chrome://extensions/`，打开右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择解压出的 `steam-workshop-batch-subscribe` 文件夹
4. 打开任意创意工坊浏览页，右下角出现面板即安装成功；日志提示「已检测到 Steam 登录」表示登录态正常（请在 Chrome 中先登录 Steam）

> 更新方式：开发人员模式加载的扩展**不会自动安装更新**。下载新版并替换文件夹后，到 `edge://extensions/` / `chrome://extensions/` 点击该扩展的「重新加载」；若新增了权限，浏览器会提示重新确认。

### 使用

- **订阅本页全部**：只处理当前页
- **全部页（自动翻页）**：自动逐页处理直到末页；翻页中途不要手动切换到其他工坊页面
- **退订本页全部**：退订当前页所有物品（需确认）
- 面板上的**序号范围**：填入起始–结束序号（1 基）即可只处理本页部分 Mod，留空 = 整页
- **↻** 刷新扫描与设置，**⇪** 手动检查更新，**≡** 展开/收起日志，**⇩** 导出日志，**—** 折叠面板，**⚙** 打开设置
- 设置项：每项间隔、每批数量、批次冷却（可关闭）、单项重试次数、自动翻页上限。默认值已按保守策略配置，**请勿把间隔调得过短**

### 权限说明

- `storage`：保存设置、跨页任务状态、日志（仅本地）
- `cookies`：读取 Steam 登录 Cookie 判断是否已登录。`steamLoginSecure` 是 HttpOnly Cookie，页面脚本无法直接读取，必须通过浏览器 Cookie 接口查询；不会读取或上传任何账号凭据
- `host_permissions: steamcommunity.com`：仅与 Steam 官方域名通信
- `host_permissions: api.github.com`：仅用于读取本项目公开的最新 Release 元数据（版本号、下载页链接）以检查更新，不发送任何账号或浏览数据

### 隐私

- 无远程代码、无统计；对外请求只有两类：与 steamcommunity.com 同源的订阅通信，以及向 GitHub 公共 API 查询 Release 版本
- 不读取账号密码，仅使用浏览器中已存在的 Steam 会话
- 设置、任务状态、日志仅存于 `chrome.storage.local`

### 免责声明

仅供个人合理使用。批量操作创意工坊可能违反 Steam 服务条款，默认速率已按保守策略设置，请勿调得过快。使用本扩展产生的一切后果由使用者自行承担。

---

## English

A Manifest V3 Edge / Chrome extension to subscribe to all Steam Workshop items on a browse page with one click. It reuses Steam's own subscribe endpoint with human-like pacing (random delays, batch cooldowns, backoff on rate limits) to stay under official thresholds. **All data stays in your browser. No collection, no telemetry.**

### Features

- One-click subscribe to all items on the current page (idempotent on Steam's side)
- **All Pages (auto page-turn)**: finishes a page and automatically moves to the next, until the workshop's last page; pagination detection is now more robust (works with both old and new Steam pagination UIs), and it probes the next page even when pagination can't be detected, stopping via a duplicate-page guard; a configurable cap (default 20, range 1–100) prevents runaway runs
- Batch unsubscribe (with confirmation)
- Human-like pacing: random per-item delay, batch cooldown, exponential backoff honoring `Retry-After` on 429/5xx
- Pause / resume / cancel, and **targeted retry** that re-runs only failed items
- **Detailed progress log**: timestamped entries with per-item counters like `3/29`, plus a "Page N done (x ok, y failed this page)" note after every page; persisted across page turns and exportable to txt
- **Item range**: enter start–end positions on the current page (e.g. `2 – 10`); blank means the whole page. In auto page-turn mode the range applies to the starting page only; later pages run in full
- **Panel refresh** (↻): rescans the page and reloads settings after you tweak cooldowns etc., without stopping a running job
- **Version display & update check**: the current version is shown in the panel title; GitHub Releases is checked silently every 12 hours or manually with ⇪, showing a top banner with a download link when a new version exists
- Automatic login detection via the browser cookie API (never touches your password)
- Steam-native dark floating panel, **draggable** (grab the title bar; position is remembered), collapsible, auto EN/中文
- Badge progress counter; stale cross-page jobs are discarded when you switch games/filters

### Install (Edge / Chrome)

This is a standard Chromium Manifest V3 extension — **the exact same files run in both Edge and Chrome; there is no separate build** (the `-chrome` zip attached to releases is byte-identical to the standard zip, just named for convenience).

**Edge:**

1. Download this repo (or unzip a Release package)
2. Open `edge://extensions/` and enable **Developer mode**
3. Click **Load unpacked**, select this folder
4. Open any Workshop browse page (e.g. `steamcommunity.com/workshop/browse/?appid=730`) — the panel appears at the bottom-right
5. "Steam login detected" in the log means auth works; if it says not logged in, sign in to Steam first

**Chrome:**

1. Download `steam-workshop-batch-subscribe-chrome-vX.Y.Z.zip` (or the standard zip) from Releases and unzip it
2. Open `chrome://extensions/` and toggle **Developer mode** (top-right)
3. Click **Load unpacked** and select the unzipped `steam-workshop-batch-subscribe` folder
4. Open any Workshop browse page — the panel appears at the bottom-right. Make sure you are signed in to Steam in Chrome

> Updating: developer-mode extensions are **never auto-installed**. Download a new release, replace the folder, then click **Reload** on `edge://extensions/` / `chrome://extensions/`; the browser may ask you to re-approve newly added permissions.

### Usage

- **Subscribe this page**: current page only
- **All pages (auto page-turn)**: walks page by page until the last page; don't switch to another workshop page mid-run
- **Unsubscribe this page**: unsubscribes every item on the page (with confirmation)
- **Item range inputs**: 1-based start–end positions to process only part of a page; blank = whole page
- **↻** refresh scan & settings, **⇪** check for updates, **≡** toggle log, **⇩** export log, **—** collapse panel, **⚙** settings
- Settings: per-item delay, batch size, batch cooldown (toggleable), max retries, page-turn cap. Defaults are deliberately conservative — **don't make the delays too short**

### Permissions

- `storage`: settings, cross-page job state, logs (local only)
- `cookies`: reads the Steam login cookie to detect login state. `steamLoginSecure` is HttpOnly and can only be queried through the browser cookie API — credentials are never read or uploaded
- `host_permissions: steamcommunity.com`: talks only to official Steam domains
- `host_permissions: api.github.com`: only reads this project's public latest-release metadata (version number, download URL) for update checks — no account or browsing data is sent

### Privacy

- No remote code, no analytics. The only outbound requests are same-origin Steam calls and public GitHub Release version lookups
- Never touches credentials; uses your existing browser session
- Settings, job state, and logs live in `chrome.storage.local` only

### Disclaimer

For personal use only. Bulk workshop actions may violate the Steam Terms of Service. Defaults are deliberately conservative — do not crank the speed up. Use at your own risk.

## License

MIT
