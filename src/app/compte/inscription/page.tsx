import RegisterForm from "./register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = redirect ?? "/";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-brand-chocolate">
        Créer un compte
      </h1>
      <RegisterForm redirectTo={redirectTo} />
    </div>
  );
}
