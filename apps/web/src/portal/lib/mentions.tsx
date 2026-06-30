import Link from "@portal/components/Link";
import type { ReactNode } from "react";

// @handle mentions: handles are the same shape as profile usernames
// ([a-z0-9] + hyphens, 2–24 chars). Matched case-insensitively, stored lower.
const MENTION = /@([a-z0-9][a-z0-9-]{1,23})/gi;

/** Pull the unique, lowercased @handles out of a block of text. */
export function extractMentions(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(MENTION)) {
    out.add(m[1].toLowerCase());
  }
  return [...out];
}

/**
 * Render text with @handles that exist in `valid` turned into profile links.
 * Unknown @handles stay as plain text so typos don't become dead links.
 */
export function MentionText({
  text,
  valid,
}: {
  text: string;
  valid: Set<string>;
}): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(MENTION)) {
    const idx = m.index ?? 0;
    const handle = m[1].toLowerCase();
    if (idx > last) nodes.push(text.slice(last, idx));
    if (valid.has(handle)) {
      nodes.push(
        <Link key={`m-${i++}`} href={`/u/${handle}`} className="link">
          @{m[1]}
        </Link>,
      );
    } else {
      nodes.push(m[0]);
    }
    last = idx + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}
