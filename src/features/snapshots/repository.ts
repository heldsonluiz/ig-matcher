import { deleteDB, openDB, type IDBPDatabase } from "idb";
import type { InstagramSnapshot } from "@/features/instagram-import/types";
import type { StoredInstagramSnapshot } from "./types";

const databaseName = "instagram-matcher";
const databaseVersion = 1;
const snapshotStore = "snapshots";

let databasePromise: Promise<IDBPDatabase<{ snapshots: StoredInstagramSnapshot }>> | null = null;

function getDatabase() {
  databasePromise ??= openDB<{ snapshots: StoredInstagramSnapshot }>(
    databaseName,
    databaseVersion,
    {
      upgrade(database) {
        if (!database.objectStoreNames.contains(snapshotStore)) {
          database.createObjectStore(snapshotStore, { keyPath: "id" });
        }
      },
    },
  );
  return databasePromise;
}

function datasetUsernames(snapshot: InstagramSnapshot, dataset: keyof Pick<InstagramSnapshot, "followers" | "following" | "pendingSentRequests" | "pendingReceivedRequests">) {
  return snapshot[dataset].profiles.map(({ username }) => username).sort();
}

export function createSnapshotSignature(snapshot: InstagramSnapshot): string {
  return JSON.stringify({
    accountUsername: snapshot.accountUsername,
    followers: datasetUsernames(snapshot, "followers"),
    following: datasetUsernames(snapshot, "following"),
    pendingSentRequests: datasetUsernames(snapshot, "pendingSentRequests"),
    pendingReceivedRequests: datasetUsernames(snapshot, "pendingReceivedRequests"),
  });
}

export async function saveSnapshot(
  snapshot: InstagramSnapshot,
  friendlyName: string | null = null,
): Promise<StoredInstagramSnapshot> {
  const storedSnapshot: StoredInstagramSnapshot = {
    ...snapshot,
    friendlyName,
    signature: createSnapshotSignature(snapshot),
  };
  const database = await getDatabase();
  await database.put(snapshotStore, storedSnapshot);
  return storedSnapshot;
}

export async function listSnapshots(): Promise<StoredInstagramSnapshot[]> {
  const database = await getDatabase();
  const snapshots = await database.getAll(snapshotStore);
  return snapshots.sort((left, right) => right.importedAt.localeCompare(left.importedAt));
}

export async function getSnapshot(id: string): Promise<StoredInstagramSnapshot | undefined> {
  const database = await getDatabase();
  return database.get(snapshotStore, id);
}

export async function updateSnapshotName(
  id: string,
  friendlyName: string | null,
): Promise<StoredInstagramSnapshot | undefined> {
  const database = await getDatabase();
  const snapshot = await database.get(snapshotStore, id);
  if (!snapshot) return undefined;
  const updatedSnapshot = { ...snapshot, friendlyName };
  await database.put(snapshotStore, updatedSnapshot);
  return updatedSnapshot;
}

export async function deleteSnapshot(id: string): Promise<void> {
  const database = await getDatabase();
  await database.delete(snapshotStore, id);
}

export async function deleteAllSnapshots(): Promise<void> {
  const database = await getDatabase();
  await database.clear(snapshotStore);
}

export async function closeSnapshotDatabase(): Promise<void> {
  if (!databasePromise) return;
  const database = await databasePromise;
  database.close();
  databasePromise = null;
}

export async function deleteSnapshotDatabase(): Promise<void> {
  await closeSnapshotDatabase();
  await deleteDB(databaseName);
}
