import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";

export const fileReaderTool = createTool({
  id: "read-file",
  description:
    "Read the contents of a file from the local filesystem. Supports text files (.txt, .md, .pdf text, .docx text). Returns the raw text content of the file.",
  inputSchema: z.object({
    filePath: z
      .string()
      .describe(
        "Absolute or relative path to the file to read (e.g., './documents/chapter1.txt')"
      ),
  }),
  outputSchema: z.object({
    content: z.string().describe("The text content of the file"),
    fileName: z.string().describe("The name of the file"),
    fileSize: z.number().describe("The size of the file in bytes"),
  }),
  execute: async ({ filePath }) => {
    try {
      const resolvedPath = path.resolve(filePath);
      const stats = await fs.stat(resolvedPath);
      const content = await fs.readFile(resolvedPath, "utf-8");

      return {
        content,
        fileName: path.basename(resolvedPath),
        fileSize: stats.size,
      };
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error reading file";
      throw new Error(`Failed to read file "${filePath}": ${errMsg}`);
    }
  },
});

export const directoryReaderTool = createTool({
  id: "list-directory",
  description:
    "List all files in a directory. Useful for discovering what learning materials are available before reading them.",
  inputSchema: z.object({
    dirPath: z
      .string()
      .describe("Absolute or relative path to the directory to list"),
    extensions: z
      .array(z.string())
      .optional()
      .describe(
        "Optional file extensions to filter by (e.g., ['.txt', '.md', '.pdf'])"
      ),
  }),
  outputSchema: z.object({
    files: z.array(
      z.object({
        name: z.string(),
        path: z.string(),
        size: z.number(),
        isDirectory: z.boolean(),
      })
    ),
    totalFiles: z.number(),
  }),
  execute: async ({ dirPath, extensions }) => {
    try {
      const resolvedPath = path.resolve(dirPath);
      const entries = await fs.readdir(resolvedPath, { withFileTypes: true });

      let files = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(resolvedPath, entry.name);
          const stats = await fs.stat(fullPath);
          return {
            name: entry.name,
            path: fullPath,
            size: stats.size,
            isDirectory: entry.isDirectory(),
          };
        })
      );

      if (extensions && extensions.length > 0) {
        files = files.filter(
          (f) =>
            f.isDirectory ||
            extensions.some((ext) => f.name.toLowerCase().endsWith(ext))
        );
      }

      return { files, totalFiles: files.length };
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Unknown error listing directory";
      throw new Error(`Failed to list directory "${dirPath}": ${errMsg}`);
    }
  },
});
