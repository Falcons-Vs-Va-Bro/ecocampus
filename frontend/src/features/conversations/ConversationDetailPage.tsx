import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Image, Info, MapPin, MessageCircle, Send, ShieldCheck, Smile } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listConversations, listMessages, sendMessage } from '../../api/conversation.api'
import type { ConversationSummary, MessageSummary } from '../../api/conversation.api'
import { getMockConversationMeta, mockCurrentUserId } from '../../api/mock/conversations.mock'
import { queryKeys } from '../../api/queryKeys'
import tradeReminderImage from '../../assets/messages/trade-reminder.webp'
import { MarketplaceShell } from '../../components/marketplace'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import './MessagesPage.css'

const quickReplies = ['我想预约自提，时间地点？', '还在吗？', '可以便宜一点吗？', '什么时候方便交易？']
const emptyMessages: MessageSummary[] = []
const emptyConversations: ConversationSummary[] = []

export function ConversationDetailPage() {
  const { conversationId } = useParams()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [keyword, setKeyword] = useState('')
  const [draft, setDraft] = useState('')
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  useDocumentTitle('厦大闲置 - 私信详情')

  const conversationsQuery = useQuery({
    queryKey: queryKeys.conversations.list,
    queryFn: () => listConversations({ page: 1, size: 20 }),
  })

  const messagesQuery = useQuery({
    queryKey: queryKeys.conversations.messages(conversationId ?? ''),
    queryFn: () => listMessages(conversationId ?? '', { page: 1, size: 50 }),
    enabled: Boolean(conversationId),
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversationId ?? '', { content }),
    onSuccess: () => {
      setDraft('')
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.messages(conversationId ?? '') })
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.list })
    },
  })

  const conversations = conversationsQuery.data?.data.items ?? emptyConversations
  const conversation = useMemo(
    () => conversations.find((item) => String(item.id) === String(conversationId)),
    [conversationId, conversations],
  )
  const meta = conversation ? getMockConversationMeta(conversation.id) : undefined
  const messages = messagesQuery.data?.data.items ?? emptyMessages

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  function submitMessage(content = draft) {
    const normalizedContent = content.trim()

    if (!normalizedContent || sendMutation.isPending) {
      return
    }

    sendMutation.mutate(normalizedContent)
  }

  return (
    <MarketplaceShell
      activeUserLabel="消息中心"
      keyword={keyword}
      mainClassName="messages-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索私信"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      <motion.section
        className="favorites-heading message-detail-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.24 }}
      >
        <Link to="/messages" className="message-back-link" aria-label="返回消息中心">
          <ArrowLeft size={30} />
        </Link>
        <h1>私信详情</h1>
      </motion.section>

      {conversationsQuery.isError || messagesQuery.isError ? (
        <div className="messages-empty-state">
          <h2>私信加载失败</h2>
          <p>登录状态可能已失效，请重新登录或稍后重试。</p>
          <button
            type="button"
            onClick={() => {
              conversationsQuery.refetch()
              messagesQuery.refetch()
            }}
          >
            重新加载
          </button>
        </div>
      ) : null}

      {!conversationsQuery.isLoading && !conversationsQuery.isError && !conversation ? (
        <div className="messages-empty-state">
          <h2>没有找到这条会话</h2>
          <p>请从消息中心重新进入私信详情。</p>
          <Link to="/messages">回到消息中心</Link>
        </div>
      ) : null}

      {conversation ? (
        <section className="message-detail-layout">
          <div className="message-chat-panel">
            <header className="message-chat-header">
              <span className={classNames('message-avatar large', meta?.online && 'online')}>
                {conversation.targetNickname[0]}
              </span>
              <div className="message-peer">
                <strong>{conversation.targetNickname}</strong>
                <span>
                  {meta?.online ? '在线' : '离线'}
                  {meta?.sellerVerified ? <em>已认证</em> : null}
                </span>
              </div>
              <div className="message-product-card">
                {meta?.itemCoverImageUrl ? <img src={meta.itemCoverImageUrl} alt="" /> : null}
                <span>
                  <strong>{conversation.itemTitle}</strong>
                  <small>{meta ? formatPrice(meta.itemPriceCent) : '价格待确认'}</small>
                </span>
                <a href={`/items/${conversation.itemId}`}>查看商品</a>
              </div>
            </header>

            <div className="message-timeline" aria-label="聊天记录">
              {messagesQuery.isLoading ? (
                <div className="message-loading">消息加载中...</div>
              ) : (
                messages.map((message, index) => (
                  <MessageBubble
                    message={message}
                    previousMessage={messages[index - 1]}
                    reduceMotion={shouldReduceMotion}
                    targetName={conversation.targetNickname}
                    key={message.id}
                  />
                ))
              )}
              <div ref={messageEndRef} />
            </div>

            <footer className="message-composer">
              <div className="quick-replies" aria-label="快捷回复">
                <span>快捷回复</span>
                {quickReplies.map((reply) => (
                  <button type="button" onClick={() => setDraft(reply)} key={reply}>
                    {reply}
                  </button>
                ))}
              </div>
              <form
                className="message-input-row"
                onSubmit={(event) => {
                  event.preventDefault()
                  submitMessage()
                }}
              >
                <input
                  aria-label="输入消息"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="输入消息..."
                  maxLength={1000}
                />
                <button type="button" aria-label="选择表情" className="message-tool-button">
                  <Smile size={25} />
                </button>
                <button type="button" aria-label="添加图片" className="message-tool-button">
                  <Image size={25} />
                </button>
                <button type="submit" className="message-send-button" disabled={!draft.trim() || sendMutation.isPending}>
                  <Send size={24} />
                  发送
                </button>
              </form>
            </footer>
          </div>

          <aside className="trade-reminder-panel">
            <h2>交易提醒</h2>
            <span className="painted-asset message-panel-art message-panel-art--trade" aria-hidden="true">
              <img src={tradeReminderImage} alt="" />
            </span>
            <ReminderPoint icon={<MapPin size={22} />} title="确认地点后再交易" text="请选择安全的交易地点" />
            <ReminderPoint icon={<MessageCircle size={22} />} title="保留聊天记录" text="交易过程更有保障" />
            <ReminderPoint icon={<ShieldCheck size={22} />} title="不要提前转账" text="谨防诈骗，保护财产安全" />
            <div className="trade-note">
              <Info size={20} />
              <span>
                <strong>消息可关联商品</strong>
                <small>点击商品可快速查看详情</small>
              </span>
            </div>
          </aside>
        </section>
      ) : null}
    </MarketplaceShell>
  )
}

interface MessageBubbleProps {
  message: MessageSummary
  previousMessage?: MessageSummary
  reduceMotion: boolean
  targetName: string
}

function MessageBubble({ message, previousMessage, reduceMotion, targetName }: MessageBubbleProps) {
  const isMine = message.senderId === mockCurrentUserId
  const showTime = !previousMessage || previousMessage.createdAt !== message.createdAt

  return (
    <motion.div
      className={classNames('message-group', isMine && 'mine')}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {showTime ? <time dateTime={message.createdAt}>今天 {formatMessageTime(message.createdAt)}</time> : null}
      <div className="message-bubble-row">
        {!isMine ? <span className="message-avatar small">{targetName[0]}</span> : null}
        <p>{message.content}</p>
        {isMine ? <span className="message-avatar small">海</span> : null}
      </div>
    </motion.div>
  )
}

interface ReminderPointProps {
  icon: ReactNode
  title: string
  text: string
}

function ReminderPoint({ icon, title, text }: ReminderPointProps) {
  return (
    <div className="reminder-point">
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  )
}

function formatPrice(priceCent: number) {
  return `¥${(priceCent / 100).toFixed(2)}`
}

function formatMessageTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
