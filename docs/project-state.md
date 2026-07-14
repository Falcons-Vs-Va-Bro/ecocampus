# EcoCampus 项目状态

最近一次全项目复核：2026-07-07

本文件是 AI 协作和人工交接的快速上下文入口。它应保持简短、事实化；完整契约、权限矩阵、设计规范和长期决策仍以 `docs/` 下的真实源文档为准。

## 使用方式

- 开始任务时先读本文件，再按任务影响面阅读相关源文档和代码。
- 不要默认每次全仓库扫描，除非任务影响面不明确、本文件明显过期，或用户明确要求完整项目阅读。
- 完成代码、路由、API、架构、视觉方向或文档变更后，结束前同步更新本文件的相关部分。
- 本文件只做状态索引，不复制完整 API 契约、RBAC 矩阵或设计规格。

## 真实源文档

- API 契约：`docs/api-contract.md`
- RBAC 与权限边界：`docs/rbac.md`
- 前端技术栈、路由、守卫与接口映射：`docs/frontend-stack.md`
- 公开首页与收藏页视觉/内容方向：`docs/frontend-homepage/README.md`
- 用户端彩绘动画方向：`docs/frontend-animation/README.md`
- 数据库约束与锁策略：`docs/database-constraints-and-locking.md`
- GitHub Pages + Mac mini 部署：`docs/deployment-github-pages-macmini.md`
- Sites + Mac mini 历史部署：`docs/deployment-sites-macmini.md`
- 项目汇报演示页规格：`docs/superpowers/specs/2026-07-03-process-page-design.md`

## 产品方向

EcoCampus 是面向校内师生的校园闲置物品流转平台，覆盖教材、数码产品、宿舍用品、运动器材、生活日用等二手交易，以及轻量求购匹配。

当前产品边界：

- Web/H5 是优先交付形态。
- `/` 是公开市场首页/推荐流。
- `/favorites` 是登录用户的个人收藏管理页。
- 用户端市场 UI 遵循手绘校园交易风格。
- 前端业务 UI 采用 mock-first，避免被后端可用性阻塞。
- 后台管理页面以操作效率优先，不默认套用用户端彩绘装饰。

## 仓库结构

- `backend/`：Java 21 Spring Boot API 服务。
- `frontend/`：React + TypeScript + Vite Web/H5 应用。
- `docs/`：接口、设计、架构和项目协作源文档。
- `assets/process/` 与 `process.html`：课堂/项目进度汇报展示资产。

非源码上下文：

- `frontend/node_modules/`、构建输出、日志、本地存储、上传文件和 `process-standalone.html` 不作为源码上下文阅读。
- 图片资产只在视觉相关任务中检查。

## 后端状态

技术与运行：

