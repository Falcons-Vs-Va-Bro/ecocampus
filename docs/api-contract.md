# EcoCampus 接口契约

## 1. 基本约定

- Base URL: `/api/v1`
- 数据格式: `application/json; charset=utf-8`
- 认证方式: `Authorization: Bearer <accessToken>`
- 时间格式: ISO-8601，例如 `2026-07-03T15:00:00+08:00`
- 金额单位: 分，字段名使用 `priceCent`
- 分页参数: `page` 从 `1` 开始，`size` 默认 `20`

统一响应：

```json
{
  "code": "OK",
  "message": "success",
  "data": {},
  "traceId": "req-20260703-0001"
}
```

分页响应：

```json
{
  "items": [],
  "page": 1,
  "size": 20,
  "total": 100
}
```

常见错误码：

| code | HTTP | 说明 |
| --- | --- | --- |
| `OK` | 200 | 成功 |
| `BAD_REQUEST` | 400 | 参数错误 |
| `UNAUTHORIZED` | 401 | 未登录或 token 无效 |
| `FORBIDDEN` | 403 | 无权限 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `CONFLICT` | 409 | 状态冲突，例如重复收藏、重复下单 |
| `VALIDATION_FAILED` | 422 | 字段校验失败 |
| `BLACKLISTED` | 423 | 用户已被黑名单限制 |
| `INTERNAL_ERROR` | 500 | 服务端错误 |

## 2. 枚举

```ts
type UserRole = "USER" | "ADMIN";
type VerificationStatus = "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "BLACKLISTED";
type ItemStatus = "DRAFT" | "PENDING_REVIEW" | "ON_SALE" | "OFF_SHELF" | "REJECTED" | "VIOLATION_REMOVED" | "SOLD" | "DELETED";
type DeliveryMode = "SELF_PICKUP" | "DELIVER_TO_SCHOOL";
type OrderStatus = "PENDING_COMMUNICATION" | "WAITING_PICKUP" | "COMPLETED" | "CANCELLED";
type DemandStatus = "OPEN" | "MATCHED" | "CLOSED";
```

## 3. 认证与校园核验

### 3.1 发送验证码

`POST /auth/sms-code`

```json
{
  "phone": "13800000000"
}
```

### 3.2 手机号登录

`POST /auth/login`

```json
{
  "phone": "13800000000",
  "code": "123456"
}
```

响应：

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

### 3.3 提交校园核验

`POST /auth/campus-verification`

权限：`PENDING_USER`、`USER`

```json
{
  "realName": "张三",
  "studentNo": "2026000001",
  "college": "信息学院",
  "grade": "2026"
}
```

### 3.4 查询当前登录用户

`GET /auth/me`

响应：

```json
{
  "id": 1,
  "nickname": "Eco 用户",
  "phone": "138****0000",
  "role": "USER",
  "verificationStatus": "VERIFIED",
  "studentNoMasked": "2026****001"
}
```

## 4. 用户与地址

### 4.1 更新个人信息

`PUT /users/me`

```json
{
  "nickname": "Eco 用户",
  "avatarUrl": "https://cdn.example.com/avatar.png"
}
```

### 4.2 地址列表

`GET /users/me/addresses`

### 4.3 新增地址

`POST /users/me/addresses`

```json
{
  "receiverName": "张三",
  "receiverPhone": "13800000000",
  "campusArea": "主校区",
  "detail": "xx 宿舍楼下",
  "isDefault": true
}
```

### 4.4 更新/删除地址

- `PUT /users/me/addresses/{addressId}`
- `DELETE /users/me/addresses/{addressId}`

### 4.5 我的发布商品

`GET /users/me/items?status=ON_SALE&page=1&size=20`

权限：`USER`

说明：用于“我的发布/上下架管理”页面。`status` 可选，不传时返回当前用户全部未删除商品。

响应：

```json
{
  "items": [
    {
      "id": 1001,
      "title": "数据结构教材",
      "categoryName": "教材",
      "priceCent": 3200,
      "status": "ON_SALE",
      "coverImageUrl": "https://cdn.example.com/item/1001.png",
      "createdAt": "2026-07-03T15:00:00+08:00"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1
}
```

## 5. 类目

### 5.1 前台类目列表

`GET /categories`

响应：

```json
[
  { "id": 1, "name": "教材", "sort": 10 },
  { "id": 2, "name": "数码", "sort": 20 },
  { "id": 3, "name": "宿舍用品", "sort": 30 },
  { "id": 4, "name": "运动器材", "sort": 40 }
]
```

## 6. 文件上传

### 6.1 上传图片

`POST /files/images`

Content-Type: `multipart/form-data`

字段：

- `file`: 图片文件
- `scene`: `ITEM`、`AVATAR`、`REPORT`

响应：

```json
{
  "url": "https://cdn.example.com/item/1.png",
  "width": 1200,
  "height": 900
}
```

## 7. 商品

### 7.1 商品列表

`GET /items`

查询参数：

| 参数 | 说明 |
| --- | --- |
| `keyword` | 关键词 |
| `categoryId` | 类目 |
| `minPriceCent` | 最低价 |
| `maxPriceCent` | 最高价 |
| `deliveryMode` | 自提/送货到校 |
| `page` / `size` | 分页 |

### 7.2 商品详情

`GET /items/{itemId}`

