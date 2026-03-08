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
    color: "#6366f1",
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
    color: "#22c55e",
    suggestions: [
      "Create a study package from my notes",
      "Summarize and organize study material",
    ],
  },
];

export function getAgentById(id: string): AgentConfig {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0];
}
