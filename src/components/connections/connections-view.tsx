"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSnapshot, listSnapshots } from "@/features/snapshots/repository";
import type { StoredInstagramSnapshot } from "@/features/snapshots/types";
import {
  categories,
  connectionHref,
  selectConnections,
  isRequestCategory,
  type ConnectionCategory,
} from "@/features/connections/selectors";
import { Button } from "@/components/ui/button";
import { ConnectionsList } from "./connections-list";

export function ConnectionsView({
  category,
  snapshotId,
}: {
  category: ConnectionCategory;
  snapshotId?: string;
}) {
  const [snapshot, setSnapshot] = useState<StoredInstagramSnapshot>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const request = snapshotId
      ? getSnapshot(snapshotId)
      : listSnapshots().then((all) => all[0]);
    request
      .then((stored) => {
        if (!cancelled) setSnapshot(stored);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [snapshotId, attempt]);

  if (loading) return <p role="status">Carregando conexões locais...</p>;
  if (error)
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-destructive/30 p-4"
      >
        <p>Não foi possível ler os dados locais. Tente novamente.</p>
        <Button
          onClick={() => {
            setError(false);
            setLoading(true);
            setAttempt((a) => a + 1);
          }}
        >
          Tentar novamente
        </Button>
      </div>
    );
  if (!snapshot)
    return (
      <div className="space-y-3 rounded-xl border p-5">
        <h2 className="font-semibold">
          {snapshotId
            ? "Importação não encontrada"
            : "Nenhuma importação disponível"}
        </h2>
        <p>
          Esta importação pode ter sido substituída ou apagada. Abra o dashboard
          para consultar os dados atuais.
        </p>
        <Link className="text-primary underline" href="/import">
          Importar ZIP
        </Link>
        {" · "}
        <Link className="text-primary underline" href="/dashboard">
          Abrir dashboard
        </Link>
      </div>
    );
  const dataset = selectConnections(snapshot, category);
  return (
    <div className="space-y-6">
      {(category === "following" || category === "not-following-back") && (
        <aside
          aria-label="Sobre perfis indisponíveis"
          className="space-y-2 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground"
        >
          <h2 className="font-medium text-foreground">
            Sobre perfis indisponíveis
          </h2>
          <p>
            Um perfil registrado no arquivo de seguindo (following.json) pode
            estar indisponível hoje. O ZIP já baixado não se atualiza quando uma
            conta é excluída, suspensa, desativada ou muda de nome.
          </p>
          <p>
            “Não seguem de volta” indica perfis presentes em
            &quot;seguindo&quot; e ausentes em &quot;seguidores&quot; nesta
            exportação. Isso não confirma que a conta ainda existe ou explica
            por que um link não abre. A aplicação não verifica contas em tempo
            real nem deixa de seguir perfis.
          </p>
        </aside>
      )}
      <div className="relative">
        <p className="mb-2 flex items-center justify-end gap-1 text-xs text-muted-foreground sm:hidden">
          Deslize para ver mais categorias <span aria-hidden="true">→</span>
        </p>
        <nav
          aria-label="Categorias de conexões"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          {Object.entries(categories)
            .filter(([key]) => key !== "mutuals")
            .map(([key, label]) => (
              <Link
                key={key}
                href={connectionHref(key as ConnectionCategory, snapshot.id)}
                aria-current={key === category ? "page" : undefined}
                className="shrink-0 rounded-lg border px-3 py-2 text-xs hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
              >
                {label}
              </Link>
            ))}
        </nav>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 bottom-2 h-9 w-8 bg-linear-to-l from-background to-transparent sm:hidden"
        />
      </div>
      {dataset.warnings.length > 0 && (
        <div
          role="status"
          className="rounded-xl border bg-muted/40 p-4 text-sm"
        >
          <p className="font-medium">Avisos da importação</p>
          <ul className="mt-2 list-inside list-disc">
            {dataset.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      {category === "pending-sent" && (
        <p className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Solicitações enviadas ainda registradas como pendentes no momento da
          exportação. A aplicação não cancela solicitações automaticamente.
        </p>
      )}
      {category === "pending-received" && (
        <p className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Solicitações recebidas ainda registradas na exportação. Esse conjunto
          é opcional e pode não ser fornecido pelo Instagram. A aplicação não
          aceita nem recusa solicitações.
        </p>
      )}
      {dataset.status === "not_provided" ? (
        <p role="status">
          {isRequestCategory(category)
            ? "O Instagram não forneceu esses dados nesta exportação."
            : "O Instagram não forneceu os dados necessários para esta lista nesta exportação. Importe outro ZIP com seguidores e seguindo."}
        </p>
      ) : dataset.status === "invalid" ? (
        <p role="alert">
          Os dados necessários para esta lista são inválidos. Revise os avisos
          da importação ou importe uma nova exportação.
        </p>
      ) : (
        <ConnectionsList
          snapshot={snapshot}
          category={category}
          profiles={dataset.profiles}
        />
      )}
    </div>
  );
}
