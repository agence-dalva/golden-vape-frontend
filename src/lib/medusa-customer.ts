import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./medusa";
import type { MedusaAddress } from "./medusa-cart";

export type MedusaCustomerAddress = MedusaAddress & {
  id: string;
  is_default_shipping?: boolean;
  is_default_billing?: boolean;
};

export type MedusaCustomer = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  addresses: MedusaCustomerAddress[];
};

const CUSTOMER_FIELDS = "id,email,first_name,last_name,phone,*addresses";

async function authFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options ?? {};
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Medusa auth API a répondu ${res.status} sur ${path}: ${body}`);
  }

  return res.json();
}

// Étape 1/3 : crée l'identité d'authentification, retourne un token "actorless" (utilisable
// uniquement pour créer le customer associé — pas encore un vrai token de session).
export async function registerAuthIdentity(email: string, password: string): Promise<string> {
  const { token } = await authFetch<{ token: string }>(
    "/auth/customer/emailpass/register",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  return token;
}

// Étape 2/3 : crée l'entité Customer, attachée à l'identité auth via le token actorless.
export async function createCustomer(
  actorlessToken: string,
  data: { email: string; first_name?: string; last_name?: string }
): Promise<MedusaCustomer> {
  const { customer } = await authFetch<{ customer: MedusaCustomer }>(
    `/store/customers?fields=${encodeURIComponent(CUSTOMER_FIELDS)}`,
    { method: "POST", body: JSON.stringify(data), token: actorlessToken }
  );
  return customer;
}

// Étape 3/3 (et login classique) : même route que l'inscription — POST sans body actorless
// authentifie un auth_identity existant et retourne le vrai token de session exploitable.
export async function loginCustomer(email: string, password: string): Promise<string> {
  const { token } = await authFetch<{ token: string }>(
    "/auth/customer/emailpass",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  return token;
}

export async function getCustomerByToken(token: string): Promise<MedusaCustomer | null> {
  try {
    const { customer } = await authFetch<{ customer: MedusaCustomer }>(
      `/store/customers/me?fields=${encodeURIComponent(CUSTOMER_FIELDS)}`,
      { token }
    );
    return customer;
  } catch {
    return null;
  }
}

// Enregistre une adresse sur le compte. La première est marquée par défaut : elle sert
// ensuite à préremplir le tunnel de commande.
export async function createCustomerAddress(
  token: string,
  address: MedusaAddress & { is_default_shipping?: boolean; is_default_billing?: boolean }
): Promise<void> {
  await authFetch("/store/customers/me/addresses", {
    method: "POST",
    body: JSON.stringify(address),
    token,
  });
}

// Associe un panier existant au customer connecté (transferCartCustomerWorkflow côté backend).
export async function attachCartToCustomer(cartId: string, token: string): Promise<void> {
  await authFetch(`/store/carts/${cartId}/customer`, { method: "POST", token });
}
