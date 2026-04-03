'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

interface CTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: ReactNode
}

export function CTAButton({
  loading,
  variant = 'primary',
  icon,
  className,
  children,
  disabled,
  ...props
}: CTAButtonProps) {
  const variants = {
    primary: 'bg-accent-cta hover:bg-accent-cta-hover text-white',
    secondary: 'bg-accent-blue hover:bg-[#005f8f] text-white',
    ghost: 'bg-transparent border-2 border-accent-cta text-accent-cta hover:bg-accent-cta/5',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'w-full flex items-center justify-center gap-2 rounded-full px-6 py-[14px] text-base font-semibold transition-all active:scale-95',
        variants[variant],
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
