import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
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

export function OrderConfirmationEmail({ orderNumber, firstName, planLabel, amount, magicUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Commande {orderNumber} confirmée ✓ — NaviPass</Preview>
      <Body style={{ backgroundColor: '#F2F2F7', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px' }}>
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #0077B6, #48CAE4)',
              borderRadius: '16px',
              padding: '12px 24px',
            }}>
              <Heading style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '800' }}>
                NaviPass
              </Heading>
            </div>
          </Section>

          {/* Card */}
          <Section style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <Heading style={{ fontSize: '22px', color: '#1A1A2E', marginTop: 0 }}>
              Bonjour {firstName} 👋
            </Heading>
            <Text style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Votre commande a été confirmée et nous allons préparer votre compte IDF Mobilités.
            </Text>

            <Hr style={{ borderColor: '#E5E7EB', margin: '20px 0' }} />

            {/* Order details */}
            <Row>
              <Column>
                <Text style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  N° de commande
                </Text>
                <Text style={{ fontSize: '20px', fontWeight: '800', color: '#0077B6', margin: 0 }}>
                  {orderNumber}
                </Text>
              </Column>
            </Row>

            <Row style={{ marginTop: '16px' }}>
              <Column>
                <Text style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  Forfait
                </Text>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>
                  {PLAN_LABELS[planLabel]}
                </Text>
              </Column>
              <Column>
                <Text style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  Montant
                </Text>
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>
                  {formatPrice(amount)}
                </Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: '#E5E7EB', margin: '24px 0' }} />

            <Text style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
              Votre compte sera prêt sous <strong style={{ color: '#1A1A2E' }}>24 à 48h ouvrées</strong>.
              Vous recevrez un email avec vos identifiants.
            </Text>

            <Button
              href={magicUrl}
              style={{
                display: 'block',
                background: '#E63946',
                color: 'white',
                borderRadius: '9999px',
                padding: '14px 28px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '15px',
                textDecoration: 'none',
                marginTop: '24px',
              }}
            >
              Suivre ma commande →
            </Button>
          </Section>

          <Text style={{ color: '#9CA3AF', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
            NaviPass — Service non officiel. En cas de problème, contactez-nous.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
