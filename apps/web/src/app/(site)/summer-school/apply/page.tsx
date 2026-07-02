"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { GraduationCap, Briefcase, Sparkles, type LucideIcon } from "lucide-react";

import { CardStage } from "@site/components/hacker-house/cards/CardStage";
import { SubmittedCard } from "@site/components/hacker-house/cards/SubmittedCard";
import { Button } from "@site/components/ui/button";
import { cn } from "@site/lib/utils";

import { newSessionId } from "@site/lib/hacker-house/storage";
import { submitApplication, syncImmediately } from "@site/lib/hacker-house/sync";
import type { ApplicationState } from "@site/lib/hacker-house/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STAGE_OPTIONS = ["Studying", "Working", "Other"] as const;
type Stage = (typeof STAGE_OPTIONS)[number];

// Matches the wizard's conditional follow-ups (q2a/q2b/q2c) so the admin
// dashboard labels these answers correctly.
const FOLLOWUP: Record<Stage, { id: string; prompt: string; placeholder: string }> = {
  Studying: { id: "q2a", prompt: "Where are you studying?", placeholder: "School or program" },
  Working: { id: "q2b", prompt: "Where do you work?", placeholder: "Company or role" },
  Other: { id: "q2c", prompt: "What are you up to?", placeholder: "A sentence is plenty" },
};

const STAGE_ICON: Record<Stage, LucideIcon> = {
  Studying: GraduationCap,
  Working: Briefcase,
  Other: Sparkles,
};

const TOTAL_PAGES = 2;

export default function ApplyPage() {
  const [sessionId] = useState(() => newSessionId());
  const [page, setPage] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [stage, setStage] = useState<Stage | "">("");
  const [stageDetail, setStageDetail] = useState("");
  const [goals, setGoals] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page1Valid = useMemo(
    () =>
      name.trim().length >= 2 &&
      EMAIL_RE.test(email.trim()) &&
      country.trim().length >= 2 &&
      stage !== "" &&
      stageDetail.trim().length >= 2,
    [name, email, country, stage, stageDetail],
  );
  const page2Valid = goals.trim().length >= 2;

  const goNext = () => {
    if (!page1Valid) return;
    setError(null);
    setPage(2);
  };
  const goBack = () => {
    setError(null);
    setPage(1);
  };

  const handleSubmit = async () => {
    if (!page1Valid || !page2Valid || submitting || stage === "") return;
    setSubmitting(true);
    setError(null);

    const answers: Record<string, string> = {
      q1: country.trim(),
      q2: stage,
      [FOLLOWUP[stage].id]: stageDetail.trim(),
      goals: goals.trim(),
    };

    const state: ApplicationState = {
      sessionId,
      email: email.trim(),
      name: name.trim(),
      answers,
      portfolioUrl: portfolio.trim() || undefined,
      githubUrl: github.trim() || undefined,
      otherUrl: linkedin.trim() || undefined,
      step: "review",
      cardIndex: 0,
      status: "in_progress",
      updatedAt: Date.now(),
    };

    try {
      // Upsert the row (creates it with all fields), then submit.
      await syncImmediately(state);
      await submitApplication(sessionId);
      setSubmitted(true);
    } catch (err) {
      console.error("submit failed", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <header className="px-6 py-4">
        <Link
          href="/summer-school"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Summer School
        </Link>
      </header>
      <section className="px-6 pt-6 pb-20 flex items-start justify-center">
        <div className="w-full max-w-md mx-auto">
          {submitted ? (
            <SubmittedCard name={name.trim() || undefined} />
          ) : (
            <CardStage>
              <div className="flex-1 flex flex-col">
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
                  Online program · Step {page} of {TOTAL_PAGES}
                </p>
                <h2 className="font-heading text-2xl font-semibold leading-tight mb-2">
                  {page === 1 ? "Apply for the online program" : "A bit about your work"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {page === 1
                    ? "Tell us who you are and what you're up to."
                    : "What you'd like to get out of this. Links are optional."}
                </p>

                {page === 1 ? (
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium">Name</span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                        autoFocus
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">Email</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">
                        What country are you from?
                      </span>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                      />
                    </label>
                    <div className="block">
                      <span className="text-sm font-medium">
                        What are you currently doing?
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {STAGE_OPTIONS.map((opt) => {
                          const Icon = STAGE_ICON[opt];
                          const selected = stage === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setStage(opt)}
                              className={cn(
                                "flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-lg border text-sm transition-colors",
                                selected
                                  ? "border-primary bg-primary text-white font-medium shadow-sm"
                                  : "bg-background text-foreground hover:bg-muted/50 hover:border-muted-foreground/40",
                              )}
                            >
                              <Icon className="w-5 h-5" aria-hidden />
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {stage !== "" && (
                      <label className="block">
                        <span className="text-sm font-medium">
                          {FOLLOWUP[stage].prompt}
                        </span>
                        <input
                          type="text"
                          value={stageDetail}
                          onChange={(e) => setStageDetail(e.target.value)}
                          placeholder={FOLLOWUP[stage].placeholder}
                          className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-sm font-medium">
                        What do you want to build or learn?
                      </span>
                      <textarea
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        placeholder="A sentence or two is plenty."
                        rows={3}
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base resize-none"
                        autoFocus
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">
                        GitHub{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </span>
                      <input
                        type="url"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/…"
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">
                        LinkedIn{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </span>
                      <input
                        type="url"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/…"
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-medium">
                        Portfolio / personal site{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </span>
                      <input
                        type="url"
                        value={portfolio}
                        onChange={(e) => setPortfolio(e.target.value)}
                        placeholder="https://"
                        className="mt-1 w-full px-4 py-3 bg-background rounded-lg border text-base"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-6">
                {error && (
                  <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
                )}
                {page === 1 ? (
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                    disabled={!page1Valid}
                    onClick={goNext}
                  >
                    Next →
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      onClick={goBack}
                      disabled={submitting}
                    >
                      ← Previous
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 bg-primary hover:bg-primary/90 text-white disabled:opacity-50"
                      disabled={!page2Valid || submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? "Submitting…" : "Submit →"}
                    </Button>
                  </div>
                )}
              </div>
            </CardStage>
          )}
        </div>
      </section>
    </main>
  );
}
