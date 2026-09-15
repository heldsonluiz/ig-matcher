"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSnapshot, listSnapshots } from "@/features/snapshots/repository";
import type { StoredInstagramSnapshot } from "@/features/snapshots/types";
import {
  categories,
  connectionHref,
  selectConnections,
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

  if (loading) return <p role="status">Carregando conexoes locais...</p>;
  if (error)
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-destructive/30 p-4"
      >
        <p>Nao foi possivel ler os dados locais. Tente novamente.</p>
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
            ? "Snapshot nao encontrado"
            : "Nenhum snapshot disponivel"}
        </h2>
        <p>Importe uma exportacao ou escolha outro snapshot no dashboard.</p>
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
      <div className="space-y-2 rounded-xl border bg-card p-4">
        <p className="break-words font-medium">
          {snapshot.friendlyName ?? snapshot.sourceFileName}
        </p>
        <p className="break-words text-sm text-muted-foreground">
          Arquivo: {snapshot.sourceFileName}
        </p>
        <p className="text-sm text-muted-foreground">
          Importado em {new Date(snapshot.importedAt).toLocaleString("pt-BR")}
        </p>
        <Link
          className="text-sm text-primary underline"
          href={`/dashboard?snapshot=${encodeURIComponent(snapshot.id)}`}
        >
          Voltar ao dashboard
        </Link>
      </div>
      <nav aria-label="Categorias de conexoes" className="flex flex-wrap gap-2">
        {Object.entries(categories).map(([key, label]) => (
          <Link
            key={key}
            href={connectionHref(key as ConnectionCategory, snapshot.id)}
            aria-current={key === category ? "page" : undefined}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
          >
            {label}
          </Link>
        ))}
      </nav>
      {dataset.warnings.length > 0 && (
        <div
          role="status"
          className="rounded-xl border bg-muted/40 p-4 text-sm"
        >
          <p className="font-medium">Avisos da importacao</p>
          <ul className="mt-2 list-inside list-disc">
            {dataset.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      {dataset.status === "not_provided" ? (
        <p role="status">
          O Instagram nao forneceu os dados necessarios para esta lista nesta
          exportacao. Importe outro ZIP com seguidores e seguindo.
        </p>
      ) : dataset.status === "invalid" ? (
        <p role="alert">
          Os dados necessarios para esta lista sao invalidos. Revise os avisos
          da importacao ou importe uma nova exportacao.
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
