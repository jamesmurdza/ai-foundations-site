import React, { useEffect, useState } from 'react';

interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

interface TranscriptProps {
  videoId: string;
  onSeek?: (seconds: number) => void;
}

// Universal HTML entity decoder (works on server and client)
function decodeHTMLEntities(text: string) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

export const Transcript: React.FC<TranscriptProps> = ({ videoId, onSeek }) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/transcript?videoId=${videoId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Transcript not available.');
        const data = await res.json();
        setTranscript(data.transcript);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError('Transcript not available.');
        setLoading(false);
      });
  }, [videoId]);

  const handleSeek = (start: number, idx: number) => {
    setActiveIndex(idx);
    if (onSeek) onSeek(start);
  };

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading transcript...</div>;
  if (error) return <div className="text-center text-destructive py-8">{error}</div>;

  return (
    <div className="overflow-y-auto max-h-[70vh] px-2 py-4 bg-white rounded-2xl w-full font-sans relative border border-slate-100 shadow-sm">
      <h3 className="font-bold text-xl mb-4 text-gray-900 tracking-tight pl-2">Transcript</h3>
      <div className="flex flex-col gap-0.5 relative z-20">
        {transcript.map((item, idx) => (
          <React.Fragment key={item.offset}>
            <div
              className={`flex items-start gap-4 py-3 px-2 group transition-colors duration-100 rounded-lg cursor-pointer
                ${activeIndex === idx ? 'bg-slate-100' : 'hover:bg-slate-50'}
              `}
              onClick={() => handleSeek(item.offset, idx)}
              tabIndex={0}
              aria-current={activeIndex === idx ? 'true' : undefined}
              style={{ minHeight: '44px' }}
            >
              <button
                className={`flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 shadow-sm mr-1 transition-all duration-150
                  ${activeIndex === idx ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 hover:bg-primary/10'}
                `}
                aria-label={`Play from ${formatTime(item.offset)}`}
                tabIndex={-1}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 3.993v8.014c0 .548.592.885 1.06.593l6.518-4.007a.684.684 0 0 0 0-1.186L5.06 3.4A.684.684 0 0 0 4 3.993z"/>
                </svg>
              </button>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs text-slate-400 font-mono mb-1 select-none">
                  {formatTime(item.offset)}
                </span>
                <span className="text-[1.08rem] text-gray-900 leading-relaxed font-normal font-sans break-words" style={{wordBreak:'break-word', lineHeight: '1.7'}}>
                  {decodeHTMLEntities(item.text)}
                </span>
              </div>
            </div>
            {idx < transcript.length - 1 && (
              <div className="border-b border-slate-100 mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
} 