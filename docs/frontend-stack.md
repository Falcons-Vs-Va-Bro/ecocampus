# EcoCampus 前端技术栈、路由与数据源

最近一次按 `frontend/package.json`、`routeCatalog.ts`、`routes.tsx`、API wrappers 和页面组件全量复核：2026-07-14；登录页与市场首页移动响应式实现复核：2026-07-15。

## 1. 技术栈

| 层级 | 当前实现 |
| --- | --- |
| 框架 | React 19.2、TypeScript 6 |
| 构建 | Vite 8，pnpm lockfile |
| 路由 | React Router 7，`createBrowserRouter` |
| 服务端状态 | TanStack Query 5 |
| 本地状态 | Zustand 5；认证使用 persist |
| 请求 | Axios，统一 token、`X-Trace-Id`、401 清会话 |
| 样式 | Tailwind CSS Vite plugin 已安装；当前业务页面主要使用普通 CSS 文件和共享样式 |
| 后台 UI | Ant Design 6 与自定义 CSS |
| 图标/动画 | lucide-react、Motion for React |
| 表单依赖 | React Hook Form、Zod 已安装；现有不少页面仍使用组件本地状态 |

常用命令：

```bash
cd frontend
pnpm dev
pnpm dev:mock
pnpm lint
pnpm build
pnpm preview
```

`pnpm dev:mock` 通过 `.env.mock` 设置 `VITE_USE_MOCKS=true`。默认 API base 为同源 `/api/v1`，可用 `VITE_API_BASE_URL` 覆盖。需要通过 Vite 同源代理联调远端后端时，可设置 `VITE_API_PROXY_TARGET=https://example-api.invalid`；代理会转发 `/api/**` 并避免浏览器跨域限制。本地直连 8080 后端仍可设置 `VITE_API_BASE_URL=http://localhost:8080/api/v1`。`VITE_BASE_PATH` 同时服务 Vite base 和 React Router basename。

## 2. 代码边界

```text
src/
├── app/                 # providers、路由元数据与组件映射
├── api/                 # API wrappers、query keys 和 API mock
├── components/
│   ├── marketplace/     # 用户端共享壳、商品卡片、占位页
│   ├── admin/           # 管理后台共享壳
│   └── layout/          # RouteGuard、404、基础布局
├── features/            # 页面与页面级样式/本地演示数据
├── hooks/               # 当前用户、未读消息、document title
├── stores/              # Zustand 认证状态
└── types/               # 通用 API/路由类型
```

路由元数据位于 `src/app/routeCatalog.ts`，组件映射位于 `src/app/routes.tsx`，页面组件由 `src/app/routeComponents.ts` 通过 `React.lazy` 按路由加载，`App.tsx` 提供 `Suspense` 回退。判断页面是否已实现必须同时看 catalog 和组件映射；出现在 catalog 中不代表已有真实业务 UI 或后端接线。

## 3. 路由现状

状态含义：

- **API-backed**：页面调用 `src/api/` wrapper，可在 wrapper 支持时切换 mock/真实 API。
- **Local mock**：有完整业务 UI，但关键数据或提交只在组件、本地模块或 `localStorage` 中处理。
- **Placeholder**：catalog 中存在，但渲染统一占位页。
- **Redirect**：仅兼容跳转。

### 用户端

