# GitHub Pages 前端 + Mac mini 后端部署

状态：当前课堂展示部署方案。仓库配置最近复核于 2026-07-15；域名、证书和主机进程属于外部运行状态，不能仅凭本文假定始终在线。

课堂展示环境采用 GitHub Pages 托管 React 静态前端，本机 Mac mini 继续运行 Spring Boot、MySQL 和 Cloudflare Tunnel：

```text
Browser -> GitHub Pages (frontend)
        -> https://ecocampus-api.teamdsb.online
        -> Cloudflare Tunnel on Mac mini
        -> 127.0.0.1:8080 (Spring Boot)
        -> 127.0.0.1:3306 (MySQL)
```

该结构不经过 `dmit-la`，不修改其现有服务。Mac mini 离线、休眠或断网时，静态页面仍可打开，但真实 API 不可用。

## 内网数据库运维

MySQL 继续只监听 Mac mini 的 `127.0.0.1:3306`。内网运维设备加入 `tail806576.ts.net` 后，通过 Shadowrocket 节点 `100.80.234.31:22` 和受限用户 `lifuyue` 建立本地转发：

```bash
ssh -i <私钥路径> -N \
  -L 13306:127.0.0.1:3306 \
  lifuyue@100.80.234.31
```

数据库客户端连接 `127.0.0.1:13306`，数据库和用户分别为 `ecocampus`、`ecocampus_ops`。密码只在线下密钥管理渠道保存，不写入仓库。该 SSH 用户无 Shell/PTY 权限，只允许转发到 `127.0.0.1:3306`；MySQL 用户只拥有 `ecocampus.*` 权限。

不要改连 `100.110.98.120:22`：该地址对应另一台 `mac-mini` 设备，本轮验证未能完成 SSH banner 握手。应用在目标 Mac mini 本机运行时仍直接连接 `127.0.0.1:3306`，无需绕 SSH 隧道。

Cloudflare Zone `teamdsb.online` 已配置 Cache Rule `EcoCampus uploaded image cache`：仅匹配 `ecocampus-api.teamdsb.online/uploads/*`，强制允许缓存，Edge TTL 与 Browser TTL 均为 31,536,000 秒。该规则不匹配 `/api/*`，未启用付费 Cache Reserve。源站同时为上传图片返回 `public, max-age=31536000, immutable`，UUID 图片地址不得覆盖写入。

## 自动发布

`.github/workflows/deploy-pages.yml` 在 `main` 分支的 `frontend/**` 或工作流自身发生变化时自动构建并发布，也支持在 GitHub Actions 页面手动触发。

工作流当前使用 Node.js 22、pnpm 10 和 frozen lockfile。

生产构建固定使用真实接口：

```text
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://ecocampus-api.teamdsb.online/api/v1
```

Vite 的 `base` 和 React Router 的 `basename` 从 Pages 环境自动获取。构建产物额外生成与 `index.html` 相同的 `404.html`，用于 GitHub Pages 上的 SPA 深层路由回落。

## 后端 self-hosted CD

仓库级 GitHub Actions Runner `ecocampus-macmini` 作为当前 Mac mini 用户的 LaunchAgent 常驻，使用标签 `self-hosted`、`macOS`、`ARM64`、`ecocampus-deploy`。`.github/workflows/deploy-backend-macmini.yml` 在 `main` 的 `backend/**`、`deploy/macos/**` 或工作流自身变化时触发，也支持手动运行。

Runner 在测试前通过本机 MySQL root socket 幂等创建 `ecocampus_test` 和测试账号授权。测试只清理名称以 `_test` 结尾的数据库，不会对生产 `ecocampus` 执行 Flyway clean。

Runner 在本机完成以下步骤，因此 Maven 依赖缓存和构建流量留在 Mac mini：

```text
checkout main
  -> Java 21 检查
  -> ./mvnw test
  -> ./mvnw -DskipTests package
  -> ~/.local/bin/ecocampus-deploy-backend
  -> 原子替换 JAR
  -> 重启 LaunchAgent
  -> 最长 45 秒健康检查
  -> 失败时恢复 ecocampus.jar.previous
```

部署并发组 `ecocampus-backend-production` 不允许取消正在进行的部署，避免连续推送在 JAR 替换阶段中断。部署成功的 commit SHA 写入 `~/.local/state/ecocampus/deployed-commit`，重复任务不会重启健康的同版本。

本机固定部署器从仓库 `deploy/macos/ecocampus-deploy-backend` 手动安装到 `~/.local/bin/`，工作流不在每次运行时覆盖它。数据库/JWT 等密钥继续只存在 `~/.config/ecocampus/backend.env`，不进入 GitHub Actions secrets 或仓库。

安全边界：该仓库为公开仓库且 `main` 当前未启用分支保护；拥有 `main` 写权限的人可以修改 workflow 并由 self-hosted Runner 执行。Runner 不响应 `pull_request`，但仍建议启用 `main` 必须经 PR、状态检查和审核后合并。

2026-07-14 首次自动部署基线：Runner 2.335.1 安装目录约 433 MB，空闲 `Runner.Listener` RSS 约 97 MB；工作流 48 秒完成 32 项测试、构建与部署，JAR 替换后约 19 秒恢复健康，公网 health 为 `UP`。

