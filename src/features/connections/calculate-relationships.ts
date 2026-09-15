import type { ImportedDataset, InstagramProfile, InstagramSnapshot } from "@/features/instagram-import/types";

export type RelationshipList = {
  status: "available" | "not_provided";
  profiles: InstagramProfile[];
};

export type RelationshipSummary = {
  followersCount: number | null;
  followingCount: number | null;
  pendingSentCount: number | null;
  pendingReceivedCount: number | null;
  mutuals: RelationshipList;
  notFollowingBack: RelationshipList;
  notFollowedBackByMe: RelationshipList;
};

function datasetIsUsable(dataset: ImportedDataset): boolean {
  return dataset.status === "available" || dataset.status === "empty";
}

function profileMap(profiles: InstagramProfile[]): Map<string, InstagramProfile> {
  return new Map(profiles.map((profile) => [profile.username, profile]));
}

function unavailableList(): RelationshipList {
  return { status: "not_provided", profiles: [] };
}

export function calculateRelationships(
  snapshot: InstagramSnapshot,
): RelationshipSummary {
  const followersUsable = datasetIsUsable(snapshot.followers);
  const followingUsable = datasetIsUsable(snapshot.following);
  const followers = profileMap(snapshot.followers.profiles);
  const following = profileMap(snapshot.following.profiles);

  if (!followersUsable || !followingUsable) {
    return {
      followersCount: followersUsable ? snapshot.followers.profiles.length : null,
      followingCount: followingUsable ? snapshot.following.profiles.length : null,
      pendingSentCount: datasetIsUsable(snapshot.pendingSentRequests)
        ? snapshot.pendingSentRequests.profiles.length
        : null,
      pendingReceivedCount: datasetIsUsable(snapshot.pendingReceivedRequests)
        ? snapshot.pendingReceivedRequests.profiles.length
        : null,
      mutuals: unavailableList(),
      notFollowingBack: unavailableList(),
      notFollowedBackByMe: unavailableList(),
    };
  }

  const mutuals = [...followers.keys()]
    .filter((username) => following.has(username))
    .map((username) => followers.get(username) as InstagramProfile);
  const notFollowingBack = [...following.values()].filter(
    ({ username }) => !followers.has(username),
  );
  const notFollowedBackByMe = [...followers.values()].filter(
    ({ username }) => !following.has(username),
  );

  return {
    followersCount: snapshot.followers.profiles.length,
    followingCount: snapshot.following.profiles.length,
    pendingSentCount: datasetIsUsable(snapshot.pendingSentRequests)
      ? snapshot.pendingSentRequests.profiles.length
      : null,
    pendingReceivedCount: datasetIsUsable(snapshot.pendingReceivedRequests)
      ? snapshot.pendingReceivedRequests.profiles.length
      : null,
    mutuals: { status: "available", profiles: mutuals },
    notFollowingBack: { status: "available", profiles: notFollowingBack },
    notFollowedBackByMe: {
      status: "available",
      profiles: notFollowedBackByMe,
    },
  };
}
