import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createConversation } from '../../api/conversation.api'
import { favoriteItem, unfavoriteItem } from '../../api/favorite.api'
import { getItem, listItems } from '../../api/item.api'
import type { ItemDetail, ItemSummary } from '../../api/item.api'
import { createOrder } from '../../api/order.api'
import { queryKeys } from '../../api/queryKeys'
import sellerAvatarImage from '../../assets/item-detail/seller-avatar.png'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './ItemDetailPage.css'

const emptyItems: ItemSummary[] = []

export function ItemDetailPage() {
  const { id } = useParams()
  const itemId = id ?? '1003'
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [actionNotice, setActionNotice] = useState('')

  const itemQuery = useQuery({
    queryKey: queryKeys.items.detail(itemId),
    queryFn: () => getItem(itemId),
  })

  const relatedItemsQuery = useQuery({
    queryKey: queryKeys.items.list('item-detail-related'),
    queryFn: () => listItems({ page: 1, size: 12 }),
  })

  const item = itemQuery.data?.data

  useDocumentTitle(item ? `厦大闲置 - ${item.title}` : '厦大闲置 - 商品详情')

  useEffect(() => {
    if (!item) {
      return
    }

    setSelectedImageIndex(0)
    setIsFavorited(item.favorited)
    setFavoriteCount(item.favoriteCount)
    setActionNotice('')
  }, [item])

  const itemImages = useMemo(() => {
    if (!item) {
      return []
    }

    return item.imageUrls.length > 0 ? item.imageUrls : item.coverImageUrl ? [item.coverImageUrl] : []
  }, [item])

  const selectedImageUrl = itemImages[selectedImageIndex] ?? itemImages[0]

  const relatedItems = useMemo(() => {
    const items = relatedItemsQuery.data?.data.items ?? emptyItems
    return items.filter((relatedItem) => relatedItem.id !== item?.id).slice(0, 4)
  }, [item?.id, relatedItemsQuery.data?.data.items])

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!item) {
        return
      }

      if (isFavorited) {
        await unfavoriteItem(item.id)
      } else {
        await favoriteItem(item.id)
      }
    },
    onMutate: () => {
      setActionNotice('')
      setIsFavorited((current) => {
        setFavoriteCount((count) => Math.max(0, count + (current ? -1 : 1)))
        return !current
      })
    },
    onError: () => {
      setIsFavorited((current) => {
        setFavoriteCount((count) => Math.max(0, count + (current ? -1 : 1)))
        return !current
      })
      setActionNotice('收藏状态更新失败，请稍后再试')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.mine })
      queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(itemId) })
    },
  })

  const contactMutation = useMutation({
    mutationFn: async (currentItem: ItemDetail) =>
      createConversation({
        itemId: currentItem.id,
        targetUserId: currentItem.seller.id,
      }),
    onSuccess: (response) => {
      navigate(`/messages/${response.data.id}`)
    },
    onError: () => {
      setActionNotice('私信会话创建失败，请稍后再试')
    },
  })

  const orderMutation = useMutation({
    mutationFn: async (currentItem: ItemDetail) =>
      createOrder({
        itemId: currentItem.id,
        deliveryMode: currentItem.deliveryModes.includes('SELF_PICKUP') ? 'SELF_PICKUP' : currentItem.deliveryModes[0],
        remark: '预约自提，等待卖家确认时间地点',
      }),
    onSuccess: () => {
      setActionNotice('已创建待沟通订单，请在消息中确认自提安排')
    },
    onError: () => {
      setActionNotice('预约自提失败，请确认商品仍在售')
    },
  })

  function handleSearch() {
    const trimmedKeyword = keyword.trim()
    navigate(trimmedKeyword ? `/items?keyword=${encodeURIComponent(trimmedKeyword)}` : '/items')
  }

  return (
    <MarketplaceShell
      activeCategoryLabel="全部分类"
      keyword={keyword}
      mainClassName="item-detail-main"
      onKeywordChange={setKeyword}
      onSearch={handleSearch}
      searchLabel="搜索商品"
      shellClassName="item-detail-shell"
    >
      {itemQuery.isLoading ? <ItemDetailSkeleton /> : null}

      {itemQuery.isError ? (
        <div className="item-detail-empty">
          <h1>商品加载失败</h1>
          <p>请确认已启用 mock 模式或后端商品详情接口可用。</p>
          <button type="button" onClick={() => itemQuery.refetch()}>
            重新加载
          </button>
        </div>
      ) : null}

      {!itemQuery.isLoading && !itemQuery.isError && item ? (
        <>
          <motion.header
            className="item-detail-heading"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.12 }}
          >
            <nav aria-label="面包屑">
              <a href="/">首页</a>
              <span>/</span>
              <a href="/items">全部商品</a>
              <span>/</span>
              <strong>{item.title}</strong>
            </nav>
            <h1>商品详情</h1>
          </motion.header>

          <section className="item-detail-top-grid">
            <motion.div
              className="item-gallery-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14, rotate: -0.18 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.42, delay: 0.18 }}
            >
              <div className="item-gallery-main">
                {selectedImageUrl ? <img src={selectedImageUrl} alt={item.title} /> : <span>待上传商品图片</span>}
              </div>
              <div className="item-gallery-thumbs" aria-label="商品图片">
                {itemImages.map((imageUrl, index) => (
                  <button
                    type="button"
                    className={selectedImageIndex === index ? 'active' : undefined}
                    onClick={() => setSelectedImageIndex(index)}
                    key={imageUrl}
                  >
                    <img src={imageUrl} alt={`${item.title} 图片 ${index + 1}`} />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.article
              className="item-info-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.24 }}
            >
              <h2>{item.title}</h2>
              <strong>{formatPrice(item.priceCent)}</strong>
              <div className="item-tags">
                <span>九成新</span>
                <span>{item.categoryName}</span>
                <span>发布时间 {formatMonthDay(item.createdAt)}</span>
              </div>
              <dl className="item-facts">
                <div>
                  <Truck size={20} />
                  <dt>交易方式：</dt>
                  <dd>{formatDelivery(item.deliveryModes)}</dd>
                </div>
                <div>
                  <MapPin size={20} />
                  <dt>自提地点：</dt>
                  <dd>芙蓉园门口</dd>
                </div>
                <div>
                  <Eye size={20} />
                  <dt>浏览</dt>
                  <dd>128</dd>
                  <Heart size={20} />
                  <dt>收藏</dt>
                  <dd>{favoriteCount}</dd>
                </div>
              </dl>
              <section className="item-description">
                <h3>商品描述</h3>
                <p>{item.description}</p>
              </section>
              <div className="item-action-row">
                <button
                  type="button"
                  className={isFavorited ? 'favorited' : undefined}
                  disabled={favoriteMutation.isPending}
                  onClick={() => favoriteMutation.mutate()}
                >
                  <Heart size={25} fill={isFavorited ? 'currentColor' : 'none'} />
                  {isFavorited ? '已收藏' : '收藏'}
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={contactMutation.isPending}
                  onClick={() => contactMutation.mutate(item)}
                >
                  <MessageCircle size={23} />
                  立即联系
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={orderMutation.isPending}
                  onClick={() => orderMutation.mutate(item)}
                >
                  预约自提
                </button>
              </div>
              <p className="item-action-note">{actionNotice || '预约后将创建待沟通意向订单'}</p>
            </motion.article>

            <motion.aside
              className="seller-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.3 }}
            >
              <h2>发布者信息</h2>
              <div className="seller-profile-card">
                <img src={sellerAvatarImage} alt="发布者头像" />
                <div>
                  <strong>{item.seller.nickname}</strong>
                  <span>
                    <CheckCircle2 size={16} />
                    已认证
                  </span>
                </div>
              </div>
              <p>厦门大学 · 学生认证</p>
              <p>在售 6 件 · 回复较快</p>
              <button type="button" onClick={() => contactMutation.mutate(item)}>
                进入私信
              </button>
            </motion.aside>
          </section>

          <section className="item-detail-bottom-grid">
            <TradeInstructionCard />
            <RelatedItemsCard items={relatedItems} reduceMotion={shouldReduceMotion} />
          </section>
        </>
      ) : null}
    </MarketplaceShell>
  )
}

