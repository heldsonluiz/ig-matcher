import Link from "next/link";
import { ArrowRight, FileUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ImportWorkflow } from "@/components/import/import-workflow";

export default function ImportPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <FileUp aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Etapa 5
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Importe sua exportacao
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A leitura do ZIP acontece neste navegador. Revise o resumo antes de
            confirmar qualquer salvamento local.
          </p>
        </div>
      </div>
      <ImportWorkflow />
      <Link
        href="/import/instructions"
        className={buttonVariants({ variant: "ghost", className: "mt-5" })}
      >
        Precisa gerar o arquivo? Veja o passo a passo
        <ArrowRight aria-hidden="true" />
      </Link>
    </main>
  );
}
