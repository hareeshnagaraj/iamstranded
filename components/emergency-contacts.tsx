import { ExternalLink } from "lucide-react";
import type { EmergencyContact } from "@/types/crisis";

export function EmergencyContacts({
  contacts,
}: {
  contacts: EmergencyContact[];
}) {
  return (
    <div className="mb-8">
      <h2 className="mb-3.5 text-base font-semibold">Emergency Contacts</h2>
      <div className="flex flex-wrap gap-2">
        {contacts.map((c) => {
          const href = c.phone
            ? `tel:${c.phone.replace(/[^\d+]/g, "")}`
            : c.url ?? "#";
          return (
            <a
              key={c.id}
              href={href}
              className="min-w-[140px] flex-1 overflow-hidden rounded-md border border-border-subtle bg-surface-secondary p-3"
            >
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-text-primary">
                {c.name}
                <ExternalLink size={11} className="text-text-tertiary" />
              </div>
              <div className="mt-1 truncate font-mono text-[11px] text-text-tertiary">
                {c.phone ?? c.url ?? ""}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
