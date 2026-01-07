// Imágenes de alta calidad de Unsplash para cada categoría
// Basado en los slugs reales de la base de datos

export const categoryImages: Record<string, string> = {
  // Conciergerie & Réservations - Hotel de lujo
  'conciergerie-reservations': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop&q=80',

  // Achat-Vente - Shopping de lujo
  'achat-vente': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop&q=80',

  // Administratif - Oficina elegante
  'administratif': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop&q=80',

  // Services (antes Services Privés) - Servicio premium
  'services-prives': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=400&fit=crop&q=80',

  // Santé (antes Medical) - Salud y bienestar médico
  'medical': 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=400&fit=crop&q=80',

  // Bien-être - Spa y wellness
  'bien-etre': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=400&fit=crop&q=80',

  // Assurances & Banques - Finanzas
  'assurances-banques': 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=400&fit=crop&q=80',

  // Autre - Abstracto elegante
  'autre': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop&q=80',
}

// Imagen por defecto elegante (gradiente abstracto)
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop&q=80'

export function getCategoryImage(slug: string): string {
  return categoryImages[slug] || DEFAULT_IMAGE
}