GitHub Pages 不提供可配置的服务端 rewrite。当前自定义 `404.html` 能让浏览器在深层 URL 启动同一 React 应用，但 HTTP 状态仍是 404；这对普通课堂演示可用，对严格要求深层路由 200、SEO 或探测器的场景不等价于真正的 SPA rewrite。

## 域名与 CORS

正式前端域名仍为 `ecocampus.teamdsb.online`。Cloudflare DNS 应以仅 DNS 模式将该域名 CNAME 到 `falcons-vs-va-bro.github.io`；API 域名和 Tunnel 保持不变。

生产后端继续只允许以下前端 Origin：

```text
https://ecocampus.teamdsb.online
```

## 课堂并发配置

当前按 50+ 人同时访问的课堂突发流量配置单实例后端：

```text
Hikari maximum-pool-size: 12
Hikari minimum-idle: 3
Hikari connection-timeout: 10s
Tomcat max-threads: 100
Tomcat min-spare-threads: 8
Tomcat max-connections: 300
Tomcat accept-count: 100
```

MySQL 默认 `max_connections=151`，单实例应用池上限 12 不会挤占数据库连接额度。这里不按“一个访客一个数据库连接”配置：100 个请求线程共享 12 条数据库连接，短时突发请求在 Hikari 队列中等待，避免课堂瞬时访问把 MySQL 和 JVM 一起拖垮。若未来启动第二个后端实例，需要按实例数重新核算连接池总上限。

Mac mini 的 LaunchAgent 环境文件 `~/.config/ecocampus/backend.env` 使用同名环境变量覆盖这些默认值；该文件含密钥，不进入仓库。

前端通过路由级动态导入限制首页 JavaScript，仓库图片统一为 WebP；首屏商品图最多 4 张主动加载，其余商品图和装饰插画懒加载。

## Tailscale 数据库运维入口

Mac mini 使用 macOS GUI/系统扩展版 Tailscale，因此不启用 Tailscale 自带 SSH 服务端；运维入口采用系统 OpenSSH 叠加 Tailscale 网络。由于本机 Shadowrocket Packet Tunnel 会为 `100.64.0.0/10` 注入优先级冲突路由，直接访问 Tailscale IP 的 22 端口可能完成握手但收不到 SSH banner；当前通过 Tailscale Serve 在 tailnet-only TCP `2222` 代理到 `127.0.0.1:22`，绕开内核冲突路由。MySQL 继续只监听 `127.0.0.1:3306`，不向局域网或公网开放。

运维公钥在 `authorized_keys` 中限制为仅接受 Tailscale 地址段或本机 Serve 代理来源、仅允许转发到 `127.0.0.1:3306`，禁止 Shell、PTY、代理转发和其他目标端口。运维端必须先加入同一 tailnet，再用 `ssh -p 2222 -N -L <本地端口>:127.0.0.1:3306 <用户>@<MagicDNS>` 建立隧道。数据库使用独立的 `ecocampus_ops@localhost` 账号，仅授权 `ecocampus.*`，不复用应用账号或 MySQL root；公钥、数据库密码和 tailnet 身份均不进入仓库。

## 验证

- GitHub Actions 的 `Deploy frontend to GitHub Pages` 工作流成功。
- Pages 自定义域名显示 DNS check successful，并启用强制 HTTPS。
- `/` 返回 200；`/messages`、`/admin/users` 等深层地址响应体与首页构建产物一致并可启动前端路由，但 GitHub Pages 返回 HTTP 404。
- `https://ecocampus-api.teamdsb.online/api/v1/health` 返回 `UP`。
- 登录、`/auth/me` 和正式前端 Origin 的 CORS 预检成功。
- 数据库型商品列表接口以至少 60 并发执行短时压测，要求失败请求为 0，并在压测后复核数据库连接峰值。

2026-07-14 基线结果：商品列表 600 请求、60 并发时失败数 0、吞吐 439.30 req/s、P95 269 ms；MySQL 连接峰值 10/151，慢查询 0。

2026-07-15 经运维明确授权，通过受限 SSH 隧道将 `R__mysql_demo_seed.sql` 导入真实 `ecocampus`。Flyway repeatable migration 执行成功，JDBC 核对结果为 9 类目、36 用户、27 商品、14 收藏、9 订单、5 会话、11 消息、4 求购和 4 审计记录。生产 profile 仍只加载结构 migration，后续生产启动不会自动重跑 demo seed。

同日继续导入 `R__mysql_catalog_seed.sql`，新增 72 件校园二手商品，九类目各 8 件，并写入 72 张图片关联和 82 条配送方式。真实库商品总数增至 99，其中新增数据为 63 件在售、5 件已售、4 件下架；Flyway history 中 `mysql catalog seed` 执行成功。

2026-07-14 文档审计时的点状复核：前端首页返回 200 且 `Server: GitHub.com`，API `/api/v1/health` 返回统一响应中的 `status: UP`；`/messages`、`/admin/users` 返回 404 状态但与首页响应体 SHA-256 相同。外部状态会变化，后续发布后应重新检查。

原 Sites 部署说明保留在 `docs/deployment-sites-macmini.md`，用于迁移记录和必要时回退；Linux/Tailscale 方案位于 `docs/deployment-low-memory.md`。二者不代表当前线上拓扑。
