import { BarChart3 } from "lucide-react";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ snapshot?: string | string[] }>;
}) {
  const { snapshot } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BarChart3 aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Visão geral
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            As contagens serão calculadas a partir de um snapshot importado, sem
            misturar dados de exportações diferentes.
          </p>
        </div>
      </div>
      <DashboardView
        key={typeof snapshot === "string" ? snapshot : "latest"}
        initialSnapshotId={typeof snapshot === "string" ? snapshot : undefined}
      />
    </main>
  );
}
