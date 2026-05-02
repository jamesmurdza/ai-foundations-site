"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { CardStage } from "@/components/hacker-house/cards/CardStage";
import { ProgressBar } from "@/components/hacker-house/cards/ProgressBar";
import { IntroCard } from "@/components/hacker-house/cards/IntroCard";
import { ContactCard } from "@/components/hacker-house/cards/ContactCard";
import { MultipleChoiceCard } from "@/components/hacker-house/cards/MultipleChoiceCard";
import { LongTextCard } from "@/components/hacker-house/cards/LongTextCard";
import { LinksCard } from "@/components/hacker-house/cards/LinksCard";
import { ReviewCard } from "@/components/hacker-house/cards/ReviewCard";
import { SubmittedCard } from "@/components/hacker-house/cards/SubmittedCard";
import { GeneratingCard } from "@/components/hacker-house/cards/GeneratingCard";

import { STATIC_COUNT, STATIC_QUESTIONS } from "@/lib/hacker-house/questions";
import {
  freshState,
  loadState,
  saveState,
} from "@/lib/hacker-house/storage";
import {
  generateDynamicQuestions,
  submitApplication,
  useDebouncedDbSync,
  useSyncOnUnload,
} from "@/lib/hacker-house/sync";
import type {
  ApplicationState,
  Step,
} from "@/lib/hacker-house/types";

const DYNAMIC_COUNT = 5;

function previousStep(
  step: Step,
  cardIndex: number,
  hasDynamic: boolean,
): { step: Step; cardIndex: number } | null {
  switch (step) {
    case "intro":
    case "submitted":
    case "generating":
      return null;
    case "contact":
      return { step: "intro", cardIndex: 0 };
    case "static":
      if (cardIndex > 0) return { step: "static", cardIndex: cardIndex - 1 };
      return { step: "contact", cardIndex: 0 };
    case "dynamic":
      if (cardIndex > 0) return { step: "dynamic", cardIndex: cardIndex - 1 };
      return { step: "static", cardIndex: STATIC_COUNT - 1 };
    case "why":
      return hasDynamic
        ? { step: "dynamic", cardIndex: DYNAMIC_COUNT - 1 }
        : { step: "static", cardIndex: STATIC_COUNT - 1 };
    case "project":
      return { step: "why", cardIndex: 0 };
    case "links":
      return { step: "project", cardIndex: 0 };
    case "review":
      return { step: "links", cardIndex: 0 };
  }
}

function computeProgress(step: Step, cardIndex: number): number {
  switch (step) {
    case "intro":
      return 0;
    case "contact":
      return 0.04;
    case "static":
      return 0.06 + (cardIndex / STATIC_COUNT) * 0.5;
    case "generating":
      return 0.58;
    case "dynamic":
      return 0.6 + (cardIndex / DYNAMIC_COUNT) * 0.22;
    case "why":
      return 0.86;
    case "project":
      return 0.91;
    case "links":
      return 0.95;
    case "review":
      return 0.98;
    case "submitted":
      return 1;
  }
}

