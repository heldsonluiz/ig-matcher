import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import type {
  ImportedDataset,
  InstagramSnapshot,
} from "@/features/instagram-import/types";
import {
  closeSnapshotDatabase,
  createSnapshotSignature,
  deleteAllSnapshots,
  deleteSnapshotDatabase,
  getSnapshot,
  listSnapshots,
  saveSnapshot,
  updateSnapshotName,
} from "./repository";

function dataset(usernames: string[]): ImportedDataset {
  return {
    status: usernames.length > 0 ? "available" : "empty",
    sourceFiles: ["followers.json"],
    profiles: usernames.map((username) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: null,
    })),
    warnings: [],
  };
}

function snapshot(
  id: string,
  importedAt: string,
  usernames: string[],
): InstagramSnapshot {
  const empty = dataset([]);
  return {
    id,
    importedAt,
    exportGeneratedAt: null,
    sourceFileName: "export-ficticio.zip",
    accountUsername: "conta_ficticia",
    followers: dataset(usernames),
    following: empty,
    pendingSentRequests: empty,
    pendingReceivedRequests: {
      ...empty,
      status: "not_provided",
      sourceFiles: [],
    },
  };
}

describe("snapshot repository", () => {
  beforeEach(async () => {
    await deleteSnapshotDatabase();
  });

  it("salva, lista e recupera snapshots no IndexedDB", async () => {
    const first = snapshot("snapshot-1", "2026-09-15T10:00:00.000Z", ["alfa"]);
    const second = snapshot("snapshot-2", "2026-09-15T11:00:00.000Z", ["beta"]);

    await saveSnapshot(first);
    await saveSnapshot(second, "Snapshot da manha");

    expect((await getSnapshot("snapshot-1"))?.id).toBe("snapshot-1");
    expect((await listSnapshots()).map(({ id }) => id)).toEqual([
      "snapshot-2",
      "snapshot-1",
    ]);
    expect((await getSnapshot("snapshot-2"))?.friendlyName).toBe(
      "Snapshot da manha",
    );
  });

  it("gera a mesma assinatura para os mesmos conjuntos em ordens diferentes", () => {
    const first = snapshot("snapshot-1", "2026-09-15T10:00:00.000Z", [
      "alfa",
      "beta",
    ]);
    const second = snapshot("snapshot-2", "2026-09-15T12:00:00.000Z", [
      "beta",
      "alfa",
    ]);

    expect(createSnapshotSignature(first)).toBe(
      createSnapshotSignature(second),
    );
  });

  it("atualiza o nome amigável sem alterar os dados do snapshot", async () => {
    await saveSnapshot(
      snapshot("snapshot-1", "2026-09-15T10:00:00.000Z", ["alfa"]),
    );

    const updated = await updateSnapshotName(
      "snapshot-1",
      "Exportação inicial",
    );

    expect(updated?.friendlyName).toBe("Exportação inicial");
    expect(updated?.followers.profiles[0].username).toBe("alfa");
  });

  it("apaga todos os snapshots", async () => {
    await saveSnapshot(
      snapshot("snapshot-1", "2026-09-15T10:00:00.000Z", ["alfa"]),
    );
    await deleteAllSnapshots();

    await expect(listSnapshots()).resolves.toEqual([]);
  });

  it("trata snapshot inexistente ao atualizar nome", async () => {
    await expect(
      updateSnapshotName("missing", "Nome"),
    ).resolves.toBeUndefined();
  });

  afterAll(async () => {
    await closeSnapshotDatabase();
  });
});
