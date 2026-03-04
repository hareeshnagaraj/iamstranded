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
    <div className="flex flex-wrap gap-1">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors ${
            active === cat.id
              ? "border-neutral-600 bg-[#111111] text-text-primary"
              : "border-neutral-800 bg-transparent text-neutral-600 hover:text-neutral-400"
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
