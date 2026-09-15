export type InstagramProfile = {
  username: string;
  profileUrl: string;
  timestamp: number | null;
};

export type DatasetStatus = "available" | "empty" | "not_provided" | "invalid";

export type ImportedDataset = {
  status: DatasetStatus;
  sourceFiles: string[];
  profiles: InstagramProfile[];
  warnings: string[];
};

export type InstagramSnapshot = {
  id: string;
  importedAt: string;
  exportGeneratedAt: string | null;
  sourceFileName: string;
  accountUsername: string | null;
  followers: ImportedDataset;
  following: ImportedDataset;
  pendingSentRequests: ImportedDataset;
  pendingReceivedRequests: ImportedDataset;
};

export type DeduplicatedProfiles = {
  profiles: InstagramProfile[];
  duplicatesRemoved: number;
};
