"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import type {
  InstagramProfile,
  InstagramSnapshot,
} from "@/features/instagram-import/types";
import {
  filterAndSortProfiles,
  pageSize,
  relationshipLabels,
  type ConnectionCategory,
  type ConnectionSort,
} from "@/features/connections/selectors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sorts: Record<ConnectionSort, string> = {
  az: "Nome: A–Z",
  za: "Nome: Z–A",
  newest: "Data: mais recentes",
  oldest: "Data: mais antigas",
};

export function ConnectionsList({
  snapshot,
  category,
  profiles,
}: {
  snapshot: InstagramSnapshot;
  category: ConnectionCategory;
  profiles: InstagramProfile[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ConnectionSort>("az");
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () => filterAndSortProfiles(profiles, query, sort),
    [profiles, query, sort],
  );
  const labels = useMemo(
    () => relationshipLabels(snapshot, category),
    [snapshot, category],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasDates = profiles.some((p) => p.timestamp !== null);
  return (
    <section aria-label="Lista de conexoes" className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="connection-search" className="text-sm font-medium">
            Buscar por nome de usuario
          </label>
          <Input
            id="connection-search"
            value={query}
            placeholder="Buscar username"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="connection-sort" className="text-sm font-medium">
            Ordenar
          </label>
          <Select
            value={sort}
            items={sorts}
            onValueChange={(value) => {
              if (value && Object.hasOwn(sorts, value)) {
                setSort(value as ConnectionSort);
                setPage(1);
              }
            }}
          >
            <SelectTrigger
              id="connection-sort"
              aria-label="Ordenar conexoes"
              className="w-full sm:w-52"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sorts).map(([value, label]) => (
                <SelectItem
                  key={value}
                  value={value}
                  disabled={
                    !hasDates && (value === "newest" || value === "oldest")
                  }
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p role="status" className="text-sm text-muted-foreground">
        {filtered.length} de {profiles.length} perfis · Pagina {currentPage} de{" "}
        {pages}
      </p>
      <p className="text-xs text-muted-foreground">
        A data e o timestamp fornecido pela Meta; seu significado nao e
        confirmado. Perfis sem data aparecem ao final da ordenacao por data.
      </p>
      {!visible.length ? (
        <p className="rounded-xl border border-dashed p-6">
          {profiles.length
            ? "Nenhum perfil corresponde a busca."
            : "Nenhum perfil encontrado nesta lista da exportacao."}
        </p>
      ) : (
        <ul
          aria-label="Perfis"
          className="divide-y overflow-hidden rounded-xl border bg-card"
        >
          {visible.map((profile) => (
            <li
              key={profile.username}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-2">
                <a
                  href={`https://www.instagram.com/${encodeURIComponent(profile.username)}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 rounded text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                  aria-label={`Abrir perfil de @${profile.username} (nova aba)`}
                >
                  <span className="break-all">@{profile.username}</span>
                  <ExternalLink
                    className="size-3 shrink-0"
                    aria-hidden="true"
                  />
                </a>
                <div>
                  <Badge variant="secondary">
                    {labels.get(profile.username)}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Data no arquivo:{" "}
                {profile.timestamp === null
                  ? "Nao fornecida"
                  : new Date(profile.timestamp * 1000).toLocaleString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
      <nav
        aria-label="Paginacao"
        className="flex items-center justify-between gap-3"
      >
        <Button
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm">
          {currentPage} / {pages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage >= pages}
          onClick={() => setPage(currentPage + 1)}
        >
          Proxima
        </Button>
      </nav>
    </section>
  );
}
