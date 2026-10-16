# Steam 创意工坊批量订阅插件 — 设计规格

日期：2026-10-16
仓库名：steam-workshop-batch-subscribe（GitHub / Gitee 同名，MIT，公开）

## 目标

Edge（Chromium MV3）浏览器插件：在 Steam 创意工坊浏览页一键订阅当前页（或跨页）全部 mod。通过复用 Steam 原生订阅接口 + 拟人节奏，避免触发官方频率限制。所有数据仅存本地，零隐私收集。

## 已核实的技术事实（2026-10-16 实测）

- 浏览页为 React SPA，CSS 类名为哈希值（会随部署变化）→ **禁止依赖类名选择器**
- 条目识别：`a[href*="sharedfiles/filedetails/?id="]`，按 id 去重，每页约 30 个
- 翻页：URL 参数 `&p=N` 服务端有效（已验证 p=2 与 p=1 无重叠）
- 订阅接口：`POST https://steamcommunity.com/sharedfiles/subscribe`，表单参数 `id`、`appid`、`sessionid`；退订为 `/sharedfiles/unsubscribe`，幂等
- `sessionid` 取自 `document.cookie`；登录态以 `steamLoginSecure` cookie 存在为准
- `appid` 从浏览页 URL 解析

## 架构

纯原生 JS，无第三方依赖，Manifest V3。

| 模块 | 职责 |
|------|------|
| `manifest.json` | 声明 content script（匹配 steamcommunity.com/workshop/browse）、storage 权限、host_permissions、action 角标 |
| `content.js` | 页面扫描、订阅队列引擎（拟人节奏/退避/重试）、跨页导航与任务恢复、与面板通信 |
| `panel.js` + `panel.css` | 注入式 Steam 风格面板（进度、控制按钮、设置抽屉、日志） |
| `background.js` | service worker，仅维护 action 角标文本 |
| `i18n.js` | 中/英文案，按 Steam_Language cookie 自动切换 |
| `icons/` | 16/48/128 PNG |

## 拟人节奏与风控

- 每项订阅间隔随机 2.5–5 秒（可调 1–30s）
- 每 10 项休息 20–45 秒（可调）
- 429/5xx：尊重 `Retry-After`（上限 300s），否则指数退避；单最多重试 3 次后标记失败
- 默认速率约 10–15 订阅/分钟，远低于 Steam 触发阈值的经验值
- 支持暂停 / 继续 / 取消；任务状态逐步写入 `storage.local`，跨页导航后自动恢复

## 功能清单

1. 一键订阅本页全部（幂等，已订阅的由 Steam 侧自然跳过）
2. 跨页模式：用户设定页数，完成后自动 `&p=N+1` 导航继续
3. 批量退订模式（红色二次确认）
4. 每项状态：成功 / 失败（可一键重试失败项）
5. 未登录检测并提示
6. 面板：进度条、计数、实时日志（可折叠）、设置抽屉
7. action 图标角标显示进行中数量
8. 中英双语自动切换

## 隐私与合规

- 无远程代码、无统计上报、无外部网络请求（仅 steamcommunity.com 同源请求）
- 不读取/存储账号密码，仅使用浏览器既有会话 cookie
- README 附免责声明：仅限个人合理使用，滥用可能违反 Steam 服务条款

## 发布

- GitHub + Gitee 公开仓库，MIT License，中英 README
- 附 zip 打包（Edge 加载已解压扩展 / 拖放安装）
- 桌面复制一份源码 + 安装说明
