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
- 图片仅实现本地 JPEG/PNG/GIF 存储；`FILE_STORAGE_TYPE` 没有实现选择器。`GET /uploads/**` 已公开并返回一年期 `public, immutable` 缓存头，生产上传响应默认使用 API 域名完整 URL，可由 Cloudflare和浏览器缓存。

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

- API-backed：`/login`、`/`、`/items`、九个 `/items/*` 分类页、`/items/:id`、商品收藏、私信、购买/出售订单、求购广场、发布求购、我的求购/匹配结果、个人常用地址、后台看板、后台商品/用户/类目。主页求购摘要、分类商品、商品卡片、收藏失效、订单卡片、私信详情当前用户判断和求购主要链路已使用真实 API 字段。
- API-backed limited：求购详情页通过公开 `GET /demands` 列表兜底定位开放求购；后端没有单条求购详情接口，关闭/非公开求购无法直接展示。
- Local mock：发布/我的商品/编辑（上传图片压缩后随草稿和商品本地持久化）；头像与基本资料编辑、核验表单；收藏里的求购关注。
- Placeholder：`/demands`、`/demands/new`、`/demands/mine`。
- Redirect：`/orders -> /orders/purchase`，`/orders/sales -> /orders/sale`。

市场移动布局：

- 宽度不超过 `720px` 时，用户端共享市场壳切换为独立移动结构：紧凑品牌/搜索/横向分类区与固定五项底部导航；`721px` 起继续使用原桌面顶部栏和左侧导航。
- `/` 移动首页使用独立信息流：快捷发布、横向分区、折叠筛选、双列紧凑商品卡、分页、求购动态、热门类目和折叠安全提示；桌面首页结构未改。
- `/items` 移动端默认折叠筛选并使用双列紧凑商品卡；`/publish` 改为宽度安全的单列手机表单并移除桌面辅助面板；`/messages` 使用横向紧凑统计和短会话卡，避免辅助组件占据首屏。
- 移动和桌面首页的求购摘要均调用 `GET /demands`，入口已统一到 `/orders/purchase/demand*`。

登录视觉：

- `/login` 的桌面与移动展示已拆分，共享账号、密码、语言、错误、认证请求和安全 `returnTo` 跳转状态。
- 宽度不超过 `640px` 时使用独立厦大官网移动版：默认中文、仅账号密码登录、本地移动背景与品牌/密码图标；横屏粗指针手机也保持移动布局。
- 桌面版继续使用三张官网背景轮播和扫码/账号双标签，不受移动端样式影响。

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

1. 后台商品真实摘要缺少审核/治理页面 mock 中的图片、描述、举报数、审核标记等元数据；前端 wrapper 类型过宽。
2. 校园核验、收藏、上下架、关闭求购、审核/违规下架等若干 mutation wrapper 声明 `void`，后端实际返回当前用户、商品/求购详情或后台商品摘要。
3. 后端没有 `GET /demands/{demandId}`、求购编辑、删除或重开端点；前端求购详情只能通过公开列表兜底，发布页编辑模式明确不可用。
4. 求购关注仍为 `localStorage` 本地能力，后端没有对应收藏表/API。
5. 九个分类页面已改用真实商品列表，但当前先取前 80 件后按 `categoryName` 做客户端筛选；数据量超过 80 时应改为先解析真实类目 id，再用后端 `categoryId` 分页查询。
6. 类目数据库是扁平一级模型；后台树层级、启停、商品数是本地展示状态。
7. 过期黑名单不会自动恢复 `verificationStatus`；过期后交易请求从 423 变为 403，仍需管理员移出。
8. 没有前端组件/路由自动化测试；前端验证目前只有 lint/build 和人工页面检查记录。
9. GitHub Pages 深层 URL 依靠 `404.html` 启动 SPA，内容可用但 HTTP 状态仍为 404，不是真正的服务端 rewrite。
10. `/uploads/**` 匿名读取和缓存头已闭合，但发布页仍是 Local mock，尚未调用上传/商品发布 API；演示数据库中现有 79 条 `/src/assets/**` 图片路径也仍需迁移为真实上传 URL。
11. `application-local.example.yml` 的 `FILE_STORAGE_TYPE` 和 Redis 配置没有对应运行时实现/依赖。
12. Vite 支持通过 `VITE_API_PROXY_TARGET` 为 `/api` 开启可选同源代理；未设置时保持原有无代理行为。
13. 商品 `off-shelf` 只阻止 `SOLD/DELETED`，卖家可把 `VIOLATION_REMOVED` 改为 `OFF_SHELF` 后重新申请审核，违规下架存在绕过路径。
14. 市场公共壳仍显示“登录 / 注册”，但没有注册路由/端点，点击只进入自动建档登录页。
15. 后台用户页的总量、今日新增、注册日期、发布数，以及类目页的层级/启停/商品数，部分仍是硬编码或本地展示值。

## 部署状态

```text
GitHub Pages frontend
  -> https://ecocampus-api.teamdsb.online/api/v1
  -> Cloudflare Tunnel
  -> Mac mini Spring Boot + MySQL
```

