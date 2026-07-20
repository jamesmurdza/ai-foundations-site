import type { Course } from "./types";

export const git: Course = {
  slug: "git",
  title: "Git & GitHub for Beginners",
  shortTitle: "Git & GitHub",
  // TODO: add this image before registering the course in index.ts
  thumbnail: "/images/git.png",
  description:
    "Learn version control from scratch. Understand why Git exists, then work " +
    "through staging, history, branching, merging, remotes, GitHub and pull " +
    "requests with hands-on examples.",
  metaTitle: "Git & GitHub for Beginners",
  metaDescription:
    "A beginner-friendly, hands-on introduction to Git and GitHub: staging, " +
    "history, branching, merging, remotes and pull requests.",
  lessons: [
    {
      id: "intro",
      title: "Introduction to Git",
      summary:
        "Why Git exists, what version control means, and how Git differs from GitHub.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "install",
      title: "Installing Git",
      summary: "Install Git on Windows, macOS or Linux and verify it works.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "setup",
      title: "Setting Up Git",
      summary: "Tell Git who you are by configuring your name and email.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "staging-committing",
      title: "Staging and Committing",
      summary:
        "Initialise a project and save versions with the add and commit workflow.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "reading-history",
      title: "Reading History",
      summary:
        "Explore your project's timeline with log and inspect changes with diff.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "undoing-changes",
      title: "Undoing Changes",
      summary:
        "Safely undo work at every stage: unstaged, staged and committed.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "branching",
      title: "Branching",
      summary:
        "Work on new ideas safely on separate branches without touching main.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "merging",
      title: "Merging",
      summary:
        "Bring branch changes back together and resolve merge conflicts.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "lazygit",
      title: "Using LazyGit",
      summary:
        "A visual terminal interface for the Git commands you already know.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "remotes",
      title: "Working with Remotes",
      summary:
        "Store a copy of your project elsewhere and sync with push and pull.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "github",
      title: "GitHub",
      summary:
        "Create a GitHub account and repository, then push your work online.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "pull-requests",
      title: "Pull Requests",
      summary: "Propose, review and merge changes the way teams do every day.",
      tabs: [{ type: "lesson" }],
    },
  ],
};
