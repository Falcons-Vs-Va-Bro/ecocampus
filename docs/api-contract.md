# EcoCampus API 契约

最近一次按后端控制器与 DTO 复核：2026-07-14。

本文只记录当前已经实现的 HTTP API。若本文与 `backend/src/main/java` 下的 Controller、Request/Response DTO 冲突，以代码为准并应立即修正文档。

## 1. 通用约定

- Base URL：`/api/v1`
- JSON：`application/json`
- 认证：`Authorization: Bearer <accessToken>`
- 请求追踪：前端发送 `X-Trace-Id`；未发送时后端生成 UUID。
- 金额单位：分，字段使用 `priceCent`、`budgetMinCent`、`budgetMaxCent`。
- 时间：ISO-8601。
- 分页：`page` 从 1 开始，`size` 默认 20、最大 100；非法小页码归一为 1，`size < 1` 归一为 20。

统一响应：

```json
{
  "code": "OK",
  "message": "success",
  "data": {},
  "traceId": "request-trace-id"
}
```

分页 `data`：

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "total": 0
}
```

错误码：

| code | HTTP | 含义 |
| --- | --- | --- |
| `BAD_REQUEST` | 400 | 业务参数错误 |
| `UNAUTHORIZED` | 401 | 未登录、账号密码错误或 token 无效 |
| `FORBIDDEN` | 403 | 权限、校园核验或资源归属不满足 |
| `NOT_FOUND` | 404 | 资源不存在或公开资源不可见 |
| `CONFLICT` | 409 | 状态机、唯一约束或并发锁冲突 |
| `VALIDATION_FAILED` | 422 | DTO/参数校验失败，`data.errors` 给出字段错误 |
| `BLACKLISTED` | 423 | 当前用户处于有效黑名单限制 |
| `INTERNAL_ERROR` | 500 | 未处理异常 |

枚举：

```ts
type UserRole = 'USER' | 'ADMIN'
type VerificationStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'BLACKLISTED'
type ItemStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ON_SALE' | 'OFF_SHELF' | 'REJECTED' | 'VIOLATION_REMOVED' | 'SOLD' | 'DELETED'
type DeliveryMode = 'SELF_PICKUP' | 'DELIVER_TO_SCHOOL'
type OrderRole = 'BUYER' | 'SELLER'
type OrderStatus = 'PENDING_COMMUNICATION' | 'WAITING_PICKUP' | 'COMPLETED' | 'CANCELLED'
type DemandStatus = 'OPEN' | 'MATCHED' | 'CLOSED'
```

### 健康检查

`GET /health`，公开。

```json
{
  "status": "UP",
  "service": "ecocampus",
  "timestamp": "2026-07-14T12:00:00+08:00"
}
```

该响应仍包装在统一 `ApiResponse.data` 中；`/actuator/health` 是独立的 Actuator 健康端点。

## 2. 认证与用户

### 登录

`POST /auth/login`，公开。

```json
{
  "account": "22920240001",
  "password": "user-input-password"
}
```

- `account` 最大 20 字符，必须匹配 `2292024.+`。
- `password` 最大 72 字符。
- 账号不存在时自动创建 `USER/VERIFIED` 用户并保存 BCrypt 哈希；账号存在时校验首次创建时的密码。
- 当前没有注册、刷新 token 或退出登录端点。响应会返回 refresh token，但后端尚未提供 refresh API。

响应 `data`：

```json
{
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "user": {
    "id": 1,
    "role": "USER",
    "verificationStatus": "VERIFIED"
  }
}
```

### 当前用户

`GET /auth/me`，登录用户。

```json
{
  "id": 1,
  "nickname": "Eco User",
  "phone": "229****0001",
  "role": "USER",
  "verificationStatus": "VERIFIED",
  "studentNoMasked": null
}
```

### 校园核验

`POST /auth/campus-verification`，登录用户；有效黑名单用户被拒绝。

```json
{
  "realName": "张三",
  "studentNo": "2026000001",
  "college": "信息学院",
  "grade": "2026"
}
```

`studentNo` 必须为 8–20 位数字且全局唯一。当前实现提交后直接设为 `VERIFIED`，没有管理员核验接口或异步审核流程。响应为当前用户结构。

### 个人资料

`PUT /users/me`，登录用户；有效黑名单用户被拒绝。

```json
{
  "nickname": "Eco 用户",
  "avatarUrl": "https://example.com/avatar.png"
}
```

响应为当前用户结构。当前 `MeResponse` 不返回 `avatarUrl`。

### 地址

- `GET /users/me/addresses`
- `POST /users/me/addresses`
- `PUT /users/me/addresses/{addressId}`
- `DELETE /users/me/addresses/{addressId}`

均要求 `VERIFIED`；只能访问自己的地址。

```json
{
  "receiverName": "张三",
  "receiverPhone": "13800000000",
  "campusArea": "主校区",
  "detail": "xx 宿舍楼下",
  "isDefault": true
}
```

地址响应在上述字段基础上增加 `id`，`isDefault` 为布尔值。

## 3. 类目

### 公开类目

`GET /categories`，公开。响应 `data` 为按 `sort,id` 排序的扁平数组：

```json
[
  { "id": 1, "name": "教材", "sort": 10 }
]
```

### 后台类目

- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/{categoryId}`
- `DELETE /admin/categories/{categoryId}`

