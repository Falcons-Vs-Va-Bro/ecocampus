# EcoCampus 校园闲置物品流转平台

EcoCampus 是面向校内师生的校园闲置物品交易与求购平台。当前仓库是一个可运行的全栈原型：后端提供账号登录、校园核验、商品、收藏、私信、订单、求购和后台治理 API；前端提供 Web/H5 市场与管理界面，并同时保留真实 API 和 mock-first 演示能力。

项目当前以 Web/H5 为交付形态。公开路由 `/` 是市场首页，个人收藏位于 `/favorites`，用户端采用手绘校园交易视觉，后台页面以操作效率为主。

## 仓库结构

```text
ecocampus/
├── backend/          # Java 21 + Spring Boot API
├── frontend/         # React + TypeScript + Vite Web/H5
├── docs/             # API、RBAC、前端、数据库与部署源文档
├── deploy/           # Linux/Tailscale 备选部署模板
├── assets/process/   # 项目汇报页资产
└── process.html      # 独立项目汇报页
```

开始开发或交接前先读 [`docs/project-state.md`](docs/project-state.md)。它记录当前实现状态、已知对齐问题和验证基线；长期契约以对应的 `docs/` 源文档为准。

## 当前能力

后端已实现：

- 无状态 JWT 认证；账号必须以 `2292024` 开头，首次登录自动建档并保存 BCrypt 密码哈希。
- 个人资料、校园核验和校内地址管理。
- 类目、图片上传、商品发布/审核/上下架/公开查询。
- 收藏、商品私信、未读数、订单状态流转和求购匹配。
- 管理员商品审核与治理、用户黑名单、一级类目 CRUD 和数据看板。
- Flyway 数据库迁移、MySQL 本地/测试/生产配置和生产启动防呆。

前端已实现：

- 市场首页、九个分类页、商品详情、收藏、私信、购买/出售订单和求购流程。
- 发布闲置、我的发布、编辑商品、个人资料和校园核验的本地 mock-first 流程。
- 后台数据看板、商品审核、商品治理、用户黑名单和类目管理页面。
- 路由守卫、JWT 持久化、统一请求错误处理、真实 API/本地 mock 切换。

并非所有视觉页面都已完成真实后端接线。准确的页面数据源和已知 DTO 差异见 [`docs/frontend-stack.md`](docs/frontend-stack.md) 与 [`docs/project-state.md`](docs/project-state.md)。

## 技术栈

后端：Java 21、Spring Boot 3.5.3、Spring Web/Security/Validation/Data JPA、Flyway、MySQL、Actuator 和 Springdoc OpenAPI。

前端：React 19、TypeScript、Vite 8、React Router 7、TanStack Query、Zustand、Axios、Tailwind CSS、Ant Design、lucide-react、Motion、React Hook Form 和 Zod。

## 本地开发

环境建议与 CI 一致使用 JDK 21、Node.js 22 和 pnpm 10。

### 后端

默认配置使用本地 MySQL 和 Flyway，启动前需要先准备 `ecocampus` 数据库及账号：

```bash
cd backend
mysql -uroot -p -e "create database if not exists ecocampus character set utf8mb4 collate utf8mb4_unicode_ci; create database if not exists ecocampus_test character set utf8mb4 collate utf8mb4_unicode_ci;"
mysql -uroot -p -e "create user if not exists 'ecocampus_local'@'localhost' identified by 'ecocampus_local_password'; grant all privileges on ecocampus.* to 'ecocampus_local'@'localhost'; grant all privileges on ecocampus_test.* to 'ecocampus_local'@'localhost';"
./mvnw spring-boot:run
```

默认连接为 `jdbc:mysql://localhost:3306/ecocampus`，账号密码为 `ecocampus_local` / `ecocampus_local_password`。也可以用 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USERNAME`、`DB_PASSWORD` 覆盖。

常用入口：

- API 健康检查：`http://localhost:8080/api/v1/health`
- Actuator：`http://localhost:8080/actuator/health`
- Swagger UI：`http://localhost:8080/swagger-ui.html`

