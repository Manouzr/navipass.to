import { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ListItemProps {
  icon?: ReactNode
  iconBg?: string
  label: string
  sublabel?: string
  onClick?: () => void
  href?: string
  showChevron?: boolean
  rightContent?: ReactNode
  className?: string
}

export function ListItem({
  icon,
  iconBg = 'bg-blue-100',
  label,
  sublabel,
  onClick,
  showChevron = true,
  rightContent,
  className,
}: ListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 py-3.5 px-1 border-b border-border-light last:border-0 transition-colors hover:bg-gray-50 active:bg-gray-100 text-left',
        className
      )}
    >
      {icon && (
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', iconBg)}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {sublabel && <p className="text-xs text-text-secondary mt-0.5">{sublabel}</p>}
      </div>
      {rightContent ?? (showChevron && (
        <ChevronRight size={18} className="text-text-secondary shrink-0" />
      ))}
    </button>
  )
}
