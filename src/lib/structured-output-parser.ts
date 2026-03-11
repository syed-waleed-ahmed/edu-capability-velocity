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

function normalizeJSONText(text: string): string {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, " ");
}

function tryParseJSON(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with normalized quote fallback.
  }

  const normalized = normalizeJSONText(trimmed);
  if (normalized !== trimmed) {
    try {
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }

  return null;
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

function normalizeFlashcard(card: unknown): JsonRecord | null {
  if (!isRecord(card)) {
    return null;
  }

  const front =
    asString(card.front) ??
    asString(card.question) ??
    asString(card.prompt) ??
    asString(card.term) ??
    null;
  const back =
    asString(card.back) ??
    asString(card.answer) ??
    asString(card.definition) ??
    asString(card.explanation) ??
    null;

  if (!front || !back) {
    return null;
  }

  return {
    front,
    back,
    difficulty: normalizeDifficulty(card.difficulty),
  };
}

function normalizeFlashcardsPayload(payload: JsonRecord): JsonRecord {
  const rawCards = Array.isArray(payload.cards)
    ? payload.cards
    : Array.isArray(payload.flashcards)
      ? payload.flashcards
      : [];

  const cards = rawCards
    .map((card) => normalizeFlashcard(card))
    .filter((card): card is JsonRecord => Boolean(card));

  const subject = asString(payload.subject) ?? "General";

  return {
    type: "flashcards",
    deckTitle:
      asString(payload.deckTitle) ??
      asString(payload.deck_title) ??
      asString(payload.title) ??
      `${subject} Flashcards`,
    subject,
    cards,
    totalCards:
      typeof payload.totalCards === "number"
        ? payload.totalCards
        : typeof payload.total_cards === "number"
          ? payload.total_cards
          : cards.length,
  };
}

function normalizeStudyPlanSession(session: unknown, index: number): JsonRecord | null {
  if (!isRecord(session)) return null;

  const day = typeof session.day === "number" ? session.day : index + 1;

  // Topic can come from `topic`, `title`, or first activity
  const rawActivities = Array.isArray(session.activities)
    ? session.activities.map((a) => asString(a)).filter((a): a is string => Boolean(a))
    : [];
  const topic =
    asString(session.topic) ??
    asString(session.title) ??
    (rawActivities.length > 0 ? rawActivities[0] : `Day ${day}`);

  // Duration: AI may return `durationMinutes` (number) or `duration` (string like "30-60 minutes")
  let durationMinutes = typeof session.durationMinutes === "number"
    ? session.durationMinutes
    : typeof session.duration_minutes === "number"
      ? session.duration_minutes
      : 0;

  if (durationMinutes === 0) {
    const durationStr = asString(session.duration) ?? "";
    const numbers = durationStr.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      durationMinutes = Math.round(
        (Number.parseInt(numbers[0], 10) + Number.parseInt(numbers[1], 10)) / 2
      );
    } else if (numbers && numbers.length === 1) {
      durationMinutes = Number.parseInt(numbers[0], 10);
    } else {
      durationMinutes = 30;
    }
  }

  const resources = Array.isArray(session.resources)
    ? session.resources.map((r) => asString(r)).filter((r): r is string => Boolean(r))
    : [];

  return { day, topic, activities: rawActivities, durationMinutes, resources };
}

function normalizeStudyPlanPayload(payload: JsonRecord): JsonRecord {
  const rawSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
  const sessions = rawSessions
    .map((s, i) => normalizeStudyPlanSession(s, i))
    .filter((s): s is JsonRecord => Boolean(s));

  // Milestones: may be a top-level array, or embedded as `milestone` string per session
  let milestones: JsonRecord[];
  if (Array.isArray(payload.milestones) && payload.milestones.length > 0) {
    const mapped: (JsonRecord | null)[] = payload.milestones.map((m: unknown) => {
      if (!isRecord(m)) return null;
      const name = asString(m.name) ?? asString(m.milestone) ?? "";
      const byDay = typeof m.byDay === "number" ? m.byDay : typeof m.by_day === "number" ? m.by_day : 0;
      return name ? ({ name, byDay } as JsonRecord) : null;
    });
    milestones = mapped.filter((m): m is JsonRecord => m !== null);
  } else {
    // Extract per-session milestones
    const mapped: (JsonRecord | null)[] = rawSessions.map((s: unknown, i: number) => {
      if (!isRecord(s)) return null;
      const name = asString(s.milestone);
      if (!name) return null;
      const day = typeof s.day === "number" ? s.day : i + 1;
      return { name, byDay: day } as JsonRecord;
    });
    milestones = mapped.filter((m): m is JsonRecord => m !== null);
  }

  // totalDuration: may be string or missing
  const totalDuration =
    asString(payload.totalDuration) ??
    asString(payload.total_duration) ??
    `${sessions.length} days`;

  return {
    type: "study-plan",
    title: asString(payload.title) ?? "Study Plan",
    subject: asString(payload.subject) ?? "General",
    totalDuration,
    sessions,
    milestones,
  };
}

function normalizeStructuredCandidate(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const type = asString(value.type)?.toLowerCase();

  if (type === "quiz") {
    return normalizeQuizPayload(value);
  }

  if (type === "flashcards" || type === "flashcard") {
    return normalizeFlashcardsPayload(value);
  }

  if (type === "study-plan" || type === "study_plan" || type === "studyplan") {
    return normalizeStudyPlanPayload(value);
  }

  if (!type && Array.isArray(value.questions)) {
    return normalizeQuizPayload(value);
  }

  if (!type && (Array.isArray(value.cards) || Array.isArray(value.flashcards))) {
    return normalizeFlashcardsPayload(value);
  }

  // Heuristic: if it has `sessions` with day-based items, it's probably a study plan
  if (!type && Array.isArray(value.sessions) && value.sessions.length > 0) {
    const first = value.sessions[0];
    if (isRecord(first) && ("day" in first || "activities" in first)) {
      return normalizeStudyPlanPayload(value);
    }
  }

  return value;
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

  const direct = tryParseJSON(trimmed);
  if (direct) {
    return direct;
  }

  const jsonMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (jsonMatch) {
    const fromFence = tryParseJSON(jsonMatch[1]);
    if (fromFence) {
      return fromFence;
    }
  }

  const firstJSONObject = extractFirstJSONObject(trimmed);
  if (!firstJSONObject) {
    return null;
  }

  return tryParseJSON(firstJSONObject);
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
