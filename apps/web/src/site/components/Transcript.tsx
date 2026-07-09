import React, { useEffect, useMemo, useRef, useState } from "react";

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

// Render a chunk of text with any matches of `query` highlighted.
function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "ig");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 text-gray-950 rounded px-0.5">
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

export const Transcript: React.FC<TranscriptProps> = ({
  videoId,
  onSeek,
  currentTime,
}) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChunkRef = useRef<HTMLSpanElement>(null);
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

  useEffect(() => {
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
  }, [activeIndex]);

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

  if (loading)
    return (
      <div className="text-center text-muted-foreground py-8">
        Loading transcript...
      </div>
    );
  if (error)
    return <div className="text-center text-destructive py-8">{error}</div>;

  return (
    <div className="md:absolute md:inset-0 flex flex-col bg-white rounded-2xl w-full font-sans border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <h3 className="font-bold text-xl mb-3 text-gray-900 tracking-tight">
          Transcript
        </h3>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
            placeholder="Search transcript..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-gray-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
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
            const matches =
              query.length > 0 &&
              text.toLowerCase().includes(query.toLowerCase());

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
                    ${isActive ? "bg-primary/10" : ""}
                    ${
                      matches
                        ? "text-gray-950"
                        : "text-gray-700 hover:text-gray-950"
                    }
                  `}
                >
                  {highlightMatches(text, query)}
                </span>{" "}
              </React.Fragment>
            );
          })}
        </p>
      </div>
    </div>
  );
};
