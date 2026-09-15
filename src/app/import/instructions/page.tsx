import { BookOpen } from "lucide-react";
import { ExportInstructions } from "@/components/import/export-instructions";

export default function ExportInstructionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          Guia de exportação
        </p>
        <div className="mt-2 flex items-center gap-3 sm:gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12 sm:rounded-2xl">
            <BookOpen aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Passo a passo detalhado
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Siga estas instruções no aplicativo do Instagram antes de trazer o
          arquivo para cá.
        </p>
      </div>
      <ExportInstructions showBackLink={false} />
    </main>
  );
}
