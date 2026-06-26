import type { Course } from "./types";

export const aiAgentCamp: Course = {
  slug: "ai-agent-camp",
  title: "AI Agent Camp (Python)",
  description:
    "Learn to build AI Agents with Python through this comprehensive course. " +
    "Master the fundamentals of AI Agents, LLMs, and create your own intelligent systems.",
  metaTitle: "AI Agent Camp (Python)",
  metaDescription: "Learn to build AI Agents with Python through this comprehensive course",
  lessons: [
    {
      id: "1",
      title: "AI Agent Camp: Building a React agent from scratch",
      summary: "Learn how to build a React agent that can reason and act based on given tasks",
      videoId: "C0QdSBoJiMs",
      duration: "1:18:52",
      resources: [
        {
          type: "colab",
          label: "Open in Google Colab",
          href: "https://colab.research.google.com/drive/1RCVLkP_p4-ofPf4g-UPFSUAnG-c1ALBN",
        },
      ],
      tabs: [
        {
          type: "about",
          content:
            "In this workshop we will be learning how to make an agent in Python from scratch using the React architecture. Python experience is strongly recommended!",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "2",
      title: "AI Agent Camp: Building a JSON agent from scratch",
      summary: "Create an AI agent that can understand and manipulate JSON data structures",
      videoId: "xs5jTcv-2zY",
      duration: "1:15:22",
      resources: [
        {
          type: "colab",
          label: "Open in Google Colab",
          href: "https://colab.research.google.com/drive/1jTZnR_DimBMgatc6MS3iXd7kfpH4RGeX?usp=sharing",
        },
      ],
      tabs: [
        {
          type: "about",
          content:
            "In this workshop we will be learning how to make an agent in Python from using model-specific tool-use. This method brings benefits like typed tool-use inputs and better agent performance overall.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "3",
      title: "AI Agent Camp: Building a code execution agent from scratch",
      summary: "Learn to build an AI agent that can execute and understand code",
      videoId: "s4TfsgOC3m8",
      duration: "1:04:43",
      resources: [
        {
          type: "colab",
          label: "Open in Google Colab",
          href: "https://colab.research.google.com/drive/1idZDXa1HRHU3mvN55sP-REGgUk1JBDrq?usp=sharing",
        },
      ],
      tabs: [
        {
          type: "about",
          content:
            "In this workshop, we will be learning how to make an agent in Python that can run code in any programming language. This can add a ton of power and flexibility to your agents.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "4",
      title: "AI Agent Camp: Building a browser use agent from scratch",
      summary: "Create an AI agent that can interact with web browsers and perform tasks",
      videoId: "4hp9kIqlx7Q",
      duration: "1:25:14",
      resources: [
        {
          type: "colab",
          label: "Open in Google Colab",
          href: "https://colab.research.google.com/drive/1OqYAKT1OcAiQgIRE5PAAHBI4CB2lG-4n?usp=sharing",
        },
      ],
      tabs: [
        {
          type: "about",
          content:
            "In this workshop, we will be learning how to make an agent in Python that can automate a web browser using Playwright.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "5",
      title: "AI Agent Camp: Building a computer use agent from scratch",
      summary: "Learn to build an AI agent that can interact with computer systems",
      videoId: "Qnp4PQTE1Ag",
      duration: "1:25:47",
      resources: [
        {
          type: "colab",
          label: "Open in Google Colab",
          href: "https://colab.research.google.com/drive/1GV4VzhfI8l2uEBm2H9hQ2fs12_iFiYlQ?usp=sharing",
        },
      ],
      tabs: [
        {
          type: "about",
          content:
            "In this workshop, we will be learning how to make a computer use agent in Python that can fully automate a desktop sandbox using the mouse and keyboard.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
  ],
};
