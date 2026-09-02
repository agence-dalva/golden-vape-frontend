"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/customer-actions";

export default function LogoutButton({
  variant = "outline",
}: {
  variant?: "outline" | "sidebar";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  };

  const className =
    variant === "outline"
      ? "inline-flex min-h-[42px] cursor-pointer items-center gap-2 rounded-[7px] border border-gv-border-strong bg-white px-4 text-sm font-medium text-gv-text transition-colors hover:border-gv-800 hover:text-gv-800 disabled:cursor-not-allowed disabled:opacity-50"
      : "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-[7px] px-3 text-sm font-medium text-gv-text transition-colors hover:bg-gv-50 hover:text-gv-800 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <button onClick={logout} disabled={isPending} className={className}>
      <LogOut size={variant === "outline" ? 18 : 20} strokeWidth={1.6} aria-hidden />
      {isPending ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
