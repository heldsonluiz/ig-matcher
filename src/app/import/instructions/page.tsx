import { BookOpen } from "lucide-react";
import { ExportInstructions } from "@/components/import/export-instructions";

export default function ExportInstructionsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <BookOpen aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Guia de exportacao
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Passo a passo detalhado
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Siga estas instrucoes no aplicativo do Instagram antes de trazer o
            arquivo para ca.
          </p>
        </div>
      </div>
      <ExportInstructions showBackLink={false} />
    </main>
  );
}
