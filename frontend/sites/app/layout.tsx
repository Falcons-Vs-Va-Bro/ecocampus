/* oxlint-disable react/only-export-components -- Next metadata belongs beside the layout component. */
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '厦大闲置',
  description: '厦门大学校园闲置物品智慧流转平台',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
