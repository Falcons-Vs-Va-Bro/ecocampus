# EcoCampus 项目状态

最近一次全项目文档/实现复核：2026-07-14。

本文件是协作与交接入口，只保留当前摘要、已知问题和验证基线。长期契约以对应源文档为准；若文档与实现冲突，以后端 Controller/DTO/Flyway、前端路由映射/API wrapper/页面数据源和构建配置为准。

## 源文档索引

- API：[`api-contract.md`](api-contract.md)
- RBAC：[`rbac.md`](rbac.md)
- 前端路由、页面数据源与 DTO 风险：[`frontend-stack.md`](frontend-stack.md)
- 首页/收藏视觉：[`frontend-homepage/README.md`](frontend-homepage/README.md)
- 用户端动画：[`frontend-animation/README.md`](frontend-animation/README.md)
- 数据库约束与锁：[`database-constraints-and-locking.md`](database-constraints-and-locking.md)
- 当前部署：[`deployment-github-pages-macmini.md`](deployment-github-pages-macmini.md)
- 历史/备选部署：[`deployment-sites-macmini.md`](deployment-sites-macmini.md)、[`deployment-low-memory.md`](deployment-low-memory.md)
- 汇报页历史设计：[`superpowers/specs/2026-07-03-process-page-design.md`](superpowers/specs/2026-07-03-process-page-design.md)

## 产品边界

- Web/H5 优先。
- `/` 是公开市场首页，不是个人工作台。
- `/favorites` 承载商品收藏和本地求购关注。
- 用户端采用手绘校园交易风格；后台以操作效率优先。
- 前端允许 mock-first，但文档必须区分 API-backed、Local mock 和 Placeholder。

## 后端当前状态

技术：Java 21、Spring Boot 3.5.3、Spring Web/Security/Validation/Data JPA、Flyway、H2、MySQL、Actuator、Springdoc。

运行与数据：

- 默认 `application.yml` 使用 H2 MySQL mode、Flyway、`ddl-auto=none`。
- `application-prod.yml` 要求显式 MySQL 凭据，使用 `ddl-auto=validate`，并由启动期防呆阻止不安全生产配置。
- 课堂单实例默认基线：Hikari 最大 12/最小空闲 3、连接等待 10 秒；Tomcat 最大线程 100、最小空闲 8、最大连接 300、等待队列 100。
- Flyway 当前为 V1–V4：核心表、4 个初始类目、账号密码哈希列、会话双方已读时间。
- `db/seed/mysql-demo-seed.sql` 是 Flyway 后手动导入的完整演示数据，不会自动运行。
- Maven 已移除 Redis 依赖和业务使用；`application-local.example.yml` 中 Redis 段只是未生效的遗留占位。
- 图片仅实现本地 JPEG/PNG/GIF 存储；`FILE_STORAGE_TYPE` 没有实现选择器。MVC 已注册 `/uploads/**`，但安全配置未公开该路径。

API 模块：

- 账号密码登录、当前用户、校园核验、资料和地址。
- 公开/后台类目。
- 商品发布、编辑、上下架、公开查询、后台审核/治理。
- 收藏、私信/未读数、订单、求购与匹配。
- 后台用户黑名单、overview 与 summary 数据看板。

关键边界：

- 首次账号登录自动创建 `USER/VERIFIED` 用户；账号必须匹配 `2292024.+`。
- 后端没有注册、refresh token、退出登录、求购详情、求购编辑、商品删除、管理员全站订单端点。
- 校园核验提交后直接 `VERIFIED`，没有人工审核 API。
- 交易 service 要求 `VERIFIED`；后台 service 要求 `ADMIN`。
- 审计日志当前只覆盖商品和订单操作。

## 前端当前状态

技术：React 19.2、TypeScript 6、Vite 8、React Router 7、TanStack Query 5、Zustand 5、Axios、Tailwind plugin、Ant Design 6、lucide-react、Motion、React Hook Form、Zod。

页面数据源摘要：

