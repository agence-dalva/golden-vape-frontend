import Link from "next/link";
import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Nouveau mot de passe
      </h1>
      {email && (
        <p className="mb-8 text-sm text-brand-chocolate/70">
          Pour le compte <strong className="text-brand-chocolate">{email}</strong>.
        </p>
      )}
      <div className="rounded-xl bg-white shadow-gv-raised p-6 sm:p-8">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-brand-chocolate/80">
            Ce lien est incomplet.{" "}
            <Link href="/compte/mot-de-passe-oublie" className="font-medium text-brand-gold-dark hover:underline">
              Demander un nouveau lien
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
