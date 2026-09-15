import Link from "next/link";
import { ArrowRight, FileUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ImportWorkflow } from "@/components/import/import-workflow";

export default function ImportPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <div className="mb-6 flex items-start gap-3 sm:mb-8 sm:gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12 sm:rounded-2xl">
          <FileUp aria-hidden="true" />
        </span>
        <div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:mt-2 sm:text-3xl">
            Importe sua exportação
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
        className={buttonVariants({
          variant: "ghost",
          className:
            "mt-5 h-auto w-full justify-between py-2 text-left whitespace-normal sm:w-auto",
        })}
      >
        Precisa gerar o arquivo? Veja o passo a passo
        <ArrowRight aria-hidden="true" />
      </Link>
    </main>
  );
}