- API-backed：`/login`、`/`、`/items`、`/items/:id`、商品收藏、私信、购买/出售订单、后台看板、后台商品/用户/类目。
- Local mock：九个分类页的专属商品集合；求购四页；发布/我的商品/编辑；资料表单与核验表单；收藏里的求购关注。
- Placeholder：`/demands`、`/demands/new`、`/demands/mine`。
- Redirect：`/orders -> /orders/purchase`，`/orders/sales -> /orders/sale`。

mock 与守卫：

- `pnpm dev:mock` 读取 `.env.mock`；API mock 覆盖类目、商品、收藏、私信、订单、后台商品和后台用户。
- auth mock 在登录页内处理；profile/file/demand/dashboard wrappers 没有 API mock；Local mock 页面不随开关切换。
- `auth`、`verified`、`admin` 已执行跳转；`owner` 当前只检查登录，未核对商品所有者。
- 前端执行角色域隔离：`ADMIN` 登录默认进入 `/admin`，只能停留在 `/admin` 路由树；市场/用户路由会重定向后台首页，普通用户的后台 `returnTo` 不会被登录页恢复。
- mock 与真实认证分别使用 v2 storage key；401 清理会话，没有 token refresh。

性能与资源：

- `routeComponents.ts` 通过 `React.lazy` 按路由加载页面，`App.tsx` 提供 `Suspense` 回退；公开首页不预加载后台页面。
- 业务位图已转换为 WebP；商品列表仅前 4 张首屏图主动加载，其余商品图和插画懒加载并异步解码。
- 2026-07-14 生产构建入口从约 1,232 kB（gzip 380 kB）降至约 628 kB（gzip 206 kB），页面拆为独立路由 chunk。

## 已知实现对齐问题

1. `GET /items` 真实摘要缺少前端 `ItemSummary` 要求的 `deliveryModes/seller/favorited/favoriteCount`，首页和通用列表真实模式存在渲染风险。
2. 商品详情 seller 后端只有 `id/nickname`，前端类型还要求 `verificationStatus`。
3. 收藏真实列表仍是基础商品摘要；前端收藏类型额外要求 `favoritedAt/invalidReason` 和完整商品展示字段。
4. 后台商品真实摘要缺少审核/治理页面 mock 中的图片、描述、举报数、审核标记等元数据；前端 wrapper 类型过宽。
5. 校园核验、收藏、上下架、关闭求购、审核/违规下架等若干 mutation wrapper 声明 `void`，后端实际返回当前用户、商品/求购详情或后台商品摘要。
6. `routeCatalog.ts` 为求购详情列出 `GET /demands/{demandId}`，但后端没有该端点，当前详情页也未调用 API。
7. 订单/私信页面使用 mock 元数据补图片、价格或状态；私信详情的“是否本人消息”仍使用 mock 当前用户 id。
8. 前端分类 mock 有 9 个一级类目，自动 Flyway seed 只有 4 个；手动 MySQL demo seed 有 9 个。
9. 类目数据库是扁平一级模型；后台树层级、启停、商品数是本地展示状态。
10. 过期黑名单不会自动恢复 `verificationStatus`；过期后交易请求从 423 变为 403，仍需管理员移出。
11. 没有前端组件/路由自动化测试；前端验证目前只有 lint/build 和人工页面检查记录。
12. GitHub Pages 深层 URL 依靠 `404.html` 启动 SPA，内容可用但 HTTP 状态仍为 404，不是真正的服务端 rewrite。
13. `/uploads/**` 未加入 Spring Security 公开白名单，普通图片标签无法携带 Bearer token；真实上传图片的公开展示链路尚未闭合。
14. `application-local.example.yml` 的 `FILE_STORAGE_TYPE` 和 Redis 配置没有对应运行时实现/依赖。
15. Vite 没有 `/api` dev proxy；本地联调必须显式设置 `VITE_API_BASE_URL=http://localhost:8080/api/v1`。
16. 商品 `off-shelf` 只阻止 `SOLD/DELETED`，卖家可把 `VIOLATION_REMOVED` 改为 `OFF_SHELF` 后重新申请审核，违规下架存在绕过路径。
17. 市场公共壳仍显示“登录 / 注册”，但没有注册路由/端点，点击只进入自动建档登录页。
18. 后台用户页的总量、今日新增、注册日期、发布数，以及类目页的层级/启停/商品数，部分仍是硬编码或本地展示值。

