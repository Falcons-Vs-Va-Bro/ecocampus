# EcoCampus 前端技术栈

## 1. 目标

当前阶段优先交付 Web 端，同时适配移动端 H5。前端需要覆盖普通用户的浏览、发布、收藏、私信、订单、求购流程，以及管理员的审核、黑名单、类目和数据看板能力。

## 2. 技术栈决策

| 层级 | 选择 | 用途 |
| --- | --- | --- |
| 基础框架 | React + TypeScript | 组件化开发和类型约束 |
| 构建工具 | Vite | 本地开发、打包和环境变量管理 |
| 路由 | React Router | 前台/后台路由、受保护路由、详情页参数 |
| 服务端状态 | TanStack Query | 列表、详情、分页、缓存、刷新和 mutation |
| 本地状态 | Zustand | 登录态摘要、UI 面板、筛选条件草稿等轻量状态 |
| 请求层 | Axios 或 Fetch 封装 | 统一 token、错误码、traceId、重试策略 |
| 表单 | React Hook Form + Zod | 发布商品、校园核验、地址、求购、后台审核 |
| 样式 | Tailwind CSS + CSS Modules | H5 响应式页面和局部复杂样式 |
| 管理后台组件 | Ant Design | 表格、筛选、弹窗、表单、数据看板 |
| 图标 | lucide-react | 通用工具图标 |
| 动画 | Motion for React | 页面切换、卡片进场、收藏反馈、筛选抽屉 |

## 3. 推荐目录

```text
frontend/
  src/
    app/
      App.tsx
      routes.tsx
      providers.tsx
    api/
      http.ts
      auth.api.ts
      item.api.ts
      order.api.ts
      admin.api.ts
    components/
      common/
      item/
      order/
      chat/
      admin/
      motion/
    features/
      auth/
      item-market/
      item-publish/
      favorites/
      conversations/
      orders/
      demands/
      admin/
    hooks/
    stores/
    styles/
    types/
```

## 4. 路由规划

### 4.1 前台用户端

| 路由 | 页面 | 权限 |
| --- | --- | --- |
| `/login` | 手机号登录 | 公开 |
| `/` | 商品首页/推荐流 | 公开 |
| `/items` | 商品搜索与分类筛选 | 公开 |
| `/items/:id` | 商品详情 | 公开，互动需登录 |
| `/publish` | 发布商品 | `USER` |
| `/items/mine` | 我的发布/上下架管理 | `USER` |
| `/items/:id/edit` | 编辑商品 | 商品所有者 |
| `/favorites` | 我的收藏 | `USER` |
| `/messages` | 私信会话列表 | `USER` |
| `/messages/:conversationId` | 私信详情 | `USER` |
| `/orders` | 我的订单 | `USER` |
| `/demands` | 求购列表 | 公开 |
| `/demands/new` | 发布求购 | `USER` |
| `/demands/mine` | 我的求购/匹配结果 | `USER` |
| `/profile` | 个人信息/地址 | `USER` |
| `/verify` | 校园核验 | 登录用户 |

说明：`/login` 当前按厦门大学统一身份认证对接页处理，视觉上独立复现学校 SSO 登录页，不纳入用户端彩绘风格统一；本地页面只做 mock/占位交互，生产登录应跳转官方 SSO。

### 4.2 后台管理端

| 路由 | 页面 | 权限 |
| --- | --- | --- |
| `/admin` | 数据看板 | `ADMIN` |
| `/admin/items/review` | 商品审核 | `ADMIN` |
| `/admin/items` | 商品治理/违规下架 | `ADMIN` |
| `/admin/users` | 用户与黑名单 | `ADMIN` |
| `/admin/categories` | 类目管理 | `ADMIN` |

## 5. 路由与接口映射自检

### 5.1 前台用户端

| 路由 | 主要接口 | 对接状态 |
| --- | --- | --- |
| `/login` | `POST /auth/sms-code`, `POST /auth/login` | 已覆盖 |
| `/` | `GET /items`, `GET /categories` | 已覆盖 |
| `/items` | `GET /items`, `GET /categories` | 已覆盖 |
| `/items/:id` | `GET /items/{itemId}`, `POST /items/{itemId}/favorite`, `DELETE /items/{itemId}/favorite`, `POST /conversations`, `POST /orders` | 已覆盖 |
| `/publish` | `POST /files/images`, `GET /categories`, `POST /items` | 已覆盖 |
| `/items/mine` | `GET /users/me/items`, `POST /items/{itemId}/on-sale`, `POST /items/{itemId}/off-shelf` | 已覆盖 |
| `/items/:id/edit` | `GET /items/{itemId}`, `POST /files/images`, `GET /categories`, `PUT /items/{itemId}` | 已覆盖 |
| `/favorites` | `GET /users/me/favorites`, `DELETE /items/{itemId}/favorite` | 已覆盖 |
| `/messages` | `GET /conversations` | 已覆盖 |
| `/messages/:conversationId` | `GET /conversations/{conversationId}/messages`, `POST /conversations/{conversationId}/messages` | 已覆盖 |
| `/orders` | `GET /orders`, `GET /orders/{orderId}`, `POST /orders/{orderId}/status` | 已覆盖 |
| `/demands` | `GET /demands` | 已覆盖 |
| `/demands/new` | `GET /categories`, `POST /demands` | 已覆盖 |
| `/demands/mine` | `GET /users/me/demands`, `GET /demands/{demandId}/matches`, `POST /demands/{demandId}/close` | 已覆盖 |
| `/profile` | `GET /auth/me`, `PUT /users/me`, `GET /users/me/addresses`, `POST /users/me/addresses`, `PUT /users/me/addresses/{addressId}`, `DELETE /users/me/addresses/{addressId}` | 已覆盖 |
| `/verify` | `GET /auth/me`, `POST /auth/campus-verification` | 已覆盖 |

