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

## 验证

- GitHub Actions 的 `Deploy frontend to GitHub Pages` 工作流成功。
- `/`、`/messages`、`/admin/users` 直接访问均返回前端应用。
- `https://ecocampus-api.teamdsb.online/api/v1/health` 返回 `UP`。
- 登录、`/auth/me` 和正式前端 Origin 的 CORS 预检成功。

原 Sites 部署说明保留在 `docs/deployment-sites-macmini.md`，用于迁移记录和必要时回退。
