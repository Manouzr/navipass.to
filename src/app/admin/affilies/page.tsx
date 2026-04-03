import Link from 'next/link'
import { ArrowLeft, Users, TrendingUp, Clock } from 'lucide-react'
import { requireAdmin } from '@/actions/admin'
import { adminGetAffiliates, adminUpdateAffiliateStatus, adminDebitAffiliateBalance } from '@/actions/affiliate'
import { Card } from '@/components/ui/Card'
import { formatPrice, formatDate } from '@/lib/utils'
import { AffiliateStatus } from '@prisma/client'

export default async function AdminAffiliatesPage() {
  await requireAdmin()
  const affiliates = await adminGetAffiliates()

  const totalBalance = affiliates.reduce((s, a) => s + a.balance, 0)
  const totalEarned = affiliates.reduce((s, a) => s + a.totalEarned, 0)
  const activeCount = affiliates.filter((a) => a.status === 'ACTIVE').length

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-white border-b border-border-light px-6 py-4 flex items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={16} className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Affiliés</h1>
          <p className="text-xs text-text-secondary">{affiliates.length} compte{affiliates.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-5xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <Card padding="md">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Users size={20} className="text-accent-blue" />
            </div>
            <p className="text-xs text-text-secondary">Affiliés actifs</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{activeCount}</p>
          </Card>
          <Card padding="md">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-purple-500" />
            </div>
            <p className="text-xs text-text-secondary">Total commissions</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{formatPrice(totalEarned)}</p>
          </Card>
          <Card padding="md">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <Clock size={20} className="text-amber-500" />
            </div>
            <p className="text-xs text-text-secondary">Soldes en attente</p>
            <p className="text-xl font-bold text-text-primary mt-0.5">{formatPrice(totalBalance)}</p>
          </Card>
        </div>

        {/* Affiliates list */}
        <Card padding="sm">
          {affiliates.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">Aucun affilié enregistré</p>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {affiliates.map((affiliate) => (
                <div key={affiliate.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-text-primary">
                          {affiliate.firstName} {affiliate.lastName}
                        </span>
                        <StatusPill status={affiliate.status as AffiliateStatus} />
                      </div>
                      <p className="text-xs text-text-secondary">{affiliate.email}</p>
                      <p className="text-xs text-text-secondary font-mono mt-0.5">Code : {affiliate.code}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary">{formatPrice(affiliate.balance)}</p>
                      <p className="text-xs text-text-secondary">solde</p>
                      <p className="text-xs text-text-secondary">{affiliate._count.referrals} parrainage{affiliate._count.referrals !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {affiliate.status !== 'ACTIVE' && (
                      <StatusAction id={affiliate.id} newStatus="ACTIVE" label="Activer" color="green" />
                    )}
                    {affiliate.status !== 'SUSPENDED' && (
                      <StatusAction id={affiliate.id} newStatus="SUSPENDED" label="Suspendre" color="red" />
                    )}
                    {affiliate.status !== 'PENDING' && (
                      <StatusAction id={affiliate.id} newStatus="PENDING" label="Mettre en attente" color="gray" />
                    )}
                    {affiliate.balance > 0 && (
                      <DebitForm id={affiliate.id} balance={affiliate.balance} />
                    )}
                  </div>

                  <p className="text-xs text-text-secondary">Inscrit le {formatDate(affiliate.createdAt)} · Total gagné : {formatPrice(affiliate.totalEarned)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: AffiliateStatus }) {
  const map: Record<AffiliateStatus, { label: string; class: string }> = {
    ACTIVE: { label: 'Actif', class: 'bg-green-100 text-green-700' },
    SUSPENDED: { label: 'Suspendu', class: 'bg-red-100 text-red-700' },
    PENDING: { label: 'En attente', class: 'bg-amber-100 text-amber-700' },
  }
  const { label, class: cls } = map[status]
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
  )
}

function StatusAction({
  id,
  newStatus,
  label,
  color,
}: {
  id: string
  newStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  label: string
  color: 'green' | 'red' | 'gray'
}) {
  const colorMap = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
    gray: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  }
  return (
    <form
      action={async () => {
        'use server'
        await adminUpdateAffiliateStatus(id, newStatus)
      }}
    >
      <button
        type="submit"
        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${colorMap[color]}`}
      >
        {label}
      </button>
    </form>
  )
}

function DebitForm({ id, balance }: { id: string; balance: number }) {
  return (
    <form
      className="flex items-center gap-1.5"
      action={async (fd: FormData) => {
        'use server'
        const amount = parseInt(fd.get('amount') as string)
        if (amount > 0) await adminDebitAffiliateBalance(id, amount)
      }}
    >
      <input
        name="amount"
        type="number"
        min="1"
        max={balance}
        defaultValue={balance}
        className="w-24 text-xs border border-border-light rounded-lg px-2 py-1.5 outline-none"
        placeholder="Montant (cts)"
      />
      <button
        type="submit"
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
      >
        Débiter
      </button>
    </form>
  )
}
