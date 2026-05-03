"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

import { getVisibleQuestions } from "@/lib/hacker-house/questions";
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

const DYNAMIC_COUNT = 2;

function previousStep(
  step: Step,
  cardIndex: number,
  hasDynamic: boolean,
  visibleCount: number,
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
      return { step: "static", cardIndex: visibleCount - 1 };
    case "links":
      return hasDynamic
        ? { step: "dynamic", cardIndex: DYNAMIC_COUNT - 1 }
        : { step: "static", cardIndex: visibleCount - 1 };
    case "review":
      return { step: "links", cardIndex: 0 };
  }
}

function computeProgress(step: Step, cardIndex: number, visibleCount: number): number {
  switch (step) {
    case "intro":
      return 0;
    case "contact":
      return 0.04;
    case "static":
      return 0.08 + (cardIndex / visibleCount) * 0.5;
    case "generating":
      return 0.6;
    case "dynamic":
      return 0.65 + (cardIndex / DYNAMIC_COUNT) * 0.2;
    case "links":
      return 0.9;
    case "review":
      return 0.95;
    case "submitted":
      return 1;
  }
}

export default function ApplyPage() {
  const [state, setState] = useState<ApplicationState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [genFailed, setGenFailed] = useState(false);

  // Get visible questions based on current answers
  const visibleQuestions = useMemo(
    () => (state ? getVisibleQuestions(state.answers) : []),
    [state?.answers],
  );
  const visibleCount = visibleQuestions.length;

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

  const handleStaticAnswer = (qId: string, answer: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const answers = { ...prev.answers, [qId]: answer };

      // Recalculate visible questions with new answers
      const newVisible = getVisibleQuestions(answers);
      const currentQ = visibleQuestions[prev.cardIndex];

      // Find the next question index
      let nextIndex = prev.cardIndex + 1;

      // If this was Q2 (life stage), we might have just revealed a conditional question
      if (currentQ?.id === "q2") {
        // Find the conditional question that just became visible
        const conditionalIndex = newVisible.findIndex(
          (q) => q.conditionalOn?.questionId === "q2" && q.conditionalOn?.answer === answer
        );
        if (conditionalIndex !== -1) {
          nextIndex = conditionalIndex;
        }
      } else {
        // Normal case: find current question in new visible list and go to next
        const currentIndex = newVisible.findIndex((q) => q.id === currentQ?.id);
        nextIndex = currentIndex + 1;
      }

      if (nextIndex < newVisible.length) {
        return {
          ...prev,
          answers,
          cardIndex: nextIndex,
          updatedAt: Date.now(),
        };
      }
      // All static questions done, go to generating
      return {
        ...prev,
        answers,
        step: "generating",
        cardIndex: 0,
        updatedAt: Date.now(),
      };
    });
  };

  const handleDynamicAnswer = (qId: string, answer: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const answers = { ...prev.answers, [qId]: answer };
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
        step: "links",
        cardIndex: 0,
        updatedAt: Date.now(),
      };
    });
  };

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

  const progress = state ? computeProgress(state.step, state.cardIndex, visibleCount) : 0;

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
    case "static": {
      const q = visibleQuestions[state.cardIndex];
      if (!q) {
        content = <GeneratingCard message="Loading questions…" />;
        break;
      }
      const questionNum = state.cardIndex + 1;
      const totalVisible = visibleCount;
      const category = `Question ${questionNum} of ${totalVisible}`;

      if (q.type === "longtext") {
        content = (
          <LongTextCard
            category={category}
            prompt={q.prompt}
            helperText={q.helperText}
            initial={state.answers[q.id]}
            minChars={q.minChars ?? 2}
            maxChars={q.maxChars ?? 500}
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
                onClick={() => advance({ step: "links", cardIndex: 0 })}
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
      const totalStatic = visibleCount;
      content = (
        <LongTextCard
          category={`Question ${totalStatic + state.cardIndex + 1} of ${totalStatic + DYNAMIC_COUNT}`}
          prompt={q.question}
          initial={state.answers[q.id]}
          minChars={20}
          maxChars={600}
          onContinue={(text) => handleDynamicAnswer(q.id, text)}
        />
      );
      break;
    }
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
          ← Summer School
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
              visibleCount,
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
