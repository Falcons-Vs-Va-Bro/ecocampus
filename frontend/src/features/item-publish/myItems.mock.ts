import airpodsImage from '../../assets/favorites/items/airpods.webp'
import basketballImage from '../../assets/favorites/items/basketball.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import mechanicalKeyboardImage from '../../assets/favorites/items/mechanical-keyboard.webp'
import suitcaseImage from '../../assets/favorites/items/suitcase.webp'

export type MineStatus = 'on_sale' | 'off_shelf' | 'reviewing' | 'violation'

export interface MineItem {
  id: number
  title: string
  price: string
  originalPrice: string
  category: string
  detailCategory: string
  condition: '全新' | '九成新' | '八成新' | '可小刀'
  deliveryMode: '自提' | '送货到校'
  pickupPlace: string
  description: string
  updatedAt: string
  image: string
  status: MineStatus
}

export const mineItems: MineItem[] = [
  {
    id: 1,
    title: '护眼台灯 可调光',
    price: '¥45.00',
    originalPrice: '¥89.00',
    category: '宿舍用品',
    detailCategory: '宿舍用品 / 台灯照明',
    condition: '九成新',
    deliveryMode: '自提',
    pickupPlace: '芙蓉园门口',
    description: '台灯亮度可调，适合宿舍书桌使用，外观干净，配原装电源线。',
    updatedAt: '2024-05-18 14:30',
    image: deskLampImage,
    status: 'on_sale',
  },
  {
    id: 2,
    title: '高等数学（第七版）上下册',
    price: '¥45.00',
    originalPrice: '¥68.00',
    category: '教材教辅',
    detailCategory: '教材教辅 / 课程教材',
    condition: '八成新',
    deliveryMode: '自提',
    pickupPlace: '翔安一期食堂',
    description: '高数上下册，课堂笔记少量标注，适合期末复习和补课使用。',
    updatedAt: '2024-05-18 12:10',
    image: mathBooksImage,
    status: 'on_sale',
  },
  {
    id: 3,
    title: '机械键盘 青轴',
    price: '¥120.00',
    originalPrice: '¥199.00',
    category: '数码电子',
    detailCategory: '数码电子 / 外设键盘',
    condition: '九成新',
    deliveryMode: '送货到校',
    pickupPlace: '思明校门口',
    description: '青轴机械键盘，敲击反馈清楚，键帽干净，适合宿舍电脑桌使用。',
    updatedAt: '2024-05-18 10:05',
    image: mechanicalKeyboardImage,
    status: 'reviewing',
  },
  {
    id: 4,
    title: '20寸行李箱 九成新',
    price: '¥80.00',
    originalPrice: '¥159.00',
    category: '生活日用',
    detailCategory: '生活日用 / 行李箱',
    condition: '九成新',
    deliveryMode: '自提',
    pickupPlace: '芙蓉园门口',
    description: '20寸登机箱，轮子顺滑，箱体有轻微使用痕迹，毕业搬宿舍很方便。',
    updatedAt: '2024-05-17 20:20',
    image: suitcaseImage,
    status: 'off_shelf',
  },
  {
    id: 5,
    title: 'AirPods 二代',
    price: '¥399.00',
    originalPrice: '¥799.00',
    category: '数码电子',
    detailCategory: '数码电子 / 耳机',
    condition: '八成新',
    deliveryMode: '送货到校',
    pickupPlace: '海韵教学楼',
    description: 'AirPods 二代，充电盒可正常使用，耳机续航稳定，已清洁消毒。',
    updatedAt: '2024-05-17 18:45',
    image: airpodsImage,
    status: 'violation',
  },
  {
    id: 6,
    title: '斯伯丁篮球 室内外7号球',
    price: '¥60.00',
    originalPrice: '¥129.00',
    category: '运动户外',
    detailCategory: '运动户外 / 篮球',
    condition: '九成新',
    deliveryMode: '自提',
    pickupPlace: '思明校门口',
    description: '7号篮球，手感不错，适合室内外球场，平时使用次数不多。',
    updatedAt: '2024-05-17 16:30',
    image: basketballImage,
    status: 'on_sale',
  },
]

export const statusLabels: Record<MineStatus, string> = {
  on_sale: '已上架',
  off_shelf: '已下架',
  reviewing: '审核中',
  violation: '违规下架',
}
