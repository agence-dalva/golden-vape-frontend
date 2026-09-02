import { Truck } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="bg-gv-800 text-white">
      <div className="gv-container flex min-h-8 items-center justify-center gap-2 py-1.5 text-center text-xs font-medium">
        <Truck size={14} aria-hidden className="shrink-0" />
        <span>Livraison offerte dès 49 € · Expédition sous 24/48h</span>
      </div>
    </div>
  );
}
