import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/cn'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: { label: 'En attente', bg: 'bg-gray-100', text: 'text-gray-500' },
  PAID: { label: 'Payée', bg: 'bg-blue-100', text: 'text-blue-700' },
  PROCESSING: { label: 'En traitement', bg: 'bg-amber-100', text: 'text-amber-700' },
  DELIVERED: { label: 'Livrée', bg: 'bg-green-100', text: 'text-green-800' },
}

interface StatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  )
}
