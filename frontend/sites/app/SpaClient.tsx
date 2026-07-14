'use client'

import dynamic from 'next/dynamic'
import 'antd/dist/reset.css'
import '../../src/index.css'
import '../../src/styles/marketplace-consistency.css'

const Application = dynamic(() => import('../../src/app/App'), {
  ssr: false,
  loading: () => <main aria-busy="true" aria-label="正在加载厦大闲置" />,
})

export function SpaClient() {
  return <Application />
}
