import {
  parseStructuredOutput,
  type StructuredOutput,
} from "@/schemas/structured-output";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function stripOptionPrefix(option: string): string {
  return option.replace(/^[A-Z]\s*[).:-]\s*/i, "").trim();
}

function normalizeDifficulty(value: unknown): "easy" | "medium" | "hard" {
  const difficulty = asString(value)?.toLowerCase();

  if (difficulty === "easy" || difficulty === "hard") {
    return difficulty;
  }

  return "medium";
}

function mapAnswerToOption(answer: string, options: string[]): string {
  const normalizedAnswer = answer.trim();
  const letterMatch = normalizedAnswer.match(/^[A-Z]$/i);

  if (letterMatch) {
    const index = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
    if (index >= 0 && index < options.length) {
      return options[index];
    }
  }

  const numericIndex = Number.parseInt(normalizedAnswer, 10);
  if (
    Number.isFinite(numericIndex) &&
    numericIndex >= 1 &&
    numericIndex <= options.length
  ) {
    return options[numericIndex - 1];
  }

  const cleanAnswer = stripOptionPrefix(normalizedAnswer);
  const optionMatch = options.find(
    (option) => option.toLowerCase() === cleanAnswer.toLowerCase()
  );

  return optionMatch ?? cleanAnswer;
}

function normalizeQuizQuestion(
  question: unknown,
  index: number
): JsonRecord | null {
  if (!isRecord(question)) {
    return null;
  }

  const questionText =
    asString(question.question) ?? asString(question.prompt) ?? null;

  if (!questionText) {
    return null;
  }

  const rawOptions = Array.isArray(question.options)
    ? question.options
        .map((option) => asString(option))
        .filter((option): option is string => Boolean(option))
    : [];

  const options = rawOptions.map(stripOptionPrefix);
  const explicitType = asString(question.type);
  const type =
    explicitType === "multiple_choice" || explicitType === "open_ended"
      ? explicitType
      : options.length > 0
        ? "multiple_choice"
        : "open_ended";

  const rawAnswer =
    asString(question.correctAnswer) ??
    asString(question.correct_answer) ??
    asString(question.answer) ??
    "";

  const correctAnswer =
    type === "multiple_choice"
      ? mapAnswerToOption(rawAnswer, options)
      : rawAnswer;

  const parsedId =
    typeof question.id === "number"
      ? question.id
      : Number.parseInt(asString(question.id) ?? "", 10);

  return {
    id: Number.isFinite(parsedId) ? parsedId : index + 1,
    question: questionText,
    type,
    options: type === "multiple_choice" ? options : undefined,
    correctAnswer,
    explanation: asString(question.explanation) ?? "",
  };
}

function normalizeQuizPayload(payload: JsonRecord): JsonRecord {
  const questions = Array.isArray(payload.questions)
    ? payload.questions
        .map((question, index) => normalizeQuizQuestion(question, index))
        .filter((question): question is JsonRecord => Boolean(question))
    : [];

  const subject = asString(payload.subject) ?? "General";

  return {
    type: "quiz",
    title: asString(payload.title) ?? "Generated Quiz",
    subject,
    difficulty: normalizeDifficulty(payload.difficulty),
    questions,
    totalQuestions:
      typeof payload.totalQuestions === "number"
        ? payload.totalQuestions
        : typeof payload.total_questions === "number"
          ? payload.total_questions
          : questions.length,
  };
}

function normalizeStructuredCandidate(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  return value.type === "quiz" ? normalizeQuizPayload(value) : value;
}

function extractFirstJSONObject(text: string): string | null {
  const startIndex = text.indexOf("{");
  if (startIndex < 0) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function parseJSONCandidate(text: string): unknown | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with best-effort extraction strategies.
  }

  const jsonMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // Continue with inline extraction.
    }
  }

  const firstJSONObject = extractFirstJSONObject(trimmed);
  if (!firstJSONObject) {
    return null;
  }

  try {
    return JSON.parse(firstJSONObject);
  } catch {
    return null;
  }
}

export function parseStructuredOutputFromText(
  text: string
): StructuredOutput | null {
  const parsedJSON = parseJSONCandidate(text);
  if (!parsedJSON) {
    return null;
  }

  const normalized = normalizeStructuredCandidate(parsedJSON);
  return parseStructuredOutput(normalized);
}
