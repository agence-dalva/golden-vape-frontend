import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartIcon({ itemCount }: { itemCount: number }) {
  return (
    <Link
      href="/cart"
      className="group relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 text-gv-text transition-[color,transform] duration-200 hover:-translate-y-px hover:text-gv-800"
    >
      <span className="relative">
        <ShoppingBag size={24} strokeWidth={1.6} aria-hidden />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gv-800 px-1 text-[10px] font-semibold text-white">
            {itemCount}
          </span>
        )}
      </span>
      <span className="hidden text-xs sm:block">Panier</span>
      <span className="sr-only">
        Panier{itemCount > 0 ? ` — ${itemCount} article${itemCount > 1 ? "s" : ""}` : " vide"}
      </span>
    </Link>
  );
}
