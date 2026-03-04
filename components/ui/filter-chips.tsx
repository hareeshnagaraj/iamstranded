"use client";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "flight", label: "Flights" },
  { id: "ground", label: "Ground" },
  { id: "embassy", label: "Embassy" },
  { id: "safety", label: "Safety" },
] as const;

export function FilterChips({
  active,
  onChange,
}: {
  active: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            active === cat.id
              ? "border border-border-strong bg-surface-elevated text-text-primary"
              : "border border-border-subtle bg-transparent text-text-tertiary hover:text-text-secondary"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
