import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface Props {
  orderNumber: string
  magicUrl: string
}

export function MagicLinkEmail({ orderNumber, magicUrl }: Props) {
  return (
    <Html>
      <Head />
      <Preview>Accédez à votre commande NaviPass — {orderNumber}</Preview>
      <Body style={{ backgroundColor: '#F2F2F7', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '520px', margin: '40px auto', padding: '0 20px' }}>
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

          <Section style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <Heading style={{ fontSize: '20px', color: '#1A1A2E', marginTop: 0 }}>
              Votre lien de connexion 🔑
            </Heading>
            <Text style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Vous avez demandé à accéder à votre commande <strong style={{ color: '#1A1A2E' }}>{orderNumber}</strong>.
            </Text>
            <Text style={{ color: '#6B7280', lineHeight: '1.6' }}>
              Cliquez sur le bouton ci-dessous pour accéder à votre espace. Ce lien est valable <strong>24 heures</strong>.
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
              Accéder à ma commande →
            </Button>

            <Text style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '20px', lineHeight: '1.5' }}>
              Si vous n&apos;avez pas demandé cet accès, ignorez cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
