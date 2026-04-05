import { Suspense } from 'react'
import Link from 'next/link'
import { LogOut, Package, Clock, CheckCircle, TrendingUp, Search, ChevronRight, Users, AlertTriangle } from 'lucide-react'
import { requireAdmin, getAdminStats, getAdminOrders, logoutAdmin } from '@/actions/admin'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatPrice, formatDate, PLAN_LABELS } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

interface Props {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  await requireAdmin()
  const sp = await searchParams

  const page = parseInt(sp.page ?? '1')
  const status = sp.status ?? 'ALL'
  const search = sp.search ?? ''

  const [stats, { orders, total, pages }] = await Promise.all([
    getAdminStats(),
    getAdminOrders({ page, status, search }),
  ])

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-white border-b border-border-light px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">NaviPass Admin</h1>
          <p className="text-xs text-text-secondary">Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/affilies"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-cta transition-colors"
          >
            <Users size={16} />
            Affiliés
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cta transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </form>
        </div>
      </div>

      <div className="p-5 space-y-5 max-w-5xl mx-auto">
        {/* Issues alert */}
        {stats.issues > 0 && (
          <Link
            href={`/admin/dashboard?status=DELIVERED`}
            className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3"
          >
            <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">
                {stats.issues} compte{stats.issues > 1 ? 's' : ''} signalé{stats.issues > 1 ? 's' : ''} défaillant{stats.issues > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-500">Cliquez pour voir les commandes concernées</p>
            </div>
            <ChevronRight size={16} className="text-red-400 shrink-0" />
          </Link>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            icon={<Package size={20} className="text-accent-blue" />}
            label="Total commandes"
            value={stats.total}
            bg="bg-blue-50"
          />
          <KPICard
            icon={<Clock size={20} className="text-amber-500" />}
            label="À traiter"
            value={stats.paid + stats.processing}
            bg="bg-amber-50"
          />
          <KPICard
            icon={<CheckCircle size={20} className="text-green-500" />}
            label="Livrées"
            value={stats.delivered}
            bg="bg-green-50"
          />
          <KPICard
            icon={<TrendingUp size={20} className="text-purple-500" />}
            label="Revenue"
            value={formatPrice(stats.revenue)}
            bg="bg-purple-50"
          />
        </div>

        {/* Filters */}
        <Card padding="sm">
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-2 flex-1 border border-border-light rounded-xl px-3 h-10">
              <Search size={15} className="text-text-secondary shrink-0" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Rechercher par nom, email, n° commande..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
            <select
              name="status"
              defaultValue={status}
              className="border border-border-light rounded-xl px-3 h-10 text-sm bg-white outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PAID">Payées</option>
              <option value="PROCESSING">En traitement</option>
              <option value="DELIVERED">Livrées</option>
            </select>
            <button
              type="submit"
              className="bg-accent-blue text-white rounded-xl px-5 h-10 text-sm font-medium hover:bg-[#005f8f] transition-colors"
            >
              Filtrer
            </button>
          </form>
        </Card>

        {/* Orders table */}
        <Card padding="sm">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-sm font-semibold text-text-primary">
              Commandes ({total})
            </h2>
          </div>

          <div className="space-y-0">
            {orders.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">Aucune commande trouvée</p>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/commande/${order.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-accent-blue">{order.orderNumber}</span>
                      <StatusBadge status={order.status as OrderStatus} />
                      {order.accountIssueReported && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          <AlertTriangle size={10} /> Problème
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {order.firstName} {order.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">{order.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">{formatPrice(order.amount)}</p>
                    <p className="text-xs text-text-secondary">{formatDate(order.createdAt)}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-secondary shrink-0" />
                </Link>
              ))
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/dashboard?page=${p}&status=${status}&search=${search}`}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${
                    p === page
                      ? 'bg-accent-blue text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function KPICard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  bg: string
}) {
  return (
    <Card padding="md">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="text-xl font-bold text-text-primary mt-0.5">{value}</p>
    </Card>
  )
}
