'use client'

import { useEffect } from 'react'

interface Props {
  value: number  // montant en centimes
  currency?: string
  orderId: string
}

export function GoogleAdsConversion({ value, currency = 'EUR', orderId }: Props) {
  useEffect(() => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void }
    if (!w.gtag) return
    w.gtag('event', 'conversion', {
      send_to: 'AW-10829056629/2CqKCIDqjJYcEPWU2aso',
      value: value / 100,
      currency,
      transaction_id: orderId,
    })
  }, [value, currency, orderId])

  return null
}
