import type { InstagramSnapshot } from "@/features/instagram-import/types";

export type StoredInstagramSnapshot = InstagramSnapshot & {
  friendlyName: string | null;
  signature: string;
};
