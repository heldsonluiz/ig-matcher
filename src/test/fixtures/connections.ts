import type {
  ImportedDataset,
  InstagramSnapshot,
} from "@/features/instagram-import/types";

export function connectionDataset(
  usernames: string[],
  status?: ImportedDataset["status"],
): ImportedDataset {
  return {
    status: status ?? (usernames.length ? "available" : "empty"),
    sourceFiles: ["synthetic.json"],
    profiles: usernames.map((username, i) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: i === 0 ? null : 1700000000 + i,
    })),
    warnings: [],
  };
}

export function connectionSnapshot(
  overrides: Partial<InstagramSnapshot> = {},
): InstagramSnapshot {
  return {
    id: "synthetic-snapshot",
    importedAt: "2026-09-15T10:00:00.000Z",
    exportGeneratedAt: null,
    sourceFileName: "synthetic.zip",
    accountUsername: "conta_ficticia",
    followers: connectionDataset([
      "ana_ficticia",
      "bia_ficticia",
      "caio_ficticio",
    ]),
    following: connectionDataset(["ana_ficticia", "duda_ficticia"]),
    pendingSentRequests: connectionDataset([]),
    pendingReceivedRequests: connectionDataset([], "not_provided"),
    ...overrides,
  };
}