仅 `ADMIN`。创建/更新请求：

```json
{ "name": "教材", "sort": 10 }
```

`name` 最大 40 字符，`sort` 为 0–10000。当前模型只有一级类目和排序，没有父子关系、启停状态或商品数。

## 4. 文件

`POST /files/images`，`multipart/form-data`，要求 `VERIFIED`。

字段：

- `file`：非空且可解码的图片；当前支持 JPEG、PNG、GIF。仓库未显式配置 multipart 大小上限，实际限制沿用 Spring Boot 默认值。
- `scene`：`ITEM`、`AVATAR` 或 `REPORT`。

响应：

```json
{ "url": "/uploads/ITEM/uuid.jpg", "width": 1200, "height": 900 }
```

当前实现只有本地文件存储，不包含对象存储实现。`GET /uploads/**` 允许匿名读取，并返回 `Cache-Control: public, max-age=31536000, immutable`，使浏览器和 Cloudflare 可缓存 UUID 命名的不可变图片。生产环境默认把上传响应 URL 前缀设为 `https://ecocampus-api.teamdsb.online/uploads`；可以通过 `FILE_STORAGE_PUBLIC_URL_PREFIX` 覆盖。

## 5. 商品

### 商品摘要类型

公开商品列表返回卡片展示所需的卖家、配送和收藏元数据；未登录访问时 `favorited` 为 `false`。

```json
{
  "id": 1001,
  "title": "数据结构教材",
  "categoryName": "教材",
  "priceCent": 3200,
  "status": "ON_SALE",
  "coverImageUrl": "/uploads/item/1001.png",
  "createdAt": "2026-07-03T15:00:00+08:00",
  "deliveryModes": ["SELF_PICKUP"],
  "seller": { "id": 7, "nickname": "Eco User", "verificationStatus": "VERIFIED" },
  "favorited": false,
  "favoriteCount": 8
}
```

### 公开列表

`GET /items`，公开；只返回 `ON_SALE`。

参数：`keyword`、`categoryId`、`minPriceCent`、`maxPriceCent`、`deliveryMode`、`page`、`size`。

响应 `data` 为分页商品摘要。

### 公开详情

`GET /items/{itemId}`，公开；非 `ON_SALE` 对外返回 404。登录用户可得到自己的 `favorited` 状态。

```json
{
  "id": 1001,
  "title": "数据结构教材",
  "description": "九成新，少量笔记",
  "categoryId": 1,
  "categoryName": "教材",
  "priceCent": 3200,
  "deliveryModes": ["SELF_PICKUP"],
  "status": "ON_SALE",
  "imageUrls": ["/uploads/item/1001.png"],
  "seller": { "id": 7, "nickname": "Eco User", "verificationStatus": "VERIFIED" },
  "favorited": false,
  "favoriteCount": 8,
  "createdAt": "2026-07-03T15:00:00+08:00"
}
```

若公开商品 GET 携带无效 Bearer token，JWT filter 会对商品列表/详情降级为匿名访问；其他端点仍返回 401。

### 发布与编辑

- `POST /items`
- `PUT /items/{itemId}`

要求 `VERIFIED`；更新仅限商品所有者。请求：

```json
{
  "title": "数据结构教材",
  "description": "九成新，少量笔记",
  "categoryId": 1,
  "priceCent": 3200,
  "deliveryModes": ["SELF_PICKUP", "DELIVER_TO_SCHOOL"],
  "imageUrls": ["/uploads/item/1001.png"]
}
```

