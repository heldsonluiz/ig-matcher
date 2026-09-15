import {
  ImportedDatasetSchema,
  InstagramExportEntrySchema,
  InstagramPendingRequestSchema,
} from "./schemas";
import { deduplicateProfiles, normalizeUsername } from "./normalize-entry";
import type { ImportedDataset, InstagramProfile } from "./types";
import type { ImportFileKind } from "./discover-files";

export type ExportFileInput = {
  sourceFile: string;
  kind: ImportFileKind;
  text: string;
};

export type ParsedExport = {
  dataset: ImportedDataset;
  duplicatesRemoved: number;
};

const envelopeKeys: Record<ImportFileKind, string[]> = {
  followers: ["relationships_followers"],
  following: ["relationships_following"],
  pending_sent_requests: [
    "relationships_follow_requests_sent",
    "relationships_follow_requests",
  ],
  pending_received_requests: [
    "relationships_follow_requests_received",
    "relationships_follow_requests",
  ],
};

function invalidDataset(sourceFile: string, warning: string): ImportedDataset {
  return {
    status: "invalid",
    sourceFiles: [sourceFile],
    profiles: [],
    warnings: [warning],
  };
}

function isHttpsUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function getProfileUrl(username: string, href: string | undefined): string {
  if (isHttpsUrl(href)) return href;
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

function usernameFromHref(href: string | undefined): string {
  if (!href || !isHttpsUrl(href)) return "";
  const pathname = new URL(href).pathname.replace(/^\/+|\/+$/g, "");
  const segments = pathname.split("/").filter(Boolean);
  const username = segments[0] === "_u" ? segments[1] : segments[0];
  return normalizeUsername(decodeURIComponent(username ?? ""));
}

function getEntries(raw: unknown, kind: ImportFileKind): unknown[] | null {
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object" || raw === null) return null;

  for (const key of envelopeKeys[kind]) {
    const value = (raw as Record<string, unknown>)[key];
    if (Array.isArray(value)) return value;
  }

  return null;
}

function parseEntry(
  entry: unknown,
  index: number,
  kind: ImportFileKind,
): {
  profiles: InstagramProfile[];
  warning: string | null;
} {
  if (
    kind === "pending_sent_requests" ||
    kind === "pending_received_requests"
  ) {
    const pendingResult = InstagramPendingRequestSchema.safeParse(entry);
    if (pendingResult.success) {
      const usernameValue = pendingResult.data.label_values.find((item) =>
        item.label.toLocaleLowerCase("en-US").includes("usu"),
      )?.value;
      const urlValue = pendingResult.data.label_values.find((item) =>
        item.label.toLocaleLowerCase("en-US").includes("url"),
      )?.value;
      const username = normalizeUsername(
        usernameValue ?? usernameFromHref(urlValue),
      );
      if (username) {
        return {
          profiles: [
            {
              username,
              profileUrl: getProfileUrl(username, urlValue),
              timestamp: pendingResult.data.timestamp ?? null,
            },
          ],
          warning: null,
        };
      }
    }
  }

  const result = InstagramExportEntrySchema.safeParse(entry);
  if (!result.success) {
    return {
      profiles: [],
      warning: `A entrada ${index + 1} foi ignorada por estar em formato invalido.`,
    };
  }

  const profiles = result.data.string_list_data.map((item) => {
    const username = normalizeUsername(
      item.value ?? usernameFromHref(item.href),
    );
    return {
      username,
      profileUrl: getProfileUrl(username, item.href),
      timestamp: item.timestamp ?? null,
    };
  });

  return { profiles, warning: null };
}

export function parseExportText(
  text: string,
  sourceFile: string,
  kind: ImportFileKind,
): ParsedExport {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    return {
      dataset: invalidDataset(sourceFile, "O arquivo JSON nao pode ser lido."),
      duplicatesRemoved: 0,
    };
  }

  const entries = getEntries(raw, kind);
  if (!entries) {
    return {
      dataset: invalidDataset(
        sourceFile,
        "A estrutura do arquivo nao corresponde a um formato reconhecido.",
      ),
      duplicatesRemoved: 0,
    };
  }

  const profiles: InstagramProfile[] = [];
  const warnings: string[] = [];
  for (const [index, entry] of entries.entries()) {
    const parsedEntry = parseEntry(entry, index, kind);
    profiles.push(...parsedEntry.profiles);
    if (parsedEntry.warning) warnings.push(parsedEntry.warning);
  }

  const deduplicated = deduplicateProfiles(profiles);
  const status =
    deduplicated.profiles.length > 0
      ? "available"
      : warnings.length === entries.length && entries.length > 0
        ? "invalid"
        : "empty";
  return {
    dataset: {
      status,
      sourceFiles: [sourceFile],
      profiles: deduplicated.profiles,
      warnings,
    },
    duplicatesRemoved: deduplicated.duplicatesRemoved,
  };
}

export function parseExportFiles(
  files: readonly ExportFileInput[],
): ParsedExport {
  if (files.length === 0) {
    return {
      dataset: {
        status: "not_provided",
        sourceFiles: [],
        profiles: [],
        warnings: ["O conjunto nao foi fornecido nesta exportacao."],
      },
      duplicatesRemoved: 0,
    };
  }

  const parsedFiles = files.map((file) =>
    parseExportText(file.text, file.sourceFile, file.kind),
  );
  const profiles = parsedFiles.flatMap(({ dataset }) => dataset.profiles);
  const deduplicated = deduplicateProfiles(profiles);
  const warnings = parsedFiles.flatMap(({ dataset }) => dataset.warnings);
  const invalidFiles = parsedFiles.filter(
    ({ dataset }) => dataset.status === "invalid",
  );
  const sourceFiles = files.map(({ sourceFile }) => sourceFile);

  let status: ImportedDataset["status"];
  if (deduplicated.profiles.length > 0) {
    status = "available";
  } else if (invalidFiles.length === parsedFiles.length) {
    status = "invalid";
  } else {
    status = "empty";
  }

  const dataset: ImportedDataset = {
    status,
    sourceFiles,
    profiles: deduplicated.profiles,
    warnings,
  };
  const validation = ImportedDatasetSchema.safeParse(dataset);
  if (!validation.success) {
    return {
      dataset: invalidDataset(
        sourceFiles.join(", "),
        "Os dados normalizados nao passaram pela validacao interna.",
      ),
      duplicatesRemoved: 0,
    };
  }

  return {
    dataset: validation.data,
    duplicatesRemoved:
      parsedFiles.reduce(
        (total, parsed) => total + parsed.duplicatesRemoved,
        0,
      ) + deduplicated.duplicatesRemoved,
  };
}
