"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileArchive,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import {
  discoverFiles,
  DEFAULT_ZIP_LIMITS,
  type DiscoveredZip,
} from "@/features/instagram-import/discover-files";
import {
  parseExportFiles,
  type ParsedExport,
} from "@/features/instagram-import/parse-export";
import type { ImportFileKind } from "@/features/instagram-import/discover-files";
import { saveSnapshot } from "@/features/snapshots/repository";
import type { InstagramSnapshot } from "@/features/instagram-import/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const datasetLabels: Record<ImportFileKind, string> = {
  followers: "Seguidores",
  following: "Seguindo",
  pending_sent_requests: "Solicitações enviadas",
  pending_received_requests: "Solicitações recebidas",
};

const datasetStatusLabels = {
  available: "Disponível",
  empty: "Vazio",
  not_provided: "Não fornecido",
  invalid: "Inválido",
} as const;

const datasetKinds = Object.keys(datasetLabels) as ImportFileKind[];
type WorkflowStatus =
  "idle" | "processing" | "ready" | "saving" | "confirmed" | "error";

type ImportSummary = {
  fileName: string;
  fileSize: number;
  discovered: DiscoveredZip;
  datasets: Record<ImportFileKind, ParsedExport["dataset"]>;
  duplicatesRemoved: number;
  warnings: string[];
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportWorkflow() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Aguardando arquivo");
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function processFile(file: File) {
    setError(null);
    setSummary(null);
    setStatus("processing");
    setProgress(10);
    setProgressLabel("Validando arquivo");

    if (!file.name.toLocaleLowerCase("en-US").endsWith(".zip")) {
      setStatus("error");
      setError("Selecione um arquivo com extensão .zip.");
      return;
    }
    if (file.size > DEFAULT_ZIP_LIMITS.maxCompressedBytes) {
      setStatus("error");
      setError(
        `O arquivo excede o limite de ${formatBytes(DEFAULT_ZIP_LIMITS.maxCompressedBytes)}.`,
      );
      return;
    }

    try {
      setProgress(30);
      setProgressLabel("Encontrando arquivos relevantes");
      const discovered = await discoverFiles(await file.arrayBuffer());
      setProgress(55);
      setProgressLabel("Lendo conjuntos de conexões");

      const parsedFiles = await Promise.all(
        discovered.files.map(async (discoveredFile) => ({
          sourceFile: discoveredFile.path,
          kind: discoveredFile.kind,
          text: await discoveredFile.readText(),
        })),
      );
      const datasets = Object.fromEntries(
        datasetKinds.map((kind) => [
          kind,
          parseExportFiles(parsedFiles.filter((file) => file.kind === kind)),
        ]),
      ) as Record<ImportFileKind, ParsedExport>;
      const warnings = datasetKinds.flatMap((kind) =>
        datasets[kind].dataset.status === "not_provided"
          ? []
          : datasets[kind].dataset.warnings,
      );
      const duplicatesRemoved = datasetKinds.reduce(
        (total, kind) => total + datasets[kind].duplicatesRemoved,
        0,
      );

      setProgress(100);
      setProgressLabel("Resumo pronto");
      setSummary({
        fileName: file.name,
        fileSize: file.size,
        discovered,
        datasets: Object.fromEntries(
          datasetKinds.map((kind) => [kind, datasets[kind].dataset]),
        ) as Record<ImportFileKind, ParsedExport["dataset"]>,
        duplicatesRemoved,
        warnings,
      });
      setStatus("ready");
    } catch (cause) {
      setStatus("error");
      setProgress(0);
      setProgressLabel("Não foi possível processar o arquivo");
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível processar o ZIP.",
      );
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void processFile(file);
  }

  function reset() {
    setStatus("idle");
    setProgress(0);
    setProgressLabel("Aguardando arquivo");
    setSummary(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function confirmSummary() {
    if (!summary) return;
    setStatus("saving");
    try {
      const snapshot: InstagramSnapshot = {
        id: crypto.randomUUID(),
        importedAt: new Date().toISOString(),
        exportGeneratedAt: null,
        sourceFileName: summary.fileName,
        accountUsername: null,
        followers: summary.datasets.followers,
        following: summary.datasets.following,
        pendingSentRequests: summary.datasets.pending_sent_requests,
        pendingReceivedRequests: summary.datasets.pending_received_requests,
      };
      await saveSnapshot(snapshot);
      setStatus("confirmed");
    } catch {
      setStatus("error");
      setError("Não foi possível salvar o snapshot local. Tente novamente.");
    }
  }

  return (
    <div className="space-y-6">
      {status === "idle" || status === "error" ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ")
              inputRef.current?.click();
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/60 p-8 text-center transition-colors hover:border-primary/60 hover:bg-card sm:p-12"
          aria-label="Selecionar arquivo ZIP"
        >
          <UploadCloud
            className="mx-auto size-10 text-primary"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold">
            Selecione ou solte seu ZIP aqui
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            O arquivo será aberto somente neste navegador. Limite de tamanho:{" "}
            {formatBytes(DEFAULT_ZIP_LIMITS.maxCompressedBytes)}.
          </p>
          <Button
            type="button"
            className="mt-5"
            onClick={() => inputRef.current?.click()}
          >
            <FileArchive aria-hidden="true" />
            Escolher arquivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            aria-label="Arquivo ZIP"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      ) : null}

      {status === "processing" ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span>{progressLabel}</span>
              <span className="tabular-nums text-muted-foreground">
                {progress}%
              </span>
            </div>
            <Progress value={progress} aria-label={progressLabel} />
            <Button variant="outline" onClick={reset}>
              Cancelar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {summary ? (
        <SummaryCard
          summary={summary}
          confirmed={status === "confirmed"}
          saving={status === "saving"}
          onConfirm={confirmSummary}
          onReset={reset}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({
  summary,
  confirmed,
  saving,
  onConfirm,
  onReset,
}: {
  summary: ImportSummary;
  confirmed: boolean;
  saving: boolean;
  onConfirm: () => Promise<void>;
  onReset: () => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Revise sua importação</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {summary.fileName} · {formatBytes(summary.fileSize)}
            </p>
          </div>
          <Badge variant={confirmed ? "default" : "secondary"}>
            {confirmed ? "Resumo confirmado" : "Revisão necessária"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {datasetKinds.map((kind) => {
            const dataset = summary.datasets[kind];
            return (
              <div
                key={kind}
                className="rounded-xl border border-border/70 bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {datasetLabels[kind]}
                  </span>
                  <Badge variant="outline">
                    {datasetStatusLabels[dataset.status]}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">
                  {dataset.profiles.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  perfis encontrados
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <SummaryMetric
            label="Arquivos encontrados"
            value={summary.discovered.files.length}
          />
          <SummaryMetric
            label="Arquivos ignorados"
            value={summary.discovered.ignoredFiles}
          />
          <SummaryMetric
            label="Duplicatas removidas"
            value={summary.duplicatesRemoved}
          />
        </div>

        {summary.warnings.length > 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium">Avisos da importação</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {summary.warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {datasetKinds.some(
          (kind) => summary.datasets[kind].status === "not_provided",
        ) ? (
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm">
            <p className="font-medium">Conjuntos não fornecidos</p>
            <p className="mt-2 text-muted-foreground">
              O Instagram não incluiu estes arquivos nesta exportação. Isso não
              é um erro e não será tratado como lista vazia.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
              {datasetKinds
                .filter(
                  (kind) => summary.datasets[kind].status === "not_provided",
                )
                .map((kind) => (
                  <li key={kind}>{datasetLabels[kind]}</li>
                ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row">
          {!confirmed ? (
            <Button onClick={() => void onConfirm()} disabled={saving}>
              <CheckCircle2 aria-hidden="true" />
              {saving ? "Salvando snapshot..." : "Confirmar resumo"}
            </Button>
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Snapshot salvo localmente neste navegador.
            </p>
          )}
          <Button variant="outline" onClick={onReset}>
            <RotateCcw aria-hidden="true" />
            Escolher outro arquivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/70 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
