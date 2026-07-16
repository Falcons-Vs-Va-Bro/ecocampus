# EcoCampus 线上功能录制

录制器只访问真实线上站点和 API，不启用 mock。它将真实业务操作录成 WebM，再使用本目录依赖的静态 FFmpeg 合成 1920×1080 MP4。中文旁白通过 macOS `say -o` 写入离线 AIFF 文件，最后混入成片；录制期间不会直接从扬声器播放。

## 场景与覆盖

| 场景 | 命令参数 | 关键能力 | 画面 |
| --- | --- | --- | --- |
| 校园认证与地址 | `identity` | 移动登录、网页手机号验证码、学号认证、个人信息、默认地址 | 单移动端 |
| 商品发布与审核 | `publish-review` | 图片上传、分类、定价、自提、待审、管理员通过、在售 | 卖家/管理员双桌面 |
| 市场与订单闭环 | `market-order` | 关键词检索、收藏、预约自提、待沟通→待自提→已完成、双角色记录 | 卖家桌面/买家移动 |
| 后台治理 | `governance` | 违规下架、黑名单加入/移出、数据看板、类目入口 | 管理员桌面 |
| 求购智能匹配 | `demand-match` | 发布求购、分类与预算匹配、进入商品详情、联系卖家入口 | 单移动端 |
| 双账号私信 | 独立脚本 | 真实双向消息、移动/桌面轮询同步、同步耗时 | 桌面/移动 |

完整功能链路由上述 6 个场景共同构成。当前后台类目已支持真实两级结构、启停和实时商品数；本版治理成片只展示类目入口，没有执行类目 mutation，后续可单独补录类目维护镜头。

## 首次准备

```bash
cd recording
pnpm install
pnpm setup
```

## 录制命令

```bash
# 一次执行五条新增链路
pnpm record:flows

# 单独重录一个场景
pnpm exec node ./record-online-flows.mjs --scenario=publish-review
pnpm exec node ./record-online-flows.mjs --scenario=market-order
pnpm exec node ./record-online-flows.mjs --scenario=demand-match
pnpm exec node ./record-online-flows.mjs --scenario=governance
pnpm exec node ./record-online-flows.mjs --scenario=identity

# 双账号私信同步
pnpm record:messages
```

`market-order` 必须使用一件线上在售演示商品。与 `publish-review` 在同一次 `all` 执行中运行时会自动复用刚上架商品；单独执行时可传 `RECORD_ITEM_ID=<商品 ID>`，或复用卖家最近一件标题以“【线上录制】”开头的在售商品。

## 默认账号与参数

- 站点：`https://ecocampus.teamdsb.online`
- API：`https://ecocampus-api.teamdsb.online/api/v1`
- 卖家：`2292024000007`
- 买家：`2292024000001`
- 管理员：`2292024000900`
- 演示密码：`demo-password`
- 独立后台治理默认使用固定认证演示账号的学号 `2026999001`
- 旁白：`Tingting`，语速 185

可覆盖 `RECORD_SITE_URL`、`RECORD_API_URL`、`RECORD_SELLER_ACCOUNT`、`RECORD_BUYER_ACCOUNT`、`RECORD_ADMIN_ACCOUNT`、`RECORD_DEMO_PASSWORD`、`RECORD_ITEM_ID`、`RECORD_GOVERNANCE_STUDENT_NO`、`RECORD_VOICE` 和 `RECORD_SPEECH_RATE`。

认证场景默认生成新的预留账号、手机号和学号；也可以显式传入：

```bash
RECORD_IDENTITY_ACCOUNT=2292024999001 \
RECORD_IDENTITY_PHONE=19900009901 \
RECORD_IDENTITY_STUDENT_NO=2026999001 \
pnpm exec node ./record-online-flows.mjs --scenario=identity
```

指定账号必须处于 `UNVERIFIED`；已经认证的账号不能重复录制认证过程。

## 输出

每次运行生成 `recording/output/<场景>-<时间>/`，包含：

- 带旁白最终 MP4；
- 无旁白 MP4；
- 一路或两路原始 WebM；
- `preview.jpg`；
- `storyboard.json`；
- `narration.srt`。

每个场景还会复制一份 `<场景>-latest.mp4` 和 `<场景>-latest.jpg` 作为最近结果。`recording/output/` 和 `recording/.tmp/` 均被 Git 忽略。

## 线上数据边界

- access token 只保留在进程内存；输出只记录掩码账号、业务 ID 和耗时，不记录密码或 token。
- 商品和求购标题带“线上录制”“治理录制”标记，避免与普通数据混淆。
- 发布审核场景产生一件真实在售商品；订单场景完成后，该商品按业务规则变为已售。
- 求购场景结束后自动关闭刚创建的需求。
- 地址场景结束后自动删除刚创建的演示地址；认证账号本身会保留。
- 治理场景的专用商品最终保持违规下架；演示用户只短暂加入黑名单，并在正常路径和 `finally` 清理中恢复。
- 私信场景每次真实留下两条带“线上演示”标记的消息，并在录制前检查会话容量。

## 校验

```bash
cd recording
pnpm check
```

录制前会校验账号角色与认证状态；关键状态通过线上 API 轮询确认，未真正进入期望状态就不会进入合成步骤。
