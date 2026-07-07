export type StaticQuestion = {
  id: string;
  prompt: string;
  conditionalOn?: { questionId: string; answer: string };
};

export const STATIC_QUESTIONS: StaticQuestion[] = [
  { id: "q1", prompt: "What country do you live in?" },
  { id: "q2", prompt: "What stage are you at in life?" },
  {
    id: "q2a",
    prompt: "Where are you studying?",
    conditionalOn: { questionId: "q2", answer: "Studying" },
  },
  {
    id: "q2b",
    prompt: "Where do you work?",
    conditionalOn: { questionId: "q2", answer: "Working" },
  },
  {
    id: "q2c",
    prompt: "What are you up to?",
    conditionalOn: { questionId: "q2", answer: "Other" },
  },
  { id: "goals", prompt: "What do you want to build or learn?" },
  { id: "q3", prompt: "What kind of projects do you like to build?" },
  { id: "q4", prompt: "When you're building, are you more…" },
  { id: "q5", prompt: "What motivates you most in your work?" },
  { id: "q6", prompt: "What's something you'd like to teach others?" },
  { id: "q7", prompt: "How free are you in August 2026?" },
];

export function getVisibleQuestions(
  answers: Record<string, string>,
): StaticQuestion[] {
  return STATIC_QUESTIONS.filter((q) => {
    if (!q.conditionalOn) return true;
    return answers[q.conditionalOn.questionId] === q.conditionalOn.answer;
  });
}
