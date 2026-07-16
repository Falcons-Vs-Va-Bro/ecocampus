import path from 'node:path'
import {
  apiDelete,
  apiGet,
  apiPost,
  chromium,
  config,
  createRun,
  finalizeSingle,
  finalizeSplit,
  launchRecordedContext,
  login,
  maskAccount,
  openApi,
  outputRoot,
  repoRoot,
  saveRecordedPage,
  showSlate,
  sleep,
  sleepUntil,
} from './lib/recording-kit.mjs'

const requestedScenario = readArgument('--scenario') ?? 'all'
const allowedScenarios = ['identity', 'publish-review', 'market-order', 'governance', 'demand-match']
if (requestedScenario !== 'all' && !allowedScenarios.includes(requestedScenario)) {
  throw new Error(`--scenario 只支持 all 或 ${allowedScenarios.join(', ')}`)
}

const shared = {
  identityStudentNo: '',
  publishedItemId: Number(process.env.RECORD_ITEM_ID ?? 0),
  publishedItemTitle: '',
}
const scenarios = requestedScenario === 'all' ? allowedScenarios : [requestedScenario]

for (const scenario of scenarios) {
  console.log(`\n=== 录制 ${scenario} ===`)
  if (scenario === 'identity') await recordIdentity()
  if (scenario === 'publish-review') await recordPublishReview()
  if (scenario === 'market-order') await recordMarketOrder()
  if (scenario === 'governance') await recordGovernance()
  if (scenario === 'demand-match') await recordDemandMatch()
}

console.log(`\n全部完成，输出目录：${outputRoot}`)

