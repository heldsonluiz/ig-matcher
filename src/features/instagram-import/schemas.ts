import { z } from "zod";

export const InstagramStringListDataSchema = z
  .object({
    href: z.string().url().optional(),
    value: z.string().trim().min(1),
    timestamp: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export const InstagramExportEntrySchema = z
  .object({
    title: z.string().optional(),
    media_list_data: z.array(z.unknown()).optional(),
    string_list_data: z.array(InstagramStringListDataSchema),
  })
  .passthrough();

const RelationshipsEnvelopeSchema = z.object({
  relationships_followers: z.array(InstagramExportEntrySchema).optional(),
  relationships_following: z.array(InstagramExportEntrySchema).optional(),
  relationships_follow_requests: z.array(InstagramExportEntrySchema).optional(),
  relationships_follow_requests_sent: z
    .array(InstagramExportEntrySchema)
    .optional(),
  relationships_follow_requests_received: z
    .array(InstagramExportEntrySchema)
    .optional(),
});

export const InstagramExportPayloadSchema = z.union([
  z.array(InstagramExportEntrySchema),
  RelationshipsEnvelopeSchema,
]);

export const InstagramProfileSchema = z.object({
  username: z.string().trim().min(1),
  profileUrl: z.string().url(),
  timestamp: z.number().int().nonnegative().nullable(),
});

export const DatasetStatusSchema = z.enum([
  "available",
  "empty",
  "not_provided",
  "invalid",
]);

export const ImportedDatasetSchema = z.object({
  status: DatasetStatusSchema,
  sourceFiles: z.array(z.string().min(1)),
  profiles: z.array(InstagramProfileSchema),
  warnings: z.array(z.string()),
});

export const InstagramSnapshotSchema = z.object({
  id: z.string().min(1),
  importedAt: z.string().datetime({ offset: true }),
  exportGeneratedAt: z.string().datetime({ offset: true }).nullable(),
  sourceFileName: z.string().min(1),
  accountUsername: z.string().trim().min(1).nullable(),
  followers: ImportedDatasetSchema,
  following: ImportedDatasetSchema,
  pendingSentRequests: ImportedDatasetSchema,
  pendingReceivedRequests: ImportedDatasetSchema,
});
