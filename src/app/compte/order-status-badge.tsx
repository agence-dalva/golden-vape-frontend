import type { OrderTone } from "@/lib/order-status";

// Une pastille par ton : le brun de la marque pour ce qui avance, le vert pour ce qui est
// arrivé, la brique pour ce qui n'aura pas lieu. Le neutre reste discret.
const TONES: Record<OrderTone, string> = {
  neutral: "bg-gv-50 text-gv-text-soft",
  progress: "bg-gv-100 text-gv-800",
  success: "bg-gv-success/10 text-gv-success",
  danger: "bg-gv-danger/10 text-gv-danger",
};

const DOTS: Record<OrderTone, string> = {
  neutral: "bg-gv-500",
  progress: "bg-gv-800",
  success: "bg-gv-success",
  danger: "bg-gv-danger",
};

export default function OrderStatusBadge({
  label,
  tone,
  size = "sm",
}: {
  label: string;
  tone: OrderTone;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-2 rounded-full font-medium",
        size === "md" ? "px-3.5 py-1.5 text-[13.5px]" : "px-3 py-1 text-[12.5px]",
        TONES[tone],
      ].join(" ")}
    >
      <span aria-hidden className={`h-[7px] w-[7px] rounded-full ${DOTS[tone]}`} />
      {label}
    </span>
  );
}
