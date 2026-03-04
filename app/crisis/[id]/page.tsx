import { Suspense } from "react";
import { getCrisisShellData, getFeedBySlug } from "@/lib/crisis-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CrisisPageShell } from "@/components/crisis-page-shell";
import { LiveIntelFeed } from "@/components/live-intel-feed";

export const dynamic = "force-dynamic";

function FeedSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between border-b border-neutral-800 pb-3">
        <h2 className="font-display text-lg font-bold text-text-primary">
          Live Intel
        </h2>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-blink bg-emerald-500" />
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-neutral-600">
            Real-time
          </span>
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto border border-neutral-800">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`px-4 py-3.5 ${i < 3 ? "border-b border-neutral-800" : ""}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded bg-neutral-800" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-neutral-800" />
              <div className="ml-auto h-2.5 w-12 animate-pulse rounded bg-neutral-800" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-neutral-800/60" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-neutral-800/60" />
            </div>
            <div className="mt-2 h-2 w-28 animate-pulse rounded bg-neutral-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function AsyncFeed({ slug }: { slug: string }) {
  const { crisisId, feed } = await getFeedBySlug(slug);
  return <LiveIntelFeed feed={feed} crisisId={crisisId} />;
}

export default async function CrisisPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getCrisisShellData(params.id);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-6">
        <CrisisPageShell data={data}>
          <Suspense fallback={<FeedSkeleton />}>
            <AsyncFeed slug={params.id} />
          </Suspense>
        </CrisisPageShell>
      </main>
      <Footer />
    </div>
  );
}
