# 数据库约束与锁策略

本文记录 EcoCampus 后端当前数据库约束、索引和锁的设计意图。数据库结构以 `backend/src/main/resources/db/migration/` 下的 Flyway migration 为准。

最近一次按 V1–V4 migration、默认 MySQL 配置和自动 seed 复核：2026-07-15。

## 初始化方式

- 使用 Flyway 管理表结构和种子数据，避免开发、测试和真实 MySQL 环境使用不同建表脚本。
- `application.yml` 已关闭旧的 `schema.sql` / `data.sql` 自动初始化，防止重复建表或重复写入种子数据。
- V1 创建核心表、约束和索引；V2 自动插入 4 个初始类目；V3 为 `users` 增加可空的 `password_hash`；V4 为会话增加双方已读时间。
- 默认 `application.yml` 使用本地 MySQL，并将 `classpath:db/migration` 和 `classpath:db/seed` 都纳入 Flyway locations。
- `db/seed/R__mysql_demo_seed.sql` 是默认环境自动执行的 repeatable Flyway 演示 seed，补齐贴近前端 mock 的用户、类目、商品、订单、会话、求购和审计数据。
- `db/seed/R__mysql_catalog_seed.sql` 是独立的 repeatable 商品目录 seed，使用预留 ID `50001`–`50072`，为九个一级类目各补 8 件符合校园二手场景的商品及图片、配送方式关联。
- 两份 seed 的商品图片统一引用前端 `public/catalog/` 下的 `/catalog/*.webp`，避免生产构建无法访问 `/src/assets`；图片记录与静态文件按商品 ID、排序号稳定对应。
- `application-prod.yml` 同时扫描 `classpath:db/migration` 和 `classpath:db/seed`，确保真实库已登记的 repeatable seed 始终可解析；校验和不变时不会重复执行，脚本变化时按 Flyway repeatable 语义自动重跑。
- `backend/src/test/resources/application.yml` 使用独立的 `ecocampus_test` MySQL，只加载 `db/migration`，并在测试上下文启动时自动清库、迁移，不导入完整演示数据。

## 生产数据库配置

- `application-prod.yml` 只在 `prod` profile 下生效，并强制使用 MySQL driver、Flyway migration、`spring.sql.init.mode=never` 和 `spring.jpa.hibernate.ddl-auto=validate`。
- 生产数据库连接必须通过 `DB_URL`、`DB_USERNAME` 和 `DB_PASSWORD` 显式提供；`prod` profile 不提供可工作的默认数据库地址、账号或密码。
- `JWT_SECRET` 也必须显式提供，至少 32 字符，且不能包含开发/示例占位内容。
- 生产 Hikari 连接池通过 `DB_POOL_MAX_SIZE`、`DB_POOL_MIN_IDLE`、`DB_POOL_CONNECTION_TIMEOUT_MS`、`DB_POOL_VALIDATION_TIMEOUT_MS`、`DB_POOL_IDLE_TIMEOUT_MS`、`DB_POOL_MAX_LIFETIME_MS` 和 `DB_POOL_LEAK_DETECTION_MS` 配置，并在启动阶段校验基础取值。
- `ProdDatabaseSafetyEnvironmentPostProcessor` 在配置加载后、应用上下文创建前执行防呆校验：`prod` profile 下非 MySQL URL、非 MySQL driver、默认账号、示例密码、不安全 DDL 策略、SQL 自动初始化或非法连接池参数都会直接阻止启动。

## 核心约束

- `users.phone` 目前兼作唯一登录账号，账号和学号分别有唯一约束；密码只存 `password_hash`（BCrypt）。
- 枚举字段使用 `check` 约束，覆盖用户角色、核验状态、商品状态、订单状态、配送方式和求购状态。
- 商品价格和求购预算使用非负约束，求购最低预算不能高于最高预算。
- 收藏使用 `(user_id, item_id)` 唯一约束，防止重复收藏。
- 会话使用 `(item_id, user_one_id, user_two_id)` 唯一约束，并要求 `user_one_id < user_two_id`，防止同一对用户生成重复会话。
- 会话保存 `user_one_read_at` 和 `user_two_read_at`，用于计算每个参与者的未读数。
- 商品配送方式、商品图片和求购关键词使用组合主键，防止重复明细。

## 活跃订单约束

订单表增加 `active_item_id` 辅助列：

- 订单处于 `PENDING_COMMUNICATION` 或 `WAITING_PICKUP` 时，`active_item_id = item_id`。
- 订单进入 `COMPLETED` 或 `CANCELLED` 后，`active_item_id = null`。
- `active_item_id` 上有唯一约束，因此同一商品同时最多只能有一个活跃订单。

这个约束用于兜住并发下单风险，即使应用层判断遗漏或两个请求同时进入，也不会产生多个活跃订单。

## 默认地址约束

地址表增加 `default_owner_id` 辅助列：

- 地址为默认地址时，`default_owner_id = user_id`。
- 地址不是默认地址时，`default_owner_id = null`。
- `default_owner_id` 上有唯一约束，因此每个用户最多只能有一个默认地址。

这个约束用于兜住并发设置默认地址的风险。

## 锁策略

- 商品行悲观写锁：下单、卖家编辑/上下架、管理员审核/违规下架时锁定商品，避免商品状态并发穿透。
- 订单行悲观写锁：订单状态变更时锁定订单，避免买卖双方同时取消、确认自提或确认完成。
- 会话行悲观写锁：发送消息时锁定会话，保证 `lastMessage` 对应最后一次提交的消息。
- 用户地址悲观写锁：管理默认地址时锁定该用户已有地址，减少并发设置默认地址的窗口。
- 商品、订单、用户、求购聚合根增加乐观锁版本号，用于捕获后台治理、用户编辑和系统任务之间的后写覆盖。

当前类目仍是扁平一级模型，没有父类、启停状态或商品数列。`MATCHED`、`DRAFT`、`DELETED` 等枚举虽受数据库约束允许，但当前未必有对应写入端点。

## 异常处理

数据库唯一约束、外键约束、`check` 约束、乐观锁和悲观锁冲突统一映射为 `409 CONFLICT`，前端收到后应刷新资源状态再重试。
