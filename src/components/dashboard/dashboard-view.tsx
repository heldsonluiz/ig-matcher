"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { connectionHref } from "@/features/connections/selectors";
import { AlertCircle, ArrowRight, BarChart3, RefreshCw } from "lucide-react";
import {
  calculateRelationships,
  type RelationshipSummary,
} from "@/features/connections/calculate-relationships";
import { listSnapshots } from "@/features/snapshots/repository";
import type { StoredInstagramSnapshot } from "@/features/snapshots/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardView({
  initialSnapshotId,
}: {
  initialSnapshotId?: string;
}) {
  const [snapshots, setSnapshots] = useState<StoredInstagramSnapshot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summary, setSummary] = useState<RelationshipSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSnapshots() {
    setLoading(true);
    setError(null);
    try {
      const storedSnapshots = await listSnapshots();
      setSnapshots(storedSnapshots);
      const activeId =
        selectedId && storedSnapshots.some(({ id }) => id === selectedId)
          ? selectedId
          : (storedSnapshots[0]?.id ?? null);
      setSelectedId(activeId);
      const activeSnapshot = storedSnapshots.find(({ id }) => id === activeId);
      setSummary(
        activeSnapshot ? calculateRelationships(activeSnapshot) : null,
      );
    } catch {
      setError("Não foi possível recuperar os snapshots locais.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    listSnapshots()
      .then((storedSnapshots) => {
        if (cancelled) return;
        setSnapshots(storedSnapshots);
        const activeId = initialSnapshotId ?? storedSnapshots[0]?.id ?? null;
        setSelectedId(activeId);
        const activeSnapshot = storedSnapshots.find(
          ({ id }) => id === activeId,
        );
        setSummary(
          activeSnapshot ? calculateRelationships(activeSnapshot) : null,
        );
      })
      .catch(() => {
        if (!cancelled)
          setError("Não foi possível recuperar os snapshots locais.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialSnapshotId]);

  function selectSnapshot(id: string) {
    setSelectedId(id);
    const selectedSnapshot = snapshots.find((snapshot) => snapshot.id === id);
    setSummary(
      selectedSnapshot ? calculateRelationships(selectedSnapshot) : null,
    );
  }

  if (loading) {
    return <DashboardState title="Carregando snapshots locais..." />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      >
        <AlertCircle className="size-4" aria-hidden="true" />
        <span>{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadSnapshots()}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!summary || !selectedId) {
    return (
      <DashboardState
        title="Nenhum snapshot disponível"
        description="Importe uma exportação oficial para ver suas conexões neste momento."
      />
    );
  }

  const activeSnapshot = snapshots.find(({ id }) => id === selectedId);
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/80">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Snapshot ativo
            </p>
            <p className="mt-2 text-sm font-medium">
              {activeSnapshot?.friendlyName ?? activeSnapshot?.sourceFileName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Importado em {formatDate(activeSnapshot?.importedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="snapshot-select"
              className="text-xs text-muted-foreground"
            >
              Escolher
            </label>
            <select
              id="snapshot-select"
              value={selectedId}
              onChange={(event) => selectSnapshot(event.target.value)}
              className="h-9 max-w-[240px] rounded-lg border border-input bg-background px-2 text-sm"
            >
              {snapshots.map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {snapshot.friendlyName ?? snapshot.sourceFileName}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => void loadSnapshots()}
              aria-label="Atualizar snapshots"
            >
              <RefreshCw aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Seguidores"
          value={summary.followersCount}
          href={connectionHref("followers", selectedId)}
        />
        <MetricCard
          label="Seguindo"
          value={summary.followingCount}
          href={connectionHref("following", selectedId)}
        />
        <MetricCard
          label="Conexões mútuas"
          href={connectionHref("mutuals", selectedId)}
          value={
            summary.mutuals.status === "available"
              ? summary.mutuals.profiles.length
              : null
          }
        />
        <MetricCard
          label="Não seguem de volta"
          href={connectionHref("not-following-back", selectedId)}
          value={
            summary.notFollowingBack.status === "available"
              ? summary.notFollowingBack.profiles.length
              : null
          }
        />
        <MetricCard
          label="Não sigo de volta"
          href={connectionHref("not-followed-back", selectedId)}
          value={
            summary.notFollowedBackByMe.status === "available"
              ? summary.notFollowedBackByMe.profiles.length
              : null
          }
        />
        <MetricCard
          label="Solicitações enviadas"
          value={summary.pendingSentCount}
          href={connectionHref("pending-sent", selectedId)}
        />
        <MetricCard
          label="Solicitações recebidas"
          value={summary.pendingReceivedCount}
          href={connectionHref("pending-received", selectedId)}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        <BarChart3
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          As contagens representam o momento da exportação e não são atualizadas
          em tempo real.
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number | null;
  href?: string;
}) {
  const card = (
    <Card
      className={
        href
          ? "h-full transition-colors group-hover:border-primary group-hover:bg-accent/40 group-focus-visible:border-primary motion-reduce:transition-none"
          : undefined
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums">
          {value === null ? "Dados não fornecidos" : value}
        </p>
        <Badge variant="secondary" className="mt-3">
          Snapshot local
        </Badge>
        {href && (
          <p className="mt-4 flex items-center justify-between gap-2 text-sm font-medium text-primary">
            Ver lista{" "}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
              aria-hidden="true"
            />
          </p>
        )}
      </CardContent>
    </Card>
  );
  return href ? (
    <Link
      href={href}
      aria-label={`Abrir ${label}`}
      className="group block cursor-pointer rounded-xl transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      {card}
    </Link>
  ) : (
    card
  );
}

function DashboardState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return "data desconhecida";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
