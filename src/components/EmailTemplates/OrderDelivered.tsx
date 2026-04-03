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
import { formatDate } from '@/lib/utils'

interface Props {
  orderNumber: string
  firstName: string
  accountEmail: string
  accountPassword: string
  accountExpiry: Date
  magicUrl: string
}

const font = 'Arial, Helvetica, sans-serif'
const blue = '#0077B6'
const dark = '#1A1A2E'
const grey = '#6B7280'
const lightGrey = '#F3F4F6'
const border = '#E5E7EB'

export function OrderDeliveredEmail({
  orderNumber,
  firstName,
  accountEmail,
  accountPassword,
  accountExpiry,
  magicUrl,
}: Props) {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Preview>Votre compte IDF Mobilités est pret — commande {orderNumber}</Preview>
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
              Bonjour {firstName},
            </Text>
            <Text style={{ fontSize: '14px', color: grey, lineHeight: '1.7', margin: '0 0 24px 0', fontFamily: font }}>
              Votre compte IDF Mobilités est actif. Vous pouvez des maintenant utiliser
              les transports en commun d Ile-de-France (metro, RER, bus, tramway) avec votre pass Navigo.
            </Text>

            <Hr style={{ borderTop: `1px solid ${border}`, margin: '0 0 20px 0' }} />

            {/* Credentials block */}
            <Text style={{ fontSize: '13px', fontWeight: '700', color: dark, margin: '0 0 12px 0', fontFamily: font }}>
              Identifiants de connexion IDF Mobilites
            </Text>

            <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ backgroundColor: lightGrey, borderRadius: '6px', padding: '14px 16px', marginBottom: '8px', display: 'block' }}>
                    <Text style={{ fontSize: '11px', color: grey, margin: '0 0 4px 0', fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Adresse email
                    </Text>
                    <Text style={{ fontSize: '14px', fontWeight: '700', color: blue, margin: 0, fontFamily: 'Courier New, monospace' }}>
                      {accountEmail}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: 'collapse', marginTop: '8px' }}>
              <tbody>
                <tr>
                  <td style={{ backgroundColor: lightGrey, borderRadius: '6px', padding: '14px 16px', display: 'block' }}>
                    <Text style={{ fontSize: '11px', color: grey, margin: '0 0 4px 0', fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Code d acces
                    </Text>
                    <Text style={{ fontSize: '14px', fontWeight: '700', color: blue, margin: 0, fontFamily: 'Courier New, monospace', letterSpacing: '0.1em' }}>
                      {accountPassword}
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>

            <Text style={{ fontSize: '12px', color: grey, margin: '12px 0 0 0', fontFamily: font }}>
              Validite du compte : jusqu au {formatDate(accountExpiry)}
            </Text>

            <Hr style={{ borderTop: `1px solid ${border}`, margin: '20px 0' }} />

            <Text style={{ fontSize: '14px', color: grey, lineHeight: '1.7', margin: '0 0 20px 0', fontFamily: font }}>
              Conservez cet email. Vous pouvez egalement retrouver ces informations a tout moment
              dans votre espace personnel NaviPass.
            </Text>

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
                      Acceder a mon espace NaviPass
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>

            <Text style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', margin: '16px 0 0 0', fontFamily: font }}>
              Lien direct :{' '}
              <Link href={magicUrl} style={{ color: blue, wordBreak: 'break-all' }}>{magicUrl}</Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '20px 0' }}>
            <Hr style={{ borderTop: `1px solid ${border}`, margin: '0 0 16px 0' }} />
            <Text style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.6', margin: 0, fontFamily: font }}>
              NaviPass — navipass.to | Commande {orderNumber}{'\n'}
              Ce compte est personnel et ne doit pas etre partage.{'\n'}
              Pour toute question, connectez-vous a votre espace NaviPass.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
