import { getCrisisPayload } from "@/lib/crisis-data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CrisisPageShell } from "@/components/crisis-page-shell";

export const dynamic = "force-dynamic";

export default async function CrisisPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getCrisisPayload(params.id);

  return (
    <div className="min-h-screen bg-obsidian text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[960px] px-4 py-6 lg:px-6">
        <CrisisPageShell data={data} />
      </main>
      <Footer />
    </div>
  );
}
