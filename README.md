# Workshop Batch Subscribe / Steam 创意工坊批量订阅

[English](#english) | [中文](#中文)

---

## 中文

一键订阅 Steam 创意工坊浏览页全部 Mod 的 Edge / Chrome 扩展。复用 Steam 原生订阅接口，配合拟人节奏（随机间隔 + 批次冷却 + 限流退避），避免触发官方频率限制。**所有数据仅保存在本地浏览器，零收集、零上报。**

### 功能

- 一键订阅当前页全部物品（Steam 侧幂等，已订阅不会重复）
- 跨页订阅：自动翻页处理多页（1–20 页可选）
- 批量退订当前页（红色二次确认）
- 拟人节奏：每项随机间隔、每批自动冷却、429/5xx 自动退避重试
- 暂停 / 继续 / 取消，失败项可重试
- Steam 原生深色风格悬浮面板，中英双语自动切换
- 未登录检测与提示，任务进度角标

### 安装（Edge）

1. 下载本仓库（或 Release 中的 zip 并解压）
2. 打开 `edge://extensions/`，开启左下角「开发人员模式」
3. 点击「加载解压缩的扩展」，选择本文件夹
4. 打开任意创意工坊浏览页（如 `steamcommunity.com/workshop/browse/?appid=xxxx`），右下角会出现「批量订阅」面板

### 使用

- **订阅本页全部**：处理当前页所有物品
- **跨页订阅**：输入总页数，插件逐页自动处理（页面跳转后自动继续）
- **设置**（面板右上角 ⚙）：调整间隔、批量大小、冷却时长、重试次数

### 隐私

- 无远程代码、无统计、无外部请求（仅与 steamcommunity.com 同源通信）
- 不读取账号密码，仅使用浏览器中已存在的 Steam 会话
- 设置与任务状态仅存于 `chrome.storage.local`

### 免责声明

仅供个人合理使用。批量操作创意工坊可能违反 Steam 服务条款，默认速率已按保守策略设置，请勿调得过快。使用本扩展产生的一切后果由使用者自行承担。

---

## English

An Edge / Chrome extension to subscribe to all Steam Workshop items on a browse page with one click. It reuses Steam's own subscribe endpoint with human-like pacing (random delays, batch cooldowns, backoff on rate limits) to stay under official thresholds. **All data stays in your browser. No collection, no telemetry.**

### Features

- One-click subscribe to all items on the current page (idempotent)
- Multi-page mode: automatically processes 1–20 pages
- Batch unsubscribe (with confirmation)
- Human-like pacing: random per-item delay, batch cooldown, exponential backoff honoring `Retry-After`
- Pause / resume / cancel, retry failed items
- Steam-native dark floating panel, auto EN/中文
- Login detection, badge progress counter

### Install (Edge)

1. Download this repo (or unzip the Release package)
2. Open `edge://extensions/`, enable **Developer mode**
3. Click **Load unpacked**, select this folder
4. Open any Workshop browse page — the panel appears at bottom-right

### Privacy

- No remote code, no analytics, no external requests (same-origin with steamcommunity.com only)
- Never touches credentials; uses your existing browser session
- Settings and job state live in `chrome.storage.local` only

### Disclaimer

For personal use only. Bulk workshop actions may violate the Steam Terms of Service. Defaults are deliberately conservative — do not crank the speed up. Use at your own risk.

## License

MIT
