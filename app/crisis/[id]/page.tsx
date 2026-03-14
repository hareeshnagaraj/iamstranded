import { getCrisisShellData } from "@/lib/crisis-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { CrisisPageShell } from "@/components/crisis-page-shell";

export const dynamic = "force-dynamic";

export default async function CrisisPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getCrisisShellData(params.id);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary">
      <Header />
      <DisclaimerBanner />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-6">
        <CrisisPageShell data={data} />
      </main>
      <Footer />
    </div>
  );
}
