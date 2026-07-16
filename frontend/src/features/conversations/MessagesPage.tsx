import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { listConversations } from '../../api/conversation.api'
import type { ConversationSummary } from '../../api/conversation.api'
import { getMockConversationMeta } from '../../api/mock/conversations.mock'
import { queryKeys } from '../../api/queryKeys'
import messageHelperImage from '../../assets/messages/message-helper.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './MessagesPage.css'

const emptyConversations: ConversationSummary[] = []
const conversationPollIntervalMs = 3_000

export function MessagesPage() {
  useDocumentTitle('厦大闲置 - 消息中心')

  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const conversationsQuery = useQuery({
    queryKey: queryKeys.conversations.list({ page: 1, size: 20 }),
    queryFn: () => listConversations({ page: 1, size: 20 }),
    refetchInterval: conversationPollIntervalMs,
    refetchIntervalInBackground: false,
  })

  const conversations = conversationsQuery.data?.data.items ?? emptyConversations
  const stats = useMemo(() => getConversationStats(conversations), [conversations])

  const visibleConversations = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return conversations
      .filter((conversation) => {
        return showUnreadOnly ? (conversation.unreadCount ?? 0) > 0 : true
      })
      .filter((conversation) => {
        if (!normalizedKeyword) {
          return true
        }

        return `${conversation.targetNickname} ${conversation.itemTitle} ${conversation.lastMessage}`
          .toLowerCase()
          .includes(normalizedKeyword)
      })
  }, [conversations, keyword, showUnreadOnly])

  return (
    <MarketplaceShell
      activeUserLabel="消息中心"
      keyword={keyword}
      mainClassName="messages-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索联系人或商品"
      searchPlaceholder="搜索联系人或商品"
    >
      <motion.section
        className="favorites-heading messages-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.24 }}
      >
        <h1>消息中心</h1>
        <p>查看最近联系人的交易沟通</p>
      </motion.section>

      <section className="messages-layout">
        <div className="messages-list-panel">
          <section className="message-stat-strip" aria-label="消息统计">
            <StatBlock icon={<MessageCircle size={38} />} label="全部会话" value={stats.total} />
            <StatBlock icon={<Mail size={38} />} label="未读消息" value={stats.unread} tone="red" />
            <StatBlock icon={<ShieldCheck size={38} />} label="交易沟通" value={stats.activeDeals} tone="green" />
            <form
              className="message-inner-search"
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <Search size={24} />
              <input
                aria-label="搜索会话"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索联系人或商品"
              />
              <button type="submit">搜索会话</button>
            </form>
          </section>

          <div className="messages-toolbar">
            <h2>最近联系人</h2>
            <span>点击进入聊天详情</span>
            <button
              type="button"
              className={showUnreadOnly ? 'active' : undefined}
              onClick={() => setShowUnreadOnly((current) => !current)}
            >
              <SlidersHorizontal size={17} />
              筛选
            </button>
          </div>

          {conversationsQuery.isLoading ? (
            <div className="conversation-list" aria-label="会话加载中">
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="conversation-row skeleton" key={index}>
                  <span />
                  <div />
                  <div />
                </div>
              ))}
            </div>
          ) : null}

          {conversationsQuery.isError ? (
            <div className="messages-empty-state">
              <h2>消息加载失败</h2>
              <p>登录状态可能已失效，请重新登录或稍后重试。</p>
              <button type="button" onClick={() => conversationsQuery.refetch()}>
                重新加载
              </button>
            </div>
          ) : null}

          {!conversationsQuery.isLoading && !conversationsQuery.isError && visibleConversations.length === 0 ? (
            <div className="messages-empty-state">
              <h2>没有符合条件的会话</h2>
              <p>换个联系人、商品关键词或取消未读筛选。</p>
            </div>
          ) : null}

          {!conversationsQuery.isLoading && !conversationsQuery.isError && visibleConversations.length > 0 ? (
            <div className="conversation-list">
              {visibleConversations.map((conversation, index) => (
                <ConversationRow
                  conversation={conversation}
                  index={index}
                  reduceMotion={shouldReduceMotion}
                  key={conversation.id}
                />
              ))}
            </div>
          ) : null}

          <p className="messages-total">共 {conversations.length} 个会话</p>
        </div>

        <aside className="message-helper-panel">
          <h2>消息小助手</h2>
          <span className="painted-asset message-panel-art message-panel-art--helper" aria-hidden="true">
            <img src={messageHelperImage} alt="" />
          </span>
          <HelperPoint icon={<MessageCircle size={22} />} title="及时回复买家消息" text="及时沟通能提升成交率" />
          <HelperPoint icon={<MapPin size={22} />} title="确认地点后再交易" text="请选择安全的交易地点" />
          <HelperPoint icon={<Clock3 size={22} />} title="保留聊天记录" text="交易过程更有保障" />
          <div className="message-reply-card">
            <strong>
              待回复 <em>{stats.unread}</em> 条
            </strong>
            <span>有买家在等待你的回复</span>
            <a href={visibleConversations[0] ? `/messages/${visibleConversations[0].id}` : '/messages'}>
              查看全部未读
            </a>
          </div>
        </aside>
      </section>
    </MarketplaceShell>
  )
}

