"use client";

import { useState } from "react";

const TRUNCATE_LENGTH = 500;

export default function ProductDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > TRUNCATE_LENGTH;
  const displayedText = isLong && !expanded ? `${description.slice(0, TRUNCATE_LENGTH)}…` : description;

  return (
    <div>
      <p className="text-sm leading-relaxed text-brand-chocolate/70 whitespace-pre-line">
        {displayedText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-medium text-brand-gold-dark hover:underline"
        >
          {expanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}
