import { Mastra } from "@mastra/core";
import { studyPackageAgent } from "./agents/study-package-agent";
import { contentConverterAgent } from "./agents/content-converter-agent";
import { driveStudyPackageAgent } from "./agents/drive-study-package-agent";

export const mastra = new Mastra({
  agents: {
    "study-package-agent": studyPackageAgent,
    "content-converter-agent": contentConverterAgent,
    "drive-study-package-agent": driveStudyPackageAgent,
  },
});
