import { motion, useReducedMotion } from 'motion/react'
import type { PropsWithChildren } from 'react'

interface FadeInProps extends PropsWithChildren {
  className?: string
}

export function FadeIn({ children, className }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