function ItemDetailSkeleton() {
  return (
    <div className="item-detail-skeleton" aria-label="商品详情加载中">
      <div />
      <div />
      <div />
    </div>
  )
}

function TradeInstructionCard() {
  return (
    <section className="trade-instruction-card">
      <h2>交易说明</h2>
      <div>
        <InstructionPoint
          icon={<ShieldCheck size={42} />}
          title="校内当面验货"
          text="建议见面验货，确保商品与描述一致"
        />
        <InstructionPoint
          icon={<Truck size={45} />}
          title="支持送货到校"
          text="支持卖家送货到校，方便快捷"
        />
        <InstructionPoint
          icon={<ClipboardCheck size={43} />}
          title="沟通后确认订单"
          text="沟通一致后，再确认订单更安心"
        />
      </div>
    </section>
  )
}

interface InstructionPointProps {
  icon: ReactNode
  title: string
  text: string
}

function InstructionPoint({ icon, title, text }: InstructionPointProps) {
  return (
    <article className="instruction-point">
      <span>{icon}</span>
      <strong>{title}</strong>
      <small>{text}</small>
    </article>
  )
}

interface RelatedItemsCardProps {
  items: ItemSummary[]
  reduceMotion: boolean
}

function RelatedItemsCard({ items, reduceMotion }: RelatedItemsCardProps) {
  return (
    <section className="related-items-card">
      <h2>同发布者其他在售商品</h2>
      <div className="related-items-grid">
        {items.map((item, index) => (
          <motion.article
            className="related-item"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.16 + index * 0.045 }}
            key={item.id}
          >
            <button type="button" aria-label={`收藏 ${item.title}`}>
              <Heart size={18} />
            </button>
            <a href={`/items/${item.id}`}>
              {item.coverImageUrl ? <img src={item.coverImageUrl} alt={item.title} loading="lazy" /> : null}
              <strong>{item.title}</strong>
              <span>{formatPrice(item.priceCent)}</span>
              <em>查看详情</em>
            </a>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatMonthDay(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '07-06'
  }

  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDelivery(deliveryModes: ItemDetail['deliveryModes']) {
  if (deliveryModes.includes('SELF_PICKUP') && deliveryModes.includes('DELIVER_TO_SCHOOL')) {
    return '可自提 / 送货到校'
  }

  if (deliveryModes.includes('SELF_PICKUP')) {
    return '可自提'
  }

  return '送货到校'
}
