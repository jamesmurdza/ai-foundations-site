import type { Course } from "./types";

export const git: Course = {
  slug: "git",
  title: "Git & GitHub for Beginners",
  shortTitle: "Git & GitHub",
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
        "What this course covers, why Git exists, and how it differs from GitHub.",
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
      summary:
        "Configure your name, email, default branch name and editor.",
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
      id: "ignoring-files",
      title: "Ignoring Files",
      summary:
        "Use .gitignore to keep secrets, system files and build folders out of your history.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "reading-history",
      title: "Reading History",
      summary:
        "Explore your project's timeline with log, diff and diff --staged.",
      tabs: [{ type: "lesson" }],
    },
    {
      id: "undoing-changes",
      title: "Undoing Changes",
      summary:
        "Restore, reset, revert and amend — safely undo work at every stage.",
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
        "Bring branch changes back together, resolve conflicts and clean up.",
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
