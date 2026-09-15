import { FileUp } from "lucide-react";
import { EmptyState } from "@/components/app-shell/empty-state";

export default function ImportPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <FileUp aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Etapa 1
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Importe sua exportacao
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            A leitura do ZIP acontecera neste navegador. A area de selecao e o
            resumo da importacao entram na proxima etapa.
          </p>
        </div>
      </div>
      <EmptyState
        title="Importacao ainda nao iniciada"
        description="Quando o importador estiver pronto, voce podera selecionar o ZIP oficial do Instagram, revisar os dados encontrados e confirmar o snapshot antes de salva-lo."
      />
    </main>
  );
}
