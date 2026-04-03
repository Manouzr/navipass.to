import { OrderStatus } from '@prisma/client'
import { Check, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDate } from '@/lib/utils'

const STEPS: { status: OrderStatus; label: string; sublabel: string }[] = [
  { status: 'PENDING', label: 'Commande passée', sublabel: 'Commande créée' },
  { status: 'PAID', label: 'Paiement confirmé', sublabel: 'Stripe' },
  { status: 'PROCESSING', label: 'En traitement', sublabel: 'Préparation du compte' },
  { status: 'DELIVERED', label: 'Compte livré', sublabel: 'Identifiants envoyés' },
]

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING: 0,
  PAID: 1,
  PROCESSING: 2,
  DELIVERED: 3,
}

interface OrderTimelineProps {
  status: OrderStatus
  createdAt: Date
  stripePaidAt?: Date | null
  deliveredAt?: Date | null
}

export function OrderTimeline({ status, createdAt, stripePaidAt, deliveredAt }: OrderTimelineProps) {
  const currentIndex = STATUS_ORDER[status]

  const dates: Record<string, Date | null> = {
    PENDING: createdAt,
    PAID: stripePaidAt ?? null,
    PROCESSING: stripePaidAt ?? null,
    DELIVERED: deliveredAt ?? null,
  }

  return (
    <div className="space-y-0">
      {STEPS.map((step, i) => {
        const stepIndex = i
        const isDone = stepIndex <= currentIndex
        const isCurrent = stepIndex === currentIndex
        const isLast = i === STEPS.length - 1
        const date = dates[step.status]

        return (
          <div key={step.status} className="flex gap-4">
            {/* Timeline dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 z-10',
                  isDone
                    ? 'bg-green-500'
                    : isCurrent
                    ? 'bg-accent-blue border-2 border-accent-blue'
                    : 'bg-gray-200'
                )}
              >
                {isDone ? (
                  <Check size={13} className="text-white" />
                ) : (
                  <Clock size={13} className={isCurrent ? 'text-white' : 'text-gray-400'} />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 my-1',
                    stepIndex < currentIndex ? 'bg-green-400' : 'bg-gray-200'
                  )}
                  style={{ minHeight: '24px' }}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4', isLast ? 'pb-0' : '')}>
              <p
                className={cn(
                  'text-sm font-semibold',
                  isDone ? 'text-text-primary' : 'text-text-secondary'
                )}
              >
                {step.label}
              </p>
              {date && isDone ? (
                <p className="text-xs text-text-secondary mt-0.5">{formatDate(date)}</p>
              ) : (
                <p className="text-xs text-text-secondary/60 mt-0.5">{step.sublabel}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
