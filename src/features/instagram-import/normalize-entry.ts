import type { DeduplicatedProfiles, InstagramProfile } from "./types";

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@/, "").toLocaleLowerCase("en-US");
}

export function normalizeProfile(profile: InstagramProfile): InstagramProfile {
  return {
    ...profile,
    username: normalizeUsername(profile.username),
  };
}

export function deduplicateProfiles(
  profiles: InstagramProfile[],
): DeduplicatedProfiles {
  const seenUsernames = new Set<string>();
  const uniqueProfiles: InstagramProfile[] = [];
  let duplicatesRemoved = 0;

  for (const profile of profiles) {
    const normalizedProfile = normalizeProfile(profile);

    if (!normalizedProfile.username) {
      continue;
    }

    if (seenUsernames.has(normalizedProfile.username)) {
      duplicatesRemoved += 1;
      continue;
    }

    seenUsernames.add(normalizedProfile.username);
    uniqueProfiles.push(normalizedProfile);
  }

  return { profiles: uniqueProfiles, duplicatesRemoved };
}
