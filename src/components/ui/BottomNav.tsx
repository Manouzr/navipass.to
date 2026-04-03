'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Package, User } from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/commander', label: 'Commander', icon: ShoppingBag },
  { href: '/suivi', label: 'Suivi', icon: Package },
  { href: '/profil', label: 'Profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) return null

  return (
    <motion.nav
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
    >
      <div
        className="w-full max-w-[430px]"
        style={{
          background: '#1C1C1E',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <LayoutGroup>
          <div className="flex h-[56px]">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-1 flex-col items-center justify-center gap-[3px] relative"
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                      style={{ background: '#4BAFD4' }}
                    />
                  )}

                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="flex flex-col items-center gap-[3px]"
                  >
                    <motion.div
                      animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.5 : 1.8}
                        style={{ color: isActive ? '#4BAFD4' : '#636366' }}
                      />
                    </motion.div>
                    <span
                      className="text-[9px] font-medium"
                      style={{ color: isActive ? '#4BAFD4' : '#636366' }}
                    >
                      {label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </LayoutGroup>
      </div>
    </motion.nav>
  )
}
