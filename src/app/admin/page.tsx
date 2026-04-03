'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail } from 'lucide-react'
import { loginAdmin } from '@/actions/admin'

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await loginAdmin(fd)

    if (result && !result.success) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-accent-blue rounded-[18px] items-center justify-center mb-3">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Admin NaviPass</h1>
          <p className="text-sm text-text-secondary mt-1">Panneau d'administration</p>
        </div>

        <div className="bg-white rounded-[20px] shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Email</label>
              <div className="flex items-center gap-3 border border-border-light rounded-[12px] px-4 h-[52px] focus-within:border-accent-blue transition-colors">
                <Mail size={16} className="text-text-secondary" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="admin@navipass.fr"
                  className="flex-1 text-sm outline-none bg-transparent text-text-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Mot de passe</label>
              <div className="flex items-center gap-3 border border-border-light rounded-[12px] px-4 h-[52px] focus-within:border-accent-blue transition-colors">
                <Lock size={16} className="text-text-secondary" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="flex-1 text-sm outline-none bg-transparent text-text-primary"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-blue hover:bg-[#005f8f] text-white font-semibold py-3.5 rounded-full transition-colors disabled:opacity-60"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
