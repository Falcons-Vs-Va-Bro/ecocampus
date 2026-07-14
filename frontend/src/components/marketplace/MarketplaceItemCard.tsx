import { CheckCircle2, Heart } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import './MarketplaceShell.css'

interface MarketplaceItemCardProps {
  actions: ReactNode
  checkbox?: ReactNode
  className?: string
  coverImageUrl?: string
  deliveryText: string
  favoriteActive?: boolean
  favoriteLabel: string
  meta?: ReactNode
  motionIndex: number
  onFavoriteClick?: () => void
  priceLabel: string
  reduceMotion: boolean | null
  sellerName: string
  title: string
  verificationText: string
}

export function MarketplaceItemCard({
  actions,
  checkbox,
  className,
  coverImageUrl,
  deliveryText,
  favoriteActive = true,
  favoriteLabel,
  meta,
  motionIndex,
  onFavoriteClick,
  priceLabel,
  reduceMotion,
  sellerName,
  title,
  verificationText,
}: MarketplaceItemCardProps) {
  return (
    <motion.article
      className={classNames('favorite-card', className)}
      initial={reduceMotion ? false : { opacity: 0, y: 18, rotate: -0.45 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.34, delay: 0.48 + motionIndex * 0.045, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4, rotate: motionIndex % 2 === 0 ? -0.25 : 0.25 }}
    >
      {checkbox}
      <button
        type="button"
        className={favoriteActive ? 'heart-button active' : 'heart-button'}
        aria-label={favoriteLabel}
        onClick={onFavoriteClick}
      >
        <Heart size={18} fill={favoriteActive ? 'currentColor' : 'none'} />
      </button>
      <div className="favorite-image">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            loading={motionIndex < 4 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={motionIndex === 0 ? 'high' : 'auto'}
            width="360"
            height="240"
          />
        ) : (
          <span className="favorite-image-placeholder">待上传</span>
        )}
      </div>
      <h2>{title}</h2>
      <strong>{priceLabel}</strong>
      <div className="seller-line">
        <span>{sellerName}</span>
        <CheckCircle2 size={15} />
        <em>{verificationText}</em>
        <b>{deliveryText}</b>
      </div>
      {meta}
      {actions}
    </motion.article>
  )
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