响应：

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
  "imageUrls": ["https://cdn.example.com/item/1001.png"],
  "seller": {
    "id": 7,
    "nickname": "匿名同学"
  },
  "favorited": false,
  "favoriteCount": 8,
  "createdAt": "2026-07-03T15:00:00+08:00"
}
```

### 7.3 发布商品

`POST /items`

权限：`USER`

```json
{
  "title": "数据结构教材",
  "description": "九成新，少量笔记",
  "categoryId": 1,
  "priceCent": 3200,
  "deliveryModes": ["SELF_PICKUP", "DELIVER_TO_SCHOOL"],
  "imageUrls": ["https://cdn.example.com/item/1001.png"]
}
```

创建后状态为 `PENDING_REVIEW`。

### 7.4 编辑商品

`PUT /items/{itemId}`

权限：商品所有者，且商品未被违规下架/售出。

### 7.5 上下架商品

- `POST /items/{itemId}/on-sale`
- `POST /items/{itemId}/off-shelf`

重新上架需要进入 `PENDING_REVIEW`。

## 8. 收藏

### 8.1 收藏商品

`POST /items/{itemId}/favorite`

### 8.2 取消收藏

`DELETE /items/{itemId}/favorite`

### 8.3 我的收藏

`GET /users/me/favorites`

## 9. 私信聊天

### 9.1 创建/获取商品会话

`POST /conversations`

```json
{
  "itemId": 1001,
  "targetUserId": 7
}
```

### 9.2 会话列表

`GET /conversations`

### 9.3 消息列表

`GET /conversations/{conversationId}/messages`

### 9.4 发送消息

`POST /conversations/{conversationId}/messages`

```json
{
  "content": "你好，请问今天下午可以自提吗？"
}
```

实时能力可在后续用 WebSocket/SSE 扩展；MVP 可先轮询。

## 10. 订单

### 10.1 创建订单

`POST /orders`

权限：`USER`

```json
{
  "itemId": 1001,
  "deliveryMode": "SELF_PICKUP",
  "remark": "想约图书馆门口自提"
}
```

创建后状态为 `PENDING_COMMUNICATION`。

### 10.2 我的订单

`GET /orders?role=BUYER|SELLER&status=PENDING_COMMUNICATION`

### 10.3 订单详情

`GET /orders/{orderId}`

### 10.4 更新订单状态

`POST /orders/{orderId}/status`

```json
{
  "targetStatus": "WAITING_PICKUP",
  "remark": "双方已确认明天 18:00 自提"
}
```

状态流转限制：

- `PENDING_COMMUNICATION -> WAITING_PICKUP`
- `WAITING_PICKUP -> COMPLETED`
- `PENDING_COMMUNICATION -> CANCELLED`
- `WAITING_PICKUP -> CANCELLED`

## 11. 闲置求购

### 11.1 发布求购

`POST /demands`

权限：`USER`

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

### 11.2 求购列表

`GET /demands?categoryId=2&keyword=显示器&page=1&size=20`

### 11.3 我的求购

`GET /users/me/demands`

### 11.4 关闭求购

`POST /demands/{demandId}/close`

### 11.5 求购匹配结果

`GET /demands/{demandId}/matches`

响应：

```json
[
  {
    "itemId": 1001,
    "title": "二手显示器",
    "priceCent": 26000,
    "matchReason": "关键词和预算匹配"
  }
]
```

## 12. 后台管理

后台接口统一要求 `ADMIN` 权限。

### 12.1 商品审核

`GET /admin/items/review?status=PENDING_REVIEW&page=1&size=20`

`POST /admin/items/{itemId}/review`

```json
{
  "approved": true,
  "reason": "信息完整，允许上架"
}
```

### 12.2 违规下架

`GET /admin/items?status=ON_SALE&keyword=教材&categoryId=1&page=1&size=20`

说明：用于后台商品治理页面，可按状态、关键词、类目筛选全站商品。

响应：

```json
{
  "items": [
    {
      "id": 1001,
      "title": "数据结构教材",
      "sellerId": 7,
      "sellerNickname": "匿名同学",
      "categoryName": "教材",
      "priceCent": 3200,
      "status": "ON_SALE",
      "createdAt": "2026-07-03T15:00:00+08:00"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1
}
```

`POST /admin/items/{itemId}/violation-remove`

```json
{
  "reason": "疑似商贩批量发布"
}
```

### 12.3 用户黑名单

`GET /admin/users?keyword=张三&verificationStatus=VERIFIED&page=1&size=20`

说明：用于后台用户与黑名单页面，可按昵称、手机号尾号、学号尾号、核验状态筛选用户。

响应：

```json
{
  "items": [
    {
      "id": 7,
      "nickname": "匿名同学",
      "phoneMasked": "138****0000",
      "studentNoMasked": "2026****001",
      "role": "USER",
      "verificationStatus": "VERIFIED",
      "blacklisted": false
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1
}
```

`POST /admin/users/{userId}/blacklist`

```json
{
  "reason": "校外商贩或违规交易",
  "expireAt": null
}
```

`DELETE /admin/users/{userId}/blacklist`

### 12.4 类目管理

- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/{categoryId}`
- `DELETE /admin/categories/{categoryId}`

### 12.5 数据看板

`GET /admin/dashboard/overview`

响应：

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

## 13. 前后端对接要求

- 所有需要校园身份的接口必须检查 `verificationStatus == VERIFIED`。
- 黑名单用户进入受限态，交易类接口统一返回 `BLACKLISTED`。
- 商品发布、审核、下架、订单状态变更都要写审计日志。
- 图片上传接口只返回 URL，不在商品接口里传 Base64。
- 前端展示用中文，接口枚举保持英文，避免后续多端扩展时混乱。
