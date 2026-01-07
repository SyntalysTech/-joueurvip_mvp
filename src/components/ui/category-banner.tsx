'use client'

import Image from 'next/image'
import { getCategoryIcon } from './icons'

// Imágenes curadas de Unsplash - cada una elegida específicamente para su categoría
const categoryData: Record<string, { image: string }> = {
  'conciergerie-reservations': {
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'achat-vente': {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'administratif': {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'services-prives': {
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'medical': {
    image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'bien-etre': {
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'assurances-banques': {
    image: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&h=300&fit=crop&crop=center&q=80',
  },
  'autre': {
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop&crop=center&q=80',
  },
}

const defaultData = {
  image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop&crop=center&q=80',
}

interface CategoryBannerProps {
  slug: string
  name: string
  icon?: string
  variant?: 'full' | 'compact' | 'card'
  className?: string
}

export function CategoryBanner({
  slug,
  name,
  icon,
  variant = 'full',
  className = ''
}: CategoryBannerProps) {
  const data = categoryData[slug] || defaultData
  const Icon = icon ? getCategoryIcon(icon) : null

  if (variant === 'card') {
    return (
      <div className={`group relative overflow-hidden rounded-lg h-64 ${className}`}>
        <Image
          src={data.image}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-colors" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="text-lg font-bold text-white drop-shadow-lg">
            {name}
          </span>
        </div>
        <div className="absolute inset-0 rounded-lg ring-1 ring-white/10 group-hover:ring-[rgb(var(--color-accent))] transition-all" />
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-4 p-4 rounded-xl bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] ${className}`}>
        {/* Thumbnail de la imagen */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={data.image}
            alt={name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        {/* Info */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-accent))]/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-[rgb(var(--color-accent))]" />
            </div>
          )}
          <span className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
            {name}
          </span>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`relative overflow-hidden rounded-xl h-28 ${className}`}>
      <Image
        src={data.image}
        alt={name}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center px-5">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="text-base font-semibold text-white">
          {name}
        </span>
      </div>
    </div>
  )
}
