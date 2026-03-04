import { ExternalLink } from "lucide-react";
import type { EmergencyContact } from "@/types/crisis";

export function EmergencyContacts({
  contacts,
}: {
  contacts: EmergencyContact[];
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-display text-lg font-bold text-text-primary">
          Emergency Contacts
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-px border border-neutral-800 bg-neutral-800 sm:grid-cols-2">
        {contacts.map((c) => {
          const href = c.phone
            ? `tel:${c.phone.replace(/[^\d+]/g, "")}`
            : c.url ?? "#";
          return (
            <a
              key={c.id}
              href={href}
              className="flex flex-col bg-obsidian p-3.5 transition-colors hover:bg-[#0A0A0A]"
            >
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-text-primary">
                {c.name}
                <ExternalLink size={10} className="text-neutral-600" />
              </div>
              <div className="mt-1 font-mono text-[11px] uppercase tracking-tight text-neutral-600">
                {c.phone ?? c.url ?? ""}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
