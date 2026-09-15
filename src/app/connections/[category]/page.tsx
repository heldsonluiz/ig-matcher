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
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {categories[category]}
      </h1>
      <p className="text-muted-foreground">
        Estas conexoes refletem o momento da exportacao. Os dados permanecem
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
