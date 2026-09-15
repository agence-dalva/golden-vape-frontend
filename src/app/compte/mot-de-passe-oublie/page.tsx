import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Mot de passe oublié
      </h1>
      <p className="mb-8 text-sm text-brand-chocolate/70">
        Indiquez l&apos;adresse de votre compte : nous vous envoyons un lien pour choisir un nouveau
        mot de passe.
      </p>
      <div className="rounded-xl bg-white shadow-gv-raised p-6 sm:p-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