### 5.2 后台管理端

| 路由 | 主要接口 | 对接状态 |
| --- | --- | --- |
| `/admin` | `GET /admin/dashboard/overview` | 已覆盖 |
| `/admin/items/review` | `GET /admin/items/review`, `POST /admin/items/{itemId}/review` | 已覆盖 |
| `/admin/items` | `GET /admin/items`, `POST /admin/items/{itemId}/violation-remove` | 已覆盖 |
| `/admin/users` | `GET /admin/users`, `POST /admin/users/{userId}/blacklist`, `DELETE /admin/users/{userId}/blacklist` | 已覆盖 |
| `/admin/categories` | `GET /admin/categories`, `POST /admin/categories`, `PUT /admin/categories/{categoryId}`, `DELETE /admin/categories/{categoryId}` | 已覆盖 |

## 6. 动画使用边界

动画只用于增强理解和反馈，不做装饰性堆叠。

用户端彩绘、手绘动画的具体风格以 `docs/frontend-animation/README.md` 为准。当前默认组合仍是 Motion for React + CSS keyframes：Motion 负责页面区域、卡片和交互反馈，CSS keyframes 负责插画绘制感、笔触扫过、纸面和铅笔纹理。

推荐使用场景：

- 商品卡片进入列表时使用轻量 fade + translate。
- 收藏按钮使用 120ms 左右的缩放反馈。
- 筛选面板、发布页步骤切换使用横向 slide。
- 订单状态流转使用状态点高亮和短动效。
- 后台图表加载时使用 skeleton，而不是复杂动画。

不推荐使用场景：

- 大面积循环背景动画。
- 影响表单输入和后台表格效率的动画。
- 无法关闭的长过渡。

实现要求：

- 尊重 `prefers-reduced-motion`。
- 列表动画不要阻塞数据加载。
- H5 低端设备优先使用 opacity/transform。
- 不新增动画库，除非先更新 `docs/frontend-animation/README.md` 和本技术栈文档，说明引入原因、影响范围和降级策略。

## 7. API 对接策略

- 前端类型以 `docs/api-contract.md` 为准，优先从接口契约手写 TypeScript DTO。
- TanStack Query 管理服务端状态，所有查询 key 统一放在 `api/queryKeys.ts`。
- mutation 成功后按场景失效缓存，例如发布商品后刷新 `items.list` 和 `users.me.items`。
- 请求失败统一显示后端 `message`，并在开发环境暴露 `traceId`。
- `401` 统一跳转登录，`403` 展示无权限，`BLACKLISTED` 展示账号受限说明。

## 8. 权限守卫

前端不作为安全边界，但需要改善体验：

- `RequireAuth`: 未登录跳转登录。
- `RequireVerified`: 未校园核验跳转 `/verify`。
- `RequireAdmin`: 非管理员跳转无权限页。
- 发布、下单、私信、求购按钮在未核验时置灰并引导认证。

## 9. UI 风格建议

用户端应强调校园交易场景：

- 商品卡片优先展示图片、标题、价格、类目、取货方式。
- 类目固定覆盖教材、数码、宿舍用品、运动器材。
- H5 下筛选使用底部抽屉，桌面端使用侧栏或顶部筛选条。
- 订单状态用“待沟通 → 待自提 → 已完成”的短流程展示。

后台端应强调效率：

- 表格、筛选、批量操作和审核弹窗优先。
- 商品审核页要同时展示图片、描述、发布人核验状态和历史违规记录。
- 数据看板先做发布量、成交统计、待审核数量、活跃用户。

## 10. 参考来源

- React 官方建议新项目使用构建工具，Vite 是可选方案之一：https://react.dev/learn/build-a-react-app-from-scratch
- Vite 官方 React/TypeScript 模板说明：https://vite.dev/guide/
- React Router 官方文档：https://reactrouter.com/
- TanStack Query React 文档：https://tanstack.com/query/latest/docs/framework/react/overview
- Motion React 文档：https://motion.dev/docs
