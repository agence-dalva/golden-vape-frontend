"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, MapPin, UserRound } from "lucide-react";
import LogoutButton from "./logout-button";

// Chaque rubrique est une page : on peut y revenir, la partager, et le bouton précédent
// du navigateur fait ce qu'on attend. Le panneau, lui, reste en place d'une rubrique à
// l'autre — seul le contenu change, en fondu.
const ITEMS = [
  { icon: LayoutGrid, label: "Vue d'ensemble", href: "/compte" },
  { icon: Package, label: "Mes commandes", href: "/compte/commandes" },
  { icon: MapPin, label: "Mes adresses", href: "/compte/adresses" },
  { icon: UserRound, label: "Mes informations", href: "/compte/informations" },
];

function estActive(href: string, pathname: string): boolean {
  // La vue d'ensemble n'est active que sur elle-même : sinon elle s'allumerait partout.
  if (href === "/compte") return pathname === "/compte";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountSidebar({ fullName, initials }: { fullName: string; initials: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation du compte"
      className="rounded-xl border border-gv-border bg-gv-card px-2.5 pb-3 pt-5 shadow-gv-xs"
    >
      <h2 className="mb-4 px-3 font-display text-[22px] font-normal text-gv-text">Mon espace</h2>

      <div className="mb-4 flex items-center gap-3 px-3">
        <span
          aria-hidden
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gv-100 text-sm font-semibold text-gv-800"
        >
          {initials}
        </span>
        <span className="min-w-0 truncate text-sm font-medium text-gv-text">{fullName}</span>
      </div>

      <ul className="flex flex-col gap-0.5">
        {ITEMS.map(({ icon: Icon, label, href }) => {
          const active = estActive(href, pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-[7px] px-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gv-800 text-white shadow-[0_8px_18px_rgb(68_54_46/0.14)]"
                    : "text-gv-text hover:bg-gv-50 hover:text-gv-800"
                }`}
              >
                <Icon size={20} strokeWidth={1.6} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 border-t border-gv-border pt-2">
        <LogoutButton variant="sidebar" />
      </div>
    </nav>
  );
}
