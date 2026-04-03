'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors rounded-full px-3 py-2 text-sm font-medium text-text-primary"
    >
      {copied ? (
        <>
          <Check size={14} className="text-green-500" />
          <span className="text-green-600">Copié !</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          Copier
        </>
      )}
    </button>
  )
}
