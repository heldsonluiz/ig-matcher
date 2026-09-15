import { Settings2 } from "lucide-react";
import { EmptyState } from "@/components/app-shell/empty-state";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Settings2 aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Preferências
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Configurações
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            O tema já pode ser alternado no controle fixo. As opções de dados
            locais e privacidade serão adicionadas junto da persistência.
          </p>
        </div>
      </div>
      <EmptyState
        title="Configurações em preparação"
        description="Nenhuma conta ou credencial é armazenada. Em breve você poderá consultar o uso local e apagar seus snapshots por aqui."
        actionHref="/"
        actionLabel="Voltar ao início"
      />
    </main>
  );
}
