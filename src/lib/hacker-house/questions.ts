export type StaticQuestion = {
  id: string;
  prompt: string;
  options?: string[];
  helperText?: string;
  type?: "mcq" | "longtext";
  minChars?: number;
  maxChars?: number;
  conditionalOn?: { questionId: string; answer: string };
};

export const STATIC_QUESTIONS: StaticQuestion[] = [
  {
    id: "q1",
    prompt: "What country do you live in?",
    type: "longtext",
    minChars: 2,
    maxChars: 100,
  },
  {
    id: "q2",
    prompt: "What stage are you at in life?",
    options: ["Studying", "Working", "Other"],
  },
  {
    id: "q2a",
    prompt: "Where are you studying?",
    type: "longtext",
    minChars: 2,
    maxChars: 200,
    conditionalOn: { questionId: "q2", answer: "Studying" },
  },
  {
    id: "q2b",
    prompt: "Where do you work?",
    type: "longtext",
    minChars: 2,
    maxChars: 200,
    conditionalOn: { questionId: "q2", answer: "Working" },
  },
  {
    id: "q2c",
    prompt: "What are you up to?",
    type: "longtext",
    minChars: 2,
    maxChars: 200,
    conditionalOn: { questionId: "q2", answer: "Other" },
  },
  {
    id: "q3",
    prompt: "What kind of projects do you like to build?",
    type: "longtext",
    minChars: 10,
    maxChars: 500,
  },
  {
    id: "q4",
    prompt: "When you're building, are you more…",
    options: [
      "Meticulous — focused on the implementation",
      "Vibes — if it works, it works",
      "Vibes to start, meticulous to finish",
    ],
  },
  {
    id: "q5",
    prompt: "What motivates you most in your work?",
    options: [
      "Solving hard problems",
      "Making something people love",
      "Building a reputation",
      "Financial independence",
      "I'm still figuring it out",
    ],
  },
  {
    id: "q6",
    prompt: "What's something you'd like to teach others?",
    type: "longtext",
    minChars: 10,
    maxChars: 500,
  },
  {
    id: "q7",
    prompt: "How free are you between 25 July and 22 August 2026?",
    options: [
      "Completely free — I can commit 100%",
      "Mostly free — minor commitments",
      "Partially free — some obligations",
      "Not sure yet",
    ],
  },
];

// Get questions that should be shown (excluding conditional questions that don't match)
export function getVisibleQuestions(answers: Record<string, string>): StaticQuestion[] {
  return STATIC_QUESTIONS.filter((q) => {
    if (!q.conditionalOn) return true;
    return answers[q.conditionalOn.questionId] === q.conditionalOn.answer;
  });
}

export const STATIC_QUESTION_IDS = STATIC_QUESTIONS.map((q) => q.id);
export const STATIC_COUNT = STATIC_QUESTIONS.length;