interface StatBlockProps {
  icon: ReactNode
  label: string
  value: number
  tone?: 'red' | 'green'
}

function StatBlock({ icon, label, value, tone }: StatBlockProps) {
  return (
    <div className={classNames('message-stat', tone && `message-stat--${tone}`)}>
      {icon}
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  )
}

interface ConversationRowProps {
  conversation: ConversationSummary
  index: number
  reduceMotion: boolean
}

function ConversationRow({ conversation, index, reduceMotion }: ConversationRowProps) {
  const meta = getMockConversationMeta(conversation.id)
  const unreadCount = conversation.unreadCount ?? 0

  return (
    <motion.a
      className="conversation-row"
      href={`/messages/${conversation.id}`}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.26, delay: 0.08 + index * 0.045 }}
    >
      <span className={classNames('message-avatar', meta?.online && 'online')}>{conversation.targetNickname[0]}</span>
      <span className="conversation-contact">
        <strong>{conversation.targetNickname}</strong>
        <small>{meta?.role === 'seller' ? '我在出售' : '我在购买'}</small>
      </span>
      <span className="conversation-item">
        {meta?.itemCoverImageUrl ? <img src={meta.itemCoverImageUrl} alt="" loading="lazy" /> : null}
        <em>{conversation.itemTitle}</em>
      </span>
      <span className="conversation-preview">{conversation.lastMessage || '还没有消息'}</span>
      <time dateTime={conversation.lastMessageAt}>{formatConversationTime(conversation.lastMessageAt)}</time>
      {unreadCount > 0 ? <b>{unreadCount}</b> : null}
      <ChevronRight size={22} />
    </motion.a>
  )
}

interface HelperPointProps {
  icon: ReactNode
  title: string
  text: string
}

function HelperPoint({ icon, title, text }: HelperPointProps) {
  return (
    <div className="message-helper-point">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  )
}

function getConversationStats(conversations: ConversationSummary[]) {
  return conversations.reduce(
    (stats, conversation) => {
      const meta = getMockConversationMeta(conversation.id)
      return {
        total: stats.total + 1,
        unread: stats.unread + (conversation.unreadCount ?? 0),
        // 商品状态目前只在 mock 展示元数据中存在，真实接口后续扩展后可直接替换。
        activeDeals: stats.activeDeals + (meta?.itemStatus === 'ON_SALE' ? 1 : 0),
      }
    },
    { total: 0, unread: 0, activeDeals: 0 },
  )
}

function formatConversationTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '刚刚'
  }

  const now = new Date()
  const today = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (date.toDateString() === today) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  }

  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