export default function ApplyPage() {
  const router = useRouter();
  const [state, setState] = useState<ApplicationState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [genFailed, setGenFailed] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded ?? freshState());
  }, []);

  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  const enableDbSync =
    !!state?.email && state.status === "in_progress" && state.step !== "intro";
  useDebouncedDbSync(state ?? ({} as ApplicationState), enableDbSync);
  useSyncOnUnload(state ?? ({} as ApplicationState), enableDbSync);

  useEffect(() => {
    if (!state) return;
    if (state.step !== "generating") return;
    if (state.dynamicQuestions && state.dynamicQuestions.length === DYNAMIC_COUNT) {
      setState((s) =>
        s ? { ...s, step: "dynamic", cardIndex: 0, updatedAt: Date.now() } : s,
      );
      return;
    }
    let cancelled = false;
    setGenFailed(false);
    generateDynamicQuestions(state.sessionId, state.answers)
      .then(({ questions }) => {
        if (cancelled) return;
        setState((s) =>
          s
            ? {
                ...s,
                dynamicQuestions: questions,
                step: "dynamic",
                cardIndex: 0,
                updatedAt: Date.now(),
              }
            : s,
        );
      })
      .catch((err) => {
        console.error("dynamic gen failed", err);
        if (cancelled) return;
        setGenFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [state?.step, state?.sessionId, state?.dynamicQuestions]);

  const advance = useCallback((updates: Partial<ApplicationState>) => {
    setState((prev) =>
      prev ? { ...prev, ...updates, updatedAt: Date.now() } : prev,
    );
  }, []);

  const handleBegin = () => advance({ step: "contact" });

  const handleContact = ({ name, email }: { name: string; email: string }) =>
    advance({ name, email, step: "static", cardIndex: 0 });

  const handleStaticAnswer = (qId: string, opt: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const answers = { ...prev.answers, [qId]: opt };
      if (prev.cardIndex < STATIC_COUNT - 1) {
        return {
          ...prev,
          answers,
          cardIndex: prev.cardIndex + 1,
          updatedAt: Date.now(),
        };
      }
      return {
        ...prev,
        answers,
        step: "generating",
        cardIndex: 0,
        updatedAt: Date.now(),
      };
    });
  };

  const handleDynamicAnswer = (qId: string, opt: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const answers = { ...prev.answers, [qId]: opt };
      if (prev.cardIndex < DYNAMIC_COUNT - 1) {
        return {
          ...prev,
          answers,
          cardIndex: prev.cardIndex + 1,
          updatedAt: Date.now(),
        };
      }
      return {
        ...prev,
        answers,
        step: "why",
        cardIndex: 0,
        updatedAt: Date.now(),
      };
    });
  };

  const handleWhy = (text: string) =>
    advance({ whyText: text, step: "project", cardIndex: 0 });
  const handleProject = (text: string) =>
    advance({ projectText: text, step: "links", cardIndex: 0 });
  const handleLinks = (urls: {
    portfolioUrl?: string;
    githubUrl?: string;
    otherUrl?: string;
  }) =>
    advance({
      ...urls,
      step: "review",
      cardIndex: 0,
    });

  const handleEdit = (target: { step: Step; cardIndex: number }) =>
    advance({ step: target.step, cardIndex: target.cardIndex });

  const handleSubmit = async () => {
    if (!state) return;
    setSubmitting(true);
    try {
      await submitApplication(state.sessionId);
      advance({ step: "submitted", status: "submitted" });
    } catch (err) {
      console.error("submit failed", err);
      setSubmitting(false);
    }
  };

  const cardKey = useMemo(
    () => (state ? `${state.step}-${state.cardIndex}` : "loading"),
    [state],
  );

  const progress = state ? computeProgress(state.step, state.cardIndex) : 0;

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  let content: React.ReactNode = null;

  switch (state.step) {
    case "intro":
      content = <IntroCard onBegin={handleBegin} />;
      break;
    case "contact":
      content = (
        <ContactCard
          initialName={state.name}
          initialEmail={state.email}
          onContinue={handleContact}
        />
      );
      break;
    case "static": {
      const q = STATIC_QUESTIONS[state.cardIndex];
      const category = `Question ${state.cardIndex + 1} of ${STATIC_COUNT}`;
      if (q.type === "longtext") {
        content = (
          <LongTextCard
            category={category}
            prompt={q.prompt}
            helperText={q.helperText}
            initial={state.answers[q.id]}
            minChars={q.minChars ?? 30}
            maxChars={q.maxChars ?? 400}
            onContinue={(text) => handleStaticAnswer(q.id, text)}
          />
        );
      } else {
        content = (
          <MultipleChoiceCard
            category={category}
            prompt={q.prompt}
            options={q.options ?? []}
            helperText={q.helperText}
            current={state.answers[q.id]}
            onAnswer={(opt) => handleStaticAnswer(q.id, opt)}
          />
        );
      }
      break;
    }
    case "generating":
      if (genFailed) {
        content = (
          <CardStage>
            <div className="flex-1 flex flex-col justify-center text-center">
              <h2 className="font-heading text-2xl font-semibold mb-3">
                We couldn&apos;t generate your follow-ups.
              </h2>
              <p className="text-muted-foreground">
                That&apos;s on us. You can skip ahead — your application will still
                be reviewed.
              </p>
            </div>
            <div className="pt-6">
              <button
                onClick={() => advance({ step: "why", cardIndex: 0 })}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              >
                Skip to next →
              </button>
            </div>
          </CardStage>
        );
      } else {
        content = <GeneratingCard />;
      }
      break;
    case "dynamic": {
      const q = state.dynamicQuestions?.[state.cardIndex];
      if (!q) {
        content = <GeneratingCard message="Loading your questions…" />;
        break;
      }
      content = (
        <MultipleChoiceCard
          category={`Question ${STATIC_COUNT + state.cardIndex + 1} of ${
            STATIC_COUNT + DYNAMIC_COUNT
          }`}
          prompt={q.question}
          options={q.options}
          current={state.answers[q.id]}
          onAnswer={(opt) => handleDynamicAnswer(q.id, opt)}
        />
      );
      break;
    }
    case "why":
      content = (
        <LongTextCard
          category="In your words"
          prompt="Why do you want to be here?"
          helperText="What would make this the best month of your year?"
          initial={state.whyText}
          onContinue={handleWhy}
        />
      );
      break;
    case "project":
      content = (
        <LongTextCard
          category="What you're building"
          prompt="Tell us about something you've built or are working on now."
          helperText="A real thing — anything from a side project to a class assignment you cared about."
          initial={state.projectText}
          onContinue={handleProject}
        />
      );
      break;
    case "links":
      content = (
        <LinksCard
          initialPortfolio={state.portfolioUrl}
          initialGithub={state.githubUrl}
          initialOther={state.otherUrl}
          onContinue={handleLinks}
        />
      );
      break;
    case "review":
      content = (
        <ReviewCard
          state={state}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      );
      break;
    case "submitted":
      content = <SubmittedCard name={state.name} />;
      break;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <ProgressBar progress={progress} />
      <header className="px-6 py-4 flex items-center justify-between">
        <Link
          href="/hacker-house"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Hacker House
        </Link>
        {state.email && (
          <span className="text-xs text-muted-foreground">
            Saved as {state.email}
          </span>
        )}
      </header>
      <section className="px-6 pt-6 pb-20 flex items-start justify-center">
        <div className="w-full max-w-md mx-auto">
          {(() => {
            const prev = previousStep(
              state.step,
              state.cardIndex,
              !!state.dynamicQuestions && state.dynamicQuestions.length > 0,
            );
            if (!prev) return <div className="h-7 mb-3" aria-hidden />;
            return (
              <button
                type="button"
                onClick={() => advance(prev)}
                className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span aria-hidden>←</span> Back
              </button>
            );
          })()}
          <div key={cardKey}>{content}</div>
        </div>
      </section>
    </main>
  );
}
