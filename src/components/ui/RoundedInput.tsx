import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface RoundedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
  label?: string
  error?: string
}

export const RoundedInput = forwardRef<HTMLInputElement, RoundedInputProps>(
  ({ icon, label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-primary pl-1">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center gap-3 bg-white border rounded-[12px] px-4 h-[52px] transition-colors',
            error
              ? 'border-red-400 focus-within:border-red-500'
              : 'border-border-light focus-within:border-accent-blue',
            className
          )}
        >
          {icon && <span className="text-text-secondary shrink-0">{icon}</span>}
          <input
            ref={ref}
            className="flex-1 text-sm text-text-primary bg-transparent outline-none placeholder:text-text-secondary/70"
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
      </div>
    )
  }
)

RoundedInput.displayName = 'RoundedInput'