图片 1–9 张。新建状态为 `PENDING_REVIEW`；编辑 `ON_SALE`、`REJECTED` 或 `OFF_SHELF` 商品后也回到 `PENDING_REVIEW`。响应为卖家商品详情，不含 `seller/favorited/favoriteCount`。

### 上下架与我的发布

- `POST /items/{itemId}/on-sale`：所有者申请重新审核，响应卖家商品详情。
- `POST /items/{itemId}/off-shelf`：所有者下架，响应卖家商品详情。
- `GET /users/me/items?status=ON_SALE&page=1&size=20`：分页返回自己的商品。

“我的发布”摘要字段只有 `id/title/categoryName/priceCent/status/coverImageUrl/createdAt`。

实现注意：`off-shelf` 当前只拒绝 `SOLD/DELETED`，因此甚至能把 `VIOLATION_REMOVED` 改成 `OFF_SHELF`，随后再申请上架审核；这是现有状态校验漏洞，不是期望业务规则。

### 收藏

- `POST /items/{itemId}/favorite`：要求 `VERIFIED`，不能收藏自己的商品或重复收藏；响应公开商品详情。
- `DELETE /items/{itemId}/favorite`：删除自己的收藏。
- `GET /users/me/favorites?page=1&size=20`：分页返回收藏商品卡片摘要，包含在售和失效收藏，但不返回已删除商品。

收藏列表在商品摘要字段基础上增加：

```json
{
  "favorited": true,
  "favoritedAt": "2026-07-03T16:00:00+08:00",
  "invalidReason": null
}
```

`invalidReason` 对 `OFF_SHELF/SOLD/REJECTED/VIOLATION_REMOVED/PENDING_REVIEW/DRAFT` 给出失效说明；`ON_SALE` 为 `null`。

## 6. 私信

全部端点要求 `VERIFIED`。会话必须包含商品卖家，且双方都必须是已核验用户。

- `POST /conversations`
- `GET /conversations?page=1&size=20`
- `GET /conversations/{conversationId}/messages?page=1&size=20`
- `POST /conversations/{conversationId}/messages`

创建/获取会话请求：

```json
{ "itemId": 1001, "targetUserId": 7 }
```

会话摘要：

```json
{
  "id": 501,
  "itemId": 1001,
  "itemTitle": "二手显示器",
  "targetUserId": 7,
  "targetNickname": "张三",
  "lastMessage": "今天下午可以自提吗？",
  "lastMessageAt": "2026-07-03T16:00:00+08:00",
  "createdAt": "2026-07-03T15:30:00+08:00",
  "unreadCount": 1
}
```

读取消息列表会更新当前用户已读时间。消息按 `createdAt asc, id asc` 返回：

```json
{
  "id": 9001,
  "conversationId": 501,
  "senderId": 7,
  "content": "今天下午可以自提吗？",
  "createdAt": "2026-07-03T16:00:00+08:00"
}
```

发送请求为 `{ "content": "..." }`，最多 1000 字符。当前没有 WebSocket/SSE，前端按需查询刷新。

## 7. 订单

全部端点要求 `VERIFIED`。

### 创建

`POST /orders`

```json
{
  "itemId": 1001,
  "deliveryMode": "SELF_PICKUP",
  "remark": "想约图书馆门口自提"
}
```

商品必须在售、配送方式受支持、买家不能是卖家，同一商品只能有一个活跃订单。创建状态为 `PENDING_COMMUNICATION`。

### 查询

- `GET /orders?role=BUYER|SELLER&status=PENDING_COMMUNICATION&page=1&size=20`，`role` 默认 `BUYER`。
- `GET /orders/{orderId}`，仅买卖双方。

订单摘要：

```json
{
  "id": 7001,
  "itemId": 1001,
  "itemTitle": "高等数学（第七版）上下册",
  "buyerId": 12,
  "sellerId": 7,
  "deliveryMode": "SELF_PICKUP",
  "status": "PENDING_COMMUNICATION",
  "remark": "想约图书馆门口自提",
  "createdAt": "2026-07-03T15:00:00+08:00",
  "itemCoverImageUrl": "/uploads/item/1001.png",
  "itemPriceCent": 3200,
  "buyerNickname": "买家同学",
  "sellerNickname": "Eco User"
}
```

订单卡片所需的商品图片、价格和双方昵称由真实订单响应提供；取货时间/地点仍暂用订单 `remark` 承载，没有独立履约地址字段。

### 状态变更