async function recordIdentity() {
  const run = await createRun('identity-profile-online')
  const api = await openApi()
  const suffix = String(Date.now()).slice(-7)
  const account = process.env.RECORD_IDENTITY_ACCOUNT ?? `229202499${suffix}`
  const phone = process.env.RECORD_IDENTITY_PHONE ?? `199${String(Date.now()).slice(-8)}`
  const studentNo = process.env.RECORD_IDENTITY_STUDENT_NO ?? `2026${String(Date.now()).slice(-8)}`
  const session = await login(api, account)
  if (session.user.verificationStatus !== 'UNVERIFIED') {
    throw new Error(`认证演示账号 ${maskAccount(account)} 已不是 UNVERIFIED，请换一个 RECORD_IDENTITY_ACCOUNT`)
  }

  const browser = await chromium.launch({ headless: config.headless })
  const context = await launchRecordedContext(browser, run, 'mobile', 'mobile')
  const page = await context.newPage()
  const startedAt = Date.now()
  let rawPath
  try {
    await showSlate(page, '线上真实认证', '学号 + 手机号双重核验', '从未认证账号开始，完成网页验证码、校园资料与常用地址')
    await sleepUntil(startedAt, 2_000)
    await page.goto(`${config.siteUrl}/login?returnTo=%2Fverify`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.getByLabel(/学号|账号/).fill(account)
    await page.locator('input[type="password"]').fill(config.password)
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL(/\/verify/, { timeout: 20_000 })

    await sleepUntil(startedAt, 8_000)
    await page.getByLabel('手机号').fill(phone)
    await page.getByRole('button', { name: '发送验证码' }).click()
    const smsToast = page.getByLabel('网页短信验证码通知')
    await smsToast.waitFor({ state: 'visible', timeout: 12_000 })
    await sleep(1_500)
    await smsToast.getByRole('button', { name: '填入验证码' }).click()

    await page.getByLabel('姓名').fill('录制演示同学')
    await page.getByLabel('学号').fill(studentNo)
    await page.getByLabel('院系').fill('信息学院')
    await page.getByLabel('年级').fill('2026级')
    await page.locator('input.verify-file-input').setInputFiles(path.join(repoRoot, 'assets/process/campus-line-art.png'))
    await sleepUntil(startedAt, 18_000)
    await page.getByRole('button', { name: '完成校园身份认证' }).click()
    await page.getByRole('heading', { name: '校园身份认证完成' }).waitFor({ timeout: 20_000 })
    shared.identityStudentNo = studentNo

    await sleepUntil(startedAt, 25_000)
    await page.getByRole('link', { name: '返回个人中心', exact: true }).click()
    await page.waitForURL(/\/profile/, { timeout: 20_000 })
    await page.getByRole('heading', { name: '常用地址' }).scrollIntoViewIfNeeded()
    await page.getByRole('button', { name: '新增地址' }).click()
    const card = page.locator('.address-create-card')
    await card.getByPlaceholder('例如：思明校区').fill('思明校区 · 录制演示')
    await card.getByPlaceholder('宿舍楼、门牌或自提点').fill('芙蓉园门口自提点')
    await card.locator('label').filter({ hasText: '收货人' }).getByRole('textbox').fill('演示同学')
    await card.getByPlaceholder('11 位手机号').fill(phone)
    await card.getByRole('checkbox').check()
    await sleepUntil(startedAt, 34_000)
    await card.getByRole('button', { name: '保存地址' }).click()
    await page.getByText('思明校区 · 录制演示').waitFor({ timeout: 15_000 })
    await sleepUntil(startedAt, 43_000)
    rawPath = await saveRecordedPage(page, context, run, 'mobile')
  } finally {
    await browser.close()
  }

  const refreshed = await login(api, account)
  const addresses = await apiGet(api, refreshed, 'users/me/addresses')
  for (const address of addresses.filter((item) => item.campusArea.includes('录制演示'))) {
    await apiDelete(api, refreshed, `users/me/addresses/${address.id}`)
  }
  await api.dispose()

  const storyboard = [
    { startMs: 600, endMs: 5_800, narration: '新账号登录后仍是未认证状态，系统会先引导完成校园身份核验。' },
    { startMs: 7_800, endMs: 15_500, narration: '手机号只接收网页内演示验证码；输入随机码后，再填写真实校园资料。' },
    { startMs: 17_800, endMs: 25_000, narration: '姓名、学号、院系和年级提交成功后，账号立即获得已核验状态。' },
    { startMs: 27_000, endMs: 41_500, narration: '认证用户可以在个人中心维护多个校内收货或自提地址，并设置默认地址。' },
  ]
  await finalizeSingle({ run, rawPath, durationSeconds: 43, title: '用户链路 · 校园双重认证', label: '移动端 · 未认证 → 已认证 → 地址管理', storyboard, metadata: { account: maskAccount(account) }, previewSecond: 22 })
}

async function recordPublishReview() {
  const run = await createRun('publish-review-online')
  const api = await openApi()
  const seller = await login(api, config.sellerAccount)
  const admin = await login(api, config.adminAccount)
  requireRole(seller, 'USER', true)
  requireRole(admin, 'ADMIN', true)
  const title = `【线上录制】校园手绘笔记 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`

  const browser = await chromium.launch({ headless: config.headless })
  const sellerContext = await launchRecordedContext(browser, run, 'seller', 'desktop', seller)
  const adminContext = await launchRecordedContext(browser, run, 'admin', 'desktop', admin)
  const [sellerPage, adminPage] = await Promise.all([sellerContext.newPage(), adminContext.newPage()])
  const startedAt = Date.now()
  let sellerRaw
  let adminRaw
  try {
    await Promise.all([
      showSlate(sellerPage, '线上真实发布', '卖家 · 图文发布', '图片上传、分类、定价、自提地点与描述'),
      showSlate(adminPage, '线上真实审核', '管理员 · 待审工作台', '发布完成后实时进入后台审核列表'),
    ])
    await sleepUntil(startedAt, 2_000)
    await sellerPage.goto(`${config.siteUrl}/publish`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await sellerPage.getByRole('heading', { name: '发布闲置商品' }).waitFor({ timeout: 20_000 })
    await sellerPage.locator('input[type=file]').setInputFiles(path.join(repoRoot, 'assets/process/brand-smear.png'))
    await sellerPage.getByAltText('商品图片预览').waitFor({ state: 'visible', timeout: 20_000 })
    await sellerPage.getByPlaceholder('例如：护眼台灯 可调光').fill(title)
    await sellerPage.locator('.category-select > button').click()
    await sellerPage.getByRole('option', { name: /教材教辅/ }).click()
    await sellerPage.getByPlaceholder('0.00').fill('18')
    await sellerPage.locator('.segmented-control button').filter({ hasText: '自提' }).click()
    await sellerPage.getByRole('button', { name: '芙蓉园门口', exact: true }).click()
    await sellerPage.getByPlaceholder(/描述成色/).fill('课堂录制专用商品：手绘校园学习笔记，九成新，只用于验证线上发布、审核与交易链路。')
    await sleepUntil(startedAt, 13_000)
    await sellerPage.getByRole('button', { name: '提交发布' }).click()
    const submitResult = await Promise.race([
      sellerPage.waitForURL(/\/items\/mine/, { timeout: 25_000 }).then(() => ({ ok: true })),
      sellerPage.locator('.upload-error').waitFor({ state: 'visible', timeout: 25_000 }).then(async () => ({
        ok: false,
        message: await sellerPage.locator('.upload-error').textContent(),
      })),
    ])
    if (!submitResult.ok) throw new Error(`线上商品提交失败：${submitResult.message}`)
    await sellerPage.getByText(title).waitFor({ timeout: 15_000 })

    const item = await waitForItem(api, seller, title, 'PENDING_REVIEW')
    shared.publishedItemId = item.id
    shared.publishedItemTitle = title

    await sleepUntil(startedAt, 20_000)
    await adminPage.goto(`${config.siteUrl}/admin/items/review?keyword=${encodeURIComponent(title)}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    const reviewCard = adminPage.locator('.admin-review-card').filter({ hasText: title })
    await reviewCard.waitFor({ state: 'visible', timeout: 20_000 })
    await sleepUntil(startedAt, 27_000)
    await reviewCard.getByRole('button', { name: '通过上架' }).click()
    await reviewCard.waitFor({ state: 'detached', timeout: 15_000 })
    await waitForItem(api, seller, title, 'ON_SALE')

    await sleepUntil(startedAt, 33_000)
    await sellerPage.goto(`${config.siteUrl}/items/mine?tab=on_sale`, { waitUntil: 'domcontentloaded' })
    await sellerPage.getByText(title).waitFor({ timeout: 15_000 })
    await sleepUntil(startedAt, 40_000)
    ;[sellerRaw, adminRaw] = await Promise.all([
      saveRecordedPage(sellerPage, sellerContext, run, 'seller'),
      saveRecordedPage(adminPage, adminContext, run, 'admin'),
    ])
  } finally {
    await browser.close()
    await api.dispose()
  }

  const storyboard = [
    { startMs: 600, endMs: 6_500, narration: '左侧卖家填写图片、标题、分类、价格和自提地点，所有字段会提交到线上服务。' },
    { startMs: 8_000, endMs: 17_500, narration: '提交后商品进入待审核状态，卖家暂时不能把它当作在售商品交易。' },
    { startMs: 20_000, endMs: 31_500, narration: '右侧管理员从真实待审列表找到刚发布的商品，核对后点击通过上架。' },
    { startMs: 32_500, endMs: 39_500, narration: '卖家刷新我的发布，状态已经同步为在售，发布审核链路完成。' },
  ]
  await finalizeSplit({ run, leftPath: sellerRaw, rightPath: adminRaw, rightKind: 'desktop', durationSeconds: 40, title: '商品链路 · 发布与审核', leftLabel: '卖家端 · 发布/状态', rightLabel: '管理员端 · 审核', storyboard, metadata: { itemId: shared.publishedItemId, itemTitle: title }, previewSecond: 25 })
}

async function recordMarketOrder() {
  const run = await createRun('market-order-online')
  const api = await openApi()
  const seller = await login(api, config.sellerAccount)
  const buyer = await login(api, config.buyerAccount)
  requireRole(seller, 'USER', true)
  requireRole(buyer, 'USER', true)
  const item = await resolveRecordItem(api, seller)
  shared.publishedItemId = item.id
  shared.publishedItemTitle = item.title

  const browser = await chromium.launch({ headless: config.headless })
  const sellerContext = await launchRecordedContext(browser, run, 'seller', 'desktop', seller)
  const buyerContext = await launchRecordedContext(browser, run, 'buyer', 'mobile', buyer)
  const [sellerPage, buyerPage] = await Promise.all([sellerContext.newPage(), buyerContext.newPage()])
  const startedAt = Date.now()
  let sellerRaw
  let buyerRaw
  let orderId
  try {
    await Promise.all([
      showSlate(sellerPage, '订单状态流转', '卖家桌面端', '待沟通 → 待自提 → 已完成'),
      showSlate(buyerPage, '商品发现与交易', '买家移动端', '关键词检索、收藏、预约自提'),
    ])
    await sleepUntil(startedAt, 2_000)
    await Promise.all([
      sellerPage.goto(`${config.siteUrl}/orders/sale`, { waitUntil: 'domcontentloaded', timeout: 30_000 }),
      buyerPage.goto(`${config.siteUrl}/items`, { waitUntil: 'domcontentloaded', timeout: 30_000 }),
    ])
    const mobileSearch = buyerPage.locator('input[placeholder*="搜索"]:visible').first()
    await mobileSearch.fill(item.title)
    await mobileSearch.press('Enter')
    await buyerPage.getByText(item.title).first().waitFor({ timeout: 20_000 })
    await sleepUntil(startedAt, 8_000)
    const resultCard = buyerPage.locator('.items-product-card').filter({ hasText: item.title })
    await resultCard.getByRole('link', { name: '查看详情' }).click()
    await buyerPage.waitForURL(new RegExp(`/items/${item.id}`), { timeout: 15_000 })
    await buyerPage.getByRole('heading', { name: '商品详情' }).waitFor({ timeout: 15_000 })
    const favorite = buyerPage.getByRole('button', { name: '收藏', exact: true })
    if (await favorite.isVisible().catch(() => false)) await favorite.click()
    await sleepUntil(startedAt, 15_000)
    await buyerPage.getByRole('button', { name: '预约自提' }).click()
    await buyerPage.getByText(/预约成功|待沟通/).waitFor({ timeout: 15_000 })

    orderId = await waitForOrder(api, buyer, item.id, 'PENDING_COMMUNICATION')
    await sleepUntil(startedAt, 21_000)
    await sellerPage.reload({ waitUntil: 'domcontentloaded' })
    const sellerCard = sellerPage.locator('.order-card').filter({ hasText: item.title })
    await sellerCard.waitFor({ state: 'visible', timeout: 15_000 })
    await sleepUntil(startedAt, 26_000)
    await sellerCard.getByRole('button', { name: '确认可交易' }).click()
    await waitForOrder(api, seller, item.id, 'WAITING_PICKUP', 'SELLER')

    await sleepUntil(startedAt, 32_000)
    await buyerPage.goto(`${config.siteUrl}/orders/purchase`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    const buyerCard = buyerPage.locator('.order-card').filter({ hasText: item.title })
    await buyerCard.waitFor({ state: 'visible', timeout: 15_000 })
    await sleepUntil(startedAt, 37_000)
    await buyerCard.getByRole('button', { name: '确认自提' }).click()
    await waitForOrder(api, buyer, item.id, 'COMPLETED')

    await sleepUntil(startedAt, 43_000)
    await sellerPage.reload({ waitUntil: 'domcontentloaded' })
    await sellerPage.locator('.order-card').filter({ hasText: item.title }).getByText('已完成').waitFor({ timeout: 15_000 })
    await sleepUntil(startedAt, 49_000)
    ;[sellerRaw, buyerRaw] = await Promise.all([
      saveRecordedPage(sellerPage, sellerContext, run, 'seller'),
      saveRecordedPage(buyerPage, buyerContext, run, 'buyer'),
    ])
  } finally {
    await browser.close()
    await api.dispose()
  }

  const storyboard = [
    { startMs: 500, endMs: 8_500, narration: '右侧买家在移动端按关键词找到刚审核上架的商品，并进入详情。' },
    { startMs: 9_000, endMs: 19_000, narration: '收藏后点击预约自提，线上立即创建一条待沟通订单。' },
    { startMs: 21_000, endMs: 31_000, narration: '左侧卖家刷新出售订单，确认可以交易，状态流转到待自提。' },
    { startMs: 32_000, endMs: 42_500, narration: '买家进入订单记录确认已经自提，订单随后变为已完成。' },
    { startMs: 43_000, endMs: 48_500, narration: '卖家端刷新后也显示已完成，双角色订单记录保持一致。' },
  ]
  await finalizeSplit({ run, leftPath: sellerRaw, rightPath: buyerRaw, rightKind: 'mobile', durationSeconds: 49, title: '交易链路 · 发现、收藏与订单闭环', leftLabel: '卖家端 · 出售订单', rightLabel: '买家移动端 · 搜索/收藏/自提', storyboard, metadata: { itemId: item.id, orderId }, previewSecond: 35 })
}

async function recordGovernance() {
  const run = await createRun('admin-governance-online')
  const api = await openApi()
  const admin = await login(api, config.adminAccount)
  const seller = await login(api, config.sellerAccount)
  const governanceStudentNo = process.env.RECORD_GOVERNANCE_STUDENT_NO || shared.identityStudentNo || '2026999001'
  requireRole(admin, 'ADMIN', true)
  const staleGovernanceItems = await apiGet(api, admin, `admin/items?keyword=${encodeURIComponent('【治理录制】')}&page=1&size=50`)
  for (const item of staleGovernanceItems.items.filter((entry) => entry.status === 'ON_SALE')) {
    await apiPost(api, admin, `admin/items/${item.id}/violation-remove`, { reason: '清理未完成的线上录制专用商品' })
  }
  const categories = await apiGet(api, seller, 'categories')
  const category = categories.find((item) => item.name.includes('其他')) ?? categories[0]
  const marker = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  const created = await apiPost(api, seller, 'items', {
    title: `【治理录制】待复核演示物品 ${marker}`,
    description: '仅用于线上违规下架录制，管理员操作后永久保持违规下架状态。',
    categoryId: category.id,
    priceCent: 9900,
    deliveryModes: ['SELF_PICKUP'],
    imageUrls: [`${config.siteUrl}/catalog/50072.webp`],
  })
  await apiPost(api, admin, `admin/items/${created.id}/review`, { approved: true, reason: '录制前置审核通过' })
  const userPage = await apiGet(api, admin, `admin/users?keyword=${encodeURIComponent(governanceStudentNo)}&page=1&size=50`)
  const governedUser = userPage.items[0]
  if (!governedUser) throw new Error('未找到固定专用演示账号 229****9001')

  const browser = await chromium.launch({ headless: config.headless })
  const context = await launchRecordedContext(browser, run, 'admin', 'desktop', admin)
  const page = await context.newPage()
  const startedAt = Date.now()
  let rawPath
  try {
    await showSlate(page, '后台真实治理', '审核、违规下架与数据看板', '治理对象为专用线上录制商品，不影响普通用户数据')
    await sleepUntil(startedAt, 2_000)
    await page.goto(`${config.siteUrl}/admin/items?keyword=${encodeURIComponent(created.title)}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    const row = page.locator('.admin-item-row').filter({ hasText: created.title })
    await row.waitFor({ state: 'visible', timeout: 20_000 })
    await sleepUntil(startedAt, 9_000)
    await row.getByRole('button', { name: '下架', exact: true }).click()
    const panel = page.getByLabel('确认违规下架')
    await panel.getByText('虚假信息').click()
    await panel.getByPlaceholder(/填写下架说明/).fill('课堂录制专用治理动作：验证违规内容下架与记录同步。')
    await sleepUntil(startedAt, 15_000)
    await panel.getByRole('button', { name: '确认下架' }).click()
    await row.getByText('已下架').waitFor({ timeout: 15_000 })

    await sleepUntil(startedAt, 22_000)
    await page.goto(`${config.siteUrl}/admin/users?keyword=${encodeURIComponent(governanceStudentNo)}`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    const userRow = page.locator('tbody tr').filter({ hasText: governedUser.nickname })
    await userRow.waitFor({ state: 'visible', timeout: 15_000 })
    await sleepUntil(startedAt, 27_000)
    await userRow.getByRole('button', { name: '加入黑名单' }).click()
    await page.locator('.admin-modal').getByRole('button', { name: '确认加入' }).click()
    await userRow.getByRole('button', { name: '移出黑名单' }).waitFor({ timeout: 15_000 })
    await sleepUntil(startedAt, 33_000)
    await userRow.getByRole('button', { name: '移出黑名单' }).click()
    await page.locator('.admin-modal').getByRole('button', { name: '确认移出' }).click()
    await userRow.getByText('正常', { exact: true }).waitFor({ timeout: 15_000 })

    await sleepUntil(startedAt, 39_000)
    await page.goto(`${config.siteUrl}/admin`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.getByRole('heading', { name: /数据看板|控制台|后台/ }).first().waitFor({ timeout: 15_000 }).catch(() => undefined)
    await sleepUntil(startedAt, 48_000)
    await page.goto(`${config.siteUrl}/admin/categories`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.getByRole('heading', { name: /类目/ }).first().waitFor({ timeout: 15_000 }).catch(() => undefined)
    await sleepUntil(startedAt, 56_000)
    rawPath = await saveRecordedPage(page, context, run, 'admin')
  } finally {
    await browser.close()
    const latestUsers = await apiGet(api, admin, `admin/users?keyword=${encodeURIComponent(governanceStudentNo)}&page=1&size=50`).catch(() => ({ items: [] }))
    if (latestUsers.items?.find((user) => user.id === governedUser.id)?.blacklisted) {
      await apiDelete(api, admin, `admin/users/${governedUser.id}/blacklist`)
    }
    await api.dispose()
  }

  const storyboard = [
    { startMs: 500, endMs: 8_500, narration: '管理员先在商品治理工作台按关键词定位专用演示商品。' },
    { startMs: 9_000, endMs: 20_500, narration: '选择违规原因并确认后，商品立即从前台下架，处理原因写入线上记录。' },
    { startMs: 22_000, endMs: 38_000, narration: '用户治理使用专用演示账号真实加入黑名单，再立即移出，验证限制和恢复操作。' },
    { startMs: 39_000, endMs: 47_500, narration: '数据看板读取真实发布量、成交量、待审核量和活跃用户等汇总。' },
    { startMs: 48_000, endMs: 55_500, narration: '类目管理已经使用真实两级结构、启停状态和商品计数；本段展示配置入口与当前状态。' },
  ]
  await finalizeSingle({ run, rawPath, durationSeconds: 56, title: '后台链路 · 平台治理与看板', label: '管理员桌面端 · 下架/黑名单/统计/类目', storyboard, metadata: { governedItemId: created.id, governedUserId: governedUser.id }, previewSecond: 30 })
}

async function recordDemandMatch() {
  const run = await createRun('demand-match-online')
  const api = await openApi()
  const buyer = await login(api, config.buyerAccount)
  requireRole(buyer, 'USER', true)
  const browser = await chromium.launch({ headless: config.headless })
  const context = await launchRecordedContext(browser, run, 'mobile', 'mobile', buyer)
  const page = await context.newPage()
  const startedAt = Date.now()
  const title = `想收校园教材 · 录制 ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`
  let rawPath
  let demandId
  try {
    await showSlate(page, '创意链路', '发布求购 → 智能匹配', '用分类、预算与关键词，把需求连接到在售商品')
    await sleepUntil(startedAt, 2_000)
    await page.goto(`${config.siteUrl}/orders/purchase/demand/new`, { waitUntil: 'domcontentloaded', timeout: 30_000 })
    await page.getByPlaceholder(/想收高等数学/).fill(title)
    await page.getByRole('button', { name: '教材', exact: true }).click()
    await page.getByPlaceholder('最低预算').fill('1')
    await page.getByPlaceholder('最高预算').fill('200')
    await page.locator('.icon-segments button').filter({ hasText: '自提' }).click()
    await page.getByRole('button', { name: '芙蓉园门口', exact: true }).click()
    await page.getByPlaceholder(/描述型号/).fill('希望收一本厦大课程常用教材，预算两百元以内，可在芙蓉园门口自提。')
    await sleepUntil(startedAt, 13_000)
    await page.getByRole('button', { name: '发布求购' }).click()
    await page.waitForURL(/\/demand\/mine/, { timeout: 25_000 })
    const demandCard = page.locator('.demand-mine-card').filter({ hasText: title })
    await demandCard.waitFor({ state: 'visible', timeout: 20_000 })
    const demands = await apiGet(api, buyer, 'users/me/demands?page=1&size=50')
    demandId = demands.items.find((item) => item.title === title)?.id
    if (!demandId) throw new Error('未找到刚发布的求购记录')
    const matches = await apiGet(api, buyer, `demands/${demandId}/matches?limit=3`)
    if (!matches.length) throw new Error('线上求购没有匹配到任何在售商品')

    await sleepUntil(startedAt, 22_000)
    const matchRow = demandCard.locator('.demand-match-row')
    await matchRow.getByRole('link', { name: '查看详情' }).click()
    await page.waitForURL(new RegExp(`/items/${matches[0].itemId}`), { timeout: 20_000 })
    await page.getByRole('heading', { name: '商品详情' }).waitFor({ timeout: 15_000 })
    await sleepUntil(startedAt, 31_000)
    const contact = page.getByRole('button', { name: '立即联系' })
    await contact.scrollIntoViewIfNeeded()
    await sleepUntil(startedAt, 37_000)
    rawPath = await saveRecordedPage(page, context, run, 'mobile')
  } finally {
    await browser.close()
  }
  if (demandId) await apiPost(api, buyer, `demands/${demandId}/close`)
  await api.dispose()

  const storyboard = [
    { startMs: 500, endMs: 8_500, narration: '买家不是被动等待，而是主动发布想收的教材、预算和自提地点。' },
    { startMs: 9_000, endMs: 20_500, narration: '求购提交到线上后，系统按分类和预算扫描当前在售商品并生成推荐。' },
    { startMs: 21_000, endMs: 30_500, narration: '从我的求购直接进入匹配商品详情，需求和供给在一个链路中汇合。' },
    { startMs: 31_000, endMs: 36_500, narration: '下一步可以进入私信与卖家沟通，形成一条更主动的校园交易路径。' },
  ]
  await finalizeSingle({ run, rawPath, durationSeconds: 37, title: '创意链路 · 求购智能匹配', label: '移动端 · 发布需求 → 推荐商品 → 联系卖家', storyboard, metadata: { demandId }, previewSecond: 24 })
}

async function resolveRecordItem(api, seller) {
  if (shared.publishedItemId) {
    const items = await apiGet(api, seller, 'users/me/items?page=1&size=50')
    const item = items.items.find((entry) => entry.id === shared.publishedItemId)
    if (item?.status === 'ON_SALE') return item
  }
  const items = await apiGet(api, seller, 'users/me/items?page=1&size=50')
  const item = items.items.find((entry) => entry.status === 'ON_SALE' && entry.title.startsWith('【线上录制】'))
  if (!item) throw new Error('没有找到可用于订单录制的在售商品；请先运行 --scenario=publish-review，或设置 RECORD_ITEM_ID')
  return item
}

async function waitForItem(api, seller, title, status) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const page = await apiGet(api, seller, 'users/me/items?page=1&size=50')
    const item = page.items.find((entry) => entry.title === title)
    if (item?.status === status) return item
    await sleep(1_000)
  }
  throw new Error(`商品 ${title} 未进入 ${status}`)
}

async function waitForOrder(api, session, itemId, status, role = 'BUYER') {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const page = await apiGet(api, session, `orders?role=${role}&page=1&size=50`)
    const order = page.items.find((entry) => entry.itemId === itemId && entry.status === status)
    if (order) return order.id
    await sleep(1_000)
  }
  throw new Error(`商品 ${itemId} 的订单未进入 ${status}`)
}

function requireRole(session, role, verified) {
  if (session.user.role !== role) throw new Error(`${maskAccount(session.account)} 角色不是 ${role}`)
  if (verified && session.user.verificationStatus !== 'VERIFIED') throw new Error(`${maskAccount(session.account)} 尚未校园认证`)
}

function readArgument(name) {
  const direct = process.argv.find((argument) => argument.startsWith(`${name}=`))
  return direct?.slice(name.length + 1)
}