| 路由 | 页面状态 | 当前数据源/说明 |
| --- | --- | --- |
| `/login` | API-backed | 真实模式调用 `POST /auth/login`；mock 模式本地自动建档并生成 mock token；桌面与移动端使用独立厦大统一认证布局 |
| `/` | API-backed | `GET /items`、`GET /categories`、`GET /demands`；商品卡片和“同学正在求购”均来自 API |
| `/items` | API-backed | `GET /items`；客户端筛选和分页 |
| `/items/textbook` 等 9 个分类路由 | API-backed | 共用 `ItemsPage`，商品来自 `GET /items`，再按真实 `categoryName`、价格、配送和认证字段做客户端筛选与排序；不再使用组件内分类商品数组 |
| `/items/:id` | API-backed | 商品详情、收藏、创建会话、下单；相关商品依赖列表 DTO |
| `/favorites` | API-backed + Local mock | 商品收藏走 favorite API，失效商品收藏由真实状态与 `invalidReason` 支撑；“求购关注”存 `localStorage` |
| `/messages` | API-backed | 会话列表 API；商品图/状态等使用 mock 展示元数据 |
| `/messages/:conversationId` | API-backed | 会话和消息 API；消息归属使用真实 `/auth/me` 当前用户 id |
| `/orders/purchase` | API-backed | `GET /orders?role=BUYER` 与状态 mutation；图片、价格和昵称来自真实订单响应 |
| `/orders/sale` | API-backed | `GET /orders?role=SELLER`；卖家只能从待沟通确认“可交易”进入待自提，完成动作仅在买家端出现 |
| `/orders` | Redirect | 跳转 `/orders/purchase` |
| `/orders/sales` | Redirect | 跳转 `/orders/sale` |
| `/orders/purchase/demand` | API-backed + Local favorite | 求购广场调用 `GET /demands` 与 `GET /categories`；求购关注仍存 `localStorage` |
| `/orders/purchase/demand/:id/detail` | API-backed limited | 后端没有单条详情端点，页面通过 `GET /demands` 的公开列表兜底定位开放求购，找不到时提示接口限制 |
| `/orders/purchase/demand/new` | API-backed | 发布调用 `POST /demands`；分类来自 `GET /categories`；草稿/编辑不是后端能力 |
| `/orders/purchase/demand/mine` | API-backed | 我的求购调用 `GET /users/me/demands`，匹配调用 `GET /demands/{demandId}/matches`，关闭调用 `POST /demands/{demandId}/close` |
| `/publish` | API-backed + Local draft | 图片调用 `POST /files/images`，类目调用 `GET /categories`，提交调用 `POST /items`；未提交草稿仍保存在 `localStorage` |
| `/items/mine` | API-backed | 调用 `GET /users/me/items` 获取真实状态，重新申请审核与下架分别调用 `POST /items/{id}/on-sale`、`POST /items/{id}/off-shelf` |
| `/items/:id/edit` | API-backed | `GET /users/me/items/{id}` 回填所有者完整详情，图片上传调用文件 API，保存与下架分别调用 `PUT /items/{id}`、`POST /items/{id}/off-shelf` |
| `/profile` | API-backed | `/auth/me` 展示只读真实学号、手机号和校园资料；昵称、头像通过 `PUT /users/me` 持久化，头像先调用文件 API；常用地址调用完整 CRUD |
| `/verify` | API-backed + mock adapter | 真实模式调用演示验证码签发与 `/auth/campus-verification`；mock 模式复现随机码、过期和一次性校验。学生证图片仅作本地 UI 展示，不上传服务器 |
| `/demands` | Placeholder | catalog 保留的旧公开求购入口 |
| `/demands/new` | Placeholder | catalog 保留的旧发布求购入口 |
| `/demands/mine` | Placeholder | catalog 保留的旧我的求购入口 |

九个分类路径为：`textbook`、`digital`、`dorm`、`outdoors`、`daily-goods`、`make-up`、`instruments`、`tickets`、`others`。

### 管理端

| 路由 | 页面状态 | 当前数据源/说明 |
| --- | --- | --- |
| `/admin` | API-backed | 调用真实 `GET /admin/dashboard/summary`；没有 dashboard mock |
| `/admin/items/review` | API-backed | wrapper 支持 mock/真实；真实摘要包含卖家、学号掩码、描述、封面与图片数；举报提示、审核标记等仍仅在 mock 中可选展示 |
| `/admin/items` | API-backed | wrapper 支持 mock/真实；使用独立 `AdminItemSummary`，不再误声明为公开市场 `ItemSummary` |
| `/admin/users` | API-backed + Local UI model | 用户列表和黑名单 mutation 支持 mock/真实；顶部总量、注册日期、发布数等为硬编码展示值 |
| `/admin/categories` | API-backed | 一级/二级关系、启停、排序和真实商品数均来自后台类目 API；新增、编辑、启停和安全删除全部落库，禁用项从发布页移除 |

当前 `routes.tsx` 已为 catalog 中所有管理路由映射真实页面，没有后台占位路由。

## 4. 路由守卫

`RouteGuard` 当前执行：

- `public`、`interaction`：直接渲染；商品详情的互动按钮自行触发登录/请求。
- `auth`：无 token 时跳 `/login?returnTo=...`。
- `verified`：无 token 先登录；非管理员且状态不是 `VERIFIED` 时跳 `/verify`。
- `admin`：无 token 先登录；角色不是 `ADMIN` 时回 `/`。
- `owner`：当前只经过通用“已登录”检查，前端没有查询商品所有者；所有权必须由后端 service 兜底。

`AppLayout` 还执行角色域隔离：已登录 `ADMIN` 访问 `/login`、公开市场或用户端路由时统一重定向 `/admin`。管理员登录默认进入 `/admin`，只在安全的 `returnTo=/admin...` 时恢复后台目标；普通用户不会恢复到 `/admin...`。后台尚无对应 API 的订单记录、求购管理等入口保持禁用，不能链接到用户端同名页面。

认证状态使用独立 storage key：mock 为 `ecocampus.auth.mock.v2`，真实为 `ecocampus.auth.real.v2`。前端没有 refresh token 流程；任意非登录请求返回 401 时清理会话。

## 5. API mock 覆盖

`VITE_USE_MOCKS=true` 时，以下 wrapper 使用 `src/api/mock/`：

- 类目公开列表与后台 CRUD。
- 商品列表/详情。
- 商品收藏/取消/收藏列表。
- 会话创建、会话/消息列表和发送消息。
- 订单创建、列表、详情和状态变更。
- 后台商品审核/治理、后台用户和黑名单。

以下 wrapper 当前没有 API mock，会继续发真实请求：

- auth（`LoginPage` 自己分支处理 mock 登录）。
- profile、地址、文件上传。
- demand API。
- dashboard overview/summary。

