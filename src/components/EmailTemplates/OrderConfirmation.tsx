import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
} from '@react-email/components'
import { formatPrice, PLAN_LABELS } from '@/lib/utils'
import { PlanType } from '@prisma/client'

interface Props {
  orderNumber: string
  firstName: string
  planLabel: PlanType
  amount: number
  magicUrl: string
}

const font = 'Arial, Helvetica, sans-serif'
const blue = '#0077B6'
const dark = '#1A1A2E'
const grey = '#6B7280'
const lightGrey = '#F3F4F6'
const border = '#E5E7EB'

export function OrderConfirmationEmail({ orderNumber, firstName, planLabel, amount, magicUrl }: Props) {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>Commande {orderNumber} bien reçue — votre pass Navigo est en cours de préparation</Preview>
      <Body style={{ backgroundColor: '#F9FAFB', fontFamily: font, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '32px auto', padding: '0 16px' }}>

          {/* Logo / Brand */}
          <Section style={{ paddingBottom: '20px' }}>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: blue, margin: 0, fontFamily: font }}>
              NaviPass
            </Text>
          </Section>

          {/* Main card */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: `1px solid ${border}`, padding: '32px 32px 24px' }}>

            <Text style={{ fontSize: '16px', fontWeight: '700', color: dark, margin: '0 0 8px 0', fontFamily: font }}>
              Bonjour {firstName},
            </Text>
            <Text style={{ fontSize: '14px', color: grey, lineHeight: '1.7', margin: '0 0 24px 0', fontFamily: font }}>
              Nous avons bien reçu votre commande. Notre équipe va préparer votre compte IDF Mobilités
              dans les prochaines 24 à 48 heures ouvrées.
            </Text>

            <Hr style={{ borderTop: `1px solid ${border}`, margin: '0 0 20px 0' }} />

            {/* Order details */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: `1px solid ${lightGrey}` }}>
                    <Text style={{ fontSize: '12px', color: grey, margin: 0, fontFamily: font }}>Numéro de commande</Text>
                    <Text style={{ fontSize: '15px', fontWeight: '700', color: blue, margin: '2px 0 0 0', fontFamily: font, letterSpacing: '0.05em' }}>{orderNumber}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: `1px solid ${lightGrey}` }}>
                    <Text style={{ fontSize: '12px', color: grey, margin: 0, fontFamily: font }}>Forfait</Text>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: dark, margin: '2px 0 0 0', fontFamily: font }}>{PLAN_LABELS[planLabel]}</Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0' }}>
                    <Text style={{ fontSize: '12px', color: grey, margin: 0, fontFamily: font }}>Montant regle</Text>
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: dark, margin: '2px 0 0 0', fontFamily: font }}>{formatPrice(amount)}</Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <Hr style={{ borderTop: `1px solid ${border}`, margin: '20px 0' }} />

            <Text style={{ fontSize: '14px', color: grey, lineHeight: '1.7', margin: '0 0 20px 0', fontFamily: font }}>
              Vous recevrez un second email avec les identifiants de votre compte des qu il sera pret.
              Vous pouvez egalement suivre l avancement de votre commande via le lien ci-dessous.
            </Text>

            {/* CTA — plain link styled as button */}
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td align="center" style={{ paddingTop: '4px' }}>
                    <Link
                      href={magicUrl}
                      style={{
                        display: 'inline-block',
                        backgroundColor: blue,
                        color: '#ffffff',
                        fontFamily: font,
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        padding: '12px 28px',
                      }}
                    >
                      Suivre ma commande
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>

            <Text style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: '16px 0 0 0', fontFamily: font }}>
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :{' '}
              <Link href={magicUrl} style={{ color: blue, wordBreak: 'break-all' }}>{magicUrl}</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '20px 0' }}>
            <Hr style={{ borderTop: `1px solid ${border}`, margin: '0 0 16px 0' }} />
            <Text style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.6', margin: 0, fontFamily: font }}>
              NaviPass — navipass.to{'\n'}
              Ce message a ete envoye suite a votre commande sur navipass.to.{'\n'}
              Si vous n avez pas effectue cette commande, ignorez cet email.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
