'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function TestPage() {
  const [status, setStatus] = useState('Iniciando...')
  const [categories, setCategories] = useState<unknown[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const test = async () => {
      // Clear any corrupted tokens
      setStatus('Limpiando tokens...')
      localStorage.removeItem('sb-dgqbvbxcfitztjttbbox-auth-token')
      sessionStorage.clear()

      setStatus('Creando cliente Supabase...')
      const supabase = createBrowserClient(
        'https://dgqbvbxcfitztjttbbox.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncWJ2YnhjZml0enRqdHRiYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NzIwNzAsImV4cCI6MjA4MzM0ODA3MH0.0cgWbpuRPtUEGSwVGA9jB9WMQU5OxGka8r45HnrqQZ4'
      )

      setStatus('Haciendo query a categories...')
      console.log('Starting query...')

      try {
        const startTime = Date.now()
        const { data, error: queryError } = await supabase
          .from('categories')
          .select('id, name_fr, slug')
          .limit(5)

        const duration = Date.now() - startTime
        console.log('Query completed in', duration, 'ms')

        if (queryError) {
          setError(`Error: ${queryError.message}`)
          setStatus(`Error después de ${duration}ms`)
        } else {
          setCategories(data || [])
          setStatus(`Completado en ${duration}ms - ${data?.length || 0} categorías`)
        }
      } catch (e) {
        console.error('Exception:', e)
        setError(`Exception: ${e instanceof Error ? e.message : 'Unknown'}`)
        setStatus('Exception durante query')
      }
    }

    test()
  }, [])

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Test Supabase Connection</h1>

      <div className="mb-4">
        <p className="text-lg">Status: <span className="text-yellow-400">{status}</span></p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded mb-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="p-4 bg-green-900/50 border border-green-500 rounded">
          <h2 className="font-bold mb-2">Categories encontradas:</h2>
          <ul className="list-disc pl-4">
            {categories.map((cat: unknown) => {
              const c = cat as { id: string; name_fr: string; slug: string }
              return (
                <li key={c.id}>{c.name_fr} ({c.slug})</li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={() => {
            localStorage.clear()
            sessionStorage.clear()
            document.cookie.split(";").forEach(c => {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
            })
            alert('Storage y cookies limpiadas!')
            window.location.reload()
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded mr-4"
        >
          Limpiar TODO el storage
        </button>
        <button
          onClick={() => window.location.href = '/connexion'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Ir a Connexion
        </button>
      </div>
    </div>
  )
}