`.github/workflows/deploy-pages.yml` 在 `main` 的前端/工作流变更时用 Node 22、pnpm 10 构建真实 API 版本并生成 `404.html`。`frontend/sites/` 是历史 Sites 适配层；`deploy/` 是 Linux/Tailscale 备选模板。

后端使用仓库级 self-hosted Runner `ecocampus-macmini` 在 Mac mini 本机构建和部署；`deploy-backend-macmini.yml` 仅由 `main` 的后端/部署文件变化或手动触发。固定部署器执行原子 JAR 替换、最长 45 秒健康检查和失败回滚，成功 SHA 写入本机状态文件。Runner 不需要公网入站端口，也不经过 `dmit-la`。公开仓库的 `main` 当前没有分支保护，拥有直接写权限的协作者可以修改 workflow，这是现存的 Runner 安全边界。

数据库运维通过 Mac mini 系统 OpenSSH + Tailscale 内网隧道接入；为避开 Shadowrocket 对 `100.64.0.0/10` 的冲突路由，Tailscale Serve 以 tailnet-only TCP 2222 代理到本机 SSH 22。运维公钥只能经 Tailscale/本机代理转发到 MySQL 3306，不能获取 Shell 或访问其他端口。MySQL 使用独立的本地 `ecocampus_ops` 数据库级账号，3306 仍仅监听 loopback。

2026-07-14 已记录的课堂负载基线：真实商品列表 600 请求、60 并发，0 失败、439.30 req/s、P95 269 ms、最长 477 ms；MySQL 连接峰值 10/151，慢查询 0。

## 验证基线

本轮文档审计与最新远端性能变更组合后（2026-07-14）已验证：

- `cd backend && ./mvnw test`：33 tests 通过，0 failures、0 errors、0 skipped；包含上传图片匿名读取和一年期缓存头测试。
- `cd frontend && pnpm lint && pnpm build`：通过；入口包为 628.33 kB（gzip 205.52 kB），Vite 仍提示部分 chunk 超过 500 kB。
- 2026-07-14 管理员路由域隔离变更后 `cd frontend && pnpm lint && pnpm build` 通过。
- 2026-07-14 管理员路由域隔离已由 GitHub Pages 发布；真实管理员登录返回 `ADMIN/VERIFIED`，后台 summary API 返回 200，线上产物确认登录默认目标、全局管理员重定向和退出登录逻辑均已包含。
- 2026-07-14 self-hosted 后端 CD 首次运行成功：Mac mini Runner 在 48 秒内完成 32 项测试、JAR 构建、原子部署和健康检查；部署 SHA 与 `main` 一致，公网 health 为 `UP`，Runner 空闲 RSS 约 97 MB。
- 相对 Markdown 链接检查和 `git diff --check` 通过。
- 公网首页 HTTP 200，API health 为 `UP`；深层路由返回相同前端内容但 HTTP 404。
- 2026-07-15 登录页移动适配：`pnpm lint`、`pnpm build` 通过；浏览器模拟验证 360×740、390×844、430×932、640/641 断点、390×640 矮屏和 844×390 粗指针横屏，桌面 1440×900 布局保持原有轮播与双登录标签。
- 2026-07-15 市场首页移动重构：`pnpm lint`、`pnpm build` 通过；浏览器模拟验证 390×844、430×932、720×900、721×900 和 1440×900，移动首屏完整露出双列商品卡，无横向溢出，收藏页正确复用移动壳，桌面首页恢复原结构。
- 2026-07-15 发布/编辑商品图片预览修复后运行 `cd frontend && pnpm lint && pnpm build` 通过；Chrome 自动化验证选择非台灯图片后，发布页预览与“我的发布”封面一致，控制台 0 error。
- 2026-07-15 分类商品页排序交互补齐后运行 `cd frontend && pnpm lint && pnpm build` 通过；Chrome 自动化确认 4 个选项可切换、价格升降序结果正确、关注度排序改变卡片顺序，控制台 0 error。
- 2026-07-15 `/profile` 常用地址编辑与删除交互补齐后运行 `cd frontend && pnpm lint && pnpm build` 通过；人工确认地址可编辑保存，删除后对应卡片从本地列表消失。
- 2026-07-15 `/profile` 移动端比例调整后 `cd frontend && pnpm lint && pnpm build` 通过；内置浏览器验证 390×844 与 430×932 下“个人中心”保持单行、无横向溢出，430px 下资料卡高度由约 452px 收紧至 339px，控制台 0 error。
- 2026-07-15 分类、发布、消息页移动端密度调整后 `cd frontend && pnpm lint && pnpm build` 通过；内置浏览器在 430×932 下验证三页无横向溢出、控制台 0 error。分类页筛选默认折叠且可展开/收起，商品首卡位于 `y≈287`；发布页不再被固定最小宽度裁切；消息统计区由约 357px 降至 81px，首条会话由 `y≈771` 提前至 `y≈344`。
- 2026-07-15 主页求购摘要、九个分类商品页和 `/profile` 常用地址切换真实 API 后，`cd frontend && pnpm lint && pnpm build` 通过；内置浏览器经可选 Vite API 代理验证主页返回 3 条真实求购、教材页返回后端当前 8 件商品，未登录访问 `/profile` 正确跳转 `/login?returnTo=%2Fprofile`。地址写操作未在无登录凭据下执行。

