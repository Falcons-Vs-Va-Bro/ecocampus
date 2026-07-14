import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  BookOpen,
  Box,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Grid3X3,
  Heart,
  Home,
  Mail,
  MessageCircle,
  Package,
  PackageSearch,
  Pencil,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  User,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { listItems } from '../../api/item.api'
import type { ItemSummary } from '../../api/item.api'
import { queryKeys } from '../../api/queryKeys'
import { useUnreadMessageCount } from '../../hooks/useUnreadMessageCount'
import campusGateImage from '../../assets/favorites/campus-gate.png'
import campusSidebarImage from '../../assets/favorites/campus-sidebar.png'
import emptyFavoritesImage from '../../assets/favorites/empty-favorites.png'
import airpodsImage from '../../assets/favorites/items/airpods.jpg'
import basketballImage from '../../assets/favorites/items/basketball.jpg'
import calculatorImage from '../../assets/favorites/items/calculator.jpg'
import dailyCeramicSetImage from '../../assets/favorites/items/daily-ceramic-set.png'
import dailyThermosImage from '../../assets/favorites/items/daily-thermos.png'
import dailyUmbrellaImage from '../../assets/favorites/items/daily-umbrella.png'
import dailyWaterBottleImage from '../../assets/favorites/items/daily-water-bottle.png'
import deskLampImage from '../../assets/favorites/items/desk-lamp.jpg'
import instrumentsColoredPencilsImage from '../../assets/favorites/items/instruments-colored-pencils.png'
import instrumentsDrawingTabletImage from '../../assets/favorites/items/instruments-drawing-tablet.png'
import instrumentsFolderImage from '../../assets/favorites/items/instruments-folder.png'
import instrumentsGuitarImage from '../../assets/favorites/items/instruments-guitar.png'
import instrumentsHarmonicaImage from '../../assets/favorites/items/instruments-harmonica.png'
import instrumentsJournalImage from '../../assets/favorites/items/instruments-journal.png'
import instrumentsMarkersImage from '../../assets/favorites/items/instruments-markers.png'
import macbookAirImage from '../../assets/favorites/items/macbook-air.jpg'
import makeupCurlingIronImage from '../../assets/favorites/items/makeup-curling-iron.png'
import makeupLotionSetImage from '../../assets/favorites/items/makeup-lotion-set.png'
import makeupMirrorImage from '../../assets/favorites/items/makeup-mirror.png'
import makeupShampooImage from '../../assets/favorites/items/makeup-shampoo.png'
import makeupSunscreenImage from '../../assets/favorites/items/makeup-sunscreen.png'
import mathBooksImage from '../../assets/favorites/items/math-books.jpg'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.jpg'
import othersBadgeImage from '../../assets/favorites/items/others-badge.png'
import othersCeramicCatImage from '../../assets/favorites/items/others-ceramic-cat.png'
import othersFigureImage from '../../assets/favorites/items/others-figure.png'
import othersKeychainImage from '../../assets/favorites/items/others-keychain.png'
import othersPostcardsImage from '../../assets/favorites/items/others-postcards.png'
import othersSunflowerImage from '../../assets/favorites/items/others-sunflower.png'
import suitcaseImage from '../../assets/favorites/items/suitcase.jpg'
import ticketsBandImage from '../../assets/favorites/items/tickets-band.png'
import ticketsConcertImage from '../../assets/favorites/items/tickets-concert.png'
import ticketsFootballImage from '../../assets/favorites/items/tickets-football.png'
import ticketsGraduationImage from '../../assets/favorites/items/tickets-graduation.png'
import ticketsLectureImage from '../../assets/favorites/items/tickets-lecture.png'
import ticketsMovieImage from '../../assets/favorites/items/tickets-movie.png'
import ticketsTheaterImage from '../../assets/favorites/items/tickets-theater.png'
import { UnifiedMarketplacePage } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './HomePage.css'
import './ItemsPage.css'

const pageSize = 8
const emptyItems: ItemSummary[] = []

const categoryRoutes = [
  { label: '全部', sidebarLabel: '全部分类', icon: Grid3X3, to: '/items' },
  { label: '教材教辅', sidebarLabel: '教材教辅', icon: BookOpen, to: '/items/textbook' },
  { label: '数码电子', sidebarLabel: '数码电子', icon: Camera, to: '/items/digital' },
  { label: '宿舍用品', sidebarLabel: '宿舍用品', icon: Package, to: '/items/dorm' },
  { label: '运动户外', sidebarLabel: '运动户外', icon: Dumbbell, to: '/items/outdoors' },
  { label: '生活日用', sidebarLabel: '生活日用', icon: ShoppingBasket, to: '/items/daily-goods' },
  { label: '美妆个护', sidebarLabel: '美妆个护', icon: Sparkles, to: '/items/make-up' },
  { label: '乐器文具', sidebarLabel: '乐器文具', icon: Pencil, to: '/items/instruments' },
  { label: '票务转让', sidebarLabel: '票务转让', icon: ClipboardList, to: '/items/tickets' },
  { label: '其他', sidebarLabel: '其他', icon: Box, to: '/items/others' },
] as const

const priceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100-300', min: 10000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
] as const

const textbookPriceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-20', min: 0, max: 2000 },
  { label: '20-50', min: 2000, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100以上', min: 10000, max: Number.POSITIVE_INFINITY },
]

const textbookSubcategories = ['全部', '公共课教材', '专业课教材', '考研资料', '英语四六级', '课堂笔记', '实验资料']
const digitalPriceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-200', min: 5000, max: 20000 },
  { label: '200-1000', min: 20000, max: 100000 },
  { label: '1000以上', min: 100000, max: Number.POSITIVE_INFINITY },
]

const digitalSubcategories = ['全部', '电脑平板', '耳机音响', '键盘鼠标', '摄影设备', '充电配件', '计算器', '存储设备']
const digitalConditions = ['全部', '全新', '九成新', '八成新', '轻微使用痕迹']
const dormSubcategories = ['全部', '照明台灯', '收纳整理', '床上用品', '桌面用品', '小家电', '行李箱', '插排']
const outdoorsSubcategories = ['全部', '球类运动', '球拍器材', '运动鞋服', '健身器材', '自行车', '户外用品']
const outdoorsConditions = ['全部', '全新', '九成新', '八成新', '轻微磨损']
const dailyGoodsSubcategories = ['全部', '杯壶餐具', '雨伞雨具', '清洁用品', '整理收纳', '小电器', '日常杂物']
const dailyGoodsPriceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-10', min: 0, max: 1000 },
  { label: '10-30', min: 1000, max: 3000 },
  { label: '30-80', min: 3000, max: 8000 },
  { label: '80以上', min: 8000, max: Number.POSITIVE_INFINITY },
]
const makeupSubcategories = ['全部', '护肤用品', '彩妆工具', '香水香氛', '洗护用品', '美发工具', '美甲用品']
const makeupPriceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-30', min: 0, max: 3000 },
  { label: '30-80', min: 3000, max: 8000 },
  { label: '80-200', min: 8000, max: 20000 },
  { label: '200以上', min: 20000, max: Number.POSITIVE_INFINITY },
]
const makeupConditions = ['全部', '全新未拆', '仅试用', '九成新', '可小刀']
const instrumentsSubcategories = ['全部', '乐器', '绘画工具', '书写文具', '文件收纳', '手账用品', '创作工具']
const instrumentsPriceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-20', min: 0, max: 2000 },
  { label: '20-80', min: 2000, max: 8000 },
  { label: '80-300', min: 8000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
]
const ticketSubcategories = ['全部', '演出门票', '讲座活动', '电影票', '展览票', '赛事票', '校园活动']
const ticketPriceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-20', min: 0, max: 2000 },
  { label: '20-50', min: 2000, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100以上', min: 10000, max: Number.POSITIVE_INFINITY },
]
const ticketTimeFilters = ['今天', '本周', '本月', '长期有效']
const ticketPickupFilters = ['电子票', '线下交接']
const othersSubcategories = ['全部', '校园纪念', '手工制品', '装饰摆件', '杂物组合', '兴趣收藏', '未分类']
const othersConditions = ['全部', '九成新', '八成新', '可小刀']

const pickupModes = ['全部', '可自提', '校内配送'] as const
const conditionFilters = ['全部', '全新', '九成新', '八成新', '可小刀'] as const

const userNav = [
  { label: '我的收藏', icon: Star, to: '/favorites' },
  { label: '我的发布', icon: Store, to: '/items/mine' },
  { label: '购买订单', icon: ClipboardList, to: '/orders/purchase' },
  { label: '出售订单', icon: BriefcaseBusiness, to: '/orders/sale' },
  { label: '消息中心', icon: MessageCircle, to: '/messages' },
  { label: '个人中心', icon: User, to: '/profile' },
]

