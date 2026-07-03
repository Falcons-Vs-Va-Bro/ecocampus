# EcoCampus 校园闲置物品智慧流转小程序

EcoCampus 是面向本校师生的校园闲置物品智慧流转平台，聚焦教材、数码产品、宿舍用品、运动器材等二手物品的校内流转。项目通过校园专属实名核验、商品审核、交易状态流转和后台治理机制，提升闲置物品复用效率，并降低校外商贩入驻、虚假交易和违规发布风险。

当前项目定位为完整应用系统，优先建设 Web 端，并适配移动端 H5 访问；后续可按需要扩展为微信小程序或其他移动端形态。

## 功能规划

### 用户模块

- 学生手机号与校园学号双重实名认证
- 普通用户与管理员角色区分
- 个人信息维护
- 收货地址管理
- 用户黑名单与违规限制

### 商品模块

- 闲置商品分类发布
- 商品图文上传
- 商品定价
- 自提或送货到校方式选择
- 商品上架、下架与编辑
- 商品审核与违规下架

### 交易互动

- 商品搜索
- 分类筛选
- 关键词检索
- 商品收藏
- 私信聊天
- 预约自提

### 订单模块

- 商品下单
- 订单状态流转：待沟通 -> 待自提 -> 已完成
- 订单记录查询
- 交易过程留痕

### 后台管理

- 商品审核
- 违规商品下架
- 用户黑名单管理
- 商品类目管理
- 数据看板：发布量、成交量等统计数据

### 轻量化扩展

- 闲置求购板块
- 用户发布求购需求
- 系统根据分类、关键词等信息匹配对应商品

## 技术栈

### 后端

- Java 21
- Spring Boot 3.5.3
- Maven Wrapper
- RESTful API
- MySQL（local 示例配置）
- Redis（local 示例配置）
- 对象存储：本地存储、MinIO 或云 OSS
- OpenAPI/Swagger：用于接口文档维护

### 前端

- React + TypeScript
- Vite
- pnpm
- React Router
- TanStack Query
- Zustand
- Axios
- React Hook Form + Zod
- Tailwind CSS
- Ant Design
- lucide-react
- Motion for React
- Web 端优先，并适配移动端 H5 访问

### 工程与部署

- Maven Wrapper 管理后端依赖与构建
- pnpm 管理前端依赖与构建
- Git 管理版本
- 后续可按环境补充 Docker、Nginx、CI/CD 等部署配置

## 文档索引

- 前端首页内容与图示风格规范：[`docs/frontend-homepage/README.md`](docs/frontend-homepage/README.md)
- 前端彩绘动画规范：[`docs/frontend-animation/README.md`](docs/frontend-animation/README.md)
- 前端技术栈与路由规划：[`docs/frontend-stack.md`](docs/frontend-stack.md)
- 前后端接口契约：[`docs/api-contract.md`](docs/api-contract.md)
- 角色权限边界：[`docs/rbac.md`](docs/rbac.md)

## 建议目录结构

```text
ecocampus/
├── backend/      # Spring Boot 后端服务
├── frontend/     # Web/H5 前端应用
├── docs/         # 需求文档、接口文档、数据库设计等
├── README.md
└── .gitignore
```

## 本地开发

项目采用单仓库双工程：`backend/` 为 Spring Boot 后端服务，`frontend/` 为 React 前端应用。

### 环境要求

- JDK 21+
- Node.js 20+
- pnpm 11+
- MySQL 8+（后续接真实 local 环境时需要）
- Redis 7+（后续接真实 local 环境时需要）

### 后端启动

默认配置使用 H2 内存数据库，便于在未安装 MySQL/Redis 时启动骨架服务。

```bash
cd backend
./mvnw spring-boot:run
```

常用检查入口：

```text
GET http://localhost:8080/api/v1/health
GET http://localhost:8080/actuator/health
http://localhost:8080/swagger-ui.html
http://localhost:8080/swagger-ui/index.html
```

后端测试：

```bash
cd backend
./mvnw test
```

### 前端启动

```bash
cd frontend
pnpm install
pnpm dev
```

前端构建：

```bash
cd frontend
pnpm build
```

## 配置说明

本地开发建议复制 `backend/src/main/resources/application-local.example.yml` 为本机私有配置，并使用环境变量保存敏感信息，不要提交真实账号、密码、密钥等内容。

常见配置项包括：

```text
SPRING_PROFILES_ACTIVE=local
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecocampus
DB_USERNAME=root
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
FILE_STORAGE_TYPE=local
```

## 开发状态

当前仓库已完成初始工程骨架：

- 后端 Spring Boot 工程、统一响应模型、全局异常处理、安全/CORS 基础配置、健康检查接口
- 前端 React 工程、完整路由占位、API client、Query client、权限守卫占位
- RBAC、接口契约、前端技术栈文档

后续将逐步补充数据库表结构、真实业务接口实现、业务 UI、部署文档和测试用例。
