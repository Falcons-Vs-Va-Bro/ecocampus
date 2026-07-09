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
- 使用 Spring Web、Security、Validation、Data JPA、Redis starter、Actuator、Springdoc OpenAPI、Flyway、H2 和 MySQL driver。
- 默认 `application.yml` 使用 H2 MySQL mode 和 Flyway migrations。
- `application-local.example.yml` 通过环境变量切换 MySQL 与 Redis。
- `application-prod.yml` 提供独立生产 MySQL 配置，要求显式 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`，配置 Hikari 连接池，并通过启动期防呆阻止 `prod` profile 误用 H2、默认账号、示例密码或不安全 DDL/初始化策略。

已实现 API 范围：

- 健康检查：`/api/v1/health`。
- 认证：短信码、登录、校园核验、当前用户。
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

- 安全模型为无状态 JWT。公开端点包括健康检查、公开类目/商品/求购、认证短信码/登录、Swagger/OpenAPI 和 actuator health。
- `CampusAccessGuard` 在 service 层处理已核验用户、黑名单用户和管理员权限。
- 当前后端认证实现是 `phone + 6 位验证码`；本地开发验证码为 `123456`。
- 后端通过短信登录自动创建的新用户初始为 `UNVERIFIED`，需要完成校园核验后才是 `VERIFIED`。
- Flyway migration 已定义用户、类目、地址、商品、商品配送方式/图片、审计日志、收藏、订单、会话/消息、求购和求购关键词表。
- 数据库约束覆盖枚举 check、手机号/学号唯一、收藏唯一、单商品唯一活跃订单、单用户唯一默认地址和会话唯一性。
- Repository/service 对商品、订单、会话和地址状态变更使用悲观锁，对聚合根使用乐观锁版本号。
- 会话列表和消息列表使用 `PageResponse` 分页；求购匹配使用 `limit` 参数，并在数据库侧按关键词、类目和预算过滤后限量返回。
- 测试覆盖认证、类目、用户/地址、文件上传、商品卖家/后台/公开查询、收藏、私信、订单、求购、后台用户和后台看板。

## 前端状态

技术与运行：

- React 19、TypeScript、Vite 8、pnpm。
- 使用 React Router 7、TanStack Query、Zustand、Axios、Tailwind CSS Vite plugin、Ant Design、lucide-react、Motion for React、React Hook Form 和 Zod。
- 常用脚本：`pnpm dev`、`pnpm lint`、`pnpm build`、`pnpm preview`。
- API base 默认 `/api/v1`，可通过 `VITE_API_BASE_URL` 覆盖。

已实现前端结构：

- 路由元数据位于 `frontend/src/app/routeCatalog.ts`。
- 路由生成位于 `frontend/src/app/routes.tsx`。
- 当前真实页面为 `/`、`/login`、`/items/:id`、`/favorites`、`/messages` 和 `/messages/:conversationId`。
- 其他规划中的公开/用户路由目前渲染市场端 `MarketplacePlaceholderPage`；后台路由仍通过 `RouteGuard` 渲染 `PlaceholderPage`。
- API wrapper 已覆盖 auth、profile、category、item、favorite、file、conversation、order、demand、admin 和 query keys。
- 请求层从 Zustand 注入 bearer token，并生成 `X-Trace-Id`。
- `VITE_USE_MOCKS=true` 下，类目、商品、收藏和私信 API 使用本地 mock。

已实现用户 UI：

- `/` 是公开市场首页，包含搜索、分区 tab、分类/价格/取送筛选、商品卡片、分页、发布闲置/求购快捷入口、求购动态、热门类目和交易提示。
- `/items/:id` 是彩绘风格商品详情页，包含商品图集/缩略图、价格与标签、交易方式、浏览/收藏统计、发布者信息、收藏/立即联系/预约自提动作、交易说明和同发布者商品推荐；当前采用 mock-first 商品详情与订单创建能力。
- `/favorites` 是彩绘风格收藏管理页，包含筛选、批量管理 UI、有效收藏卡片、取消收藏 mutation、失效收藏面板、加载/错误/空状态。
- `/messages` 和 `/messages/:conversationId` 是彩绘风格私信页，包含会话统计、会话搜索/未读筛选、商品关联会话列表、聊天详情、快捷回复、发送消息 mutation、交易提醒和加载/错误/空状态；当前采用 mock-first 私信 API，右侧栏使用生成并压缩后的彩绘 WebP 插画资产。
- `/login` 是厦门大学统一身份认证视觉 mock，使用账号/密码 UI，校验账号前缀 `2292024`，创建本地 mock session，不调用后端。
- 市场端顶部栏、侧栏、商品卡片、彩绘动画样式和公开/用户占位页已沉淀到 `frontend/src/components/marketplace/`；用户端共享视觉资产目前主要位于 `frontend/src/assets/favorites/`，私信页插画资产位于 `frontend/src/assets/messages/`。

## 演示页状态

- 根目录 `process.html` 是课堂/项目进度汇报用独立页面。
- `assets/process/` 包含演示页图片和截图资产。
- `process-standalone.html` 是生成文件，已被忽略。

## 已知对齐问题

- 认证链路当前未完全对齐：
  - `docs/api-contract.md`、`docs/frontend-stack.md`、`frontend/src/api/auth.api.ts` 和 `frontend/src/features/auth/LoginPage.tsx` 描述或实现的是账号/密码 mock 登录，账号前缀为 `2292024`。
  - 后端 `LoginRequest` 和 `AuthService` 实现的是手机号/短信验证码登录，本地验证码为 `123456`。
- 后端新用户初始为 `UNVERIFIED`，但 API 契约写的是自动建档用户默认为 `VERIFIED`。
- 前端 mock 类目包含 9 个首页类目，后端种子迁移目前只插入 4 个类目。
- 除 `/`、`/login`、`/items/:id`、`/favorites`、`/messages` 和 `/messages/:conversationId` 外，大多数前端路由仍是占位页；公开/用户占位页已统一到市场端彩绘壳，真实业务 UI 仍待接入，后端 API 和前端 wrapper 已经更完整。
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
- 2026-07-09 商品详情页 `/items/:id` 接入后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB；已用本地 Chrome headless 检查 1672px 桌面和 390px H5 视口截图。
- 2026-07-09 商品详情页商品信息 L 形卡片和主联系按钮铅笔质感修正后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB；已用本地 Chrome headless 检查 1672px 桌面、390px H5 首屏和 390px H5 商品信息区截图。
- 2026-07-09 商品详情页“立即联系”按钮改为复用市场端公共蓝色铅笔按钮样式后运行 `cd frontend && pnpm lint`、`cd frontend && pnpm build`；前端 lint/build 通过，Vite 仍提示主 chunk 超过 500 kB。
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

- 2026-07-07：完整复核已追踪项目文件后创建本项目状态文件，并将其设为 AI/交接上下文入口。
- 2026-07-08：新增独立 `prod` 数据库配置、Hikari 连接池参数和生产启动防呆，避免上线误用 H2、默认账号或示例密码。
- 2026-07-08：私信会话/消息列表改为分页响应，求购匹配改为数据库侧过滤并限量返回。
- 2026-07-08：抽出市场端共享 `MarketplaceShell`、`MarketplaceItemCard` 和彩绘动画样式，公开/用户占位路由改为统一市场端骨架页。
- 2026-07-09：在 mock 模式下将 `/messages` 和 `/messages/:conversationId` 从市场端占位页替换为真实私信会话列表和聊天详情页，并补齐前端私信 mock API。
- 2026-07-09：用生成并压缩后的彩绘 WebP 插画替换私信列表页“消息小助手”和详情页“交易提醒”右侧栏的 CSS 绘制占位图。
- 2026-07-09：调整 `/messages` 会话行列宽分配，让商品标题 chip 在 1440px 桌面视口完整显示，消息预览承担截断。
- 2026-07-09：将 `/items/:id` 从市场端占位页替换为真实商品详情页，补齐商品详情 mock、台灯详情素材和预约自提 mock 订单反馈。
- 2026-07-09：修正 `/items/:id` 商品信息区为设计稿中的 L 形延展卡片，并强化“立即联系”按钮的蓝色铅笔纹理。
- 2026-07-09：抽出市场端公共 `.market-pencil-primary-button` 蓝色铅笔按钮样式，并让 `/items/:id` 的“立即联系”复用该样式。