- Java 21、Spring Boot 3.5.3、Maven Wrapper。
- 使用 Spring Web、Security、Validation、Data JPA、Actuator、Springdoc OpenAPI、Flyway、H2 和 MySQL driver；未被业务使用的 Redis starter 已移除。
- 默认 `application.yml` 使用 H2 MySQL mode 和 Flyway migrations。
- `application-local.example.yml` 通过环境变量切换 MySQL 与 Redis。
- `application-prod.yml` 提供独立生产 MySQL 配置，要求显式 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`，配置 Hikari 连接池，并通过启动期防呆阻止 `prod` profile 误用 H2、默认账号、示例密码或不安全 DDL/初始化策略。

已实现 API 范围：

- 健康检查：`/api/v1/health`。
- 认证：账号密码自动建档登录、校园核验、当前用户。
- 用户/资料：个人资料更新、地址 CRUD。
- 类目：公开列表、后台 CRUD。
- 文件：本地图片上传与 `/uploads/**` 静态访问。
- 商品：公开列表/详情、卖家发布/编辑/上架申请/下架、后台审核、违规下架。
- 收藏：收藏、取消收藏、我的收藏。
- 私信：创建/获取商品会话、分页会话列表、分页消息列表、发送消息。
- 订单：创建订单、我的订单、订单详情、订单状态流转。
- 求购：发布/列表/关闭求购、我的求购、限量商品匹配。
- 后台：数据看板、商品审核/治理、用户黑名单、类目管理。

后端行为要点：

- 安全模型为无状态 JWT。公开端点包括健康检查、公开类目/商品/求购、账号密码登录、Swagger/OpenAPI 和 actuator health。
- `CampusAccessGuard` 在 service 层处理已核验用户、黑名单用户和管理员权限。
- 当前后端认证实现是账号密码：账号必须以 `2292024` 开头，首次登录自动创建 `VERIFIED` 用户并保存 BCrypt 哈希，已有账号必须使用原密码；账号前缀校验视为演示环境统一身份认证结果。
- Flyway migration 已定义用户、类目、地址、商品、商品配送方式/图片、审计日志、收藏、订单、会话/消息、求购和求购关键词表。
- MySQL 本地/演示数据脚本位于 `backend/src/main/resources/db/seed/mysql-demo-seed.sql`，需在 Flyway migration 后手动导入；脚本按前端 mock-first 场景补齐 9 个类目、演示用户、商品、收藏、私信、订单、求购和后台审核/治理样本，不作为自动 migration 运行。
- 数据库约束覆盖登录账号/学号唯一、收藏唯一、单商品唯一活跃订单、单用户唯一默认地址和会话唯一性；当前物理列 `users.phone` 兼容承载登录账号。
- Repository/service 对商品、订单、会话和地址状态变更使用悲观锁，对聚合根使用乐观锁版本号。
- 会话列表和消息列表使用 `PageResponse` 分页；求购匹配使用 `limit` 参数，并在数据库侧按关键词、类目和预算过滤后限量返回。
- 会话表记录双方各自的已读时间，会话列表返回真实 `unreadCount`；读取聊天详情后当前用户未读数归零。
- 测试覆盖认证、类目、用户/地址、文件上传、商品卖家/后台/公开查询、收藏、私信、订单、求购、后台用户和后台看板。

## 前端状态

技术与运行：

- React 19、TypeScript、Vite 8、pnpm。
- 使用 React Router 7、TanStack Query、Zustand、Axios、Tailwind CSS Vite plugin、Ant Design、lucide-react、Motion for React、React Hook Form 和 Zod。
- 常用脚本：`pnpm dev`、`pnpm lint`、`pnpm build`、`pnpm preview`。
- API base 默认 `/api/v1`，可通过 `VITE_API_BASE_URL` 覆盖。
- `.github/workflows/deploy-pages.yml` 将 `frontend/` 自动构建到 GitHub Pages，生产构建使用 `ecocampus-api.teamdsb.online` 真实 API，并通过 Pages base path 与 `404.html` 兼容 React Router 深层路由。
- `frontend/sites/` 保留原 OpenAI Sites 部署适配层，作为迁移记录和回退方案。
- `/login` 与后端统一使用账号密码契约：账号必须以 `2292024` 开头，不存在时自动创建，已存在时校验 BCrypt 密码；JWT 会话通过 Zustand persist 保存。mock 构建保留同样的统一身份认证视觉演示流程。
- 市场端公共壳按真实登录态显示游客或当前用户：游客显示“登录 / 注册”，登录后用 `/auth/me` 显示真实昵称/角色并可退出；生产会话 storage key 已升级到 v2，使 Sites 时期遗留 JWT 首次访问自动失效。
- 路由元数据中的 `auth`、`verified`、`owner` 和 `admin` 已由真实 `RouteGuard` 执行；未登录携带 `returnTo` 跳转 `/login`，非管理员返回公开首页，未核验用户跳转 `/verify`。

已实现前端结构：

- 路由元数据位于 `frontend/src/app/routeCatalog.ts`。
- 路由生成位于 `frontend/src/app/routes.tsx`。
- 当前真实页面为 `/`、`/login`、`/items` 及分类页、`/items/:id`、`/favorites`、`/messages`、`/messages/:conversationId`、`/orders`、`/orders/sales`、`/publish`、`/items/mine`、`/items/:id/edit`、`/profile`、`/verify`、`/admin/items/review`、`/admin/items`、`/admin/users` 和 `/admin/categories`。
- 其他规划中的公开/用户路由目前渲染市场端 `MarketplacePlaceholderPage`；未接入真实业务 UI 的后台路由仍通过 `RouteGuard` 渲染 `PlaceholderPage`。
- API wrapper 已覆盖 auth、profile、category、item、favorite、file、conversation、order、demand、admin 和 query keys。
- 请求层从 Zustand 注入 bearer token，并生成 `X-Trace-Id`。
- `VITE_USE_MOCKS=true` 下，类目、商品、收藏、私信、订单和后台商品治理 API 使用本地 mock。

已实现用户 UI：

- `/` 是公开市场首页，包含搜索、分区 tab、分类/价格/取送筛选、商品卡片、分页、发布闲置/求购快捷入口、求购动态、热门类目和交易提示。
- `/items` 及 `/items/textbook`、`/items/digital`、`/items/dorm`、`/items/outdoors`、`/items/daily-goods`、`/items/make-up`、`/items/instruments`、`/items/tickets`、`/items/others` 是分类商品浏览页，使用 mock-first 商品集合、分类筛选、价格/成色/取货等分类化筛选和收藏交互。
- `/items/:id` 是彩绘风格商品详情页，包含商品图集/缩略图、价格与标签、交易方式、浏览/收藏统计、发布者信息、收藏/立即联系/预约自提动作、交易说明和同发布者商品推荐；当前采用 mock-first 商品详情与订单创建能力。
- `/favorites` 是彩绘风格收藏管理页，包含筛选、批量管理 UI、有效收藏卡片、取消收藏 mutation、失效收藏面板、加载/错误/空状态。
- `/messages` 和 `/messages/:conversationId` 是彩绘风格私信页，包含会话统计、会话搜索/未读筛选、商品关联会话列表、聊天详情、快捷回复、发送消息 mutation、交易提醒和加载/错误/空状态；当前采用 mock-first 私信 API，右侧栏使用生成并压缩后的彩绘 WebP 插画资产。
- `/orders` 重定向到 `/orders/purchase`；`/orders/purchase` 和 `/orders/sale` 分别展示买家侧与卖家侧彩绘订单页，包含订单状态统计、状态筛选、订单搜索、订单卡片、状态流转 mutation、订单提示/状态流转侧栏和加载/错误/空状态；当前采用 mock-first 订单 API，正式 DTO 仍以订单摘要字段为准，图片/价格/昵称由 mock 展示元数据补充。
- `/orders/purchase/demand`、`/orders/purchase/demand/:id/detail`、`/orders/purchase/demand/new` 和 `/orders/purchase/demand/mine` 是 mock-first 求购流程；列表支持分类/预算/状态筛选与关注，动态详情页展示预算、成色、地点、发布者、匹配闲置、相似求购和交易流程，并可进入私信或我的商品；关注状态通过本地存储同步到 `/favorites` 的“求购关注”页签，可从收藏页返回详情或取消关注。
- `/publish`、`/items/mine` 和 `/items/:id/edit` 是 mock-first 发布与我的商品管理流程，当前主要依赖前端状态和 `localStorage` 串联草稿、待审核商品和编辑跳转。
- `/profile` 和 `/verify` 是 mock-first 个人信息、地址与校园核验页面，使用本地 mock 状态承接登录后的用户侧流程。
- `/login` 是厦门大学统一身份认证视觉 mock，使用账号/密码 UI，校验账号前缀 `2292024`，创建本地 mock session，不调用后端。
- 市场端顶部栏、侧栏、商品卡片、彩绘动画样式和公开/用户占位页已沉淀到 `frontend/src/components/marketplace/`；用户端共享视觉资产目前主要位于 `frontend/src/assets/favorites/`，私信页插画资产位于 `frontend/src/assets/messages/`。
- 分类商品页、个人中心、校园核验、发布闲置、我的发布和编辑商品已通过 `UnifiedMarketplacePage` 直接复用首页的 `MarketplaceShell`；`frontend/src/styles/marketplace-consistency.css` 只负责收拢这些页面保留的业务内容 DOM，顶部栏、页面底色、左侧图标/校园插画、选中态和入场动画均由共享壳统一提供。

已实现后台 UI：

- 后台路由使用 `frontend/src/components/admin/AdminShell.tsx` 承载管理后台顶部搜索、左侧导航、管理员入口和跨路由链接。
- `/admin/items/review` 是商品审核页，包含待审核商品列表、图片/描述/卖家信息摘要、审核意见和通过/驳回 mutation；当前采用 mock-first 后台商品审核 API。
- `/admin/items` 是商品治理/违规下架页，包含治理指标、关键词/分类/状态/价格/举报筛选、商品治理表格、查看详情跳转、违规下架确认 mutation、治理规则和下架记录快捷查看；当前采用 mock-first 后台商品治理 API。
- `/admin/users` 是用户与黑名单工作台，包含用户指标、搜索、全部/黑名单视图、用户列表和加入/移出黑名单确认；mock 模式下提供可变更的后台用户数据。
- `/admin/categories` 是类目管理工作台，包含类目指标、搜索/状态筛选、一级/二级树状列表、启停、编辑和新增子类交互；当前采用 mock-first 类目数据。

## 演示页状态

- 根目录 `process.html` 是课堂/项目进度汇报用独立页面。
- `assets/process/` 包含演示页图片和截图资产。
- `process-standalone.html` 是生成文件，已被忽略。

## 已知对齐问题

- 前端 mock 类目包含 9 个首页类目，后端自动 Flyway 种子迁移目前只插入 4 个类目；2026-07-12 新增的手动 MySQL demo seed 已按前端 mock 补齐 9 个类目，但不会自动随应用启动导入。
- 类目后端仍是扁平模型；设计稿中的二级类目、启停状态与商品数统计尚未落入数据库契约，当前真实 API 仅支持一级类目名称/排序 CRUD。
- 除 `/`、`/login`、商品浏览/详情、收藏、私信、订单、求购、发布/我的商品、个人信息、校园核验、商品审核、商品治理、用户与黑名单和类目管理外，其余规划中的前端路由仍是占位页；公开/用户占位页已统一到市场端彩绘壳，后端 API 和前端 wrapper 已经更完整。
- 根目录 `README.md` 的开发状态仍描述较早的骨架阶段，后续做文档整理时应刷新。

## 当前验证基线

- 创建本文件前，Git 追踪工作区无改动。
- 已追踪的后端测试覆盖主要模块，但本次文档方案创建没有重新运行测试套件。
- 2026-07-08 数据库生产配置防呆变更后运行 `cd backend && ./mvnw test`，结果：28 tests, 0 failures, 0 errors, 0 skipped。
- 2026-07-08 分页/限量接口变更后运行 `cd backend && ./mvnw test`、`cd frontend && pnpm lint`、`cd frontend && pnpm build`；后端 28 tests 全通过，前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-08 市场端共享壳/卡片/占位页重构后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 私信会话列表和私信详情 mock-first UI 接入后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 私信页右侧栏插画替换为生成 WebP 资产后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 私信会话列表商品标题列宽修正后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 合并 PR #2 的分类商品页、发布/我的商品、个人信息和校园核验 mock-first 页面后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 商品详情页 `/items/:id` 接入后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB；已用本地 Chrome headless 检查 1672px 桌面和 390px H5 视口截图。
- 2026-07-09 商品详情页商品信息 L 形卡片和主联系按钮铅笔质感修正后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB；已用本地 Chrome headless 检查 1672px 桌面、390px H5 首屏和 390px H5 商品信息区截图。
- 2026-07-09 商品详情页“立即联系”按钮改为复用市场端公共蓝色铅笔按钮样式后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 我的订单 mock-first UI 接入并清理后台壳未使用图标导入后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 `/admin/items` 商品治理/违规下架 mock-first UI 接入后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 订单侧边栏购买/出售入口改为 `/orders?role=BUYER` 与 `/orders?role=SELLER`，订单页读取并同步 `role` 查询参数；运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build` 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 出售订单前端路由改为 `/orders/sales`，`/orders` 固定为购买订单页，出售订单页固定卖家视角并更新卖家提示/状态动作；运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build` 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 将最新 `origin/main` 合入 `backend-dev` 并解决商品详情、订单和后台治理前端冲突后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-13 求购详情动态路由 `/orders/purchase/demand/:id/detail` 接入后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。侧边浏览器因本地地址安全策略未完成自动化视觉检查。
- 2026-07-13 用户端旧版页面壳统一到首页视觉体系后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-09 将最新 `origin/main` 合入 `zzh`，保留主线新增分类/商品详情/发布/个人资料页面状态和 `zzh` 的订单 `role` 查询参数直达逻辑；运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build` 通过，Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-11 真实接口第一阶段与 Tailscale 双机部署模板完成后运行 `cd backend && ./mvnw test`（29 tests 全通过）、`cd frontend && pnpm lint && pnpm build`（通过）；Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-11 账号密码自动建档登录接入后运行 `cd backend && ./mvnw test`（30 tests 全通过）、`cd frontend && pnpm lint && pnpm build`（通过）；Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-11 使用 H2 后端与 `VITE_USE_MOCKS=false` 前端完成真实 E2E 冒烟：首次账号自动创建、重复登录复用用户、错误密码返回 401、浏览器 `/login` 提交后跳转 `/`，控制台无 error。
- 2026-07-11 修复 mock token 污染真实 API：mock/real 使用独立持久化会话 key，任意非登录请求 401 时清理会话并携带 `returnTo` 跳转登录；恢复账号自动建档为 `VERIFIED`。真实冒烟验证 `/auth/me`、会话、收藏、订单、我的发布、我的求购均为 200，浏览器登录后返回 `/messages` 且无加载错误或控制台 error。
- 2026-07-11 移除所有市场端壳体中通知/私信/消息中心的硬编码徽标；新增会话双方已读时间和真实 `unreadCount`，共享 hook 驱动顶部站内信与侧栏消息徽标，数量为 0 时不渲染。通知系统尚未落库，真实通知数为 0。
- 2026-07-12 新增手动 MySQL demo seed 脚本后运行 `cd backend && ./mvnw test`，结果：28 tests, 0 failures, 0 errors, 0 skipped。
- 2026-07-12 合并远端账号密码登录、会话未读数和后台管理更新，并将 MySQL demo seed 账号改为 `2292024...`/`demo-password` 后运行 `cd backend && ./mvnw test`（30 tests 全通过）、`cd frontend && pnpm lint`、`cd frontend && pnpm build`（通过）；Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-14 解决 PR #3 与 `main` 的冲突后运行 `cd backend && ./mvnw test`（32 tests 全通过）、`cd frontend && pnpm lint && pnpm build`（通过）；Vite 仍提示主 chunk 超过 500 kB。
- 2026-07-14 新增 Sites 部署适配层并接通 Mac mini 真实生产链路：`frontend/sites` 构建通过；后端 32 tests 全通过并完成生产 JAR 构建；本机 MySQL 完成 Flyway v1–v4，Spring Boot 与 Cloudflare Tunnel 由 LaunchAgent 常驻，公网健康接口 `https://ecocampus-api.teamdsb.online/api/v1/health` 返回 UP。
- 2026-07-14 Sites 私有生产版本 v2 发布成功，`ecocampus.teamdsb.online` 的域名与证书状态均为 active；带 Sites owner-only bypass 验证 `/`、`/messages`、`/admin/users` 均返回 200，公网真实登录与 `/auth/me` 返回 200 并写入 MySQL。
- 2026-07-14 Sites v2 访问策略切换为 public 并重新发布；匿名访问 `ecocampus.teamdsb.online` 的 `/`、`/messages`、`/admin/users` 均返回 200，公网 API 健康检查返回 200。
- 2026-07-14 为课堂展示新增 GitHub Pages 自动部署工作流，前端继续连接 Mac mini 上的真实 API；本地 `pnpm lint` 与 Pages 子路径生产构建通过，`ecocampus.teamdsb.online` 已完成 DNS 切换、证书签发和强制 HTTPS，公网登录与 `/auth/me` 验证通过。
- 2026-07-14 修正公共首页硬编码登录身份：新增真实 `/auth/me` 用户快捷入口、客户端退出、生产会话 v2 迁移和有效路由守卫；前端 `pnpm lint`、`pnpm build` 通过。
- 纯文档变更至少运行 `git diff --check`。
- 后端变更运行 `cd backend && ./mvnw test`。
- 前端变更运行 `cd frontend && pnpm lint && pnpm build`。

## 维护清单

任务结束前，如果任一问题答案为“是”，需要更新本文件：

- 产品方向、路由归属、API 形状、认证行为、RBAC、数据库结构、视觉方向或 mock 策略是否变化？
- 是否有占位页变成真实业务 UI？
- 是否有后端端点新增、移除或行为显著变化？
- 测试/构建状态或已知阻塞是否变化？
- `docs/` 下源文档是否发生了后续任务应快速知道的变化？

更新规则：

- 只改相关小节。
- 内容保持事实化；必要时带日期。
- 持久细节写入对应源文档，本文件只链接和摘要。
- 不隐藏未解决的不一致；记录到“已知对齐问题”。

## 最近变更

- 2026-07-14：移除市场公共壳硬编码“海风吹过嘉庚楼”登录展示，游客恢复未登录入口，真实用户昵称由 `/auth/me` 驱动，并启用受保护路由守卫和退出登录。
- 2026-07-14：课堂展示前端由 OpenAI Sites 迁移到 GitHub Pages，保留 Mac mini、MySQL、Cloudflare Tunnel 和 API 域名不变，不修改 `dmit-la`。
- 2026-07-14：将 Sites 前端从 owner-only 切换为 public，完成公开生产部署和自定义域名匿名访问验证。
- 2026-07-14：采用 OpenAI Sites 托管前端、Mac mini 运行 Spring Boot/MySQL/Cloudflare Tunnel 的部署结构；新增可配置生产 CORS、Sites SPA 适配层和部署文档，不修改 `dmit-la`。
- 2026-07-14：解决 PR #3 与 `main` 的冲突，采用 PR 的 `/orders/purchase`、`/orders/sale` 和求购流程，保留 `/orders`、`/orders/sales` 作为兼容重定向入口，并保留主线真实未读消息计数、账号密码认证和后台看板更新。
- 2026-07-13：修正公开商品 GET 接口携带过期或无效 Bearer token 时被 JWT 过滤器提前返回 401 的问题；公开商品列表/详情会降级为匿名访问，受保护的商品写操作仍返回 401。
- 2026-07-13：首页商品和分类响应增加运行时格式校验与空数组 fallback，避免 API 返回缺失 `data/items` 时页面崩溃，并为异常商品响应展示可重试错误状态。
- 2026-07-07：完整复核已追踪项目文件后创建本项目状态文件，并将其设为 AI/交接上下文入口。
- 2026-07-08：新增独立 `prod` 数据库配置、Hikari 连接池参数和生产启动防呆，避免上线误用 H2、默认账号或示例密码。
- 2026-07-08：私信会话/消息列表改为分页响应，求购匹配改为数据库侧过滤并限量返回。
- 2026-07-08：抽出市场端共享 `MarketplaceShell`、`MarketplaceItemCard` 和彩绘动画样式，公开/用户占位路由改为统一市场端骨架页。
- 2026-07-09：在 mock 模式下将 `/messages` 和 `/messages/:conversationId` 从市场端占位页替换为真实私信会话列表和聊天详情页，并补齐前端私信 mock API。
- 2026-07-09：用生成并压缩后的彩绘 WebP 插画替换私信列表页“消息小助手”和详情页“交易提醒”右侧栏的 CSS 绘制占位图。
- 2026-07-09：调整 `/messages` 会话行列宽分配，让商品标题 chip 在 1440px 桌面视口完整显示，消息预览承担截断。
- 2026-07-09：合并 PR #2，接入商品分类浏览页、发布/我的商品、商品编辑、个人信息和校园核验 mock-first 页面；冲突处理保留 `main` 的共享 `MarketplaceShell`/`MarketplaceItemCard` 架构，同时采纳 `Jenny_front-end` 的分类路由、校内配送文案和相关交互入口。
- 2026-07-09：将 `/items/:id` 从市场端占位页替换为真实商品详情页，补齐商品详情 mock、台灯详情素材和预约自提 mock 订单反馈。
- 2026-07-13：将求购列表数据抽为共享 mock 模型，新增 `/orders/purchase/demand/:id/detail` 动态详情页，并把每张求购卡片的“查看详情”入口切换到该路由。
- 2026-07-13：新增卖家侧 `/orders/sale` 路由，将各用户端导航的“出售订单”统一指向该路由；页面按参考稿实现卖家统计、两列紧凑订单卡片、买家预约/地点/消息、卖家操作、卖家提示和状态流转，并补充 6 条卖家侧 mock 订单。
- 2026-07-13：新增 `UnifiedMarketplacePage`，将个人中心、校园核验、发布闲置、我的发布和编辑商品直接接入首页同款 `MarketplaceShell`，隐藏重复旧壳并统一左侧图标、校园插画、选中态和入场动画。
- 2026-07-13：将 `/items` 及九个分类商品页从独立 `market-page` 旧壳迁入 `UnifiedMarketplacePage`，移除分类页对顶部栏、底色和左侧导航的独立渲染，确保与首页使用同一套共享壳。
- 2026-07-09：修正 `/items/:id` 商品信息区为设计稿中的 L 形延展卡片，并强化“立即联系”按钮的蓝色铅笔纹理。
- 2026-07-09：抽出市场端公共 `.market-pencil-primary-button` 蓝色铅笔按钮样式，并让 `/items/:id` 的“立即联系”复用该样式。
- 2026-07-09：在 mock 模式下将 `/orders` 从市场端占位页替换为真实我的订单页，并补齐前端订单 mock API、状态流转 mutation 和订单响应契约摘要。
- 2026-07-09：在 mock 模式下将 `/admin/items` 从后台占位页替换为真实商品治理/违规下架工作台，并补齐前端后台商品治理 mock API 和下架 mutation。
- 2026-07-09：订单侧边栏购买/出售入口改为 `/orders?role=BUYER` 与 `/orders?role=SELLER`，订单页角色切换同步 `role` 查询参数。
- 2026-07-09：出售订单前端路由改为 `/orders/sales`，侧栏出售入口同步跳转新路径，订单页拆为固定购买/出售视角并更新出售订单卖家提示、状态标签和操作按钮。
- 2026-07-09：将最新 `origin/main` 合入 `backend-dev`，合并保留 `/items/:id` 商品详情、`/orders` 我的订单、`/admin/items/review` 商品审核和 `/admin/items` 商品治理页面。
- 2026-07-09：将最新 `origin/main` 合入 `zzh`，合并保留主线新增用户端页面和 `zzh` 的 `/orders?role=BUYER`、`/orders?role=SELLER` 订单角色直达入口。
- 2026-07-11：将 `/admin/users` 与 `/admin/categories` 从后台占位页替换为真实 mock-first 管理工作台，补齐用户黑名单 mock mutation、类目树状管理交互和同路径导航激活逻辑。
- 2026-07-11：开始真实后端对接：持久化 JWT、修正黑名单必填原因并接入一级类目 CRUD；移除未使用 Redis 依赖，新增本机应用主机 + `dmit-la` 公网入口的 Tailscale 双机部署模板和低内存 JVM/连接池配置。
- 2026-07-11：按产品确认将登录恢复为账号密码方案：账号仅校验 `2292024` 前缀，首次登录自动建档并保存 BCrypt 密码哈希，后续登录校验原密码；移除前端和公开控制器中的短信验证码流程。
- 2026-07-12：新增手动执行的 MySQL demo seed 脚本 `backend/src/main/resources/db/seed/mysql-demo-seed.sql`，对照前端 mock-first 数据补齐 9 个类目、商品、用户、收藏、私信、订单、求购和后台演示样本。
- 2026-07-12：合并最新 `origin/main` 的账号密码登录、会话未读数、后台用户/类目管理和部署模板更新，并将 MySQL demo seed 演示用户账号调整为 `2292024...`、统一密码为 `demo-password`。
