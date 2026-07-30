"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  registerAuthIdentity,
  createCustomer,
  loginCustomer,
  getCustomerByToken,
  attachCartToCustomer,
  type MedusaCustomer,
} from "./medusa-customer";
import { getCurrentCart } from "./cart-actions";

// Contrairement à cart_id (identifiant opaque, non sensible), ce cookie porte un JWT de session
// — httpOnly pour ne jamais être exposé au JS client.
const CUSTOMER_COOKIE = "customer_token";
const COOKIE_OPTIONS = { path: "/", maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax" as const };

async function linkCartIfNeeded(token: string) {
  const cart = await getCurrentCart();
  if (cart && !cart.customer_id) {
    await attachCartToCustomer(cart.id, token).catch(() => {});
  }
}

export async function registerAction(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ error?: string }> {
  try {
    const actorlessToken = await registerAuthIdentity(email, password);
    await createCustomer(actorlessToken, { email, first_name: firstName, last_name: lastName });
    const token = await loginCustomer(email, password);

    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE, token, COOKIE_OPTIONS);
    await linkCartIfNeeded(token);
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Échec de l'inscription" };
  }
}

export async function loginAction(email: string, password: string): Promise<{ error?: string }> {
  try {
    const token = await loginCustomer(email, password);
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_COOKIE, token, COOKIE_OPTIONS);
    await linkCartIfNeeded(token);
    revalidatePath("/", "layout");
    return {};
  } catch {
    return { error: "Email ou mot de passe incorrect" };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
  revalidatePath("/", "layout");
}

export async function getCurrentCustomer(): Promise<MedusaCustomer | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return getCustomerByToken(token);
}

export async function getCurrentCustomerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_COOKIE)?.value ?? null;
}
