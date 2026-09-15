import { notFound } from "next/navigation";
import { ConnectionsView } from "@/components/connections/connections-view";
import {
  categories,
  isConnectionCategory,
} from "@/features/connections/selectors";

export default async function ConnectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ snapshot?: string | string[] }>;
}) {
  const { category } = await params;
  if (!isConnectionCategory(category)) notFound();
  const { snapshot } = await searchParams;
  const snapshotId = typeof snapshot === "string" ? snapshot : undefined;
  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-7 sm:space-y-6 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {categories[category]}
      </h1>
      <p className="text-muted-foreground">
        Estas conexões refletem o momento da exportação. Os dados permanecem
        neste dispositivo.
      </p>
      <ConnectionsView
        key={`${category}:${snapshotId ?? "latest"}`}
        category={category}
        snapshotId={snapshotId}
      />
    </main>
  );
}