## 部署状态

```text
GitHub Pages frontend
  -> https://ecocampus-api.teamdsb.online/api/v1
  -> Cloudflare Tunnel
  -> Mac mini Spring Boot + MySQL
```

`.github/workflows/deploy-pages.yml` 在 `main` 的前端/工作流变更时用 Node 22、pnpm 10 构建真实 API 版本并生成 `404.html`。`frontend/sites/` 是历史 Sites 适配层；`deploy/` 是 Linux/Tailscale 备选模板。

后端使用仓库级 self-hosted Runner `ecocampus-macmini` 在 Mac mini 本机构建和部署；`deploy-backend-macmini.yml` 仅由 `main` 的后端/部署文件变化或手动触发。固定部署器执行原子 JAR 替换、最长 45 秒健康检查和失败回滚，成功 SHA 写入本机状态文件。Runner 不需要公网入站端口，也不经过 `dmit-la`。公开仓库的 `main` 当前没有分支保护，拥有直接写权限的协作者可以修改 workflow，这是现存的 Runner 安全边界。

2026-07-14 已记录的课堂负载基线：真实商品列表 600 请求、60 并发，0 失败、439.30 req/s、P95 269 ms、最长 477 ms；MySQL 连接峰值 10/151，慢查询 0。

## 验证基线

本轮文档审计与最新远端性能变更组合后（2026-07-14）已验证：

- `cd backend && ./mvnw test`：32 tests 通过，0 failures、0 errors、0 skipped。
- `cd frontend && pnpm lint && pnpm build`：通过；入口包为 628.14 kB（gzip 205.51 kB），Vite 仍提示部分 chunk 超过 500 kB。
- 2026-07-14 管理员路由域隔离变更后 `cd frontend && pnpm lint && pnpm build` 通过。
- 2026-07-14 管理员路由域隔离已由 GitHub Pages 发布；真实管理员登录返回 `ADMIN/VERIFIED`，后台 summary API 返回 200，线上产物确认登录默认目标、全局管理员重定向和退出登录逻辑均已包含。
- 相对 Markdown 链接检查和 `git diff --check` 通过。
- 公网首页 HTTP 200，API health 为 `UP`；深层路由返回相同前端内容但 HTTP 404。

## 文档维护规则

- 先更新承载完整事实的源文档，再更新本文件摘要。
- 路由必须标明 API-backed、Local mock、Placeholder 或 Redirect。
- “API wrapper 已存在”不等于页面已接线，“页面已绘制”不等于真实 API 可用。
- mock DTO 不得被写成后端真实响应。
- 部署文档必须标明当前、历史或备选。
- 路由、API、DTO、权限、数据库、页面数据源、部署、性能基线或视觉方向变化后同步维护本文件。

## 最近变更

- 2026-07-14：在 Mac mini 注册仓库级专用 self-hosted Runner，新增后端 `main` 自动测试、构建、原子部署、健康检查与失败回滚链路；构建不再经过 GitHub 托管 Runner。
- 2026-07-14：修正管理员登录被送往公共首页的问题；管理员默认进入 `/admin` 并被限制在后台路由树，后台未实现入口改为禁用，同时补充后台退出登录。
- 2026-07-14：完成全仓库文档/实现对照审计，按代码重写入口 README、API、RBAC、前端数据源和项目状态，显式记录真实 DTO 与 mock UI 差异。
- 2026-07-14：前端改为路由级动态导入，位图统一为 WebP 并限制首屏主动加载；课堂单实例连接池和 Tomcat 并发参数上调，完成 60 并发负载基线。
- 2026-07-14：课堂展示前端切换到 GitHub Pages，后端继续运行在 Mac mini 并经 Cloudflare Tunnel 暴露。
- 2026-07-14：公共市场壳改为由真实 `/auth/me` 展示身份并启用 v2 认证存储与路由守卫。
- 2026-07-13：完成求购详情、本地求购关注和用户端共享市场壳整合。
- 2026-07-11 至 2026-07-12：接入账号密码自动建档、真实会话未读数、后台看板/用户/类目和 MySQL demo seed。
