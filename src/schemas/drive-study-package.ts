import { z } from "zod";
import { studyPackageSchema } from "./study-package";

export const driveImportedFileSchema = z.object({
  id: z.string().describe("Google Drive file ID"),
  name: z.string().describe("File name"),
  mimeType: z.string().describe("Drive MIME type"),
  sizeBytes: z.number().describe("File size in bytes"),
  modifiedTime: z
    .string()
    .optional()
    .describe("ISO timestamp for last modification"),
});

export const driveStudyPackageSchema = studyPackageSchema.omit({ type: true }).extend({
  type: z.literal("drive-study-package"),
  source: z.object({
    provider: z.literal("google-drive"),
    folderId: z.string().optional(),
    fileCount: z.number().int().nonnegative(),
    files: z.array(driveImportedFileSchema).min(1),
  }),
  notes: z
    .array(z.string())
    .optional()
    .describe("Optional import or data quality notes"),
});

export type DriveStudyPackage = z.infer<typeof driveStudyPackageSchema>;
