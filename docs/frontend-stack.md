# EcoCampus 前端技术栈、路由与数据源

最近一次按 `frontend/package.json`、`routeCatalog.ts`、`routes.tsx`、API wrappers 和页面组件复核：2026-07-14。

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

`pnpm dev:mock` 通过 `.env.mock` 设置 `VITE_USE_MOCKS=true`。默认 API base 为同源 `/api/v1`，可用 `VITE_API_BASE_URL` 覆盖；仓库没有 Vite dev proxy，本地连接 8080 后端时应设置 `VITE_API_BASE_URL=http://localhost:8080/api/v1`。`VITE_BASE_PATH` 同时服务 Vite base 和 React Router basename。

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
| `/login` | API-backed | 真实模式调用 `POST /auth/login`；mock 模式本地自动建档并生成 mock token |
| `/` | API-backed | `GET /items`、`GET /categories`；真实商品列表已返回卡片所需卖家、配送和收藏元数据 |
| `/items` | API-backed | `GET /items`；客户端筛选和分页 |
| `/items/textbook` 等 9 个分类路由 | Local mock | 共用 `ItemsPage`，分类专属商品集合和筛选主要来自组件内本地数据；仍会发起通用商品查询 |
| `/items/:id` | API-backed | 商品详情、收藏、创建会话、下单；相关商品依赖列表 DTO |
| `/favorites` | API-backed + Local mock | 商品收藏走 favorite API，失效商品收藏由真实状态与 `invalidReason` 支撑；“求购关注”存 `localStorage` |
| `/messages` | API-backed | 会话列表 API；商品图/状态等使用 mock 展示元数据 |
| `/messages/:conversationId` | API-backed | 会话和消息 API；消息归属使用真实 `/auth/me` 当前用户 id |
| `/orders/purchase` | API-backed | `GET /orders?role=BUYER` 与状态 mutation；图片、价格和昵称来自真实订单响应 |
| `/orders/sale` | API-backed | `GET /orders?role=SELLER` 与状态 mutation；图片、价格和昵称来自真实订单响应 |
| `/orders` | Redirect | 跳转 `/orders/purchase` |
| `/orders/sales` | Redirect | 跳转 `/orders/sale` |
| `/orders/purchase/demand` | API-backed + Local favorite | 求购广场调用 `GET /demands` 与 `GET /categories`；求购关注仍存 `localStorage` |
| `/orders/purchase/demand/:id/detail` | API-backed limited | 后端没有单条详情端点，页面通过 `GET /demands` 的公开列表兜底定位开放求购，找不到时提示接口限制 |
| `/orders/purchase/demand/new` | API-backed | 发布调用 `POST /demands`；分类来自 `GET /categories`；草稿/编辑不是后端能力 |
| `/orders/purchase/demand/mine` | API-backed | 我的求购调用 `GET /users/me/demands`，匹配调用 `GET /demands/{demandId}/matches`，关闭调用 `POST /demands/{demandId}/close` |
| `/publish` | Local mock | 草稿和发布商品写入 `localStorage`，未调用上传/类目/商品 API |
| `/items/mine` | Local mock | `myItems.mock.ts` + `localStorage`，未调用我的商品 API |
| `/items/:id/edit` | Local mock | 编辑本地发布数据，未调用商品详情/更新 API |
| `/profile` | 部分 API-backed | 顶部身份可调用 `/auth/me`；资料与地址表单主体为本地演示，未调用 profile API |
| `/verify` | Local mock | 本地核验演示，未调用 `/auth/campus-verification` |
| `/demands` | Placeholder | catalog 保留的旧公开求购入口 |
| `/demands/new` | Placeholder | catalog 保留的旧发布求购入口 |
| `/demands/mine` | Placeholder | catalog 保留的旧我的求购入口 |

九个分类路径为：`textbook`、`digital`、`dorm`、`outdoors`、`daily-goods`、`make-up`、`instruments`、`tickets`、`others`。

### 管理端

| 路由 | 页面状态 | 当前数据源/说明 |
| --- | --- | --- |
| `/admin` | API-backed | 调用真实 `GET /admin/dashboard/summary`；没有 dashboard mock |
| `/admin/items/review` | API-backed | wrapper 支持 mock/真实；真实后台摘要缺少页面使用的图片、描述、标记等字段 |
| `/admin/items` | API-backed | wrapper 支持 mock/真实；真实响应是后台商品摘要，不是前端声明的完整 `ItemSummary` |
| `/admin/users` | API-backed + Local UI model | 用户列表和黑名单 mutation 支持 mock/真实；顶部总量、注册日期、发布数等为硬编码展示值 |
| `/admin/categories` | API-backed + Local UI model | 页面调用一级类目列表/创建/更新；删除 wrapper 存在但页面未调用，树层级、启停、商品数和预置子类目为本地展示模型 |

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

页面内 Local mock 不受上述 wrapper 覆盖定义约束。例如发布/我的商品、资料和核验页面即使开启或关闭 `VITE_USE_MOCKS` 仍主要使用本地数据。

## 6. 当前 DTO 对齐风险

真实后端是字段事实源，当前前端类型仍有以下未解决差异：

| 前端期望 | 后端真实响应 | 影响 |
| --- | --- | --- |
| 后台审核/治理复用或扩展 `ItemSummary` | 后台商品摘要只有治理基础字段 | 真实模式缺图片、描述、举报/审核展示元数据 |
| 校园核验、收藏、上下架、关闭求购、审核/违规下架等 wrappers 中部分声明 `void` | 后端实际返回当前用户、商品/求购详情或后台摘要 | 当前页面多半忽略响应，但类型不准确 |

2026-07-15 已对齐：`GET /items`、商品详情 seller、商品收藏列表、购买/出售订单卡片字段、私信详情当前用户判断，以及求购广场/发布/我的求购/匹配结果的主要 demand API 接线。

市场公共壳的游客入口当前文案仍是“登录 / 注册”，但只链接 `/login`，后端没有独立注册端点；真实行为是登录时自动建档。

新增真实接线前应先修正 DTO 或后端响应，并同步 `docs/api-contract.md`。不能用 mock 字段反推真实接口已经支持。

## 7. 视觉与动画边界

- `/` 保持公开市场首页；收藏管理仅在 `/favorites`。
- 用户端复用 `components/marketplace/` 的 `MarketplaceShell`、卡片和手绘动画语义。
- `/login` 采用厦门大学统一身份认证风格的视觉模拟，但当前生产行为是项目自有账号密码 API，不是跳转学校 SSO。
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
