import { Clock3 } from "lucide-react";
import { EmptyState } from "@/components/app-shell/empty-state";

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Clock3 aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Linha do tempo
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Historico
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Compare importacoes futuras sempre mantendo cada snapshot separado e
            identificado pela data.
          </p>
        </div>
      </div>
      <EmptyState
        title="Historico vazio"
        description="Depois da primeira importacao, seus snapshots locais aparecerao aqui para consulta e comparacao."
      />
    </main>
  );
}
