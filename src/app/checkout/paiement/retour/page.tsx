import MoneticoReturn from "./monetico-return";

// Monetico a déjà notifié Medusa de serveur à serveur ; il ne reste qu'à récupérer la
// commande créée par cette notification.
export default function MoneticoReturnPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <MoneticoReturn />
    </div>
  );
}
