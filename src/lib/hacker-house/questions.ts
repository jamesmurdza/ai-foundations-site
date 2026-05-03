export type StaticQuestion = {
  id: string;
  prompt: string;
  options?: string[];
  helperText?: string;
  type?: "mcq" | "longtext";
  minChars?: number;
  maxChars?: number;
};

export const STATIC_QUESTIONS: StaticQuestion[] = [
  {
    id: "q1",
    prompt: "What stage are you at right now?",
    options: [
      "Just curious about AI",
      "Actively learning, no projects yet",
      "Built a couple of personal projects",
      "Shipping things people use",
    ],
  },
  {
    id: "q2",
    prompt: "How do you build today?",
    options: [
      "Mostly code (Python, JS, etc.)",
      "Mostly low-code (Bubble, Webflow, n8n)",
      "Mostly no-code (Notion, AI tools, prompts)",
      "Generalist — whatever fits",
    ],
  },
  {
    id: "q3",
    prompt: "Your portfolio right now is…",
    options: [
      "Non-existent — I want to start one",
      "A few half-finished things",
      "One or two solid projects",
      "Multiple shipped projects with users",
    ],
  },
  {
    id: "q4",
    prompt: "For the next 4 weeks, building your portfolio is…",
    options: [
      "The single most important thing in my life",
      "One of my top 2-3 priorities",
      "Important but I have other big stuff",
      "Just curious what would happen",
    ],
  },
  {
    id: "q5",
    prompt: "When you hit a hard problem, you usually:",
    options: [
      "Bash my head against it until it cracks",
      "Ask someone I trust for help",
      "Search and read until I find a path",
      "Take a walk and come back",
    ],
  },
  {
    id: "q6",
    prompt: "In a group of 6 strangers building together, you'd probably be:",
    options: [
      "The one organizing the schedule",
      "The one with the wild ideas",
      "The one quietly shipping",
      "The one keeping morale up",
      "The one asking the hard questions",
    ],
  },
  {
    id: "q7",
    prompt: "Where in the world are you based?",
    options: [
      "North America",
      "Latin America",
      "Europe",
      "Africa",
      "Middle East",
      "South Asia",
      "Southeast Asia",
      "East Asia",
      "Oceania",
    ],
    helperText: "Helps us coordinate timezones and travel.",
  },
  {
    id: "q8",
    prompt: "Your biggest fear about a 4-week intensive like this is:",
    options: [
      "Not being good enough technically",
      "Burning out or overcommitting",
      "Not getting along with people",
      "Spending the time and not having anything to show",
      "I'm not really afraid, just excited",
    ],
  },
  {
    id: "q9",
    prompt: "On funding — which fits you?",
    options: [
      "I'd need full funding (housing + travel) to make it work",
      "I'd need partial help — I can cover part myself",
      "I can self-fund this entirely",
      "I'd rather not say yet, let's talk if I'm picked",
    ],
    helperText:
      "Some spots are fully funded, some partially. We'd rather know honestly than guess.",
  },
  {
    id: "q10",
    prompt: "Tell us one cool, weird, or specific fact about you.",
    helperText:
      "Anything we wouldn't guess from your answers above — a hobby, a story, something you obsess over. The point is to give us a thread to pull on.",
    type: "longtext",
    minChars: 30,
    maxChars: 400,
  },
];

export const STATIC_QUESTION_IDS = STATIC_QUESTIONS.map((q) => q.id);
export const STATIC_COUNT = STATIC_QUESTIONS.length;
