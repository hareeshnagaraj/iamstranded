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
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <Header />
      <main className="mx-auto w-full max-w-[720px] px-4 py-5">
        <CrisisPageShell data={data} />
      </main>
      <Footer />
    </div>
  );
}
