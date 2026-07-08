import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartIcon({ itemCount }: { itemCount: number }) {
  return (
    <Link href="/cart" className="relative flex items-center justify-center p-2 text-brand-chocolate">
      <ShoppingCart size={22} />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-semibold text-brand-chocolate">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
