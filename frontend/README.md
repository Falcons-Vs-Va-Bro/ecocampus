# EcoCampus Frontend

React 19 + TypeScript + Vite 8 的 Web/H5 前端，包含公开市场、用户交易流程和管理后台。它不是占位骨架；页面接入状态分为 API-backed、组件内 mock-first 和占位三类，完整清单见 [`../docs/frontend-stack.md`](../docs/frontend-stack.md)。

## Scripts

```bash
pnpm install
pnpm dev        # 真实 API，默认同源 base URL 为 /api/v1
pnpm dev:mock   # 读取 .env.mock，启用有 mock 实现的 API
pnpm lint
pnpm build
pnpm preview
```

可通过 `VITE_API_BASE_URL` 覆盖 API base，通过 `VITE_BASE_PATH` 设置静态部署子路径。

本地 Spring Boot 运行在 8080、Vite 运行在 5173 时，仓库没有 Vite proxy，应使用：

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1 pnpm dev
```

## Key locations

- 路由元数据：`src/app/routeCatalog.ts`
- 路由组件映射：`src/app/routes.tsx`
- 路由懒加载入口：`src/app/routeComponents.ts`
- API wrappers：`src/api/`
- API mocks：`src/api/mock/`
- 用户端共享壳：`src/components/marketplace/`
- 功能页面：`src/features/`
- 认证持久化：`src/stores/auth.store.ts`

前端 DTO 应与后端响应保持一致。当前已知的商品列表、收藏和后台商品 DTO 差异记录在 [`../docs/project-state.md`](../docs/project-state.md)，接真实 API 时不得假定 mock 展示字段一定存在。
