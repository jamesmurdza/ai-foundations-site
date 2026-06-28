"use client";

import { useState } from "react";
import { CardStage } from "./CardStage";
import { Button } from "@site/components/ui/button";

type Props = {
  initialName?: string;
  initialEmail?: string;
  onContinue: (data: { name: string; email: string }) => void;
};

export function ContactCard({ initialName, initialEmail, onContinue }: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const isValid =
    name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <CardStage>
      <div className="flex-1 flex flex-col">
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
          About you
        </p>
        <h2 className="font-heading text-2xl font-semibold leading-tight mb-2">
          What should we call you?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Saved as you type. We&apos;ll only email you about your application.
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
        </div>
      </div>
      <div className="pt-6">
        <Button
          size="lg"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          disabled={!isValid}
          onClick={() =>
            onContinue({ name: name.trim(), email: email.trim() })
          }
        >
          Continue →
        </Button>
      </div>
    </CardStage>
  );
}
