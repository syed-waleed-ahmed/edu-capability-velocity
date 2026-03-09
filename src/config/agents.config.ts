export interface AgentConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  suggestions: string[];
}

export const AGENTS: AgentConfig[] = [
  {
    id: "content-converter-agent",
    name: "Content Converter",
    icon: "🔄",
    description: "Text → Flashcards, Quizzes, Study Plans",
    color: "#34e6cf",
    suggestions: [
      "Generate flashcards about photosynthesis",
      "Create a quiz on World War II",
      "Build a study plan for linear algebra",
    ],
  },
  {
    id: "study-package-agent",
    name: "Study Package",
    icon: "📚",
    description: "Files → Structured Study Package",
    color: "#80ef9a",
    suggestions: [
      "Create a study package from my notes",
      "Summarize and organize study material",
    ],
  },
  {
    id: "drive-study-package-agent",
    name: "Drive Import",
    icon: "📂",
    description: "Google Drive → Structured Study Package",
    color: "#66a3ff",
    suggestions: [
      "Import files from Drive folder 1A2B3C and create a study package",
      "List files in my Drive folder and build a revision package",
    ],
  },
];

export function getAgentById(id: string): AgentConfig {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0];
}
