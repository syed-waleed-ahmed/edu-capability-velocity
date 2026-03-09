import { createTool } from "@mastra/core/tools";
import { z } from "zod";

const GOOGLE_DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

const driveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  modifiedTime: z.string().optional(),
});

type DriveFile = z.infer<typeof driveFileSchema>;

type DriveListResponse = {
  files?: Array<{
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
  }>;
};

type DriveFileMetadata = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
};

function getDriveAccessToken(accessToken?: string): string {
  const token = accessToken ?? process.env.GOOGLE_DRIVE_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "Google Drive access token missing. Set GOOGLE_DRIVE_ACCESS_TOKEN or pass accessToken in tool input."
    );
  }

  return token;
}

async function driveJsonRequest<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Drive request failed (${response.status}): ${body.slice(0, 300)}`
    );
  }

  return (await response.json()) as T;
}

async function driveTextRequest(url: string, accessToken: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Google Drive content request failed (${response.status}): ${body.slice(0, 300)}`
    );
  }

  return response.text();
}

function toDriveFile(file: {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}): DriveFile {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    sizeBytes: Number(file.size ?? 0),
    modifiedTime: file.modifiedTime,
  };
}

function getDriveExportMimeType(mimeType: string): string | null {
  switch (mimeType) {
    case "application/vnd.google-apps.document":
      return "text/plain";
    case "application/vnd.google-apps.presentation":
      return "text/plain";
    case "application/vnd.google-apps.spreadsheet":
      return "text/csv";
    default:
      return null;
  }
}

function supportsDirectTextDownload(mimeType: string): boolean {
  return [
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
  ].includes(mimeType);
}

export const driveListFilesTool = createTool({
  id: "drive-list-files",
  description:
    "List files from a Google Drive folder. Requires a Google OAuth access token.",
  inputSchema: z.object({
    folderId: z
      .string()
      .describe("Google Drive folder ID to list files from"),
    pageSize: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("Max number of files to return (default 10)"),
    query: z
      .string()
      .optional()
      .describe("Optional extra Drive query to append (e.g., name contains 'math')"),
    accessToken: z
      .string()
      .optional()
      .describe("Google OAuth access token (optional if env var is set)"),
  }),
  outputSchema: z.object({
    folderId: z.string(),
    files: z.array(driveFileSchema),
    totalFiles: z.number(),
  }),
  execute: async ({ folderId, pageSize = 10, query, accessToken }) => {
    const token = getDriveAccessToken(accessToken);

    const queryParts = [`'${folderId}' in parents`, "trashed = false"];
    if (query?.trim()) {
      queryParts.push(query.trim());
    }

    const params = new URLSearchParams({
      q: queryParts.join(" and "),
      fields: "files(id,name,mimeType,size,modifiedTime)",
      orderBy: "modifiedTime desc",
      pageSize: String(pageSize),
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });

    const url = `${GOOGLE_DRIVE_API_BASE}/files?${params.toString()}`;
    const payload = await driveJsonRequest<DriveListResponse>(url, token);

    const files = (payload.files ?? []).map(toDriveFile);

    return {
      folderId,
      files,
      totalFiles: files.length,
    };
  },
});

export const driveReadFileTool = createTool({
  id: "drive-read-file",
  description:
    "Read textual content from a Google Drive file by ID. Supports Google Docs, Slides, Sheets, plain text, markdown, CSV, and JSON.",
  inputSchema: z.object({
    fileId: z.string().describe("Google Drive file ID"),
    maxCharacters: z
      .number()
      .int()
      .min(500)
      .max(50000)
      .optional()
      .describe("Max number of characters returned (default 12000)"),
    accessToken: z
      .string()
      .optional()
      .describe("Google OAuth access token (optional if env var is set)"),
  }),
  outputSchema: z.object({
    file: driveFileSchema,
    content: z.string(),
    characterCount: z.number(),
    truncated: z.boolean(),
  }),
  execute: async ({ fileId, maxCharacters = 12000, accessToken }) => {
    const token = getDriveAccessToken(accessToken);

    const metadataParams = new URLSearchParams({
      fields: "id,name,mimeType,size,modifiedTime",
      supportsAllDrives: "true",
    });

    const metadataUrl = `${GOOGLE_DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?${metadataParams.toString()}`;
    const metadata = await driveJsonRequest<DriveFileMetadata>(metadataUrl, token);

    const exportMimeType = getDriveExportMimeType(metadata.mimeType);

    let contentUrl = "";

    if (exportMimeType) {
      const exportParams = new URLSearchParams({
        mimeType: exportMimeType,
      });
      contentUrl = `${GOOGLE_DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}/export?${exportParams.toString()}`;
    } else if (supportsDirectTextDownload(metadata.mimeType)) {
      const mediaParams = new URLSearchParams({
        alt: "media",
        supportsAllDrives: "true",
      });
      contentUrl = `${GOOGLE_DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?${mediaParams.toString()}`;
    } else {
      throw new Error(
        `Unsupported file type for text extraction: ${metadata.mimeType}. Use Docs/Slides/Sheets or text-like files.`
      );
    }

    const rawContent = await driveTextRequest(contentUrl, token);
    const normalized = rawContent.trim();
    const truncated = normalized.length > maxCharacters;
    const content = truncated ? `${normalized.slice(0, maxCharacters)}\n\n...[truncated]` : normalized;

    return {
      file: toDriveFile(metadata),
      content,
      characterCount: normalized.length,
      truncated,
    };
  },
});
