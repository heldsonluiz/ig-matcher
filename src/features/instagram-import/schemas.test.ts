import followersFixture from "@/test/fixtures/followers.json";
import followingFixture from "@/test/fixtures/following.json";
import invalidFixture from "@/test/fixtures/invalid-export.json";
import {
  ImportedDatasetSchema,
  InstagramExportPayloadSchema,
  InstagramSnapshotSchema,
} from "./schemas";

describe("Instagram export schemas", () => {
  it("valida uma lista fictícia na raiz", () => {
    const result = InstagramExportPayloadSchema.safeParse(followersFixture);

    expect(result.success).toBe(true);
  });

  it("valida um envelope fictício de seguindo", () => {
    const result = InstagramExportPayloadSchema.safeParse(followingFixture);

    expect(result.success).toBe(true);
  });

  it("rejeita entradas externas inválidas", () => {
    const result = InstagramExportPayloadSchema.safeParse(invalidFixture);

    expect(result.success).toBe(false);
  });

  it("distingue dataset vazio de dataset não fornecido", () => {
    const emptyDataset = ImportedDatasetSchema.safeParse({
      status: "empty",
      sourceFiles: ["followers.json"],
      profiles: [],
      warnings: [],
    });
    const missingDataset = ImportedDatasetSchema.safeParse({
      status: "not_provided",
      sourceFiles: [],
      profiles: [],
      warnings: ["O arquivo não foi fornecido nesta exportação."],
    });

    expect(emptyDataset.success).toBe(true);
    expect(missingDataset.success).toBe(true);
  });

  it("valida um snapshot interno completo", () => {
    const dataset = {
      status: "available" as const,
      sourceFiles: ["followers.json"],
      profiles: [
        {
          username: "lunamar_ficticia",
          profileUrl: "https://www.instagram.com/lunamar_ficticia/",
          timestamp: 1700000000,
        },
      ],
      warnings: [],
    };
    const snapshot = InstagramSnapshotSchema.safeParse({
      id: "snapshot-ficticio-001",
      importedAt: "2026-09-15T12:00:00.000Z",
      exportGeneratedAt: null,
      sourceFileName: "instagram-export-ficticio.zip",
      accountUsername: "conta_ficticia",
      followers: dataset,
      following: dataset,
      pendingSentRequests: {
        ...dataset,
        status: "empty",
        sourceFiles: [],
        profiles: [],
      },
      pendingReceivedRequests: {
        ...dataset,
        status: "not_provided",
        sourceFiles: [],
        profiles: [],
      },
    });

    expect(snapshot.success).toBe(true);
  });
});
