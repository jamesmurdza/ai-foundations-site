import React, { useEffect, useMemo, useRef, useState } from "react";
import { PanelRightClose } from "lucide-react";

interface TranscriptItem {
  text: string;
  duration: number;
  start: number;
  lang?: string;
}

interface TranscriptProps {
  videoId: string;
  onSeek?: (seconds: number) => void;
  currentTime?: number;
  onCollapse?: () => void;
}

// Universal HTML entity decoder (works on server and client)
function decodeHTMLEntities(text: unknown) {
  if (!text) return "";
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

// Escape a string for safe use inside a RegExp
function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const Transcript: React.FC<TranscriptProps> = ({
  videoId,
  onSeek,
  currentTime,
  onCollapse,
}) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChunkRef = useRef<HTMLSpanElement>(null);
  const activeMatchRef = useRef<HTMLElement>(null);

  const activeIndex = useMemo(() => {
    if (currentTime == null) return -1;
    let idx = -1;
    for (let i = 0; i < transcript.length; i++) {
      if (transcript[i].start <= currentTime) idx = i;
      else break;
    }
    return idx;
  }, [currentTime, transcript]);

  const query = search.trim();

  // Total number of search matches across the whole transcript.
  const totalMatches = useMemo(() => {
    if (!query) return 0;
    const regex = new RegExp(escapeRegExp(query), "ig");
    let count = 0;
    for (const item of transcript) {
      const text = decodeHTMLEntities(item.text);
      const found = text.match(regex);
      if (found) count += found.length;
    }
    return count;
  }, [query, transcript]);

  // Reset to the first match whenever the query changes.
  useEffect(() => {
    setCurrentMatch(0);
  }, [query]);

  // Keep the selected match index within bounds.
  const safeMatch =
    totalMatches > 0 ? ((currentMatch % totalMatches) + totalMatches) % totalMatches : 0;

  const gotoNext = () => {
    if (totalMatches > 0) setCurrentMatch((m) => m + 1);
  };
  const gotoPrev = () => {
    if (totalMatches > 0) setCurrentMatch((m) => m - 1);
  };

  // Scroll the current search match into the middle of the transcript panel.
  useEffect(() => {
    if (totalMatches === 0) return;
    const container = containerRef.current;
    const mark = activeMatchRef.current;
    if (!container || !mark) return;
    const cRect = container.getBoundingClientRect();
    const mRect = mark.getBoundingClientRect();
    const next =
      mRect.top -
      cRect.top +
      container.scrollTop -
      container.clientHeight / 2 +
      mRect.height / 2;
    container.scrollTo({ top: Math.max(0, next) });
  }, [safeMatch, totalMatches, query]);

  // Scroll the currently-playing chunk into view (only when not searching).
  useEffect(() => {
    if (query) return;
    const container = containerRef.current;
    const chunk = activeChunkRef.current;
    if (!container || !chunk) return;
    const cRect = container.getBoundingClientRect();
    const rRect = chunk.getBoundingClientRect();
    const next =
      rRect.top -
      cRect.top +
      container.scrollTop -
      container.clientHeight / 2 +
      rRect.height / 2;
    container.scrollTo({ top: Math.max(0, next) });
  }, [activeIndex, query]);

  useEffect(() => {
    const loadTranscript = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to load from ml-python first
        const mlPythonRes = await fetch(
          `/transcripts/ml-python/video_${videoId}.json`,
        );
        if (mlPythonRes.ok) {
          const data = await mlPythonRes.json();
          setTranscript(data);
          setLoading(false);
          return;
        }

        // If not found in ml-python, try ai-agent-camp
        const aiAgentRes = await fetch(
          `/transcripts/ai-agent-camp/video_${videoId}.json`,
        );
        if (aiAgentRes.ok) {
          const data = await aiAgentRes.json();
          setTranscript(data);
          setLoading(false);
        } else {
          throw new Error("Transcript not available in cached files.");
        }
      } catch (err) {
        setError("Transcript not available.");
        setLoading(false);
      }
    };

    loadTranscript();
  }, [videoId]);

  const handleSeek = (start: number) => {
    if (onSeek) onSeek(start);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) gotoPrev();
      else gotoNext();
    }
  };

  // Render a chunk of text, wrapping each search match in a <mark>. A running
  // counter assigns every match a global index so we can highlight/scroll to
  // the currently-selected one.
  const renderChunk = (text: string, counter: { n: number }) => {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "ig");
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.toLowerCase() !== query.toLowerCase()) {
        return <React.Fragment key={i}>{part}</React.Fragment>;
      }
      const matchIndex = counter.n++;
      const isCurrent = matchIndex === safeMatch;
      return (
        <mark
          key={i}
          ref={isCurrent ? activeMatchRef : undefined}
          className={`rounded px-0.5 text-gray-950 ${
            isCurrent ? "bg-orange-400" : "bg-yellow-200"
          }`}
        >
          {part}
        </mark>
      );
    });
  };

  if (loading)
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading transcript...
      </div>
    );
  if (error)
    return <div className="text-center text-destructive py-8">{error}</div>;

  // Running match counter shared across all chunks during this render pass.
  const matchCounter = { n: 0 };

  return (
    <div className="md:absolute md:inset-0 flex flex-col bg-background rounded-xl w-full font-sans border overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold tracking-tight">
            Transcript
          </h3>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label="Hide transcript"
              title="Hide transcript"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search transcript..."
              className="w-full rounded-lg border bg-muted/50 py-2 pl-9 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {query && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs tabular-nums text-muted-foreground">
                {totalMatches > 0 ? `${safeMatch + 1}/${totalMatches}` : "0/0"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={gotoPrev}
              disabled={totalMatches === 0}
              aria-label="Previous match"
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m18 15-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={gotoNext}
              disabled={totalMatches === 0}
              aria-label="Next match"
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-y-auto max-h-[70vh] md:max-h-none md:flex-1 px-4 py-4"
      >
        <p
          className="text-[1.08rem] leading-relaxed break-words"
          style={{ wordBreak: "break-word", lineHeight: "1.9" }}
        >
          {transcript.map((item, idx) => {
            const key = `${item.start}-${idx}`;
            const isActive = activeIndex === idx;
            const text = decodeHTMLEntities(item.text);

            return (
              <React.Fragment key={key}>
                <span
                  ref={isActive ? activeChunkRef : undefined}
                  onClick={() => handleSeek(item.start)}
                  role="button"
                  tabIndex={0}
                  aria-current={isActive ? "true" : undefined}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSeek(item.start);
                    }
                  }}
                  className={`cursor-pointer rounded transition-colors duration-100
                    ${isActive ? "bg-primary/10 text-foreground" : ""}
                    text-muted-foreground hover:text-foreground
                  `}
                >
                  {renderChunk(text, matchCounter)}
                </span>{" "}
              </React.Fragment>
            );
          })}
        </p>
      </div>
    </div>
  );
};
