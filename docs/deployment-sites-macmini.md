# Sites 前端 + Mac mini 后端部署

当前推荐结构将 React 前端托管在 OpenAI Sites，本机 Mac mini 运行 Spring Boot、MySQL 和 Cloudflare Tunnel：

```text
Browser -> OpenAI Sites (frontend)
        -> https://ecocampus-api.teamdsb.online
        -> Cloudflare Tunnel on Mac mini
        -> 127.0.0.1:8080 (Spring Boot)
        -> 127.0.0.1:3306 (MySQL)
```

该结构不经过 `dmit-la`，也不修改其 Xray、Nginx 或现有域名。Mac mini 离线、休眠或断网时，前端静态页面仍可打开，但真实 API 不可用。

## 前端

`frontend/sites/` 是现有 React + Vite SPA 的 Sites 部署适配层。它保留 `frontend/src/` 作为唯一业务 UI 源码，通过 catch-all 页面承接 React Router 多路由，并生成 Sites 所需的 Cloudflare Worker 兼容产物。

```bash
cd frontend/sites
npm install
VITE_USE_MOCKS=false \
VITE_API_BASE_URL=https://ecocampus-api.teamdsb.online/api/v1 \
npm run build
```

Sites 项目标识只保存在 `frontend/sites/.openai/hosting.json`。生产前端使用独立 Sites 版本发布，不在 DMIT 运行 Node、Vite 或静态文件服务。

当前 Sites 前端已绑定 `ecocampus.teamdsb.online`，访问策略保持 owner-only 私有预览；正式对校园用户开放前，需要单独确认并切换为 public。

## 后端与数据库

本机运行 MySQL，数据库只监听本机地址。Spring Boot 使用 `prod` profile、MySQL、Flyway 和低内存 JVM 参数：

- Java heap：`128–384 MiB`
- Metaspace：上限 `192 MiB`
- Hikari：最大 5 个连接，最少 1 个空闲连接
- Tomcat：最大 40 个线程
- Spring Boot：只监听 `127.0.0.1:8080`

生产密钥和数据库密码保存在本机权限为 `600` 的 `~/.config/ecocampus/backend.env`，不得提交仓库。JAR、上传目录和日志分别位于 `~/.local/share/ecocampus/` 与 `~/.local/state/ecocampus/`。

后端通过 macOS LaunchAgent `com.falconsvsvabro.ecocampus.backend` 常驻。MySQL 使用其 Homebrew 自带 LaunchAgent 启动；当前系统若被 Homebrew 识别为不支持版本，可直接加载 Cellar 内已有 plist，禁止为此自动升级或重装数据库。

## Cloudflare Tunnel

Tunnel 名称为 `ecocampus-macmini`，公网 API 主机名为 `ecocampus-api.teamdsb.online`，仅回源 `http://127.0.0.1:8080`。Tunnel 凭据和配置保存在 `~/.cloudflared/`，权限为 `600`，不得提交仓库。

Tunnel 通过 macOS LaunchAgent `com.falconsvsvabro.ecocampus.tunnel` 常驻。无需在路由器或 macOS 防火墙开放 8080/3306；Cloudflare Tunnel 只建立出站连接。

## CORS

生产 CORS 来源由 `CORS_ALLOWED_ORIGIN_PATTERNS` 显式配置。正式域名使用：

```text
https://ecocampus.teamdsb.online
```

不要在生产环境使用 `*`。JWT 继续通过 `Authorization: Bearer` 请求头传递，不使用跨站 Cookie。

## 验证

```bash
curl -fsS http://127.0.0.1:8080/api/v1/health
curl -fsS https://ecocampus-api.teamdsb.online/api/v1/health
```

还应验证：

- MySQL、后端和 Tunnel 在重新登录后由 LaunchAgent 恢复。
- 对正式前端 Origin 的预检响应包含正确的 `Access-Control-Allow-Origin`。
- 首次账号登录能够自动建档，已有账号继续校验原密码。
- 上传文件经 `/uploads/**` 公网入口可读取。
