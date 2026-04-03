export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center bg-bg-primary">
      <div className="text-5xl mb-4">📡</div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Vous êtes hors ligne</h1>
      <p className="text-text-secondary text-sm">
        Vérifiez votre connexion internet et réessayez.
      </p>
    </div>
  )
}
