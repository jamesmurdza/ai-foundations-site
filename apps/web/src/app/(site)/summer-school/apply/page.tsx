"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { CardStage } from "@site/components/hacker-house/cards/CardStage";
import { SubmittedCard } from "@site/components/hacker-house/cards/SubmittedCard";
import { Button } from "@site/components/ui/button";

import { newSessionId } from "@site/lib/hacker-house/storage";
import { submitApplication, syncImmediately } from "@site/lib/hacker-house/sync";
import type { ApplicationState } from "@site/lib/hacker-house/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ApplyPage() {
  const [sessionId] = useState(() => newSessionId());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = useMemo(
    () =>
      name.trim().length >= 2 &&
      EMAIL_RE.test(email.trim()) &&
      country.trim().length >= 2,
    [name, email, country],
  );

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);

    const state: ApplicationState = {
      sessionId,
      email: email.trim(),
      name: name.trim(),
      answers: { q1: country.trim() },
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
                  Online program
                </p>
                <h2 className="font-heading text-2xl font-semibold leading-tight mb-2">
                  Apply for the online program
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Just a few details. Links are optional — share whatever helps
                  us understand what you build.
                </p>
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
              </div>
              <div className="pt-6">
                {error && (
                  <p className="text-sm text-red-600 mb-3 text-center">{error}</p>
                )}
                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                  disabled={!isValid || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Submitting…" : "Submit application →"}
                </Button>
              </div>
            </CardStage>
          )}
        </div>
      </section>
    </main>
  );
}
