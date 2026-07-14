import type { ReactNode } from 'react'
import { useState } from 'react'
import { MarketplaceShell } from './MarketplaceShell'

interface UnifiedMarketplacePageProps {
  activeCategoryLabel?: string
  activeUserLabel?: string
  children: ReactNode
  keyword?: string
  onKeywordChange?: (value: string) => void
  onSearch?: () => void
}

export function UnifiedMarketplacePage({
  activeCategoryLabel,
  activeUserLabel,
  children,
  keyword,
  onKeywordChange,
  onSearch,
}: UnifiedMarketplacePageProps) {
  const [internalKeyword, setInternalKeyword] = useState('')
  const resolvedKeyword = keyword ?? internalKeyword
  const changeKeyword = onKeywordChange ?? setInternalKeyword

  return (
    <MarketplaceShell
      activeCategoryLabel={activeCategoryLabel}
      activeUserLabel={activeUserLabel}
      keyword={resolvedKeyword}
      mainClassName="unified-marketplace-content"
      onKeywordChange={changeKeyword}
      onSearch={onSearch ?? (() => undefined)}
      searchLabel="搜索商品"
      searchPlaceholder="搜索商品名称、类别、关键词..."
    >
      {children}
    </MarketplaceShell>
  )
}
