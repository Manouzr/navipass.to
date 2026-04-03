import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Conditions Générales de Vente — NaviPass' }

const SECTIONS = [
  {
    title: '1. Objet',
    content: `NaviPass est un service en ligne permettant d'obtenir un compte IDF Mobilités donnant accès au réseau de transports en commun d'Île-de-France (métro, RER, bus, tramway) via un abonnement Navigo. NaviPass n'est pas affilié à IDF Mobilités ni à Île-de-France Mobilités.`,
  },
  {
    title: '2. Produits proposés',
    content: `NaviPass propose trois forfaits :\n• Navigo Semaine — 5,00 € TTC — 7 jours consécutifs, zones 1–5\n• Navigo Mois — 15,00 € TTC — 1 mois calendaire, zones 1–5\n• Navigo Annuel — 150,00 € TTC — 12 mois, zones 1–5\n\nChaque forfait donne accès à l'intégralité du réseau francilien : métro, RER, bus Ile-de-France et tramway.`,
  },
  {
    title: '3. Commande et paiement',
    content: `La commande est validée après paiement intégral via la plateforme sécurisée Stripe. Le paiement est effectué par carte bancaire. Aucune donnée bancaire n'est stockée par NaviPass. La commande est confirmée par email immédiatement après le paiement.`,
  },
  {
    title: '4. Livraison',
    content: `Après validation de la commande, NaviPass crée un compte IDF Mobilités au nom de l'acheteur et y charge le forfait correspondant. Les identifiants (adresse email et mot de passe du compte IDF Mobilités) sont transmis par email dans un délai de 24 à 48 heures ouvrées. L'acheteur peut également les consulter à tout moment dans son espace NaviPass.`,
  },
  {
    title: '5. Droit de rétractation',
    content: `Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut s'exercer pour les contenus numériques dont l'exécution a commencé. Dès lors que les identifiants du compte IDF Mobilités ont été transmis à l'acheteur, la vente est considérée comme définitive et ne peut faire l'objet d'un remboursement.\n\nEn cas de non-livraison dans le délai indiqué (48h ouvrées), l'acheteur peut demander un remboursement intégral en contactant notre support.`,
  },
  {
    title: "6. Obligations de l'acheteur",
    content: `L'acheteur s'engage à fournir des informations exactes lors de la commande (nom, prénom, date de naissance, photo d'identité). Toute information frauduleuse entraîne l'annulation de la commande sans remboursement. Le compte IDF Mobilités est strictement personnel et ne peut être partagé ou revendu.`,
  },
  {
    title: '7. Responsabilité',
    content: `NaviPass ne saurait être tenu responsable des interruptions du réseau de transports en commun, des modifications tarifaires opérées par IDF Mobilités, ni de tout dysfonctionnement du service IDF Mobilités indépendant de sa volonté. La responsabilité de NaviPass est limitée au montant de la commande concernée.`,
  },
  {
    title: '8. Données personnelles',
    content: `Les données collectées (nom, prénom, email, date de naissance, photo) sont utilisées exclusivement pour la création du compte IDF Mobilités et la gestion des commandes. Elles ne sont pas transmises à des tiers à des fins commerciales. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.`,
  },
  {
    title: '9. Contact',
    content: `Pour toute question ou réclamation, contactez-nous via l'espace Mon Compte ou par email à l'adresse indiquée lors de votre inscription.`,
  },
]

export default function CGVPage() {
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Légal" title="Conditions de vente" />
        <div className="px-5 pt-4 pb-24 space-y-5">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-white rounded-[16px] border border-[#E5E7EB] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F3F4F6]">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wider">{s.title}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{s.content}</p>
              </div>
            </div>
          ))}
          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-[#4BAFD4] font-medium">← Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block min-h-screen" style={{ background: '#0A1628' }}>
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(75,175,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(75,175,212,1) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-3xl mx-auto px-8 py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Retour
          </Link>

          <div className="mb-10">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4BAFD4] mb-2 block">Légal</span>
            <h1 className="text-4xl font-black text-white">Conditions Générales de Vente</h1>
            <p className="text-white/40 text-sm mt-2">Dernière mise à jour : {new Date().getFullYear()}</p>
          </div>

          <div className="space-y-6">
            {SECTIONS.map((s) => (
              <div
                key={s.title}
                className="rounded-[20px] p-8"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h2 className="text-base font-bold text-[#4BAFD4] mb-3">{s.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{s.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-6">
            <Link href="/cgu" className="text-sm text-[#4BAFD4] hover:text-white transition-colors">
              Conditions d&apos;utilisation →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
