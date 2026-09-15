import { describe, expect, it } from "vitest";
import type { ImportedDataset, InstagramSnapshot } from "@/features/instagram-import/types";
import { calculateRelationships } from "./calculate-relationships";

function dataset(usernames: string[], status: ImportedDataset["status"] = "available"): ImportedDataset {
  return {
    status,
    sourceFiles: usernames.length > 0 ? ["data.json"] : [],
    profiles: usernames.map((username) => ({
      username,
      profileUrl: `https://www.instagram.com/${username}/`,
      timestamp: null,
    })),
    warnings: [],
  };
}

function snapshot(overrides: Partial<InstagramSnapshot> = {}): InstagramSnapshot {
  return {
    id: "snapshot-1",
    importedAt: "2026-09-15T10:00:00.000Z",
    exportGeneratedAt: null,
    sourceFileName: "fixture.zip",
    accountUsername: "conta_ficticia",
    followers: dataset(["ana", "bia", "caio"]),
    following: dataset(["ana", "bia", "duda"]),
    pendingSentRequests: dataset(["eva"]),
    pendingReceivedRequests: dataset([], "not_provided"),
    ...overrides,
  };
}

describe("calculateRelationships", () => {
  it("calcula mutuos e diferencas no mesmo snapshot", () => {
    const result = calculateRelationships(snapshot());

    expect(result.mutuals.profiles.map(({ username }) => username)).toEqual(["ana", "bia"]);
    expect(result.notFollowingBack.profiles.map(({ username }) => username)).toEqual(["duda"]);
    expect(result.notFollowedBackByMe.profiles.map(({ username }) => username)).toEqual(["caio"]);
    expect(result.pendingSentCount).toBe(1);
    expect(result.pendingReceivedCount).toBeNull();
  });

  it("permite datasets vazios nos calculos", () => {
    const result = calculateRelationships(
      snapshot({ followers: dataset([], "empty") }),
    );

    expect(result.mutuals.status).toBe("available");
    expect(result.mutuals.profiles).toEqual([]);
    expect(result.notFollowingBack.profiles.map(({ username }) => username)).toEqual([
      "ana",
      "bia",
      "duda",
    ]);
  });

  it("nao calcula diferencas quando um conjunto nao foi fornecido", () => {
    const result = calculateRelationships(
      snapshot({ following: dataset([], "not_provided") }),
    );

    expect(result.followersCount).toBe(3);
    expect(result.followingCount).toBeNull();
    expect(result.mutuals.status).toBe("not_provided");
    expect(result.notFollowingBack.status).toBe("not_provided");
  });
});
