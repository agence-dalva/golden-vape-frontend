import { redirectTo } from "@/lib/monetico-return";

// Retour navigateur après un paiement refusé ou abandonné.
export function GET(request: Request): Response {
  return redirectTo(request, "/checkout/paiement/echec");
}

export function POST(request: Request): Response {
  return redirectTo(request, "/checkout/paiement/echec");
}
