import basketballImage from '../../assets/favorites/items/basketball.webp'
import calculatorImage from '../../assets/favorites/items/calculator.webp'
import deskLampImage from '../../assets/favorites/items/desk-lamp.webp'
import guitarImage from '../../assets/favorites/items/instruments-guitar.webp'
import mathBooksImage from '../../assets/favorites/items/math-books.webp'
import suitcaseImage from '../../assets/favorites/items/suitcase.webp'

export type DemandStatus = 'matching' | 'talking' | 'matched' | 'expiring'

export interface DemandItem {
  author: string
  budget: string
  campus: string
  category: string
  condition: string
  description: string
  detailLines: string[]
  expiresIn: string
  id: number
  image: string
  keywords: string[]
  pickup: string
  publishedAt: string
  publishedAtFull: string
  responses: number
  status: DemandStatus
  title: string
  views: number
}

export const demandItems: DemandItem[] = [
  {
    id: 1,
    title: '求高等数学第七版教材',
    budget: '¥20 - ¥40',
    category: '教材教辅',
    description: '需要可用的高等数学第七版教材或配套笔记，有的同学联系我，谢谢！',
    detailLines: [
      '想收一本高等数学第七版教材，最好没有大量涂写，少量笔记可以接受。',
      '希望在思明校区自提，价格 20-40 元左右，如果配有习题答案也可以一起收。',
    ],
    author: '海风吹过嘉庚楼',
    publishedAt: '10 分钟前',
    publishedAtFull: '2026-07-10 14:20',
    status: 'matching',
    image: mathBooksImage,
    campus: '思明校区',
    condition: '九成新 / 八成新可接受',
    pickup: '自提优先，校内配送亦可',
    expiresIn: '3 天',
    views: 23,
    responses: 4,
    keywords: ['高数教材', '第七版', '少量笔记可', '思明校区', '自提优先'],
  },
  {
    id: 2,
    title: '求小台灯或护眼灯',
    budget: '¥30 - ¥60',
    category: '宿舍用品',
    description: '宿舍学习用，需要一盏亮度可调的台灯或护眼灯，最好九成新及以上。',
    detailLines: ['宿舍书桌使用，希望灯光柔和、亮度可调，开关与电源线完好。', '翔安校区可自提，外观轻微使用痕迹可以接受。'],
    author: '陈同学', publishedAt: '25 分钟前', publishedAtFull: '2026-07-10 14:05', status: 'talking', image: deskLampImage,
    campus: '翔安校区', condition: '九成新', pickup: '校内自提', expiresIn: '5 天', views: 18, responses: 3,
    keywords: ['护眼灯', '亮度可调', '宿舍书桌', '翔安校区'],
  },
  {
    id: 3,
    title: '求二手计算器', budget: '¥20 - ¥80', category: '数码电子',
    description: '考试用计算器，希望功能正常，屏幕清晰，有的同学联系。',
    detailLines: ['需要一台考试可用的科学计算器，按键灵敏、屏幕无缺字。', '型号不限，带保护盖或说明书更好，思明校区交易。'],
    author: '王同学', publishedAt: '1 小时前', publishedAtFull: '2026-07-10 13:30', status: 'matching', image: calculatorImage,
    campus: '思明校区', condition: '功能正常', pickup: '当面验货', expiresIn: '6 天', views: 31, responses: 5,
    keywords: ['科学计算器', '考试可用', '屏幕清晰', '当面验货'],
  },
  {
    id: 4,
    title: '求吉他变调夹', budget: '¥10 - ¥25', category: '乐器文具',
    description: '吉他变调夹一个，最好金属材质，夹得稳，有的联系我！',
    detailLines: ['民谣吉他使用，希望变调夹回弹正常，不打品。', '颜色不限，芙蓉隧道或学生公寓附近都可交易。'],
    author: '周同学', publishedAt: '2 小时前', publishedAtFull: '2026-07-10 12:20', status: 'matching', image: guitarImage,
    campus: '思明校区', condition: '正常使用', pickup: '校内面交', expiresIn: '4 天', views: 12, responses: 2,
    keywords: ['吉他配件', '金属材质', '夹持稳定', '校内面交'],
  },
  {
    id: 5,
    title: '求20寸行李箱', budget: '¥60 - ¥120', category: '生活日用',
    description: '周末短途旅行用，20寸左右行李箱，轮子灵活，外观无明显破损。',
    detailLines: ['需要可登机尺寸的行李箱，拉杆、拉链和万向轮均能正常使用。', '颜色不限，希望近期在翔安校区完成交易。'],
    author: '黄同学', publishedAt: '今天 09:30', publishedAtFull: '2026-07-10 09:30', status: 'expiring', image: suitcaseImage,
    campus: '翔安校区', condition: '八成新以上', pickup: '宿舍区自提', expiresIn: '1 天', views: 40, responses: 6,
    keywords: ['20寸', '万向轮', '可登机', '翔安校区'],
  },
  {
    id: 6,
    title: '求篮球或羽毛球拍', budget: '¥30 - ¥100', category: '运动户外',
    description: '想买篮球或羽毛球拍一副，参加校园活动用，可正常使用即可。',
    detailLines: ['篮球或一副羽毛球拍均可，主要用于新手参加学院活动。', '不要求品牌，器材无明显开裂、能正常使用即可。'],
    author: '许同学', publishedAt: '昨天', publishedAtFull: '2026-07-09 16:40', status: 'matched', image: basketballImage,
    campus: '漳州校区', condition: '可正常使用', pickup: '校内自提', expiresIn: '已匹配', views: 52, responses: 8,
    keywords: ['篮球', '羽毛球拍', '新手器材', '校内自提'],
  },
]

export const demandStatusCopy: Record<DemandStatus, { label: string; tone: 'blue' | 'orange' | 'green' | 'red' }> = {
  matching: { label: '待匹配', tone: 'orange' },
  talking: { label: '沟通中', tone: 'blue' },
  matched: { label: '已匹配', tone: 'green' },
  expiring: { label: '即将过期', tone: 'red' },
}

export function getDemandById(id: string | undefined) {
  return demandItems.find((item) => String(item.id) === id)
}