`POST /orders/{orderId}/status`

```json
{ "targetStatus": "WAITING_PICKUP", "remark": "明天 18:00 自提" }
```

- `PENDING_COMMUNICATION -> WAITING_PICKUP`：仅卖家。
- `WAITING_PICKUP -> COMPLETED`：仅买家；同时将商品设为 `SOLD`。
- 两个活跃状态均可转 `CANCELLED`：买卖双方都可执行。

## 8. 求购

### 发布与公开列表

- `POST /demands`，要求 `VERIFIED`。
- `GET /demands?categoryId=2&keyword=显示器&page=1&size=20`，公开，只返回 `OPEN`。

请求：

```json
{
  "title": "求购二手显示器",
  "description": "24 寸以上，预算 300 内",
  "categoryId": 2,
  "budgetMinCent": 10000,
  "budgetMaxCent": 30000,
  "keywords": ["显示器", "24寸"]
}
```

关键词 1–8 个，每个最多 40 字符。响应包含 `id/title/description/categoryId/categoryName/budgetMinCent/budgetMaxCent/keywords/status/createdAt`。

### 我的求购、关闭和匹配

- `GET /users/me/demands?page=1&size=20`
- `POST /demands/{demandId}/close`
- `GET /demands/{demandId}/matches?limit=20`

均要求 `VERIFIED` 且只允许求购所有者。`limit` 默认 20、最大 50；匹配在数据库侧按类目、预算和关键词过滤。

```json
[
  {
    "itemId": 1001,
    "title": "二手显示器",
    "priceCent": 26000,
    "matchReason": "keyword and budget matched"
  }
]
```

当前没有 `GET /demands/{demandId}` 详情端点，也没有编辑、删除或重开求购端点。前端求购详情页只能通过 `GET /demands` 公开列表兜底定位开放求购；我的求购页只暴露真实的关闭能力。

## 9. 后台管理

后台业务在 service 层统一要求 `ADMIN`。

### 商品审核与治理

- `GET /admin/items/review?status=PENDING_REVIEW&page=1&size=20`
- `POST /admin/items/{itemId}/review`
- `GET /admin/items?status=ON_SALE&keyword=教材&categoryId=1&page=1&size=20`
- `POST /admin/items/{itemId}/violation-remove`

审核请求：

```json
{ "approved": true, "reason": "信息完整" }
```

违规下架请求：

```json
{ "reason": "疑似违规发布" }
```

后台商品摘要真实字段：`id/title/sellerId/sellerNickname/categoryName/priceCent/status/createdAt`。不包含图片、完整描述、举报数、审核标记或卖家历史违规数；这些目前是前端 mock 展示字段。

### 用户黑名单

- `GET /admin/users?keyword=张三&verificationStatus=VERIFIED&page=1&size=20`
- `POST /admin/users/{userId}/blacklist`
- `DELETE /admin/users/{userId}/blacklist`

列表字段：`id/nickname/phoneMasked/studentNoMasked/role/verificationStatus/blacklisted`。

```json
{ "reason": "违规交易", "expireAt": null }
```

`reason` 必填且最多 255 字符；管理员不能拉黑自己。

### 数据看板

- `GET /admin/dashboard/overview`
- `GET /admin/dashboard/summary`

overview：

```json
{
  "itemPublishCount": 120,
  "orderCompletedCount": 45,
  "pendingReviewCount": 8,
  "activeUserCount": 300,
  "categoryStats": [
    { "categoryName": "教材", "itemCount": 40, "completedOrderCount": 18 }
  ]
}
```

summary 在 `overview` 之外增加：

- `dealTrends[]`：`date/label/currentWeekCount/previousWeekCount`
- `recentPendingItems[]`：`id/title/sellerNickname/categoryName/submittedAt/coverImageUrl`
- `reminders[]`：`key/label/count/severity`

## 10. 安全与审计实现边界

- 公开端点：健康检查、公开类目、商品列表/详情、公开求购列表、登录、Actuator health，以及启用时的 Swagger/OpenAPI。
- 交易类 service 使用 `CampusAccessGuard.requireVerifiedUser`，有效黑名单返回 423。
- 管理接口在 service 层检查 `ADMIN`；Spring Security 过滤链只要求这些 URL 已认证。
- 商品创建/编辑/上下架/审核/违规下架和订单创建/状态变更会写 `audit_logs`。
- 用户黑名单、类目 CRUD、求购和私信当前不写通用审计日志。
