import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center gap-6 rounded-xl border border-gv-border bg-gv-card p-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:p-8 sm:text-left lg:px-12">
      <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gv-50 sm:h-[132px] sm:w-[132px]">
        <Icon size={48} strokeWidth={1.2} aria-hidden className="text-gv-800 sm:h-16 sm:w-16" />
      </span>

      <div className="min-w-0">
        <h3 className="font-display text-[22px] font-medium leading-tight text-gv-text sm:text-2xl">
          {title}
        </h3>
        <p className="mt-1.5 text-sm text-gv-text-soft">{description}</p>

        {(primary || secondary) && (
          <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            {primary && (
              <Link
                href={primary.href}
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-[7px] border border-gv-800 bg-gv-800 px-[22px] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-gv-900 sm:w-auto"
              >
                {primary.label}
              </Link>
            )}
            {secondary && (
              <Link
                href={secondary.href}
                className="text-sm font-semibold text-gv-800 underline-offset-4 hover:underline"
              >
                {secondary.label} →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
