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
import { formatDate } from '@/lib/utils'

interface Props {
  orderNumber: string
  firstName: string
  accountEmail: string
  accountPassword: string
  accountExpiry: Date
  magicUrl: string
}

export function OrderDeliveredEmail({
  orderNumber,
  firstName,
  accountEmail,
  accountPassword,
  accountExpiry,
  magicUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Votre compte Navigo est prêt ! 🎉 — NaviPass</Preview>
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
              Votre compte est prêt {firstName} 🎉
            </Heading>
            <Text style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Voici vos identifiants pour accéder à votre espace IDF Mobilités.
            </Text>

            {/* Fake Navigo card */}
            <Section style={{
              background: 'linear-gradient(135deg, #0077B6 0%, #00A3E0 50%, #48CAE4 100%)',
              borderRadius: '16px',
              padding: '20px 24px',
              margin: '20px 0',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px 0' }}>
                île-de-france mobilités
              </Text>
              <Text style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>
                Pass Navigo
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>
                Expire le {formatDate(accountExpiry)}
              </Text>
            </Section>

            <Hr style={{ borderColor: '#E5E7EB', margin: '20px 0' }} />

            {/* Credentials */}
            <Row>
              <Column>
                <Text style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  Email
                </Text>
                <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0077B6', margin: '0 0 16px 0', fontFamily: 'monospace' }}>
                  {accountEmail}
                </Text>
              </Column>
            </Row>

            <Row>
              <Column>
                <Text style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                  Mot de passe
                </Text>
                <Text style={{ fontSize: '15px', fontWeight: '700', color: '#0077B6', margin: 0, fontFamily: 'monospace' }}>
                  {accountPassword}
                </Text>
              </Column>
            </Row>

            <Hr style={{ borderColor: '#E5E7EB', margin: '24px 0' }} />

            <Text style={{ color: '#6B7280', fontSize: '13px', lineHeight: '1.6' }}>
              Conservez cet email précieusement. Vous pouvez également retrouver vos identifiants à tout moment via votre espace NaviPass.
            </Text>

            <Button
              href={magicUrl}
              style={{
                display: 'block',
                background: '#0077B6',
                color: 'white',
                borderRadius: '9999px',
                padding: '14px 28px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '15px',
                textDecoration: 'none',
                marginTop: '20px',
              }}
            >
              Accéder à mon espace →
            </Button>
          </Section>

          <Text style={{ color: '#9CA3AF', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
            Commande {orderNumber} · NaviPass
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