页面内 Local mock 不受上述 wrapper 覆盖定义约束。例如商品编辑、头像与基本资料编辑即使开启或关闭 `VITE_USE_MOCKS` 仍主要使用本地数据。商品发布与我的发布在真实模式下已接入文件、类目、商品和状态 API；校园核验已经区分真实 API 与 mock adapter。

## 6. 当前 DTO 对齐风险

真实后端是字段事实源，当前前端类型仍有以下未解决差异：

| 前端期望 | 后端真实响应 | 影响 |
| --- | --- | --- |
| 后台审核/治理使用 `AdminItemSummary` | 后台商品摘要已补卖家、描述和图片字段 | 类型已与真实扁平 DTO 对齐；真实模式仍缺举报/审核标记和卖家历史违规数 |
| 收藏、关闭求购等 wrappers 中部分声明 `void` | 后端实际返回商品/求购详情 | 当前页面多半忽略响应，但类型不准确；商品创建/更新/上下架、校园核验和后台审核/违规下架响应类型已对齐 |

2026-07-15 已对齐：`GET /items`、商品详情 seller、商品收藏列表、购买/出售订单卡片字段、私信详情当前用户判断、求购广场/发布/我的求购/匹配结果，以及主页求购摘要、九个分类商品页和个人常用地址 CRUD 的主要 API 接线。

市场公共壳的游客入口当前文案仍是“登录 / 注册”，但只链接 `/login`，后端没有独立注册端点；真实行为是登录时自动建档。

新增真实接线前应先修正 DTO 或后端响应，并同步 `docs/api-contract.md`。不能用 mock 字段反推真实接口已经支持。

## 7. 视觉与动画边界

- `/` 保持公开市场首页；收藏管理仅在 `/favorites`。
- 用户端复用 `components/marketplace/` 的 `MarketplaceShell`、卡片和手绘动画语义。
- 市场端宽度不超过 `720px` 时，`MarketplaceShell` 渲染独立移动壳：紧凑品牌/搜索/横向分类区和固定五项底部导航；不渲染桌面顶部栏、左侧导航或桌面用户快捷区。`721px` 起保持原桌面壳。
- `/` 的移动内容由 `MobileHomePageContent` 独立编排，使用快捷发布、横向分区、折叠筛选和双列紧凑商品卡；求购、热门类目和安全提示后置。移动端和桌面端的求购摘要都消费 `GET /demands`，桌面三栏结构和完整筛选面板保持不变。
- `/login` 采用厦门大学统一身份认证风格的视觉模拟，但当前生产行为是项目自有账号密码 API，不是跳转学校 SSO。
- 登录页只共享认证状态和提交逻辑：宽度不超过 `640px` 时渲染独立移动布局，粗指针且高度不超过 `500px` 时保持横屏手机版；其余尺寸渲染现有桌面轮播与扫码/账号双标签布局。
- 移动版默认中文，只保留账号密码登录，使用仓库内的官网移动背景、Logo 和密码显隐图标；不渲染桌面轮播、扫码入口、轮播圆点或版权页脚。
- 后台复用 `components/admin/AdminShell.tsx`，以表格、筛选和操作效率为先。
- 动画使用 Motion + CSS keyframes，尊重 `prefers-reduced-motion`；详细规范见 `frontend-animation/README.md`。

## 8. 部署

`.github/workflows/deploy-pages.yml` 使用 Node.js 22、pnpm 10 构建 `frontend/`，设置：

```text
VITE_USE_MOCKS=false
VITE_API_BASE_URL=https://ecocampus-api.teamdsb.online/api/v1
VITE_BASE_PATH=<GitHub Pages base path>/
```

构建后复制 `index.html` 为 `404.html`，配合 `basename` 支持 Pages 深层路由。`frontend/sites/` 是历史 Sites 适配层，不是当前 GitHub Pages 构建入口。

## 9. 前端性能基线

- 页面组件统一通过 `src/app/routeComponents.ts` 使用 `React.lazy` 按路由加载；不要在 `routes.tsx` 或共享壳中重新静态导入完整页面。
- 管理后台壳只在进入后台路由时加载，公开首页不会预加载后台页面代码。
- 仓库内业务位图已转换为 WebP。商品列表仅前 4 张首屏图主动加载，其余商品图、侧栏和空状态插画懒加载并异步解码。
- 图片应声明稳定宽高；新增图片先压缩，不同时把 PNG/JPEG 原图和 WebP 副本打入生产包。
- 2026-07-14 基线的入口 chunk 约 628 kB（gzip 约 206 kB），其余页面按路由拆分。

## 10. 变更验收

- 路由新增/删除：同时更新 `routeCatalog.ts`、`routes.tsx`、`routeComponents.ts`、本文件和 `project-state.md`。
- 真实 API 字段变化：同时更新后端 DTO、前端类型/API wrapper 和 `api-contract.md`。
- 新页面应明确标记 API-backed、Local mock 或 Placeholder，不使用笼统“已覆盖”。
- 前端代码变更运行 `pnpm lint` 和 `pnpm build`；纯文档变更至少运行 `git diff --check`。
