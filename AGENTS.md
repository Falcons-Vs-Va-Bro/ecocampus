# 仓库指南

## 项目结构与模块组织

EcoCampus 是一个 monorepo，包含两个主要应用：

- `backend/`：Java 21 Spring Boot 服务。源码位于 `src/main/java/com/falconsvsvabro/ecocampus`，资源文件位于 `src/main/resources`，测试位于 `src/test/java`。
- `frontend/`：React + TypeScript + Vite Web/H5 应用。源码位于 `src/`，路由元数据位于 `src/app/routeCatalog.ts`，API 客户端位于 `src/api/`，可复用 UI 位于 `src/components/`，功能模块位于 `src/features/`。
- `docs/`：RBAC、API 契约和前端技术栈决策文档。
- `assets/process/` 和 `process.html`：演示/展示资产。`process-standalone.html` 为生成文件，已被忽略。

## 构建、测试与开发命令

后端：

```bash
cd backend
./mvnw test
./mvnw spring-boot:run
```

`./mvnw test` 运行 Spring Boot 测试套件。`spring-boot:run` 会在 `http://localhost:8080` 启动 API；可检查 `/api/v1/health` 和 `/swagger-ui.html`。

前端：

```bash
cd frontend
pnpm install
pnpm lint
pnpm build
pnpm dev
```

`pnpm lint` 运行 Oxlint。`pnpm build` 执行 TypeScript 项目检查并构建 Vite 输出。`pnpm dev` 启动本地应用，通常运行在 `http://127.0.0.1:5173/`。

## 编码风格与命名约定

遵循现有包和目录边界。Java 类使用 `PascalCase`；包名在 `com.falconsvsvabro.ecocampus` 下保持小写。TypeScript 中 React 组件使用 `PascalCase`，函数使用 `camelCase`，API 模块使用 `*.api.ts`。路由/API 变更需与 `docs/api-contract.md` 和 `docs/frontend-stack.md` 保持一致。

面向用户的前端 UI 必须遵循 `docs/frontend-homepage/README.md` 中固定的视觉与内容方向，并遵循 `docs/frontend-animation/README.md` 中的彩绘、手绘动画规范。尤其要保持 `/` 为公开的市场首页/推荐流，将个人收藏管理保留在 `/favorites`，并采用 mock-first 方式实现业务 UI，使前端开发可独立于后端可用性推进。

对于较大的功能、API、路由、架构或设计变更，需要重新核对当前改动影响面与既有文档是否一致，并保持 `docs/` 下的真实源文档及时更新。根目录 `README.md` 和本 `AGENTS.md` 仅作为入口和提醒；当持久化内容应归属 `docs/` 时，不要只编辑这两个文件来完成文档维护。

## 测试指南

后端测试通过 Spring Boot Test 使用 JUnit。测试文件应放在 `backend/src/test/java` 下对应的包路径中，并命名为 `*Tests` 或 `*Test`。前端变更必须通过 `pnpm lint` 和 `pnpm build`；当引入真实业务 UI 时，应补充组件或路由测试。

## Commit 与 Pull Request 指南

近期历史使用简洁提交信息，例如 `feat: add process presentation page`、`chore: initial project setup` 和简短文档摘要。优先使用 `type: summary` 格式，类型可选 `feat`、`fix`、`docs`、`chore` 或 `test`。

PR 应包含：范围摘要、关联 issue 或任务、测试结果、UI 变更截图，以及配置或迁移变更说明。

## 安全与配置提示

不要提交密钥、本地 `.env` 文件、真实数据库凭据或生成产物。使用 `backend/src/main/resources/application-local.example.yml` 作为本地配置模板。
