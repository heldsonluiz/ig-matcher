import JSZip from "jszip";

export const DEFAULT_ZIP_LIMITS = {
  maxCompressedBytes: 100 * 1024 * 1024,
  maxEntries: 2_000,
  maxUncompressedBytes: 500 * 1024 * 1024,
  maxFileBytes: 50 * 1024 * 1024,
  maxPathDepth: 12,
};

type ZipInput = Blob | ArrayBuffer | Uint8Array;

type ZipMetadata = {
  compressedSize?: number;
  uncompressedSize?: number;
};

export type ImportFileKind =
  | "followers"
  | "following"
  | "pending_sent_requests"
  | "pending_received_requests";

export type DiscoveredFile = {
  path: string;
  baseName: string;
  kind: ImportFileKind;
  part: number;
  compressedSize: number | null;
  uncompressedSize: number | null;
  readText: () => Promise<string>;
};

export type DiscoveredZip = {
  files: DiscoveredFile[];
  ignoredFiles: number;
  totalUncompressedBytes: number;
};

export class ZipImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZipImportError";
  }
}

function getInputSize(input: ZipInput): number {
  if (input instanceof Blob) return input.size;
  if (input instanceof ArrayBuffer) return input.byteLength;
  return input.byteLength;
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\/+/, "");
}

function getPathDepth(path: string): number {
  return Math.max(0, path.split("/").length - 1);
}

function getZipMetadata(entry: JSZip.JSZipObject): ZipMetadata {
  const data = (entry as JSZip.JSZipObject & { _data?: ZipMetadata })._data;
  return data ?? {};
}

function getFileMatch(
  baseName: string,
): { kind: ImportFileKind; part: number } | null {
  const normalizedName = baseName.toLocaleLowerCase("en-US");
  const followersMatch = normalizedName.match(/^followers(?:_(\d+))?\.json$/);
  if (followersMatch) {
    return {
      kind: "followers",
      part: followersMatch[1] ? Number(followersMatch[1]) : 0,
    };
  }

  const followingMatch = normalizedName.match(/^following(?:_(\d+))?\.json$/);
  if (followingMatch) {
    return {
      kind: "following",
      part: followingMatch[1] ? Number(followingMatch[1]) : 0,
    };
  }

  if (normalizedName === "pending_follow_requests.json") {
    return { kind: "pending_sent_requests", part: 0 };
  }

  if (/^follow_requests_you'?ve_received\.json$/.test(normalizedName)) {
    return { kind: "pending_received_requests", part: 0 };
  }

  return null;
}

function assertPathIsSafe(
  path: string,
  limits: typeof DEFAULT_ZIP_LIMITS,
): void {
  const segments = path.split("/");
  if (segments.some((segment) => segment === ".." || segment === ".")) {
    throw new ZipImportError("O ZIP contem um caminho de arquivo inseguro.");
  }
  if (getPathDepth(path) > limits.maxPathDepth) {
    throw new ZipImportError(
      "O ZIP contem uma pasta mais profunda que o limite permitido.",
    );
  }
}

export async function discoverFiles(
  input: ZipInput,
  customLimits: Partial<typeof DEFAULT_ZIP_LIMITS> = {},
): Promise<DiscoveredZip> {
  const limits = { ...DEFAULT_ZIP_LIMITS, ...customLimits };
  if (getInputSize(input) > limits.maxCompressedBytes) {
    throw new ZipImportError("O ZIP excede o limite de tamanho permitido.");
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(input, { checkCRC32: false });
  } catch {
    throw new ZipImportError("Nao foi possivel abrir o arquivo ZIP.");
  }

  const entries = Object.values(zip.files).filter((entry) => !entry.dir);
  if (entries.length > limits.maxEntries) {
    throw new ZipImportError(
      "O ZIP contem mais arquivos que o limite permitido.",
    );
  }

  let totalUncompressedBytes = 0;
  let ignoredFiles = 0;
  const files: DiscoveredFile[] = [];

  for (const entry of entries) {
    const path = normalizePath(entry.unsafeOriginalName ?? entry.name);
    assertPathIsSafe(path, limits);

    const baseName = path.split("/").at(-1) ?? path;
    const metadata = getZipMetadata(entry);
    const uncompressedSize = metadata.uncompressedSize ?? null;
    const compressedSize = metadata.compressedSize ?? null;
    if (uncompressedSize !== null) {
      if (uncompressedSize > limits.maxFileBytes) {
        throw new ZipImportError(
          `O arquivo ${baseName} excede o limite permitido.`,
        );
      }
      totalUncompressedBytes += uncompressedSize;
      if (totalUncompressedBytes > limits.maxUncompressedBytes) {
        throw new ZipImportError("O ZIP excede o limite total descompactado.");
      }
    }

    const match = getFileMatch(baseName);
    if (!match) {
      ignoredFiles += 1;
      continue;
    }

    files.push({
      path,
      baseName,
      ...match,
      compressedSize,
      uncompressedSize,
      readText: async () => {
        const content = await entry.async("uint8array");
        if (content.byteLength > limits.maxFileBytes) {
          throw new ZipImportError(
            `O arquivo ${baseName} excede o limite permitido.`,
          );
        }
        return new TextDecoder().decode(content);
      },
    });
  }

  files.sort((left, right) => {
    if (left.kind !== right.kind) return left.kind.localeCompare(right.kind);
    return left.part - right.part || left.path.localeCompare(right.path);
  });

  return { files, ignoredFiles, totalUncompressedBytes };
}
