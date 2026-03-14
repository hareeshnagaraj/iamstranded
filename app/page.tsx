import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LandingHero } from "@/components/landing-hero";
import { CrisisGrid } from "@/components/crisis-grid";
import { GlobalSignalBar } from "@/components/global-signal-bar";
import { getActiveCrises } from "@/lib/crisis-data";
import { getGlobalSignals } from "@/lib/external-apis";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [crises, signals] = await Promise.all([
    getActiveCrises(),
    getGlobalSignals(),
  ]);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[1400px] px-4 lg:px-6">
        <LandingHero crisisCount={crises.length} />
        <GlobalSignalBar signals={signals} />
        <CrisisGrid crises={crises} />
      </main>
      <Footer />
    </div>
  );
}
