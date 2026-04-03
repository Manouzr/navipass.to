import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Product IDs (prices are created dynamically via price_data)
export const PLAN_PRODUCT_IDS: Record<string, string> = {
  WEEK: process.env.STRIPE_PRODUCT_WEEK!,
  MONTH: process.env.STRIPE_PRODUCT_MONTH!,
  YEAR: process.env.STRIPE_PRODUCT_YEAR!,
}

// Amounts in cents — 5€, 15€, 150€
export const PLAN_AMOUNTS: Record<string, number> = {
  WEEK: 500,
  MONTH: 1500,
  YEAR: 15000,
}

export const PLAN_LABELS: Record<string, string> = {
  WEEK: 'Navigo Semaine',
  MONTH: 'Navigo Mois',
  YEAR: 'Navigo Annuel',
}
