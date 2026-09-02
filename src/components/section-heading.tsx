import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  link,
}: {
  eyebrow?: string;
  title: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        {eyebrow && <p className="gv-eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-[28px] font-normal leading-[1.2] tracking-[0.01em] text-gv-text sm:text-[34px]">
          {title}
        </h2>
      </div>

      {link && (
        <Link
          href={link.href}
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-gv-800 transition-colors hover:text-gv-900"
        >
          {link.label}
          <ArrowRight
            size={15}
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-[3px]"
          />
        </Link>
      )}
    </div>
  );
}
