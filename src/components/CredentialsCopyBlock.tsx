'use client'

import { useState } from 'react'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Props {
  accountEmail: string
  accountPassword: string
  accountExpiry: Date | null
}

export function CredentialsCopyBlock({ accountEmail, accountPassword, accountExpiry }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  async function copy(text: string, field: string) {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  async function copyAll() {
    await copy(`Email: ${accountEmail}\nMot de passe: ${accountPassword}`, 'all')
  }

  return (
    <div className="rounded-[16px] overflow-hidden" style={{ border: '1px solid #BBF7D0', background: '#F0FDF4' }}>
      <div className="px-4 py-3 border-b border-green-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Identifiants IDF Mobilités</p>
          {accountExpiry && (
            <p className="text-xs text-green-600 mt-0.5">Expire le {formatDate(accountExpiry)}</p>
          )}
        </div>
        <span className="text-lg">🎉</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Email */}
        <div className="bg-white rounded-[12px] border border-green-200 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wider">Email</p>
            <p className="text-sm font-bold text-text-primary mt-0.5 font-mono">{accountEmail}</p>
          </div>
          <button
            onClick={() => copy(accountEmail, 'email')}
            className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
          >
            {copiedField === 'email' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-green-700" />}
          </button>
        </div>

        {/* Password */}
        <div className="bg-white rounded-[12px] border border-green-200 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wider">Mot de passe</p>
            <p className="text-sm font-bold text-text-primary mt-0.5 font-mono">
              {showPassword ? accountPassword : '••••••••••'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
            >
              {showPassword ? <EyeOff size={14} className="text-green-700" /> : <Eye size={14} className="text-green-700" />}
            </button>
            <button
              onClick={() => copy(accountPassword, 'password')}
              className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
            >
              {copiedField === 'password' ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-green-700" />}
            </button>
          </div>
        </div>

        {/* Copy all */}
        <button
          onClick={copyAll}
          className="w-full rounded-full py-3 text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: '#16A34A' }}
        >
          {copiedField === 'all' ? <><Check size={15} /> Copié !</> : <><Copy size={15} /> Copier les identifiants</>}
        </button>
      </div>
    </div>
  )
}
