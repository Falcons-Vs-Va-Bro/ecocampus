# 前端彩绘动画规范

本规范固定 EcoCampus 用户端的彩绘、手绘动画方向。它是 `docs/frontend-homepage/README.md` 中视觉风格的动画补充，应与 `docs/frontend-stack.md` 和 `docs/api-contract.md` 一起阅读。

适用范围：普通用户端页面，包括 `/`、`/favorites`、商品列表、商品详情、发布、求购、个人中心和空状态。后台管理端以效率优先，不默认套用本动画规范。

例外：`/login` 是厦门大学统一身份认证对接页，应独立复现学校 SSO 登录页的视觉结构，不套用彩绘、手绘风格。前端本地实现只能作为 mock/占位展示，不能提交或保存真实厦大账号密码；生产对接应跳转官方统一身份认证服务。

## 1. 动画目标

用户端动画应强调“绘制过程”，让页面像校园手绘稿逐步上色、描边、铺开，而不是普通产品界面的通用位移特效。

- 插画资产进入时优先表现为笔触扫过、画面显现、线稿上色。
- 商品卡片和功能区进入时保持轻量、快速、可扫描。
- 交互反馈应柔和，服务于收藏、筛选、分页、切换等明确动作。
- 动画不应成为主要内容，不应拖慢列表浏览、搜索、表单填写和 H5 操作。

## 2. 技术边界

在当前技术栈下，默认只使用以下能力：

- `motion/react`：页面区域进场、商品卡片 stagger、hover/tap 反馈、布局状态切换。
- CSS keyframes：插画绘制感、笔触扫过、纸面呼吸、铅笔纹理流动等持续或伪元素动画。

不要为了彩绘风格直接引入新的动画库。确需引入 Lottie、Rive、GSAP、canvas 动画或其他方案时，必须先更新本规范和 `docs/frontend-stack.md`，说明引入原因、页面范围、包体影响和降级策略。

复杂校园插画和物品图片优先使用本地或生成的位图资产。不要把复杂插画改成手写 SVG 来追求路径动画；当前风格更依赖纸张质感、彩绘边缘和真实物品图片。

## 3. 动画语法

| 场景 | 推荐表现 | 实现方式 |
| --- | --- | --- |
| 校园插画、空状态插画 | 从一侧或下方向外显现，叠加短暂笔触扫过 | `img` 外包 `.painted-asset`，用 `clip-path` 和伪元素 keyframes |
| 页面主区域 | 轻量 fade + translate，避免大幅位移 | `motion.section` / `motion.main` |
| 左侧导航、顶部栏 | 进入时轻微错位恢复，保持节奏 | `motion.header` / `motion.aside` |
| 商品卡片列表 | 卡片 stagger 进入，hover 只做轻微上浮和极小旋转 | `motion.article` |
| 收藏、取消收藏 | 120ms 左右缩放或颜色反馈，失败时回滚状态 | `whileTap` / CSS transition |
| 标题下划线、筛选高亮 | 像墨线被画出来，不做闪烁 | CSS 伪元素 + `transform` |
| 纸张背景和铅笔纹理 | 慢速、低透明度、非必要循环 | CSS background-position / opacity |

## 4. `/favorites` 参考实现

当前 `/favorites` 是彩绘动画的第一版参考实现，市场端共享壳和卡片已抽到公共组件：

- 页面入口：`frontend/src/features/favorites/FavoritesPage.tsx`
- 共享组件入口：`frontend/src/components/marketplace/MarketplaceShell.tsx`、`frontend/src/components/marketplace/MarketplaceItemCard.tsx`
- 样式入口：`frontend/src/components/marketplace/MarketplaceShell.css`
- 公开/用户侧占位页入口：`frontend/src/components/marketplace/MarketplacePlaceholderPage.tsx`

已形成的可复用模式：

- `motion` 与 `useReducedMotion` 控制顶部栏、侧栏、内容区和商品卡片进场。
- `.painted-asset` 作为插画容器，统一承载绘制感动画。
- `painted-image-reveal` / `painted-image-rise` 控制插画显现方向。
- `painted-brush-sweep` / `painted-brush-rise` 控制笔触扫过。
- `heading-ink-draw` 控制标题墨线绘制。
- `pencil-hatch-flow` 控制轻量铅笔纹理流动。
- `paper-wash-breathe` 控制纸面底色微动。

后续页面应优先复用这些共享组件、语义和节奏，不要直接复制整页 CSS。若多个页面都需要同类动画，应继续沉淀到共享样式或组件中，并同步更新本规范。

## 5. 降级与性能要求

- 必须尊重 `prefers-reduced-motion: reduce`，关闭非必要动画，并让插画直接展示完成态。
- 动画不得阻塞数据加载、分页、筛选、表单输入和按钮反馈。
- H5 低端设备优先使用 `opacity`、`transform`、`clip-path`、`background-position`，避免频繁触发布局计算。
- 大面积循环动画要慢、轻、低对比，并且不得影响文字可读性。
- 商品图片本身不做持续动效，避免干扰用户判断物品状态。
- 错误、加载、空状态都要在 mock 模式下可见，不能依赖真实后端触发。

## 6. Mock 模式验收

彩绘动画页面必须能在前后端分离模式下独立验收：

- 使用 `VITE_USE_MOCKS=true pnpm dev` 可完整渲染目标页面。
- mock 数据字段必须符合 `docs/api-contract.md`，不要为动画加入 mock-only DTO 字段。
- 真实物品图片、校园插画、空状态插画应稳定可加载。
- 桌面宽度和 H5 宽度都要检查文字不重叠、卡片不跳动、插画不遮挡主要内容。
- `pnpm lint` 和 `pnpm build` 应通过；纯文档变更至少执行 `git diff --check`。
