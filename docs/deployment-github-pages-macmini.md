# GitHub Pages 前端 + Mac mini 后端部署

课堂展示环境采用 GitHub Pages 托管 React 静态前端，本机 Mac mini 继续运行 Spring Boot、MySQL 和 Cloudflare Tunnel：

```text
Browser -> GitHub Pages (frontend)
        -> https://ecocampus-api.teamdsb.online
        -> Cloudflare Tunnel on Mac mini
        -> 127.0.0.1:8080 (Spring Boot)
        -> 127.0.0.1:3306 (MySQL)
```

该结构不经过 `dmit-la`，不修改其现有服务。Mac mini 离线、休眠或断网时，静态页面仍可打开，但真实 API 不可用。

## 自动发布

`.github/workflows/deploy-pages.yml` 在 `main` 分支的 `frontend/**` 或工作流自身发生变化时自动构建并发布，也支持在 GitHub Actions 页面手动触发。

生产构建固定使用真实接口：

```text
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://ecocampus-api.teamdsb.online/api/v1
```

Vite 的 `base` 和 React Router 的 `basename` 从 Pages 环境自动获取。构建产物额外生成与 `index.html` 相同的 `404.html`，用于 GitHub Pages 上的 SPA 深层路由回落。

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

## 验证

- GitHub Actions 的 `Deploy frontend to GitHub Pages` 工作流成功。
- Pages 自定义域名显示 DNS check successful，并启用强制 HTTPS。
- `/`、`/messages`、`/admin/users` 直接访问均返回前端应用。
- `https://ecocampus-api.teamdsb.online/api/v1/health` 返回 `UP`。
- 登录、`/auth/me` 和正式前端 Origin 的 CORS 预检成功。
- 数据库型商品列表接口以至少 60 并发执行短时压测，要求失败请求为 0，并在压测后复核数据库连接峰值。

原 Sites 部署说明保留在 `docs/deployment-sites-macmini.md`，用于迁移记录和必要时回退。
