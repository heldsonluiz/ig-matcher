import { deleteDB, openDB, type IDBPDatabase } from "idb";
import type { InstagramSnapshot } from "@/features/instagram-import/types";
import type { StoredInstagramSnapshot } from "./types";

const databaseName = "instagram-matcher";
const databaseVersion = 2;
const snapshotStore = "snapshots";

let databasePromise: Promise<
  IDBPDatabase<{ snapshots: StoredInstagramSnapshot }>
> | null = null;

function getDatabase() {
  databasePromise ??= openDB<{ snapshots: StoredInstagramSnapshot }>(
    databaseName,
    databaseVersion,
    {
      async upgrade(database, oldVersion, _newVersion, transaction) {
        if (!database.objectStoreNames.contains(snapshotStore)) {
          database.createObjectStore(snapshotStore, { keyPath: "id" });
        } else if (oldVersion < 2) {
          const store = transaction.objectStore(snapshotStore);
          const snapshots = await store.getAll();
          snapshots.sort(
            (a, b) =>
              b.importedAt.localeCompare(a.importedAt) ||
              b.id.localeCompare(a.id),
          );
          await store.clear();
          if (snapshots[0]) await store.put(snapshots[0]);
        }
      },
      blocking() {
        void closeSnapshotDatabase();
      },
    },
  );
  return databasePromise;
}

export function createSnapshotSignature(snapshot: InstagramSnapshot): string {
  return JSON.stringify({
    accountUsername: snapshot.accountUsername,
    datasets: [
      snapshot.followers,
      snapshot.following,
      snapshot.pendingSentRequests,
      snapshot.pendingReceivedRequests,
    ].map((dataset) => ({
      status: dataset.status,
      profiles: dataset.profiles
        .map(({ username, timestamp }) => [username, timestamp])
        .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    })),
  });
}

export class SnapshotConflictError extends Error {
  constructor(public current: StoredInstagramSnapshot | undefined) {
    super("A importação atual mudou. Revise a substituição novamente.");
    this.name = "SnapshotConflictError";
  }
}

export async function saveSnapshot(
  snapshot: InstagramSnapshot,
  expectedCurrentId: string | null = null,
): Promise<StoredInstagramSnapshot> {
  const storedSnapshot: StoredInstagramSnapshot = {
    ...snapshot,
    friendlyName: null,
    signature: createSnapshotSignature(snapshot),
  };
  const database = await getDatabase();
  const transaction = database.transaction(snapshotStore, "readwrite");
  const current = (await transaction.store.getAll())[0];
  if ((current?.id ?? null) !== expectedCurrentId) {
    await transaction.done;
    throw new SnapshotConflictError(current);
  }
  try {
    await transaction.store.clear();
    await transaction.store.put(storedSnapshot);
    await transaction.done;
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      /* Already aborted. */
    }
    await transaction.done.catch(() => {});
    throw error;
  }
  return storedSnapshot;
}

export async function getCurrentSnapshot(): Promise<
  StoredInstagramSnapshot | undefined
> {
  return (await listSnapshots())[0];
}

export async function listSnapshots(): Promise<StoredInstagramSnapshot[]> {
  const database = await getDatabase();
  const snapshots = await database.getAll(snapshotStore);
  return snapshots.sort((left, right) =>
    right.importedAt.localeCompare(left.importedAt),
  );
}

export async function getSnapshot(
  id: string,
): Promise<StoredInstagramSnapshot | undefined> {
  const database = await getDatabase();
  return database.get(snapshotStore, id);
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
