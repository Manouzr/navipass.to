'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isIOSPrompt, setIsIOSPrompt] = useState(false)

  useEffect(() => {
    // Detect iOS Safari (no beforeinstallprompt event)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const inStandaloneMode = ('standalone' in navigator) && (navigator as { standalone?: boolean }).standalone

    if (ios && !inStandaloneMode) {
      setIsIOS(true)
      const dismissed = localStorage.getItem('pwa-ios-dismissed')
      if (!dismissed) {
        // Show after 3s
        setTimeout(() => setShow(true), 3000)
      }
      return
    }

    // Android/Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const dismissed = localStorage.getItem('pwa-prompt-dismissed')
      if (!dismissed) {
        setTimeout(() => setShow(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    setShow(false)
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-prompt-dismissed', '1')
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
      setDeferredPrompt(null)
    }
  }

  if (!show) return null

  // iOS manual instructions
  if (isIOS) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-[72px] left-0 right-0 z-[60] flex justify-center px-4 lg:hidden"
        >
          <div
            className="w-full max-w-[400px] rounded-[20px] p-4 shadow-2xl"
            style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0" style={{ background: '#0A1628' }}>
                <img src="/icons/icon-192.png" alt="NaviPass" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Installer NaviPass</p>
                <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                  Appuyez sur{' '}
                  <span className="inline-flex items-center gap-1 text-white/70 font-medium">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    Partager
                  </span>{' '}
                  puis{' '}
                  <span className="text-white/70 font-medium">«&nbsp;Sur l&apos;écran d&apos;accueil&nbsp;»</span>
                </p>
              </div>
              <button onClick={dismiss} className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <X size={13} className="text-white/60" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Android/Chrome prompt
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-[72px] left-0 right-0 z-[60] flex justify-center px-4 lg:hidden"
      >
        <div
          className="w-full max-w-[400px] rounded-[20px] p-4 shadow-2xl"
          style={{ background: '#1C1C1E', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] overflow-hidden shrink-0" style={{ background: '#0A1628' }}>
              <img src="/icons/icon-192.png" alt="NaviPass" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Installer NaviPass</p>
              <p className="text-xs text-white/50">Accès rapide depuis votre écran d&apos;accueil</p>
            </div>
            <button onClick={dismiss} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mr-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <X size={14} className="text-white/50" />
            </button>
            <button
              onClick={install}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shrink-0"
              style={{ background: '#4BAFD4', color: '#0A1628' }}
            >
              <Download size={14} />
              Installer
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
