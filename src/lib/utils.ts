import { OrderStatus, PlanType } from '@prisma/client'

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'NAV-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PROCESSING: 'En traitement',
  DELIVERED: 'Livrée',
}

export const PLAN_LABELS: Record<PlanType, string> = {
  WEEK: 'Navigo Semaine',
  MONTH: 'Navigo Mois',
  YEAR: 'Navigo Annuel',
}

// 5€, 15€, 150€
export const PLAN_AMOUNTS: Record<PlanType, number> = {
  WEEK: 500,
  MONTH: 1500,
  YEAR: 15000,
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}
