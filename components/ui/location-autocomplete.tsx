"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  value: string;
  onChange: (value: string, coords?: { lat: number; lon: number }) => void;
  placeholder: string;
  icon: LucideIcon;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextFetch = useRef(false);
  const debounced = useDebounce(query, 300);

  // Sync external value changes (e.g. geolocation auto-fill)
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    if (debounced.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    let cancelled = false;

    async function search() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debounced)}&format=json&limit=5`,
          { headers: { "User-Agent": "iamstranded/1.0" } },
        );
        if (!res.ok || cancelled) return;
        const data: NominatimResult[] = await res.json();
        if (cancelled) return;
        setResults(data);
        setOpen(data.length > 0);
        setActiveIndex(-1);
      } catch {
        // Graceful degradation — input still works as plain text
      }
    }

    search();
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const select = useCallback(
    (result: NominatimResult) => {
      skipNextFetch.current = true;
      setQuery(result.display_name);
      onChange(result.display_name, {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      });
      setOpen(false);
      setResults([]);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative min-w-[160px] flex-1">
      <Icon size={14} className="absolute left-3 top-3 text-neutral-600" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border border-neutral-800 bg-[#0A0A0A] py-2.5 pl-[34px] pr-3 font-mono text-sm text-text-primary outline-none placeholder:text-neutral-700 focus:border-neutral-600"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto border border-neutral-800 bg-[#0A0A0A]">
          {results.map((r, i) => (
            <li
              key={r.place_id}
              onMouseDown={() => select(r)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer px-3 py-2 font-mono text-sm text-text-primary ${
                i === activeIndex ? "bg-neutral-900" : ""
              }`}
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
