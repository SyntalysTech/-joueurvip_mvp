'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { PlayerHeader } from '@/components/layout/player-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CategoryBanner } from '@/components/ui/category-banner'
import { ChevronRight, ChevronLeft, Loader2 } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { Category, Service } from '@/types/database'

function NouvelleDemandContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  const { user, isLoading: authLoading } = useAuthStore()

  const [step, setStep] = useState<'category' | 'service' | 'details'>(
    categorySlug ? 'service' : 'category'
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadCategories = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (data) {
        setCategories(data)

        if (categorySlug) {
          const cat = data.find((c: Category) => c.slug === categorySlug)
          if (cat) {
            setSelectedCategory(cat)
          }
        }
      }
      setIsLoading(false)
    }

    loadCategories()
  }, [categorySlug, user, authLoading])

  useEffect(() => {
    const loadServices = async () => {
      if (!selectedCategory) return

      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('category_id', selectedCategory.id)
        .eq('is_active', true)
        .order('display_order')

      if (data) {
        setServices(data)
      }
    }

    loadServices()
  }, [selectedCategory])

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setSelectedService(null)
    setStep('service')
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('details')
  }

  const handleBack = () => {
    if (step === 'details') {
      setStep('service')
    } else if (step === 'service') {
      setSelectedCategory(null)
      setStep('category')
    }
  }

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedService || !user) return

    setIsSubmitting(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('requests')
      .insert({
        player_id: user.id,
        category_id: selectedCategory.id,
        service_id: selectedService.id,
        title: selectedService.name_fr,
        description: description || null,
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setIsSubmitting(false)
      return
    }

    router.push(`/joueur/demandes/${data.id}`)
  }

  const getTitle = () => {
    switch (step) {
      case 'category':
        return 'Nouvelle demande'
      case 'service':
        return selectedCategory?.name_fr || 'Service'
      case 'details':
        return 'Détails'
    }
  }

  if (isLoading || authLoading) {
    return (
      <>
        <PlayerHeader title="Nouvelle demande" />
        <main className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-[rgb(var(--color-accent))] animate-spin" />
        </main>
      </>
    )
  }

  return (
    <>
      <PlayerHeader title={getTitle()} />

      <main className="px-5 py-6 animate-fade-in">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {['category', 'service', 'details'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1 rounded-full transition-colors',
                ['category', 'service', 'details'].indexOf(step) >= i
                  ? 'bg-[rgb(var(--color-accent))]'
                  : 'bg-[rgb(var(--color-border-primary))]'
              )}
            />
          ))}
        </div>

        {/* Back button */}
        {step !== 'category' && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] mb-5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </button>
        )}

        {/* Step: Category - Grid de banners */}
        {step === 'category' && (
          <div className="space-y-4">
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              Sélectionnez une catégorie
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="text-left transition-transform active:scale-[0.97]"
                >
                  <CategoryBanner
                    slug={category.slug}
                    name={category.name_fr}
                    icon={category.icon}
                    variant="card"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Service */}
        {step === 'service' && selectedCategory && (
          <div className="space-y-5">
            {/* Category Banner */}
            <CategoryBanner
              slug={selectedCategory.slug}
              name={selectedCategory.name_fr}
              icon={selectedCategory.icon}
              variant="compact"
            />

            <p className="text-[rgb(var(--color-text-secondary))]">
              Sélectionnez un service
            </p>

            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="flex items-center justify-between w-full p-4 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl hover:border-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-bg-secondary))] transition-all text-left group"
                >
                  <span className="font-medium text-[rgb(var(--color-text-primary))]">
                    {service.name_fr}
                  </span>
                  <ChevronRight className="w-5 h-5 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-accent))] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Details */}
        {step === 'details' && selectedService && selectedCategory && (
          <div className="space-y-6">
            {/* Selected info with banner */}
            <div className="relative overflow-hidden rounded-2xl bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))]">
              <div className="p-5">
                <p className="text-xs text-[rgb(var(--color-text-muted))] uppercase tracking-wider mb-1">
                  {selectedCategory.name_fr}
                </p>
                <p className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                  {selectedService.name_fr}
                </p>
              </div>
              <div className="h-1 bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent))]/50" />
            </div>

            {/* Description */}
            <Textarea
              label="Détails de votre demande (optionnel)"
              placeholder="Précisez vos besoins, dates, préférences..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[160px]"
            />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Envoyer la demande
            </Button>

            <p className="text-center text-sm text-[rgb(var(--color-text-muted))]">
              Votre concierge traitera votre demande dans les plus brefs délais
            </p>
          </div>
        )}
      </main>
    </>
  )
}

export default function NouvelleDemandePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[rgb(var(--color-accent))] animate-spin" />
      </div>
    }>
      <NouvelleDemandContent />
    </Suspense>
  )
}
