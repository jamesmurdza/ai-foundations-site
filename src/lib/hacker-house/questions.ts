export type StaticQuestion = {
  id: string;
  prompt: string;
  options: string[];
  helperText?: string;
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
    prompt: "Pick what you'd rather do for a weekend:",
    options: [
      "Build something new from scratch",
      "Polish something I already shipped",
      "Read or research deep on a topic",
      "Talk to people about ideas",
    ],
  },
  {
    id: "q4",
    prompt: "Your portfolio right now is…",
    options: [
      "Non-existent — I want to start one",
      "A few half-finished things",
      "One or two solid projects",
      "Multiple shipped projects with users",
    ],
  },
  {
    id: "q5",
    prompt: "For the next 4 weeks, building your portfolio is…",
    options: [
      "The single most important thing in my life",
      "One of my top 2-3 priorities",
      "Important but I have other big stuff",
      "Just curious what would happen",
    ],
  },
  {
    id: "q6",
    prompt: "When you hit a hard problem, you usually:",
    options: [
      "Bash my head against it until it cracks",
      "Ask someone I trust for help",
      "Search and read until I find a path",
      "Take a walk and come back",
    ],
  },
  {
    id: "q7",
    prompt: "Pick the one that best describes you:",
    options: [
      "I ship fast, polish later",
      "I plan carefully, then build",
      "I'm best when I'm collaborating",
      "I do my best work alone, deep in flow",
    ],
  },
  {
    id: "q8",
    prompt: "The last project or thing you completed…",
    options: [
      "Was so good I'm still telling people about it",
      "I'm proud of it but already see flaws",
      "Got it shipped, learned a lot",
      "Honestly, I haven't finished much lately",
    ],
  },
  {
    id: "q9",
    prompt: "You're more excited by:",
    options: [
      "Solving a problem nobody has solved yet",
      "Making something elegant out of something messy",
      "Helping a real person with something they need",
      "Pure invention — building because I want to",
    ],
  },
  {
    id: "q10",
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
    id: "q11",
    prompt: "Be honest about your last 3 months:",
    options: [
      "Building or learning every day",
      "4-5 days a week",
      "1-3 days a week",
      "On and off, in bursts",
    ],
  },
  {
    id: "q12",
    prompt: "For 4 weeks straight, you'd be okay with:",
    options: [
      "12+ hour days, full immersion",
      "8-10 hour days, no slack",
      "Solid 6-8 hour days, weekends off",
      "I need balance even in intense weeks",
    ],
  },
  {
    id: "q13",
    prompt: "Someone shows you a tool you've never used. You:",
    options: [
      "Open it that night and try to break it",
      "Bookmark and come back if useful",
      "Ask them to walk me through it",
      "Look for tutorials before touching it",
    ],
  },
  {
    id: "q14",
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
    id: "q15",
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
    id: "q16",
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
];

export const STATIC_QUESTION_IDS = STATIC_QUESTIONS.map((q) => q.id);
export const STATIC_COUNT = STATIC_QUESTIONS.length;
