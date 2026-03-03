import { Phone } from "lucide-react";
import { getDashboardPayload } from "@/lib/crisis-data";
import type { DashboardQuery, ExtractionOption, GroundTruthUpdate } from "@/types/crisis";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatUtc(value: string): string {
  const date = new Date(value);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

function formatMode(mode: ExtractionOption["mode"]): string {
  return mode.toUpperCase();
}

function statusClass(status: ExtractionOption["status"]): string {
  return status === "closed" ? "text-alert" : "text-white";
}

function formatStatus(status: ExtractionOption["status"]): string {
  return status.toUpperCase();
}

function safeTel(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function messageClass(update: GroundTruthUpdate): string {
  return update.severity === "critical"
    ? "font-serif text-lg leading-7 text-alert"
    : "font-serif text-lg leading-7 text-white";
}

export default async function CrisisPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: SearchParams;
}) {
  const query: DashboardQuery = {
    region: params.id,
    location: first(searchParams?.location),
    nationality: first(searchParams?.nationality),
    lat: toNumber(first(searchParams?.lat)),
    lng: toNumber(first(searchParams?.lng)),
  };

  const payload = await getDashboardPayload(query);
  const contact = payload.consularContacts[0];

  const packetParams = new URLSearchParams({
    region: payload.region.slug,
    location: query.location ?? "",
    nationality: query.nationality ?? "",
  });

  return (
    <div className="min-h-screen bg-obsidian text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-800 bg-obsidian">
        <div className="mx-auto flex h-12 w-full max-w-[1360px] items-center justify-between px-4 lg:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">Crisis Command</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-alert">
            LIVE: NETWORK DEGRADED
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1360px] px-4 pb-6 pt-16 lg:px-6">
        <div className="flex flex-col space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
          <section className="border border-neutral-800 bg-obsidian p-4 lg:col-span-3 lg:p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
              Active Region: {payload.region.name.toUpperCase()}
            </p>
            <h1 className="mt-3 font-serif text-3xl leading-tight text-white lg:text-5xl">
              Extraction Routing
            </h1>

            <form
              action={`/crisis/${params.id}`}
              method="get"
              className="mt-6 flex flex-col gap-3"
            >
              <label className="flex h-12 items-center border border-neutral-800 px-3">
                <span className="sr-only">Location</span>
                <input
                  type="text"
                  name="location"
                  defaultValue={query.location}
                  placeholder="Location"
                  className="h-full w-full font-sans text-sm text-white placeholder:text-ash focus:outline-none"
                />
              </label>

              <label className="flex h-12 items-center border border-neutral-800 px-3">
                <span className="sr-only">Nationality</span>
                <input
                  type="text"
                  name="nationality"
                  defaultValue={query.nationality}
                  placeholder="Nationality"
                  className="h-full w-full font-sans text-sm text-white placeholder:text-ash focus:outline-none"
                />
              </label>

              <button
                type="submit"
                className="h-12 w-full border border-white font-mono text-xs uppercase tracking-[0.2em] text-white transition-none hover:bg-white hover:text-black focus:bg-white focus:text-black"
              >
                Route
              </button>
            </form>
          </section>

          <section className="border border-neutral-800 bg-obsidian p-4 lg:col-span-2 lg:p-6">
            <h2 className="font-serif text-2xl text-white">Ground Truth Feed</h2>
            <ul className="mt-4">
              {payload.groundTruth.slice(0, 6).map((update, index, items) => (
                <li
                  key={update.id}
                  className={`py-4 ${index < items.length - 1 ? "border-b border-neutral-800" : ""}`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
                    {formatUtc(update.timestampUtc)}
                  </p>
                  <p className={messageClass(update)}>
                    {update.severity === "critical" ? "[CRITICAL] " : ""}
                    {update.message}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-neutral-800 bg-obsidian p-4 lg:p-6">
            <h2 className="font-serif text-2xl text-white">Alternative Extraction</h2>
            <div className="mt-4 border border-neutral-800">
              {payload.extractionOptions.slice(0, 6).map((option, index, items) => (
                <div
                  key={option.id}
                  className={`flex items-start justify-between gap-3 p-3 ${index < items.length - 1 ? "border-b border-neutral-800" : ""}`}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-white">
                    {formatMode(option.mode)}
                  </p>
                  <div className="text-right">
                    <p className={`font-mono text-xs uppercase tracking-[0.18em] ${statusClass(option.status)}`}>
                      {option.distanceKm} KM · {formatStatus(option.status)}
                    </p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
                      {option.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-neutral-800 bg-obsidian p-4 lg:p-6">
            <h2 className="font-serif text-2xl text-white">Consular Artifact</h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-ash">
              TARGET NATIONALITY: {(query.nationality ?? "UNSPECIFIED").toUpperCase()}
            </p>

            {contact ? (
              <a
                href={safeTel(contact.primaryPhone)}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 border border-white bg-white px-4 font-mono text-xs uppercase tracking-[0.18em] text-black"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Initiate Consular Call
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-4 h-12 w-full border border-neutral-700 bg-white px-4 font-mono text-xs uppercase tracking-[0.18em] text-black"
              >
                Initiate Consular Call
              </button>
            )}

            {contact ? (
              <div className="mt-4 space-y-2 border border-neutral-800 p-3">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-white">
                  {contact.country.toUpperCase()}
                </p>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-ash">
                  PRIMARY: {contact.primaryPhone}
                </p>
                {contact.secondaryPhone ? (
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-ash">
                    SECONDARY: {contact.secondaryPhone}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="border border-neutral-800 bg-obsidian p-4 lg:p-6">
            <h2 className="font-serif text-2xl text-white">Utility / Offline Packet</h2>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-ash">
              CONNECTIVITY: {(payload.connectivityStatus ?? "degraded").toUpperCase()}
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-ash">
              CACHED SAFE ROUTES: {payload.cacheAvailable ? "AVAILABLE" : "UNAVAILABLE"}
            </p>

            <a
              href={`/api/offline-packet?${packetParams.toString()}`}
              className="mt-4 inline-flex h-12 w-full items-center justify-center border border-neutral-800 px-4 font-mono text-xs uppercase tracking-[0.18em] text-white"
            >
              Download Offline Packet
            </a>
          </section>
        </div>
      </main>
    </div>
  );
}
