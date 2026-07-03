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
- Spring Boot
- Maven
- RESTful API
- MySQL
- Redis
- 对象存储：本地存储、MinIO 或云 OSS
- OpenAPI/Swagger：用于接口文档维护

### 前端

- Web 端优先
- 移动端 H5 适配
- 前端框架待项目初始化时确定，可根据开发需要选择 Vue、React 或其他技术栈

### 工程与部署

- Maven 管理后端依赖与构建
- Git 管理版本
- 后续可按环境补充 Docker、Nginx、CI/CD 等部署配置

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

项目代码初始化后，可按以下方式运行。

### 环境要求

- JDK 21+
- Maven 3.9+
- MySQL 8+
- Redis 7+
- Node.js 20+（如使用前端工程化工具）

### 后端启动

```bash
cd backend
mvn spring-boot:run
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

## 配置说明

本地开发建议使用独立配置文件或环境变量保存敏感信息，不要提交真实账号、密码、密钥等内容。

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

当前仓库处于项目初始化阶段，后续将逐步补充：

- 后端 Spring Boot 工程
- Web/H5 前端工程
- 数据库表结构与初始化脚本
- 接口文档
- 部署文档
- 测试用例
