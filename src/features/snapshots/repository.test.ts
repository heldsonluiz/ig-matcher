import "fake-indexeddb/auto";
import { openDB } from "idb";
import {
  connectionSnapshot,
  connectionDataset,
} from "@/test/fixtures/connections";
import {
  closeSnapshotDatabase,
  createSnapshotSignature,
  deleteSnapshotDatabase,
  getSnapshot,
  listSnapshots,
  saveSnapshot,
  SnapshotConflictError,
} from "./repository";

beforeEach(async () => {
  await deleteSnapshotDatabase();
});
afterAll(async () => {
  await closeSnapshotDatabase();
});

it("salva apenas uma importação e exige confirmação para substituir", async () => {
  const first = connectionSnapshot();
  const second = connectionSnapshot({ id: "second" });
  await saveSnapshot(first);
  await expect(saveSnapshot(second)).rejects.toBeInstanceOf(
    SnapshotConflictError,
  );
  expect((await listSnapshots()).map((s) => s.id)).toEqual([first.id]);
  await saveSnapshot(second, first.id);
  expect((await listSnapshots()).map((s) => s.id)).toEqual([second.id]);
  expect(await getSnapshot(first.id)).toBeUndefined();
});

it("migra múltiplas importações antigas preservando apenas a mais recente", async () => {
  const legacy = await openDB("instagram-matcher", 1, {
    upgrade(db) {
      db.createObjectStore("snapshots", { keyPath: "id" });
    },
  });
  await legacy.put("snapshots", {
    ...connectionSnapshot({ id: "old", importedAt: "2026-09-14T10:00:00Z" }),
    signature: "",
    friendlyName: null,
  });
  await legacy.put("snapshots", {
    ...connectionSnapshot({ id: "new" }),
    signature: "",
    friendlyName: null,
  });
  legacy.close();
  expect((await listSnapshots()).map((s) => s.id)).toEqual(["new"]);
});

it("reverte a limpeza se a gravação da nova importação falhar", async () => {
  const first = connectionSnapshot();
  await saveSnapshot(first);
  const broken = {
    ...connectionSnapshot({ id: "broken" }),
    cannotClone: () => {},
  };
  await expect(saveSnapshot(broken, first.id)).rejects.toBeDefined();
  expect((await listSnapshots()).map((s) => s.id)).toEqual([first.id]);
});

it("impede que duas substituições simultâneas sobrescrevam dados sem confirmação", async () => {
  const first = connectionSnapshot();
  await saveSnapshot(first);
  const results = await Promise.allSettled([
    saveSnapshot(connectionSnapshot({ id: "a" }), first.id),
    saveSnapshot(connectionSnapshot({ id: "b" }), first.id),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  expect(await listSnapshots()).toHaveLength(1);
});

it("compara assinaturas sem depender da ordem e distingue dados ausentes de vazios", () => {
  const first = connectionSnapshot();
  const reordered = connectionSnapshot({
    followers: {
      ...first.followers,
      profiles: [...first.followers.profiles].reverse(),
    },
  });
  expect(createSnapshotSignature(first)).toBe(
    createSnapshotSignature(reordered),
  );
  expect(
    createSnapshotSignature(
      connectionSnapshot({ followers: connectionDataset([], "not_provided") }),
    ),
  ).not.toBe(
    createSnapshotSignature(
      connectionSnapshot({ followers: connectionDataset([]) }),
    ),
  );
});

it("apaga os dados e permite criar uma nova importação", async () => {
  await saveSnapshot(connectionSnapshot());
  await deleteSnapshotDatabase();
  expect(await listSnapshots()).toEqual([]);
  await saveSnapshot(connectionSnapshot());
  expect(await listSnapshots()).toHaveLength(1);
});
