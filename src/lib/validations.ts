import { z } from 'zod'

export const orderFormSchema = z.object({
  planType: z.enum(['WEEK', 'MONTH', 'YEAR']),
  firstName: z.string().min(2, 'Prénom trop court').max(50),
  lastName: z.string().min(2, 'Nom trop court').max(50),
  email: z.string().email('Email invalide'),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val)
    const now = new Date()
    const minAge = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate())
    return date <= minAge
  }, 'Date de naissance invalide'),
  photoUrl: z.string().min(1, 'Photo requise'),
})

export const trackingFormSchema = z.object({
  orderNumber: z
    .string()
    .regex(/^NAV-[A-Z0-9]{6}$/, 'Format invalide (ex: NAV-AB1234)'),
  email: z.string().email('Email invalide'),
})

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const deliverOrderSchema = z.object({
  orderId: z.string().cuid(),
  accountEmail: z.string().email('Email du compte invalide'),
  accountPassword: z.string().min(6, 'Mot de passe trop court'),
  accountExpiry: z.string().refine((val) => !isNaN(Date.parse(val)), 'Date invalide'),
  adminNote: z.string().max(500).optional(),
})

export type OrderFormData = z.infer<typeof orderFormSchema>
export type TrackingFormData = z.infer<typeof trackingFormSchema>
export type DeliverOrderData = z.infer<typeof deliverOrderSchema>