## 文档维护规则

- 先更新承载完整事实的源文档，再更新本文件摘要。
- 路由必须标明 API-backed、Local mock、Placeholder 或 Redirect。
- “API wrapper 已存在”不等于页面已接线，“页面已绘制”不等于真实 API 可用。
- mock DTO 不得被写成后端真实响应。
- 部署文档必须标明当前、历史或备选。
- 路由、API、DTO、权限、数据库、页面数据源、部署、性能基线或视觉方向变化后同步维护本文件。

## 最近变更

- 2026-07-16：配置完整图片缓存链路：匿名开放 `GET /uploads/**`，添加一年期 `public, immutable` 缓存头，并让生产上传响应默认返回 API 域名完整 URL；Cloudflare 已启用仅匹配 `ecocampus-api.teamdsb.online/uploads/*` 的一年期 Edge/Browser Cache Rule，未匹配 `/api/*` 或启用 Cache Reserve。
- 2026-07-15：移除主页求购摘要、九个分类页和个人地址区的页面硬编码业务数据；分别接入 demand、item 与 profile address API，并增加可选的 Vite `/api` 联调代理。
- 2026-07-15：分别重构分类、发布和消息页的移动端信息密度；分类筛选默认折叠并展示双列商品，发布表单改为无溢出的单列结构，消息统计与会话列表改为紧凑首屏布局，桌面端保持原状。
- 2026-07-15：调整 `/profile` 移动端页面比例，固定“个人中心”为单行标题，缩小头像与资料字号，并将资料操作、地址区和设置区改为更紧凑的手机布局；桌面端不受影响。
- 2026-07-15：新增独立市场移动壳与首页移动信息流，使用紧凑搜索/分类、双列商品卡、折叠筛选和固定底部导航；桌面结构保持原状。
- 2026-07-15：登录页新增独立厦大官网移动版，背景、Logo 和密码图标改为本地资源；移动端默认中文并只保留账号密码登录，桌面版保持原结构。
- 2026-07-15：补齐 `/profile` 常用地址卡片交互，支持编辑地址名称、详细地点、联系人和配送方式并保存或取消，同时保留每张卡片的即时删除能力。
- 2026-07-15：将分类商品页静态“最新发布”按钮改为真实排序菜单，支持 4 种客户端排序方式和键盘操作。
- 2026-07-15：第二组真实接线完成：求购广场调用 `GET /demands`/类目 API，发布求购调用 `POST /demands`，我的求购调用 `GET /users/me/demands`、匹配 API 和关闭 API；移除编辑/删除/重开等后端不存在的假操作。
- 2026-07-15：第一组真实接线完成：商品列表/详情补齐卖家、配送、收藏元数据；收藏列表返回失效原因和收藏时间；订单响应补图片、价格和双方昵称；私信详情改用真实当前用户 id 判断消息归属。
- 2026-07-15：修复 Local mock 发布/编辑商品时上传图片始终显示固定台灯素材的问题；选择的图片会压缩为 WebP 数据，真实用于预览、草稿和新发布商品封面。
- 2026-07-15：恢复 Mac mini 的 Tailscale 节点在线状态，新增仅限 Tailscale/本机代理来源和 MySQL 3306 转发的运维公钥入口，并创建数据库级独立运维账号；针对 Shadowrocket 冲突路由增加 tailnet-only SSH 2222 转发，未开放 Shell、MySQL 网络监听或公网端口。
- 2026-07-14：在 Mac mini 注册仓库级专用 self-hosted Runner，新增后端 `main` 自动测试、构建、原子部署、健康检查与失败回滚链路；构建不再经过 GitHub 托管 Runner。
- 2026-07-14：修正管理员登录被送往公共首页的问题；管理员默认进入 `/admin` 并被限制在后台路由树，后台未实现入口改为禁用，同时补充后台退出登录。
- 2026-07-14：完成全仓库文档/实现对照审计，按代码重写入口 README、API、RBAC、前端数据源和项目状态，显式记录真实 DTO 与 mock UI 差异。
- 2026-07-14：前端改为路由级动态导入，位图统一为 WebP 并限制首屏主动加载；课堂单实例连接池和 Tomcat 并发参数上调，完成 60 并发负载基线。
- 2026-07-14：课堂展示前端切换到 GitHub Pages，后端继续运行在 Mac mini 并经 Cloudflare Tunnel 暴露。
- 2026-07-14：公共市场壳改为由真实 `/auth/me` 展示身份并启用 v2 认证存储与路由守卫。
- 2026-07-13：完成求购详情、本地求购关注和用户端共享市场壳整合。
- 2026-07-11 至 2026-07-12：接入账号密码自动建档、真实会话未读数、后台看板/用户/类目和 MySQL demo seed。
