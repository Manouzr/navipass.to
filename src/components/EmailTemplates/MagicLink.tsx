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

interface Props {
  orderNumber: string
  magicUrl: string
}

const font = 'Arial, Helvetica, sans-serif'
const blue = '#0077B6'
const dark = '#1A1A2E'
const grey = '#6B7280'
const border = '#E5E7EB'

export function MagicLinkEmail({ orderNumber, magicUrl }: Props) {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>Acces a votre commande {orderNumber} — lien valable 24 heures</Preview>
      <Body style={{ backgroundColor: '#F9FAFB', fontFamily: font, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '560px', margin: '32px auto', padding: '0 16px' }}>

          {/* Logo */}
          <Section style={{ paddingBottom: '20px' }}>
            <Text style={{ fontSize: '18px', fontWeight: '700', color: blue, margin: 0, fontFamily: font }}>
              NaviPass
            </Text>
          </Section>

          {/* Main card */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: `1px solid ${border}`, padding: '32px 32px 24px' }}>

            <Text style={{ fontSize: '16px', fontWeight: '700', color: dark, margin: '0 0 8px 0', fontFamily: font }}>
              Acces a votre espace
            </Text>
            <Text style={{ fontSize: '14px', color: grey, lineHeight: '1.7', margin: '0 0 8px 0', fontFamily: font }}>
              Vous avez demande a acceder a votre commande <strong style={{ color: dark }}>{orderNumber}</strong>.
            </Text>
            <Text style={{ fontSize: '14px', color: grey, lineHeight: '1.7', margin: '0 0 24px 0', fontFamily: font }}>
              Cliquez sur le bouton ci-dessous pour consulter votre commande. Ce lien est valable <strong style={{ color: dark }}>24 heures</strong>.
            </Text>

            <Hr style={{ borderTop: `1px solid ${border}`, margin: '0 0 24px 0' }} />

            {/* CTA */}
            <table width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td align="center">
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
                      Acceder a ma commande
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>

            <Text style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: '16px 0 0 0', fontFamily: font }}>
              Lien direct :{' '}
              <Link href={magicUrl} style={{ color: blue, wordBreak: 'break-all' }}>{magicUrl}</Link>
            </Text>

            <Hr style={{ borderTop: `1px solid ${border}`, margin: '20px 0 0 0' }} />

            <Text style={{ fontSize: '12px', color: '#9CA3AF', margin: '16px 0 0 0', lineHeight: '1.6', fontFamily: font }}>
              Si vous n avez pas effectue cette demande, ignorez simplement cet email. Votre compte reste securise.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '20px 0' }}>
            <Hr style={{ borderTop: `1px solid ${border}`, margin: '0 0 16px 0' }} />
            <Text style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.6', margin: 0, fontFamily: font }}>
              NaviPass — navipass.to{'\n'}
              Commande {orderNumber}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
