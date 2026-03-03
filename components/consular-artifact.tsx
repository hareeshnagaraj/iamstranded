"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";
import type { ConsularContact } from "@/types/crisis";

function toTel(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function ConsularArtifact({
  contacts,
  nationality,
}: {
  contacts: ConsularContact[];
  nationality?: string;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <section className="flex h-full min-h-[220px] flex-col border border-neutral-800">
      <header className="border-b border-neutral-800 px-4 py-3">
        <h2 className="font-heading text-lg tracking-[0.04em] text-white">Consular Artifact</h2>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-hidden px-4 py-4">
        <p className="font-ui text-sm text-neutral-300">
          Target nationality profile: <span className="font-mono text-white">{nationality || "UNSPECIFIED"}</span>
        </p>

        <button
          type="button"
          onClick={() => setIsRevealed((value) => !value)}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white px-4 font-ui text-xs uppercase tracking-[0.2em] text-white transition-none hover:bg-white hover:text-black focus:bg-white focus:text-black"
        >
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Initiate Consular Call
        </button>

        {isRevealed ? (
          <ul className="border border-neutral-800">
            {contacts.slice(0, 2).map((contact, index, items) => (
              <li
                key={contact.id}
                className={`space-y-2 px-4 py-3 ${index < items.length - 1 ? "border-b border-neutral-800" : ""}`}
              >
                <p className="font-ui text-sm text-white">{contact.country} Desk</p>
                <a
                  href={toTel(contact.primaryPhone)}
                  className="block border border-neutral-700 px-3 py-2 font-mono text-sm text-white transition-none hover:bg-white hover:text-black focus:bg-white focus:text-black"
                >
                  Primary: {contact.primaryPhone}
                </a>
                {contact.secondaryPhone ? (
                  <a
                    href={toTel(contact.secondaryPhone)}
                    className="block border border-neutral-700 px-3 py-2 font-mono text-sm text-neutral-300 transition-none hover:bg-white hover:text-black focus:bg-white focus:text-black"
                  >
                    Alternate: {contact.secondaryPhone}
                  </a>
                ) : null}
                <p className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-500">
                  {contact.hoursUtc}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-neutral-500">
            Action locked. Trigger call protocol to reveal numbers.
          </p>
        )}
      </div>
    </section>
  );
}
