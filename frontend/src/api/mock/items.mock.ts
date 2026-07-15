import type { ApiResponse, PageResult } from '../../types/api'
import airpodsImage from '../../assets/favorites/items/airpods.webp'
import basketballImage from '../../assets/favorites/items/basketball.webp'
import calculatorImage from '../../assets/favorites/items/calculator.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import macbookAirImage from '../../assets/favorites/items/macbook-air.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.webp'
import suitcaseImage from '../../assets/favorites/items/suitcase.webp'
import dailyCeramicSetImage from '../../assets/favorites/items/daily-ceramic-set.webp'
import dailyThermosImage from '../../assets/favorites/items/daily-thermos.webp'
import dailyUmbrellaImage from '../../assets/favorites/items/daily-umbrella.webp'
import dailyWaterBottleImage from '../../assets/favorites/items/daily-water-bottle.webp'
import instrumentsColoredPencilsImage from '../../assets/favorites/items/instruments-colored-pencils.webp'
import instrumentsDrawingTabletImage from '../../assets/favorites/items/instruments-drawing-tablet.webp'
import instrumentsFolderImage from '../../assets/favorites/items/instruments-folder.webp'
import instrumentsGuitarImage from '../../assets/favorites/items/instruments-guitar.webp'
import instrumentsHarmonicaImage from '../../assets/favorites/items/instruments-harmonica.webp'
import instrumentsJournalImage from '../../assets/favorites/items/instruments-journal.webp'
import instrumentsMarkersImage from '../../assets/favorites/items/instruments-markers.webp'
import makeupCurlingIronImage from '../../assets/favorites/items/makeup-curling-iron.webp'
import makeupLotionSetImage from '../../assets/favorites/items/makeup-lotion-set.webp'
import makeupMirrorImage from '../../assets/favorites/items/makeup-mirror.webp'
import makeupShampooImage from '../../assets/favorites/items/makeup-shampoo.webp'
import makeupSunscreenImage from '../../assets/favorites/items/makeup-sunscreen.webp'
import othersBadgeImage from '../../assets/favorites/items/others-badge.webp'
import othersCeramicCatImage from '../../assets/favorites/items/others-ceramic-cat.webp'
import othersFigureImage from '../../assets/favorites/items/others-figure.webp'
import othersKeychainImage from '../../assets/favorites/items/others-keychain.webp'
import othersPostcardsImage from '../../assets/favorites/items/others-postcards.webp'
import othersSunflowerImage from '../../assets/favorites/items/others-sunflower.webp'
import ticketsBandImage from '../../assets/favorites/items/tickets-band.webp'
import ticketsConcertImage from '../../assets/favorites/items/tickets-concert.webp'
import ticketsFootballImage from '../../assets/favorites/items/tickets-football.webp'
import ticketsGraduationImage from '../../assets/favorites/items/tickets-graduation.webp'
import ticketsLectureImage from '../../assets/favorites/items/tickets-lecture.webp'
import ticketsMovieImage from '../../assets/favorites/items/tickets-movie.webp'
import ticketsTheaterImage from '../../assets/favorites/items/tickets-theater.webp'
import lampMainImage from '../../assets/item-detail/lamp-main.webp'
import lampThumb2Image from '../../assets/item-detail/lamp-thumb-2.webp'
import lampThumb3Image from '../../assets/item-detail/lamp-thumb-3.webp'
import lampThumb4Image from '../../assets/item-detail/lamp-thumb-4.webp'
import type { ItemDetail, ItemListParams, ItemSummary } from '../item.api'

const mockLatencyMs = 180

