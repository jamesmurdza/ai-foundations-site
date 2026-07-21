import type { Course } from "./types";

export const mlPython: Course = {
  slug: "ml-python",
  title: "Machine Learning in Python",
  shortTitle: "Machine Learning Fundamentals",
  thumbnail: "/images/machinelearning.png",
  description:
    "Learn Machine Learning with Python through this comprehensive course. " +
    "Master the fundamentals and advanced concepts with hands-on projects.",
  metaTitle: "Machine Learning in Python Course",
  metaDescription: "Learn Machine Learning with Python through this comprehensive course",
  resources: [
    {
      type: "apply",
      label: "Apply to AI Foundations",
      href: "https://aifoundations.school",
    },
    {
      type: "github",
      label: "View Course Materials",
      href: "https://github.com/aifoundations/course/",
    },
  ],
  lessons: [
    {
      id: "1",
      title: "Machine Learning in Python: Introduction",
      summary:
        "Get started with Machine Learning in Python. Learn the fundamentals and set up your development environment.",
      videoId: "uzKF08iaxu0",
      duration: "1:15:00",
      tabs: [
        {
          type: "about",
          content:
            "Get started with Machine Learning in Python. Learn the fundamentals and set up your development environment.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "2",
      title: "AI Foundations: Linear Regression in Machine Learning",
      summary: "Learn how to process and prepare data for machine learning models.",
      videoId: "OJTqB2wlvyA",
      duration: "1:30:00",
      tabs: [
        {
          type: "about",
          content: "Learn how to process and prepare data for machine learning models.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "3",
      title: "AI Foundations: Linear Regression Demo",
      summary: "Understand how to train machine learning models effectively.",
      videoId: "t4agKQrQou4",
      duration: "1:45:00",
      tabs: [
        {
          type: "about",
          content: "Understand how to train machine learning models effectively.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "4",
      title: "AI Foundations: Logistic Regression",
      summary: "Learn techniques for evaluating and improving model performance.",
      videoId: "RtDeNk00_FE",
      duration: "1:20:00",
      tabs: [
        {
          type: "about",
          content: "Learn techniques for evaluating and improving model performance.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
    {
      id: "5",
      title: "AI Foundations: Would you survive the titanic disaster?",
      summary: "Explore advanced machine learning concepts and techniques.",
      videoId: "iwvwi1_-0gw",
      duration: "1:35:00",
      tabs: [
        {
          type: "about",
          content: "Explore advanced machine learning concepts and techniques.",
        },
        { type: "material" },
        { type: "transcript" },
      ],
    },
  ],
};
