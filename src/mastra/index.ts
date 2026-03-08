import { Mastra } from "@mastra/core";
import { studyPackageAgent } from "./agents/study-package-agent";
import { contentConverterAgent } from "./agents/content-converter-agent";

export const mastra = new Mastra({
  agents: {
    "study-package-agent": studyPackageAgent,
    "content-converter-agent": contentConverterAgent,
  },
});
