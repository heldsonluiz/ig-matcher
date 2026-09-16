"use client";

import { useMemo, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import type {
  InstagramProfile,
  InstagramSnapshot,
} from "@/features/instagram-import/types";
import {
  filterAndSortProfiles,
  pageSize,
  relationshipLabels,
  isRequestCategory,
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
  const tableStartRef = useRef<HTMLDivElement>(null);
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

  function changePage(nextPage: number) {
    setPage(nextPage);
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    tableStartRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section aria-label="Lista de conexões" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-end">
        <div className="grid min-w-0 gap-2">
          <label
            htmlFor="connection-search"
            className="block text-sm leading-5 font-medium"
          >
            Buscar por nome de usuário
          </label>
          <Input
            id="connection-search"
            className="h-9"
            value={query}
            placeholder="Buscar username"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <label
            htmlFor="connection-sort"
            className="block text-sm leading-5 font-medium"
          >
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
              aria-label="Ordenar conexões"
              className="w-full data-[size=default]:h-9"
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
      <p role="status" className="mt-6 text-sm text-muted-foreground sm:mt-12">
        {filtered.length} de {profiles.length} perfis · Página {currentPage} de{" "}
        {pages}
      </p>
      <Pagination
        position="superior"
        page={currentPage}
        pages={pages}
        onPageChange={changePage}
      />
      {!visible.length ? (
        <p className="rounded-xl border border-dashed p-6">
          {profiles.length
            ? "Nenhum perfil corresponde à busca."
            : category === "pending-sent"
              ? "Nenhuma solicitação pendente encontrada."
              : category === "pending-received"
                ? "Nenhuma solicitação recebida encontrada."
                : "Nenhum perfil encontrado nesta lista da exportação."}
        </p>
      ) : (
        <div
          ref={tableStartRef}
          className="overflow-x-auto rounded-xl border bg-card"
          role="region"
          aria-label="Tabela de conexões"
          tabIndex={0}
        >
          <table
            aria-label="Perfis"
            className="w-full text-left text-sm sm:min-w-160"
          >
            <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th
                  scope="col"
                  className="w-10 px-2 py-2 text-right sm:w-14 sm:px-3"
                >
                  Nº
                </th>
                <th scope="col" className="px-2 py-2 sm:px-3">
                  Perfil
                </th>
                <th scope="col" className="hidden px-3 py-2 sm:table-cell">
                  {isRequestCategory(category) ? "Status" : "Relação"}
                </th>
                <th scope="col" className="hidden px-3 py-2 sm:table-cell">
                  Data no arquivo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((profile, index) => (
                <tr
                  key={profile.username}
                  className="hover:bg-muted/40 focus-within:bg-muted/40"
                >
                  <td className="px-2 py-3 text-right text-xs text-muted-foreground tabular-nums sm:px-3">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="min-w-0 px-2 py-3 sm:px-3">
                    <a
                      href={`https://www.instagram.com/${encodeURIComponent(profile.username)}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                      aria-label={`Abrir perfil de @${profile.username} (nova aba)`}
                    >
                      <span className="break-all">@{profile.username}</span>
                      <ExternalLink
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                    <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden">
                      <Badge variant="secondary">
                        {labels.get(profile.username)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {profile.timestamp === null
                          ? "Data não fornecida"
                          : new Date(
                              profile.timestamp * 1000,
                            ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 sm:table-cell">
                    <Badge variant="secondary">
                      {labels.get(profile.username)}
                    </Badge>
                  </td>
                  <td className="hidden px-3 py-3 text-xs whitespace-nowrap text-muted-foreground sm:table-cell">
                    {profile.timestamp === null
                      ? "Não fornecida"
                      : new Date(profile.timestamp * 1000).toLocaleString(
                          "pt-BR",
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        position="inferior"
        page={currentPage}
        pages={pages}
        onPageChange={changePage}
      />
    </section>
  );
}

function Pagination({
  position,
  page,
  pages,
  onPageChange,
}: {
  position: "superior" | "inferior";
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label={`Paginação ${position}`}
      className="flex items-center justify-between gap-2"
    >
      <Button
        aria-label="Anterior"
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <span aria-hidden="true" className="sm:hidden">
          ←
        </span>
        <span className="hidden sm:inline">Anterior</span>
      </Button>
      <span className="text-sm">
        {page} / {pages}
      </span>
      <Button
        aria-label="Próxima"
        variant="outline"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <span className="hidden sm:inline">Próxima</span>
        <span aria-hidden="true" className="sm:hidden">
          →
        </span>
      </Button>
    </nav>
  );
}
