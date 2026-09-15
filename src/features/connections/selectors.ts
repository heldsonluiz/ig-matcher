import type {
  ImportedDataset,
  InstagramProfile,
  InstagramSnapshot,
} from "@/features/instagram-import/types";
import { normalizeUsername } from "@/features/instagram-import/normalize-entry";
import { calculateRelationships } from "./calculate-relationships";

export const categories = {
  followers: "Seguidores",
  following: "Seguindo",
  mutuals: "Conexões mútuas",
  "not-following-back": "Não seguem de volta",
  "not-followed-back": "Não sigo de volta",
  "pending-sent": "Solicitações enviadas",
  "pending-received": "Solicitações recebidas",
} as const;
export type ConnectionCategory = keyof typeof categories;
export type ConnectionSort = "az" | "za" | "newest" | "oldest";
export const pageSize = 50;

export function isRequestCategory(category: ConnectionCategory) {
  return category === "pending-sent" || category === "pending-received";
}

export function isConnectionCategory(
  value: string,
): value is ConnectionCategory {
  return Object.hasOwn(categories, value);
}

export function connectionHref(
  category: ConnectionCategory,
  snapshotId: string,
) {
  return `/connections/${category}?snapshot=${encodeURIComponent(snapshotId)}`;
}

export function selectConnections(
  snapshot: InstagramSnapshot,
  category: ConnectionCategory,
): ImportedDataset {
  if (category === "pending-sent") return snapshot.pendingSentRequests;
  if (category === "pending-received") return snapshot.pendingReceivedRequests;
  if (category === "followers" || category === "following")
    return snapshot[category];
  const datasets = [snapshot.followers, snapshot.following];
  const common = {
    sourceFiles: datasets.flatMap((d) => d.sourceFiles),
    warnings: datasets.flatMap((d) => d.warnings),
  };
  if (datasets.some((d) => d.status === "invalid"))
    return { ...common, status: "invalid", profiles: [] };
  if (datasets.some((d) => d.status === "not_provided"))
    return { ...common, status: "not_provided", profiles: [] };
  const summary = calculateRelationships(snapshot);
  const profiles =
    category === "mutuals"
      ? summary.mutuals.profiles
      : category === "not-following-back"
        ? summary.notFollowingBack.profiles
        : summary.notFollowedBackByMe.profiles;
  return {
    ...common,
    status: profiles.length ? "available" : "empty",
    profiles,
  };
}

export function filterAndSortProfiles(
  profiles: InstagramProfile[],
  query: string,
  sort: ConnectionSort,
): InstagramProfile[] {
  const search = normalizeUsername(query);
  return profiles
    .filter((p) => p.username.includes(search))
    .sort((a, b) => {
      const alphabetical = a.username.localeCompare(b.username, "en-US");
      if (sort === "az") return alphabetical;
      if (sort === "za") return -alphabetical;
      if (a.timestamp === null) return b.timestamp === null ? alphabetical : 1;
      if (b.timestamp === null) return -1;
      return (
        (sort === "oldest"
          ? a.timestamp - b.timestamp
          : b.timestamp - a.timestamp) || alphabetical
      );
    });
}

export function relationshipLabels(
  snapshot: InstagramSnapshot,
  category: ConnectionCategory,
): Map<string, string> {
  if (isRequestCategory(category)) {
    return new Map(
      selectConnections(snapshot, category).profiles.map((p) => [
        p.username,
        category === "pending-sent"
          ? "Solicitação pendente"
          : "Solicitação recebida",
      ]),
    );
  }
  const counterpart =
    category === "following" || category === "not-following-back"
      ? snapshot.followers
      : snapshot.following;
  const available =
    counterpart.status === "available" || counterpart.status === "empty";
  const usernames = new Set(counterpart.profiles.map((p) => p.username));
  return new Map(
    selectConnections(snapshot, category).profiles.map((p) => [
      p.username,
      !available
        ? "Relação indisponível"
        : usernames.has(p.username)
          ? "Conexão mútua"
          : category === "following" || category === "not-following-back"
            ? "Não segue você de volta"
            : "Você não segue de volta",
    ]),
  );
}