运行测试：

```bash
cd backend
./mvnw test
```

### 前端

```bash
cd frontend
pnpm install
VITE_API_BASE_URL=http://localhost:8080/api/v1 pnpm dev
```

前端默认真实 API base 是同源 `/api/v1`，Vite 配置没有本地反向代理，因此本地前后端分端口运行时需要像上面一样显式指向 8080。需要完全独立于后端验收支持 mock 的页面时：

```bash
cd frontend
pnpm dev:mock
```

`.env.mock` 会设置 `VITE_USE_MOCKS=true`。注意：求购、发布/我的商品、资料和核验页面还包含组件内本地演示数据，不等同于所有 API 都有 mock 实现。

前端检查：

```bash
cd frontend
pnpm lint
pnpm build
```

## 配置与数据

- 默认 `backend/src/main/resources/application.yml`：本地 MySQL、Flyway migration 和自动演示 seed。
- 测试配置：`backend/src/test/resources/application.yml` 使用独立的 `ecocampus_test` MySQL，并在测试上下文启动时自动清库、迁移；可用 `TEST_DB_URL`、`TEST_DB_USERNAME`、`TEST_DB_PASSWORD` 覆盖。
- MySQL 本地示例：`backend/src/main/resources/application-local.example.yml`。
- 生产配置：`backend/src/main/resources/application-prod.yml`，必须显式提供 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD` 和安全的 `JWT_SECRET`。
- 自动 MySQL 演示数据：`backend/src/main/resources/db/seed/R__mysql_demo_seed.sql` 提供账号、交易与基础商品，`R__mysql_catalog_seed.sql` 额外提供九类目各 8 件的校园二手商品；默认环境随 Flyway 自动执行，`prod` profile 只加载结构 migration。
- Seed 商品图片位于 `frontend/public/catalog/`，数据库统一保存 `/catalog/*.webp`；Vite 构建会原样复制这些静态资源，真实 API 首页不再依赖仅开发期可用的 `/src/assets` 路径。
- 图片默认写入 `./storage/uploads`，并注册 `/uploads/**` 静态处理；当前 Spring Security 未将该路径设为公开，读取仍要求认证，这是已知接线问题。

`application-local.example.yml` 仍保留 Redis 参数占位，但当前 Maven 依赖和业务代码均未使用 Redis，无需启动 Redis。

不要提交真实密码、JWT 密钥、Tunnel 凭据、本地 `.env`、上传目录或构建产物。

## 部署

当前课堂展示链路是 GitHub Pages 前端 + Mac mini 上的 Spring Boot/MySQL + Cloudflare Tunnel，详见 [`docs/deployment-github-pages-macmini.md`](docs/deployment-github-pages-macmini.md)。

OpenAI Sites 和低内存 Linux/Tailscale 文档是保留的历史/备选方案，不代表当前线上拓扑：

- [`docs/deployment-sites-macmini.md`](docs/deployment-sites-macmini.md)
- [`docs/deployment-low-memory.md`](docs/deployment-low-memory.md)

## 文档索引

- [当前项目状态](docs/project-state.md)
- [API 契约](docs/api-contract.md)
- [RBAC 与权限边界](docs/rbac.md)
- [前端技术栈、路由和数据源](docs/frontend-stack.md)
- [首页与收藏页视觉方向](docs/frontend-homepage/README.md)
- [用户端彩绘动画规范](docs/frontend-animation/README.md)
- [数据库约束与锁策略](docs/database-constraints-and-locking.md)
- [GitHub Pages + Mac mini 部署](docs/deployment-github-pages-macmini.md)

实现发生变化时，应同步更新对应源文档和 `docs/project-state.md`；文档与代码冲突时，以控制器、DTO、迁移、路由和实际页面数据源为准。
