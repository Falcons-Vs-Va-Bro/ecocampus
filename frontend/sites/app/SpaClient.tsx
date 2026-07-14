'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'
import 'antd/dist/reset.css'
import '../../src/index.css'
import '../../src/styles/marketplace-consistency.css'

export function SpaClient() {
  const [Application, setApplication] = useState<ComponentType | null>(null)

  useEffect(() => {
    let mounted = true

    import('../../src/app/App').then(({ default: App }) => {
      if (mounted) {
        setApplication(() => App)
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  if (!Application) {
    return <main aria-busy="true" aria-label="正在加载厦大闲置" />
  }

  return <Application />
}
