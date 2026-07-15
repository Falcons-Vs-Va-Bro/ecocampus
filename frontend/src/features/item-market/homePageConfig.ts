import {
  BookOpen,
  Camera,
  Dumbbell,
  Package,
  ShoppingBasket,
  Star,
} from 'lucide-react'
import type { ItemSummary } from '../../api/item.api'

export const pageSize = 8

export const sectionTabs = ['今日推荐', '最新上架', '教材专区', '数码好物', '宿舍补给'] as const

export const priceRanges = [
  { label: '全部', min: 0, max: Number.POSITIVE_INFINITY },
  { label: '0-50', min: 0, max: 5000 },
  { label: '50-100', min: 5000, max: 10000 },
  { label: '100-300', min: 10000, max: 30000 },
  { label: '300以上', min: 30000, max: Number.POSITIVE_INFINITY },
]

export const deliveryModes = ['全部', '可自提', '校内配送'] as const

export const demandHighlights = [
  { title: '求购 高等数学（第七版）下册', meta: '学号 103****5123 · 5 分钟前' },
  { title: '求购 iPad 或平板电脑', meta: '学号 105****3321 · 12 分钟前' },
  { title: '求购 篮球鞋 42码左右', meta: '学号 104****7788 · 18 分钟前' },
]

export const hotCategories = [
  { label: '教材教辅', icon: BookOpen, to: '/items/textbook' },
  { label: '数码电子', icon: Camera, to: '/items/digital' },
  { label: '宿舍用品', icon: Package, to: '/items/dorm' },
  { label: '生活日用', icon: ShoppingBasket, to: '/items/daily-goods' },
  { label: '运动户外', icon: Dumbbell, to: '/items/outdoors' },
  { label: '美妆个护', icon: Star, to: '/items/make-up' },
]

export type SectionTab = (typeof sectionTabs)[number]
export type DeliveryModeFilter = (typeof deliveryModes)[number]
export type PriceRange = (typeof priceRanges)[number]

export function filterBySection(item: ItemSummary, section: SectionTab) {
  const categoryName = displayCategoryName(item.categoryName)

  if (section === '教材专区') {
    return categoryName === '教材教辅'
  }

  if (section === '数码好物') {
    return categoryName === '数码电子'
  }

  if (section === '宿舍补给') {
    return categoryName === '宿舍用品'
  }

  return true
}

export function displayCategoryName(categoryName: string) {
  const map: Record<string, string> = {
    教材: '教材教辅',
    数码: '数码电子',
  }

  return map[categoryName] ?? categoryName
}

export function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

export function formatDelivery(deliveryModesValue: ItemSummary['deliveryModes']) {
  const canPickup = deliveryModesValue.includes('SELF_PICKUP')
  const canDeliver = deliveryModesValue.includes('DELIVER_TO_SCHOOL')

  if (canPickup && canDeliver) {
    return '可自提/校内配送'
  }

  if (canPickup) {
    return '可自提'
  }

  return '校内配送'
}
