import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { ArrowLeft } from 'lucide-react'

export const metadata = { title: "Conditions Générales d'Utilisation — NaviPass" }

const SECTIONS = [
  {
    title: "1. Présentation du service",
    content: `NaviPass est une plateforme en ligne permettant de commander un abonnement Navigo IDF Mobilités. Le service donne accès à l'ensemble du réseau de transports en commun d'Île-de-France : métro, RER (toutes lignes), bus Île-de-France et tramway, pour les zones 1 à 5.\n\nNaviPass est un service indépendant, non officiel, et n'est pas affilié à Île-de-France Mobilités ni à la RATP.`,
  },
  {
    title: '2. Accès au service',
    content: `L'utilisation de NaviPass est ouverte à toute personne majeure. L'accès à l'espace personnel se fait via l'adresse email utilisée lors de la commande, sans création de mot de passe. Un lien d'accès sécurisé est envoyé par email à chaque connexion.`,
  },
  {
    title: '3. Utilisation du compte IDF Mobilités',
    content: `Le compte IDF Mobilités créé par NaviPass est strictement personnel. Il est interdit de :\n• Partager les identifiants avec des tiers\n• Utiliser le compte à des fins commerciales ou de revente\n• Tenter d'accéder frauduleusement au réseau de transports\n\nTout usage frauduleux entraîne la résiliation immédiate du service sans remboursement.`,
  },
  {
    title: '4. Données personnelles',
    content: `NaviPass collecte les données suivantes lors d'une commande :\n• Nom et prénom\n• Adresse email\n• Date de naissance\n• Photo d'identité\n\nCes données sont utilisées exclusivement pour la création et la gestion du compte IDF Mobilités. Elles sont chiffrées (AES-256) en base de données et ne sont jamais transmises à des tiers à des fins commerciales.\n\nConformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.`,
  },
  {
    title: '5. Propriété intellectuelle',
    content: `Le logo Navigo, la marque IDF Mobilités et tous les éléments graphiques associés sont la propriété d'Île-de-France Mobilités. NaviPass n'est pas autorisé à utiliser ces marques à titre commercial. La présence de ces éléments visuels sur le site est à titre informatif uniquement.`,
  },
  {
    title: '6. Cookies et traçabilité',
    content: `NaviPass utilise des cookies de session sécurisés (httpOnly) pour maintenir la connexion à l'espace personnel. Aucun cookie publicitaire ou de traçage tiers n'est utilisé. Les cookies de session expirent automatiquement après 7 jours.`,
  },
  {
    title: '7. Limitation de responsabilité',
    content: `NaviPass ne peut être tenu responsable :\n• Des perturbations ou interruptions du réseau de transports en commun\n• Des modifications apportées par IDF Mobilités à ses services ou tarifs\n• Des pertes de données résultant d'une utilisation frauduleuse des identifiants\n• De tout dommage indirect lié à l'utilisation du service`,
  },
  {
    title: '8. Modifications des CGU',
    content: `NaviPass se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email en cas de modification substantielle. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles CGU.`,
  },
  {
    title: '9. Droit applicable',
    content: `Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut, les tribunaux compétents de Paris seront seuls habilités.`,
  },
]

export default function CGUPage() {
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden min-h-screen bg-white">
        <PageHeader greeting="Légal" title="Conditions d'utilisation" />
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
            <h1 className="text-4xl font-black text-white">Conditions Générales d&apos;Utilisation</h1>
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
            <Link href="/cgv" className="text-sm text-[#4BAFD4] hover:text-white transition-colors">
              Conditions générales de vente →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