const mockItems: ItemSummary[] = [
  createItem(1001, '高等数学（第七版）上下册', '教材', 2800, mathBooksImage, '李同学', ['SELF_PICKUP'], 18, 1),
  createItem(1002, 'MacBook Air 2019 13 寸', '数码', 235000, macbookAirImage, '林同学', ['SELF_PICKUP'], 42, 2),
  createItem(1003, '护眼台灯 可调光', '宿舍用品', 4500, deskLampImage, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 23, 3, {
    createdAt: '2026-07-06T14:20:00+08:00',
  }),
  createItem(1004, '斯伯丁篮球 室内外 7 号球', '运动户外', 6000, basketballImage, '陈同学', ['SELF_PICKUP'], 15, 4),
  createItem(1005, '机械键盘 青轴', '数码', 12000, mechanicalKeyboardImage, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 27, 5),
  createItem(1006, '20 寸行李箱 九成新', '生活日用', 8000, suitcaseImage, '刘同学', ['SELF_PICKUP'], 16, 6),
  createItem(1007, 'AirPods 二代', '数码', 39900, airpodsImage, '周同学', ['DELIVER_TO_SCHOOL'], 31, 7),
  createItem(1008, '卡西欧计算器 fx-991CN X', '乐器文具', 8500, calculatorImage, '黄同学', ['SELF_PICKUP'], 12, 8),
  createItem(1009, '宿舍收纳箱 三件套', '宿舍用品', 3500, suitcaseImage, '许同学', ['DELIVER_TO_SCHOOL'], 7, 9),
  createItem(1010, '羽毛球拍双拍 轻量款', '运动户外', 6800, basketballImage, '郑同学', ['SELF_PICKUP'], 11, 10),
  createItem(1011, '考研英语真题 近五年', '教材', 1800, mathBooksImage, '何同学', ['SELF_PICKUP'], 5, 11),
  createItem(1012, '小米显示器 24 寸', '数码', 42000, macbookAirImage, '宋同学', ['SELF_PICKUP'], 22, 12),
  createItem(1013, '宿舍床边置物架', '宿舍用品', 2600, deskLampImage, '赵同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 6, 13),
  createItem(1014, '课程用科学计算器', '乐器文具', 7600, calculatorImage, '吴同学', ['DELIVER_TO_SCHOOL'], 8, 14),
  createItem(1015, '蓝牙键盘便携款', '数码', 9900, mechanicalKeyboardImage, '谢同学', ['SELF_PICKUP'], 19, 15),
  createItem(1016, '篮球训练包 九成新', '运动户外', 5200, basketballImage, '郭同学', ['SELF_PICKUP'], 10, 16),
  createItem(3001, '高等数学（第七版）上下册', '公共课教材', 1800, mathBooksImage, '林同学', ['SELF_PICKUP'], 7, 1),
  createItem(3002, '考研英语真题解析', '考研资料', 2500, mathBooksImage, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 12, 2),
  createItem(3003, '大学物理实验报告模板', '实验资料', 800, calculatorImage, '陈同学', ['SELF_PICKUP'], 5, 3),
  createItem(3004, '线性代数辅导讲义', '公共课教材', 1200, mathBooksImage, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, 4),
  createItem(3005, '英语四级词汇书', '英语四六级', 1500, mathBooksImage, '张同学', ['SELF_PICKUP'], 11, 5),
  createItem(3006, '计算机组成原理笔记', '课堂笔记', 2000, calculatorImage, '黄同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 14, 6),
  createItem(3007, '马克思主义基本原理教材', '公共课教材', 1000, mathBooksImage, '周同学', ['SELF_PICKUP'], 6, 7),
  createItem(3008, '概率论期末复习资料', '课堂笔记', 600, mathBooksImage, '吴同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, 8),
  createItem(4001, 'MacBook Air 2019 13寸', '电脑平板', 235000, macbookAirImage, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, 1),
  createItem(4002, 'AirPods 二代', '耳机音响', 39900, airpodsImage, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 11, 2),
  createItem(4003, '机械键盘 青轴', '键盘鼠标', 12000, mechanicalKeyboardImage, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 12, 3),
  createItem(4004, '罗技 G304 无线鼠标', '键盘鼠标', 8500, deskLampImage, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, 4),
  createItem(4005, '24寸显示器', '电脑平板', 38000, macbookAirImage, '黄同学', ['SELF_PICKUP'], 7, 5),
  createItem(4006, 'iPad 9代 64G', '电脑平板', 168000, airpodsImage, '刘同学', ['SELF_PICKUP'], 14, 6),
  createItem(4007, '卡西欧计算器 fx-991CN X', '计算器', 8500, calculatorImage, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 13, 7),
  createItem(4008, '65W充电器套装', '充电配件', 4500, deskLampImage, '李同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 6, 8),
  createItem(4009, '移动硬盘 1TB', '存储设备', 22000, mechanicalKeyboardImage, '吴同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, 9),
  createItem(4010, '佳能 EOS M50 微单相机', '摄影设备', 185000, macbookAirImage, '郑同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 15, 10),
  createItem(4011, 'JBL Flip5 蓝牙音箱', '耳机音响', 18000, airpodsImage, '赵同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, 11),
  createItem(4012, '小米立式无线充电器', '充电配件', 6500, deskLampImage, '孙同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 5, 12),
  createItem(5001, '护眼台灯 可调光', '照明台灯', 4500, deskLampImage, '林同学', ['SELF_PICKUP'], 23, 1),
  createItem(5002, '透明收纳箱 三件套', '收纳整理', 3000, suitcaseImage, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, 2),
  createItem(5003, '宿舍床帘 蓝色', '床上用品', 2800, mathBooksImage, '陈同学', ['SELF_PICKUP'], 7, 3),
  createItem(5004, '床上小桌 可折叠', '桌面用品', 3500, deskLampImage, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, 4),
  createItem(5005, '小风扇 USB充电', '小家电', 2500, deskLampImage, '张同学', ['SELF_PICKUP'], 11, 5),
  createItem(5006, '衣架 20只装', '收纳整理', 800, suitcaseImage, '黄同学', ['SELF_PICKUP'], 5, 6),
  createItem(5007, '三层置物架', '收纳整理', 5000, mathBooksImage, '周同学', ['SELF_PICKUP'], 9, 7),
  createItem(5008, '20寸行李箱 九成新', '行李箱', 8000, suitcaseImage, '吴同学', ['SELF_PICKUP'], 13, 8),
  createItem(6001, '斯伯丁篮球 室内外7号球', '球类运动', 6000, basketballImage, '张同学', ['SELF_PICKUP'], 12, 1),
  createItem(6002, '羽毛球拍 双拍套装', '球拍器材', 8800, basketballImage, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 14, 2),
  createItem(6003, '网球拍 九成新', '球拍器材', 12000, basketballImage, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, 3),
  createItem(6004, '瑜伽垫 加厚防滑', '健身器材', 3500, suitcaseImage, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, 4),
  createItem(6005, '运动鞋 42码', '运动鞋服', 15000, macbookAirImage, '陈同学', ['SELF_PICKUP'], 8, 5),
  createItem(6006, '校园自行车', '自行车', 26000, basketballImage, '黄同学', ['SELF_PICKUP'], 15, 6),
  createItem(6007, '护膝护腕套装', '运动鞋服', 2500, mechanicalKeyboardImage, '周同学', ['SELF_PICKUP'], 6, 7),
  createItem(6008, '跳绳 计数款', '健身器材', 1800, calculatorImage, '吴同学', ['SELF_PICKUP'], 5, 8),
  createItem(7001, '保温水杯 500ml', '杯壶餐具', 1800, dailyWaterBottleImage, '林同学', ['SELF_PICKUP'], 8, 1),
  createItem(7002, '折叠雨伞 深蓝色', '雨伞雨具', 1200, dailyUmbrellaImage, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 7, 2),
  createItem(7003, '陶瓷餐具 三件套', '杯壶餐具', 2000, dailyCeramicSetImage, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, 3),
  createItem(7004, '保温壶 九成新', '杯壶餐具', 3500, dailyThermosImage, '黄同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, 4),
  createItem(7005, '吹风机 小功率', '小电器', 4000, deskLampImage, '吴同学', ['SELF_PICKUP'], 11, 5),
  createItem(7006, '桌面镜 可折叠', '日常杂物', 1000, dailyWaterBottleImage, '刘同学', ['SELF_PICKUP'], 6, 6),
  createItem(7007, '整理盒 三格', '整理收纳', 1500, suitcaseImage, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 5, 7),
  createItem(7008, '洗衣篮 可折叠', '整理收纳', 1600, suitcaseImage, '李同学', ['SELF_PICKUP'], 7, 8),
  createItem(8001, '护肤水乳套装', '护肤用品', 6800, makeupLotionSetImage, '林同学', ['SELF_PICKUP'], 12, 1),
  createItem(8002, '化妆刷 8支装', '彩妆工具', 3500, makeupMirrorImage, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, 2),
  createItem(8003, '小样香水 30ml', '香水香氛', 8000, dailyThermosImage, '王同学', ['SELF_PICKUP'], 10, 3),
  createItem(8004, '防晒霜 SPF50', '护肤用品', 2800, makeupSunscreenImage, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 11, 4),
  createItem(8005, '卷发棒 32mm', '美发工具', 5500, makeupCurlingIronImage, '张同学', ['SELF_PICKUP'], 9, 5),
  createItem(8006, '桌面化妆镜', '彩妆工具', 1800, makeupMirrorImage, '黄同学', ['SELF_PICKUP'], 7, 6),
  createItem(8007, '美甲工具套装', '美甲用品', 2200, makeupCurlingIronImage, '吴同学', ['SELF_PICKUP'], 6, 7),
  createItem(8008, '洗发水 未拆封', '洗护用品', 4500, makeupShampooImage, '陈同学', ['SELF_PICKUP'], 13, 8),
  createItem(9001, '民谣吉他 41寸', '乐器', 18000, instrumentsGuitarImage, '林同学', ['SELF_PICKUP'], 15, 1),
  createItem(9002, '尤克里里 23寸', '乐器', 9500, instrumentsGuitarImage, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 11, 2),
  createItem(9003, '口琴 C调', '乐器', 2500, instrumentsHarmonicaImage, '王同学', ['SELF_PICKUP'], 8, 3),
  createItem(9004, '水彩画笔套装', '绘画工具', 3000, instrumentsColoredPencilsImage, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, 4),
  createItem(9005, '马克笔 48色', '绘画工具', 5500, instrumentsMarkersImage, '吴同学', ['SELF_PICKUP'], 12, 5),
  createItem(9006, '文件夹 五只装', '文件收纳', 800, instrumentsFolderImage, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 5, 6),
  createItem(9007, '手账本 未使用', '手账用品', 1800, instrumentsJournalImage, '黄同学', ['SELF_PICKUP'], 7, 7),
  createItem(9008, '绘图板 小号', '创作工具', 12000, instrumentsDrawingTabletImage, '赵同学', ['SELF_PICKUP'], 10, 8),
  createItem(10001, '厦大芙蓉湖音乐会门票', '演出门票', 6000, ticketsConcertImage, '林同学', ['DELIVER_TO_SCHOOL'], 14, 1),
  createItem(10002, '人工智能与未来 讲座票', '讲座活动', 0, ticketsLectureImage, '周同学', ['DELIVER_TO_SCHOOL'], 10, 2),
  createItem(10003, '电影票《银河漫游指南》', '电影票', 2800, ticketsMovieImage, '陈同学', ['DELIVER_TO_SCHOOL'], 9, 3),
  createItem(10004, '话剧《暗恋桃花源》门票', '演出门票', 8000, ticketsTheaterImage, '王同学', ['SELF_PICKUP'], 12, 4),
  createItem(10005, '《山海有声》艺术展门票', '展览票', 1500, ticketsTheaterImage, '张同学', ['DELIVER_TO_SCHOOL'], 8, 5),
  createItem(10006, '厦大毕业晚会 入场券', '校园活动', 1000, ticketsGraduationImage, '黄同学', ['DELIVER_TO_SCHOOL'], 11, 6),
  createItem(10007, '厦大 vs 集大 足球赛门票', '赛事票', 2000, ticketsFootballImage, '李同学', ['SELF_PICKUP'], 6, 7),
  createItem(10008, '海韵音乐节 2日通票', '演出门票', 12000, ticketsBandImage, '吴同学', ['DELIVER_TO_SCHOOL'], 15, 8),
  createItem(11001, '鼓浪屿船票钥匙扣', '校园纪念', 600, othersKeychainImage, '林同学', ['SELF_PICKUP'], 7, 1),
  createItem(11002, '小猫陶瓷摆件', '装饰摆件', 1200, othersCeramicCatImage, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, 2),
  createItem(11003, '厦大风景明信片套装', '校园纪念', 800, othersPostcardsImage, '王同学', ['SELF_PICKUP'], 8, 3),
  createItem(11004, '手工钩织向日葵', '手工制品', 1500, othersSunflowerImage, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 11, 4),
  createItem(11005, '厦大校徽徽章', '校园纪念', 500, othersBadgeImage, '张同学', ['SELF_PICKUP'], 6, 5),
  createItem(11006, '厦大主题盲盒', '兴趣收藏', 1800, othersFigureImage, '吴同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 12, 6),
  createItem(11007, '迷你场景小夜灯', '装饰摆件', 2000, deskLampImage, '李同学', ['SELF_PICKUP'], 8, 7),
  createItem(11008, '杂物组合一打包出', '杂物组合', 1000, suitcaseImage, '赵同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 7, 8),
  createItem(11009, '厦大香囊挂件', '手工制品', 900, othersBadgeImage, '黄同学', ['SELF_PICKUP'], 5, 9),
  createItem(11010, '动漫手办小摆件', '兴趣收藏', 1600, othersFigureImage, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, 10),
]

const mockItemDescriptions: Record<number, string> = {
  3001: '高等数学第七版上下册齐全，书页干净，只有少量课堂批注，适合公共数学课程复习使用。',
  3002: '考研英语历年真题与逐题解析，题册和答案齐全，重点长难句已做标记。',
  3003: '大学物理实验报告模板及数据处理示例，覆盖常见实验项目，便于课前预习和格式参考。',
  3004: '线性代数辅导讲义，包含矩阵、行列式、特征值等重点知识梳理与典型例题。',
  3005: '英语四级高频词汇书，按考频分类，附例句和常用搭配，书本保存良好。',
  3006: '计算机组成原理课堂笔记，包含处理器、存储系统、指令系统和期末复习要点。',
  3007: '马克思主义基本原理教材，版本与校内课程配套，内页完整，无缺页破损。',
  3008: '概率论期末复习资料，整理了常用公式、题型模板和往年练习题，适合考前集中复习。',
}

export async function listMockItems(params?: ItemListParams): Promise<ApiResponse<PageResult<ItemSummary>>> {
  await delay(mockLatencyMs)

  const page = params?.page ?? 1
  const size = params?.size ?? 20
  const normalizedKeyword = params?.keyword?.trim().toLowerCase()

  const filteredItems = mockItems
    .filter((item) => item.id < 3000)
    .filter((item) => item.status === 'ON_SALE')
    .filter((item) => (normalizedKeyword ? `${item.title} ${item.categoryName}`.toLowerCase().includes(normalizedKeyword) : true))
    .filter((item) => (params?.minPriceCent == null ? true : item.priceCent >= params.minPriceCent))
    .filter((item) => (params?.maxPriceCent == null ? true : item.priceCent <= params.maxPriceCent))
    .filter((item) => (params?.deliveryMode == null ? true : item.deliveryModes.includes(params.deliveryMode)))

  const start = (page - 1) * size

  return {
    code: 'OK',
    message: 'success',
    data: {
      items: filteredItems.slice(start, start + size),
      page,
      size,
      total: filteredItems.length,
    },
    traceId: 'mock-items',
  }
}

export async function getMockItem(itemId: string | number): Promise<ApiResponse<ItemDetail>> {
  await delay(mockLatencyMs)

  const item = mockItems.find((mockItem) => mockItem.id === Number(itemId))

  if (!item) {
    throw new Error('mock item not found')
  }

  const detail = createDetail(item)

  return {
    code: 'OK',
    message: 'success',
    data: detail,
    traceId: 'mock-item-detail',
  }
}

export function getMockItemSummary(itemId: string | number): ItemSummary | undefined {
  return mockItems.find((mockItem) => mockItem.id === Number(itemId))
}

function createItem(
  id: number,
  title: string,
  categoryName: string,
  priceCent: number,
  coverImageUrl: string,
  sellerNickname: string,
  deliveryModes: ItemSummary['deliveryModes'],
  favoriteCount: number,
  dayOffset: number,
  options?: { createdAt?: string },
): ItemSummary {
  return {
    id,
    title,
    categoryName,
    priceCent,
    status: 'ON_SALE',
    coverImageUrl,
    createdAt:
      options?.createdAt ??
      `2026-07-${String(Math.max(1, 3 - Math.floor(dayOffset / 6))).padStart(2, '0')}T${String(9 + (dayOffset % 10)).padStart(2, '0')}:20:00+08:00`,
    deliveryModes,
    seller: {
      id: 2000 + id,
      nickname: sellerNickname,
      verificationStatus: 'VERIFIED',
    },
    favorited: id % 3 === 0,
    favoriteCount,
  }
}

function createDetail(item: ItemSummary): ItemDetail {
  if (item.id === 1003) {
    return {
      ...item,
      description: '台灯亮度三档可调，适合宿舍书桌使用，灯头角度可旋转，功能正常。',
      categoryId: 3,
      imageUrls: [lampMainImage, lampThumb2Image, lampThumb3Image, lampThumb4Image],
    }
  }

  return {
    ...item,
    description:
      mockItemDescriptions[item.id] ?? `${item.title}，校内同学闲置转让，成色良好，支持当面验货后确认。`,
    categoryId: getCategoryId(item),
    imageUrls: item.coverImageUrl ? [item.coverImageUrl] : [],
  }
}

function getCategoryId(item: ItemSummary) {
  const catalogCategoryId = Math.floor(item.id / 1000) - 2
  if (catalogCategoryId >= 1 && catalogCategoryId <= 9) {
    return catalogCategoryId
  }

  const categoryIds: Record<string, number> = {
    教材: 1,
    数码: 2,
    宿舍用品: 3,
    运动户外: 4,
    生活日用: 5,
    美妆个护: 6,
    乐器文具: 7,
    票务转让: 8,
    其他: 9,
  }

  return categoryIds[item.categoryName] ?? 9
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
