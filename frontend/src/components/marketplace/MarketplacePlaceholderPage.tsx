import { ArrowRight, FileJson2, LockKeyhole, Route, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import type { RouteMeta } from '../../types/routes'
import { MarketplaceShell } from './MarketplaceShell'

interface MarketplacePlaceholderPageProps {
  meta: RouteMeta
}

const moduleLabel = {
  public: '前台公开',
  user: '用户中心',
  admin: '后台管理',
}

const guardLabel = {
  public: '公开浏览',
  auth: '登录后访问',
  verified: '校园核验后访问',
  owner: '仅所有者可操作',
  admin: '管理员访问',
  interaction: '浏览公开，互动需登录',
}

const activeCategoryByPath: Record<string, string> = {
  '/': '首页',
  '/items': '全部分类',
  '/items/:id': '全部分类',
  '/demands': '全部分类',
}

const activeUserByPath: Record<string, string> = {
  '/favorites': '我的收藏',
  '/items/mine': '我的发布',
  '/items/:id/edit': '我的发布',
  '/messages': '消息中心',
  '/messages/:conversationId': '消息中心',
  '/orders': '购买订单',
  '/orders/sales': '出售订单',
  '/profile': '个人中心',
  '/verify': '个人中心',
}

export function MarketplacePlaceholderPage({ meta }: MarketplacePlaceholderPageProps) {
  useDocumentTitle(`厦大闲置 - ${meta.title}`)

  const shouldReduceMotion = useReducedMotion()
  const [keyword, setKeyword] = useState('')

  return (
    <MarketplaceShell
      activeCategoryLabel={activeCategoryByPath[meta.path]}
      activeUserLabel={activeUserByPath[meta.path]}
      keyword={keyword}
      mainClassName="market-placeholder-main"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel={`搜索${meta.title}`}
      searchPlaceholder="搜索商品、求购、订单或会话..."
    >
      <motion.section
        className="favorites-heading market-placeholder-heading"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.36, delay: 0.24 }}
      >
        <div className="market-placeholder-kicker">
          <span>
            <Route size={15} />
            {meta.path}
          </span>
          <span>
            <LockKeyhole size={15} />
            {guardLabel[meta.guard]}
          </span>
        </div>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </motion.section>

      <section className="market-placeholder-grid">
        <motion.article
          className="market-placeholder-panel market-placeholder-panel--primary"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14, rotate: -0.2 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.34, delay: 0.34 }}
        >
          <header>
            <span className="student-avatar">建</span>
            <div>
              <strong>{moduleLabel[meta.module]}</strong>
              <small>页面正在接入业务 UI</small>
            </div>
          </header>
          <p>
            这个路由已经纳入前端契约，后续会在当前位置接入真实表单、列表、详情或工作台；目前先使用统一市场壳承接导航、搜索和权限语义。
          </p>
          <div className="market-placeholder-actions">
            <a href="/">回到首页</a>
            <a href="/favorites">查看收藏</a>
          </div>
        </motion.article>

        <motion.article
          className="market-placeholder-panel"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14, rotate: 0.2 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.34, delay: 0.42 }}
        >
          <header>
            <FileJson2 size={22} />
            <div>
              <strong>接口清单</strong>
              <small>按路由契约保留</small>
            </div>
          </header>
          <div className="market-endpoint-list">
            {meta.endpoints.map((endpoint) => (
              <div className="endpoint-row" key={endpoint}>
                <ArrowRight size={14} className="shrink-0 text-[#2f78bf]" />
                <span>{endpoint}</span>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          className="market-placeholder-panel market-placeholder-panel--wide"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.5 }}
        >
          <header>
            <Sparkles size={22} />
            <div>
              <strong>接入顺序</strong>
              <small>沿用 mock-first 开发方式</small>
            </div>
          </header>
          <ol className="market-placeholder-steps">
            <li>先补齐契约字段和本地 mock，确保页面可独立渲染。</li>
            <li>再接 TanStack Query 查询和 mutation，保持 API wrapper 作为边界。</li>
            <li>最后替换成真实业务 UI，并在桌面和 H5 宽度下检查文字与卡片。</li>
          </ol>
        </motion.article>
      </section>
    </MarketplaceShell>
  )
}