const textbookItems: ItemSummary[] = [
  createTextbookItem(3001, '高等数学（第七版）上下册', '公共课教材', 1800, '林同学', ['SELF_PICKUP'], 1, mathBooksImage),
  createTextbookItem(3002, '考研英语真题解析', '考研资料', 2500, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, mathBooksImage),
  createTextbookItem(3003, '大学物理实验报告模板', '实验资料', 800, '陈同学', ['SELF_PICKUP'], 3, calculatorImage),
  createTextbookItem(3004, '线性代数辅导讲义', '公共课教材', 1200, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, mathBooksImage),
  createTextbookItem(3005, '英语四级词汇书', '英语四六级', 1500, '张同学', ['SELF_PICKUP'], 5, mathBooksImage),
  createTextbookItem(3006, '计算机组成原理笔记', '课堂笔记', 2000, '黄同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 6, calculatorImage),
  createTextbookItem(3007, '马克思主义基本原理教材', '公共课教材', 1000, '周同学', ['SELF_PICKUP'], 7, mathBooksImage),
  createTextbookItem(3008, '概率论期末复习资料', '课堂笔记', 600, '吴同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, mathBooksImage),
]

const digitalItems: ItemSummary[] = [
  createTextbookItem(4001, 'MacBook Air 2019 13寸', '电脑平板', 235000, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 1, macbookAirImage),
  createTextbookItem(4002, 'AirPods 二代', '耳机音响', 39900, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, airpodsImage),
  createTextbookItem(4003, '机械键盘 青轴', '键盘鼠标', 12000, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 3, mechanicalKeyboardImage),
  createTextbookItem(4004, '罗技 G304 无线鼠标', '键盘鼠标', 8500, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, deskLampImage),
  createTextbookItem(4005, '24寸显示器', '电脑平板', 38000, '黄同学', ['SELF_PICKUP'], 5, macbookAirImage),
  createTextbookItem(4006, 'iPad 9代 64G', '电脑平板', 168000, '刘同学', ['SELF_PICKUP'], 6, airpodsImage),
  createTextbookItem(4007, '卡西欧计算器 fx-991CN X', '计算器', 8500, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 7, calculatorImage),
  createTextbookItem(4008, '65W充电器套装', '充电配件', 4500, '李同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, deskLampImage),
  createTextbookItem(4009, '移动硬盘 1TB', '存储设备', 22000, '吴同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 9, mechanicalKeyboardImage),
  createTextbookItem(4010, '佳能 EOS M50 微单相机', '摄影设备', 185000, '郑同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, macbookAirImage),
  createTextbookItem(4011, 'JBL Flip5 蓝牙音箱', '耳机音响', 18000, '赵同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 11, airpodsImage),
  createTextbookItem(4012, '小米立式无线充电器', '充电配件', 6500, '孙同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 12, deskLampImage),
]

const dormItems: ItemSummary[] = [
  createTextbookItem(5001, '护眼台灯 可调光', '照明台灯', 4500, '林同学', ['SELF_PICKUP'], 1, deskLampImage),
  createTextbookItem(5002, '透明收纳箱 三件套', '收纳整理', 3000, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, suitcaseImage),
  createTextbookItem(5003, '宿舍床帘 蓝色', '床上用品', 2800, '陈同学', ['SELF_PICKUP'], 3, mathBooksImage),
  createTextbookItem(5004, '床上小桌 可折叠', '桌面用品', 3500, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, deskLampImage),
  createTextbookItem(5005, '小风扇 USB充电', '小家电', 2500, '张同学', ['SELF_PICKUP'], 5, deskLampImage),
  createTextbookItem(5006, '衣架 20只装', '收纳整理', 800, '黄同学', ['SELF_PICKUP'], 6, suitcaseImage),
  createTextbookItem(5007, '三层置物架', '收纳整理', 5000, '周同学', ['SELF_PICKUP'], 7, mathBooksImage),
  createTextbookItem(5008, '20寸行李箱 九成新', '行李箱', 8000, '吴同学', ['SELF_PICKUP'], 8, suitcaseImage),
]

const outdoorsItems: ItemSummary[] = [
  createTextbookItem(6001, '斯伯丁篮球 室内外7号球', '球类运动', 6000, '张同学', ['SELF_PICKUP'], 1, basketballImage),
  createTextbookItem(6002, '羽毛球拍 双拍套装', '球拍器材', 8800, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, basketballImage),
  createTextbookItem(6003, '网球拍 九成新', '球拍器材', 12000, '王同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 3, basketballImage),
  createTextbookItem(6004, '瑜伽垫 加厚防滑', '健身器材', 3500, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, suitcaseImage),
  createTextbookItem(6005, '运动鞋 42码', '运动鞋服', 15000, '陈同学', ['SELF_PICKUP'], 5, macbookAirImage),
  createTextbookItem(6006, '校园自行车', '自行车', 26000, '黄同学', ['SELF_PICKUP'], 6, basketballImage),
  createTextbookItem(6007, '护膝护腕套装', '运动鞋服', 2500, '周同学', ['SELF_PICKUP'], 7, mechanicalKeyboardImage),
  createTextbookItem(6008, '跳绳 计数款', '健身器材', 1800, '吴同学', ['SELF_PICKUP'], 8, calculatorImage),
]

const dailyGoodsItems: ItemSummary[] = [
  createTextbookItem(7001, '保温水杯 500ml', '杯壶餐具', 1800, '林同学', ['SELF_PICKUP'], 1, dailyWaterBottleImage),
  createTextbookItem(7002, '折叠雨伞 深蓝色', '雨伞雨具', 1200, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, dailyUmbrellaImage),
  createTextbookItem(7003, '陶瓷餐具 三件套', '杯壶餐具', 2000, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 3, dailyCeramicSetImage),
  createTextbookItem(7004, '保温壶 九成新', '杯壶餐具', 3500, '黄同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, dailyThermosImage),
  createTextbookItem(7005, '吹风机 小功率', '小电器', 4000, '吴同学', ['SELF_PICKUP'], 5, deskLampImage),
  createTextbookItem(7006, '桌面镜 可折叠', '日常杂物', 1000, '刘同学', ['SELF_PICKUP'], 6, dailyWaterBottleImage),
  createTextbookItem(7007, '整理盒 三格', '整理收纳', 1500, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 7, suitcaseImage),
  createTextbookItem(7008, '洗衣篮 可折叠', '整理收纳', 1600, '李同学', ['SELF_PICKUP'], 8, suitcaseImage),
]

const makeupItems: ItemSummary[] = [
  createTextbookItem(8001, '护肤水乳套装', '护肤用品', 6800, '林同学', ['SELF_PICKUP'], 1, makeupLotionSetImage),
  createTextbookItem(8002, '化妆刷 8支装', '彩妆工具', 3500, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, makeupMirrorImage),
  createTextbookItem(8003, '小样香水 30ml', '香水香氛', 8000, '王同学', ['SELF_PICKUP'], 3, dailyThermosImage),
  createTextbookItem(8004, '防晒霜 SPF50', '护肤用品', 2800, '刘同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, makeupSunscreenImage),
  createTextbookItem(8005, '卷发棒 32mm', '美发工具', 5500, '张同学', ['SELF_PICKUP'], 5, makeupCurlingIronImage),
  createTextbookItem(8006, '桌面化妆镜', '彩妆工具', 1800, '黄同学', ['SELF_PICKUP'], 6, makeupMirrorImage),
  createTextbookItem(8007, '美甲工具套装', '美甲用品', 2200, '吴同学', ['SELF_PICKUP'], 7, makeupCurlingIronImage),
  createTextbookItem(8008, '洗发水 未拆封', '洗护用品', 4500, '陈同学', ['SELF_PICKUP'], 8, makeupShampooImage),
]

const instrumentsItems: ItemSummary[] = [
  createTextbookItem(9001, '民谣吉他 41寸', '乐器', 18000, '林同学', ['SELF_PICKUP'], 1, instrumentsGuitarImage),
  createTextbookItem(9002, '尤克里里 23寸', '乐器', 9500, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, instrumentsGuitarImage),
  createTextbookItem(9003, '口琴 C调', '乐器', 2500, '王同学', ['SELF_PICKUP'], 3, instrumentsHarmonicaImage),
  createTextbookItem(9004, '水彩画笔套装', '绘画工具', 3000, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, instrumentsColoredPencilsImage),
  createTextbookItem(9005, '马克笔 48色', '绘画工具', 5500, '吴同学', ['SELF_PICKUP'], 5, instrumentsMarkersImage),
  createTextbookItem(9006, '文件夹 五只装', '文件收纳', 800, '张同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 6, instrumentsFolderImage),
  createTextbookItem(9007, '手账本 未使用', '手账用品', 1800, '黄同学', ['SELF_PICKUP'], 7, instrumentsJournalImage),
  createTextbookItem(9008, '绘图板 小号', '创作工具', 12000, '赵同学', ['SELF_PICKUP'], 8, instrumentsDrawingTabletImage),
]

const ticketItems: ItemSummary[] = [
  createTextbookItem(10001, '厦大芙蓉湖音乐会门票', '演出门票', 6000, '林同学', ['DELIVER_TO_SCHOOL'], 1, ticketsConcertImage),
  createTextbookItem(10002, '人工智能与未来 讲座票', '讲座活动', 0, '周同学', ['DELIVER_TO_SCHOOL'], 2, ticketsLectureImage),
  createTextbookItem(10003, '电影票《银河漫游指南》', '电影票', 2800, '陈同学', ['DELIVER_TO_SCHOOL'], 3, ticketsMovieImage),
  createTextbookItem(10004, '话剧《暗恋桃花源》门票', '演出门票', 8000, '王同学', ['SELF_PICKUP'], 4, ticketsTheaterImage),
  createTextbookItem(10005, '《山海有声》艺术展门票', '展览票', 1500, '张同学', ['DELIVER_TO_SCHOOL'], 5, ticketsTheaterImage),
  createTextbookItem(10006, '厦大毕业晚会 入场券', '校园活动', 1000, '黄同学', ['DELIVER_TO_SCHOOL'], 6, ticketsGraduationImage),
  createTextbookItem(10007, '厦大 vs 集大 足球赛门票', '赛事票', 2000, '李同学', ['SELF_PICKUP'], 7, ticketsFootballImage),
  createTextbookItem(10008, '海韵音乐节 2日通票', '演出门票', 12000, '吴同学', ['DELIVER_TO_SCHOOL'], 8, ticketsBandImage),
]

const othersItems: ItemSummary[] = [
  createTextbookItem(11001, '鼓浪屿船票钥匙扣', '校园纪念', 600, '林同学', ['SELF_PICKUP'], 1, othersKeychainImage),
  createTextbookItem(11002, '小猫陶瓷摆件', '装饰摆件', 1200, '周同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 2, othersCeramicCatImage),
  createTextbookItem(11003, '厦大风景明信片套装', '校园纪念', 800, '王同学', ['SELF_PICKUP'], 3, othersPostcardsImage),
  createTextbookItem(11004, '手工钩织向日葵', '手工制品', 1500, '陈同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 4, othersSunflowerImage),
  createTextbookItem(11005, '厦大校徽徽章', '校园纪念', 500, '张同学', ['SELF_PICKUP'], 5, othersBadgeImage),
  createTextbookItem(11006, '厦大主题盲盒', '兴趣收藏', 1800, '吴同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 6, othersFigureImage),
  createTextbookItem(11007, '迷你场景小夜灯', '装饰摆件', 2000, '李同学', ['SELF_PICKUP'], 7, deskLampImage),
  createTextbookItem(11008, '杂物组合一打包出', '杂物组合', 1000, '赵同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 8, suitcaseImage),
  createTextbookItem(11009, '厦大香囊挂件', '手工制品', 900, '黄同学', ['SELF_PICKUP'], 9, othersBadgeImage),
  createTextbookItem(11010, '动漫手办小摆件', '兴趣收藏', 1600, '林同学', ['SELF_PICKUP', 'DELIVER_TO_SCHOOL'], 10, othersFigureImage),
]

type PriceRange = { label: string; min: number; max: number }
type PickupMode = (typeof pickupModes)[number]

export function ItemsPage() {
  const unreadMessageCount = useUnreadMessageCount()
  const location = useLocation()
  const routeCategory = categoryRoutes.find((item) => item.to === location.pathname)?.label ?? '全部'
  const isTextbookPage = location.pathname === '/items/textbook'
  const isDigitalPage = location.pathname === '/items/digital'
  const isDormPage = location.pathname === '/items/dorm'
  const isOutdoorsPage = location.pathname === '/items/outdoors'
  const isDailyGoodsPage = location.pathname === '/items/daily-goods'
  const isMakeupPage = location.pathname === '/items/make-up'
  const isInstrumentsPage = location.pathname === '/items/instruments'
  const isTicketsPage = location.pathname === '/items/tickets'
  const isOthersPage = location.pathname === '/items/others'
  const hasSpecialItems =
    isTextbookPage || isDigitalPage || isDormPage || isOutdoorsPage || isDailyGoodsPage || isMakeupPage || isInstrumentsPage || isTicketsPage || isOthersPage
  const pageTitle = isTextbookPage
    ? '教材教辅'
    : isDigitalPage
      ? '数码电子'
      : isDormPage
        ? '宿舍用品'
        : isOutdoorsPage
          ? '运动户外'
          : isDailyGoodsPage
            ? '生活日用'
            : isMakeupPage
              ? '美妆个护'
              : isInstrumentsPage
                ? '乐器文具'
                : isTicketsPage
                  ? '票务转让'
                  : isOthersPage
                    ? '其他'
          : routeCategory === '全部'
            ? '全部商品'
            : routeCategory
  useDocumentTitle(`厦大闲置 - ${pageTitle}`)
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>(hasSpecialItems ? '全部' : routeCategory)
  const [priceRange, setPriceRange] = useState<PriceRange>(priceRanges[0])
  const [pickupMode, setPickupMode] = useState<PickupMode>('全部')
  const [condition, setCondition] = useState('全部')
  const [ticketTime, setTicketTime] = useState('')
  const [ticketPickup, setTicketPickup] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set([1002]))

  const itemsQuery = useQuery({
    queryKey: queryKeys.items.list('items'),
    queryFn: () => listItems({ page: 1, size: 80 }),
  })

  const allItems = itemsQuery.data?.data.items ?? emptyItems
  const sourceItems = isTextbookPage
    ? textbookItems
    : isDigitalPage
      ? digitalItems
      : isDormPage
        ? dormItems
        : isOutdoorsPage
          ? outdoorsItems
          : isDailyGoodsPage
            ? dailyGoodsItems
            : isMakeupPage
              ? makeupItems
              : isInstrumentsPage
                ? instrumentsItems
                : isTicketsPage
                ? ticketItems
                : isOthersPage
                  ? othersItems
              : allItems
  const categoryOptions = isTextbookPage
    ? textbookSubcategories
    : isDigitalPage
      ? digitalSubcategories
      : isDormPage
        ? dormSubcategories
        : isOutdoorsPage
          ? outdoorsSubcategories
          : isDailyGoodsPage
            ? dailyGoodsSubcategories
            : isMakeupPage
              ? makeupSubcategories
              : isInstrumentsPage
              ? instrumentsSubcategories
              : isTicketsPage
                ? ticketSubcategories
                : isOthersPage
                  ? othersSubcategories
          : categoryRoutes.map((item) => item.label)
  const priceOptions = isInstrumentsPage
    ? instrumentsPriceRanges
    : isTicketsPage
      ? ticketPriceRanges
    : isMakeupPage
      ? makeupPriceRanges
      : isDailyGoodsPage
        ? dailyGoodsPriceRanges
        : isTextbookPage || isDormPage
          ? textbookPriceRanges
          : isDigitalPage
            ? digitalPriceRanges
            : priceRanges
  const conditionOptions = isOthersPage ? othersConditions : isMakeupPage ? makeupConditions : isDigitalPage ? digitalConditions : isOutdoorsPage ? outdoorsConditions : conditionFilters
  const helperTags = isTextbookPage
    ? ['考研资料', '四六级', '线代', '高数', '教材']
    : isDigitalPage
      ? ['AirPods', 'MacBook', '键盘', '显示器', '计算器']
      : isDormPage
        ? ['台灯', '收纳箱', '床帘', '小风扇', '行李箱']
        : isOutdoorsPage
          ? ['篮球', '羽毛球拍', '自行车', '瑜伽垫', '运动鞋']
          : isDailyGoodsPage
            ? ['水杯', '雨伞', '吹风机', '餐具', '整理盒']
            : isMakeupPage
            ? ['防晒霜', '洗发水', '水乳', '化妆镜', '卷发棒']
            : isInstrumentsPage
              ? ['吉他', '马克笔', '画笔', '文件夹', '笔记本']
              : isTicketsPage
              ? ['讲座', '演唱会', '电影票', '活动票', '展览']
              : isOthersPage
                ? ['纪念品', '明信片', '摆件', '盲盒', '钥匙扣']
          : ['考研资料', '自行车', '显示器', '台灯']
  const helperStats = isTextbookPage
    ? { today: 24, cheap: 16 }
    : isDormPage
      ? { today: 32, cheap: 20 }
      : isOutdoorsPage
        ? { today: 28, cheap: 14 }
        : isDailyGoodsPage
          ? { today: 30, cheap: 22 }
          : isMakeupPage
          ? { today: 26, cheap: 15 }
          : isInstrumentsPage
            ? { today: 22, cheap: 13 }
            : isTicketsPage
              ? { today: 18, cheap: 11 }
              : isOthersPage
                ? { today: 20, cheap: 15 }
          : { today: 36, cheap: 18 }
  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return sourceItems
      .filter((item) => {
        if (category === '全部') {
          return true
        }

        return hasSpecialItems ? item.categoryName === category : displayCategoryName(item.categoryName) === category
      })
      .filter((item) => item.priceCent >= priceRange.min && item.priceCent < priceRange.max)
      .filter((item) => {
        if (pickupMode === '可自提') {
          return item.deliveryModes.includes('SELF_PICKUP')
        }

        if (pickupMode === '校内配送') {
          return item.deliveryModes.includes('DELIVER_TO_SCHOOL')
        }

        return true
      })
      .filter((item) => {
        if (!isTicketsPage) {
          return true
        }

        if (!ticketPickup) {
          return true
        }

        if (ticketPickup === '电子票') {
          return item.deliveryModes.includes('DELIVER_TO_SCHOOL')
        }

        return item.deliveryModes.includes('SELF_PICKUP')
      })
      .filter((item) => (isTicketsPage && ticketTime === '今天' ? item.id === 10002 || item.id === 10003 : true))
      .filter((item) => (isTicketsPage && ticketTime === '本周' ? item.id <= 10005 : true))
      .filter((item) => (isTicketsPage && ticketTime === '本月' ? item.id <= 10008 : true))
      .filter((item) => (verifiedOnly ? item.seller.verificationStatus === 'VERIFIED' : true))
      .filter((item) => (condition === '全部' ? true : inferCondition(item) === condition))
      .filter((item) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${item.title} ${displayCategoryName(item.categoryName)} ${item.seller.nickname}`.toLowerCase().includes(normalizedKeyword)
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [category, condition, hasSpecialItems, isTicketsPage, keyword, pickupMode, priceRange, sourceItems, ticketPickup, ticketTime, verifiedOnly])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function resetPage(action: () => void) {
    action()
    setPage(1)
  }

  function toggleFavorite(itemId: number) {
    setFavoriteIds((current) => {
      const next = new Set(current)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  return (
    <UnifiedMarketplacePage
      activeCategoryLabel={categoryRoutes.find((item) => item.to === location.pathname)?.sidebarLabel ?? '全部分类'}
      keyword={keyword}
      onKeywordChange={(value) => resetPage(() => setKeyword(value))}
      onSearch={() => setPage(1)}
    >
      <div className="market-page items-page">
      <header className="market-topbar">
        <a className="market-brand" href="/">
          <img src={campusGateImage} alt="" aria-hidden="true" />
          <span>
            <strong>厦大闲置</strong>
            <small>厦门大学校园二手交易平台</small>
          </span>
        </a>

        <form
          className="market-search"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
          }}
        >
          <Search size={24} />
          <input
            aria-label="搜索商品"
            placeholder="搜索商品名称、类别、关键词..."
            value={keyword}
            onChange={(event) => resetPage(() => setKeyword(event.target.value))}
          />
          <button type="submit">搜索</button>
        </form>

        <div className="market-userbar" aria-label="用户快捷入口">
          <IconNotice label="通知" count={0}>
            <Bell size={25} />
          </IconNotice>
          <IconNotice label="私信" count={unreadMessageCount}>
            <Mail size={26} />
          </IconNotice>
          <button type="button" className="profile-button">
            <span className="avatar">海</span>
            <strong>海风吹过嘉庚楼</strong>
            <em>学生</em>
            <ChevronDown size={17} />
          </button>
        </div>
      </header>

      <div className="market-layout">
        <aside className="market-sidebar">
          <nav className="market-nav" aria-label="商品分类">
            <a href="/">
              <Home size={20} />
              <span>首页</span>
            </a>
            {categoryRoutes.map((item) => (
              <a className={location.pathname === item.to ? 'active' : undefined} href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.sidebarLabel}</span>
              </a>
            ))}
          </nav>

          <nav className="market-nav market-nav-user" aria-label="个人中心">
            {userNav.map((item) => (
              <a href={item.to} key={item.label}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/messages' && unreadMessageCount > 0 ? <b>{unreadMessageCount}</b> : null}
              </a>
            ))}
          </nav>

          <img className="sidebar-sketch" src={campusSidebarImage} alt="" aria-hidden="true" />
        </aside>

        <main className="items-main">
          <section className="items-content">
            <div className="items-column">
              <header className="items-heading">
                <h1>{pageTitle}</h1>
              </header>

              <section className="items-filter-panel" aria-label="商品筛选">
                <FilterRow label="分类">
                  {categoryOptions.map((item) => (
                    <button type="button" className={category === item ? 'selected' : undefined} onClick={() => resetPage(() => setCategory(item))} key={item}>
                      {item}
                    </button>
                  ))}
                </FilterRow>
                <FilterRow label="价格">
                  {priceOptions.map((item) => (
                    <button
                      type="button"
                      className={priceRange.label === item.label ? 'selected' : undefined}
                      onClick={() => resetPage(() => setPriceRange(item))}
                      key={item.label}
                    >
                      {item.label}
                    </button>
                  ))}
                </FilterRow>
                {isTicketsPage ? (
                  <>
                    <FilterRow label="时间">
                      {ticketTimeFilters.map((item) => (
                        <button type="button" className={ticketTime === item ? 'selected' : undefined} onClick={() => resetPage(() => setTicketTime(item))} key={item}>
                          {item}
                        </button>
                      ))}
                    </FilterRow>
                    <FilterRow label="取票">
                      {ticketPickupFilters.map((item) => (
                        <button type="button" className={ticketPickup === item ? 'selected' : undefined} onClick={() => resetPage(() => setTicketPickup(item))} key={item}>
                          {item}
                        </button>
                      ))}
                    </FilterRow>
                  </>
                ) : (
                  <>
                    <FilterRow label="取货">
                      {pickupModes.map((item) => (
                        <button type="button" className={pickupMode === item ? 'selected' : undefined} onClick={() => resetPage(() => setPickupMode(item))} key={item}>
                          {item}
                        </button>
                      ))}
                    </FilterRow>
                    <FilterRow label="成色">
                      {conditionOptions.map((item) => (
                        <button type="button" className={condition === item ? 'selected' : undefined} onClick={() => resetPage(() => setCondition(item))} key={item}>
                          {item}
                        </button>
                      ))}
                    </FilterRow>
                  </>
                )}
              </section>

              <div className="items-toolbar">
                <div>
                  <span>为你找到 {filteredItems.length || sourceItems.length} 件在售闲置</span>
                  <label>
                    <input type="checkbox" checked={verifiedOnly} onChange={(event) => resetPage(() => setVerifiedOnly(event.target.checked))} />
                    只有已认证卖家
                    <CheckCircle2 size={17} />
                  </label>
                </div>
                <div>
                  <span>排序：</span>
                  <button type="button">
                    最新发布
                    <ChevronDown size={16} />
                  </button>
                  <a href="/publish">
                    <Pencil size={18} />
                    发布闲置
                  </a>
                </div>
              </div>

              {!hasSpecialItems && itemsQuery.isLoading ? (
                <div className="product-grid" aria-label="商品加载中">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div className="product-card skeleton" key={index}>
                      <div />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : null}

              {!hasSpecialItems && itemsQuery.isError ? <EmptyState title="商品加载失败" action="重新加载" onClick={() => itemsQuery.refetch()} /> : null}

              {(hasSpecialItems || (!itemsQuery.isLoading && !itemsQuery.isError)) && visibleItems.length === 0 ? (
                <EmptyState title="暂无符合条件的商品" description="换个分类、价格或关键词再试试。" />
              ) : null}

              {(hasSpecialItems || (!itemsQuery.isLoading && !itemsQuery.isError)) && visibleItems.length > 0 ? (
                <div className="product-grid items-product-grid">
                  {visibleItems.map((item) => (
                    <ProductCard
                      item={item}
                      favorited={favoriteIds.has(item.id) || item.favorited}
                      onToggleFavorite={() => toggleFavorite(item.id)}
                      key={item.id}
                    />
                  ))}
                </div>
              ) : null}

              <footer className="feed-pagination items-pagination" aria-label="商品分页">
                <span>共 {filteredItems.length} 件商品</span>
                <div>
                  <button type="button" onClick={() => setPage(Math.max(1, currentPage - 1))} aria-label="上一页">
                    <ChevronLeft size={17} />
                  </button>
                  {Array.from({ length: Math.min(pageCount, 3) }).map((_, index) => {
                    const pageNumber = index + 1
                    return (
                      <button
                        type="button"
                        className={currentPage === pageNumber ? 'active' : undefined}
                        onClick={() => setPage(pageNumber)}
                        key={pageNumber}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                  <button type="button" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} aria-label="下一页">
                    <ChevronRight size={17} />
                  </button>
                </div>
                <button type="button" className="page-size-button">
                  8 条/页
                  <ChevronDown size={15} />
                </button>
              </footer>
            </div>

            <aside className="items-helper" aria-label="筛选小助手">
              <section className="helper-card">
                <h2>筛选小助手</h2>
                <div className="helper-illustration">
                  <PackageSearch size={136} />
                </div>
                <h3>热门搜索</h3>
                <div className="helper-tags">
                  {helperTags.map((item) => (
                    <button type="button" onClick={() => resetPage(() => setKeyword(item))} key={item}>
                      {item}
                    </button>
                  ))}
                </div>
                <div className="helper-stat">
                  <span>今日上新</span>
                  <button type="button">{helperStats.today} 件 <ChevronRight size={16} /></button>
                </div>
                <div className="helper-stat">
                  <span>低价好物</span>
                  <button type="button">{helperStats.cheap} 件 <ChevronRight size={16} /></button>
                </div>
              </section>
            </aside>
          </section>
        </main>
      </div>
      </div>
    </UnifiedMarketplacePage>
  )
}

function IconNotice({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  return (
    <button type="button" className="notice-button" aria-label={label}>
      {children}
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="items-filter-row">
      <span>{label}：</span>
      <div>{children}</div>
    </div>
  )
}

function ProductCard({ item, favorited, onToggleFavorite }: { item: ItemSummary; favorited: boolean; onToggleFavorite: () => void }) {
  return (
    <article className="product-card items-product-card">
      <button
        type="button"
        className={favorited ? 'heart-button active' : 'heart-button'}
        aria-label={favorited ? '取消收藏' : '收藏商品'}
        onClick={onToggleFavorite}
      >
        <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
      </button>
      <a className="product-image" href={`/items/${item.id}`}>
        <img src={item.coverImageUrl} alt={item.title} loading="lazy" />
      </a>
      <h2>{item.title}</h2>
      <strong>{formatPrice(item.priceCent)}</strong>
      <div className="seller-line">
        <span>{item.seller.nickname}</span>
        <CheckCircle2 size={15} />
        <em>{item.seller.verificationStatus === 'VERIFIED' ? '已认证' : '待认证'}</em>
      </div>
      <div className="items-card-footer">
        <div className="delivery-tags">
          {item.deliveryModes.includes('SELF_PICKUP') ? <span>可自提</span> : null}
          {item.deliveryModes.includes('DELIVER_TO_SCHOOL') ? <span>可配送</span> : null}
        </div>
        <a href={`/items/${item.id}`}>查看详情</a>
      </div>
    </article>
  )
}

function EmptyState({ title, description, action, onClick }: { title: string; description?: string; action?: string; onClick?: () => void }) {
  return (
    <div className="empty-state">
      <img src={emptyFavoritesImage} alt="" aria-hidden="true" />
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? (
        <button type="button" onClick={onClick}>
          {action}
        </button>
      ) : null}
    </div>
  )
}

function createTextbookItem(
  id: number,
  title: string,
  categoryName: string,
  priceCent: number,
  sellerNickname: string,
  deliveryModes: ItemSummary['deliveryModes'],
  dayOffset: number,
  coverImageUrl: string,
): ItemSummary {
  return {
    id,
    title,
    categoryName,
    priceCent,
    status: 'ON_SALE',
    coverImageUrl,
    createdAt: `2026-07-${String(Math.max(1, 9 - dayOffset)).padStart(2, '0')}T${String(9 + dayOffset).padStart(2, '0')}:10:00+08:00`,
    deliveryModes,
    seller: {
      id: 6000 + id,
      nickname: sellerNickname,
      verificationStatus: 'VERIFIED',
    },
    favorited: id % 4 === 0,
    favoriteCount: 6 + dayOffset,
  }
}

function displayCategoryName(categoryName: string) {
  const map: Record<string, string> = {
    教材: '教材教辅',
    数码: '数码电子',
  }

  return map[categoryName] ?? categoryName
}

function inferCondition(item: ItemSummary) {
  if (item.title.includes('全新')) {
    return '全新'
  }

  if (item.title.includes('九成新')) {
    return '九成新'
  }

  if (item.title.includes('可小刀')) {
    return '可小刀'
  }

  return '八成新'
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}
