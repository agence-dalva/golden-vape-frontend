import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = redirect ?? "/";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Connexion
      </h1>
      <div className="rounded-xl border border-brand-chocolate/10 bg-white p-6 sm:p-8">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
