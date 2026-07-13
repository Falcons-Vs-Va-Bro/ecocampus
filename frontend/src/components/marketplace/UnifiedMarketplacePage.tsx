import type { ReactNode } from 'react'
import { useState } from 'react'
import { MarketplaceShell } from './MarketplaceShell'

interface UnifiedMarketplacePageProps {
  activeUserLabel: string
  children: ReactNode
}

export function UnifiedMarketplacePage({ activeUserLabel, children }: UnifiedMarketplacePageProps) {
  const [keyword, setKeyword] = useState('')

  return (
    <MarketplaceShell
      activeUserLabel={activeUserLabel}
      keyword={keyword}
      mainClassName="unified-marketplace-content"
      onKeywordChange={setKeyword}
      onSearch={() => undefined}
      searchLabel="搜索商品"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      {children}
    </MarketplaceShell>
  )
}
