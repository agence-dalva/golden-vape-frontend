import { redirectTo } from "@/lib/monetico-return";

// Monetico renvoie le navigateur ici après un paiement accepté, en GET ou en POST selon le
// paramétrage du contrat. Une page ne répondant qu'au GET renverrait un 405 : on passe donc
// par un route handler qui accepte les deux et redirige vers la page de confirmation.
export function GET(request: Request): Response {
  return redirectTo(request, "/checkout/paiement/retour");
}

export function POST(request: Request): Response {
  return redirectTo(request, "/checkout/paiement/retour");
}
