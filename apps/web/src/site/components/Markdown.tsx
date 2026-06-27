import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div
      className="prose prose-zinc max-w-none
        prose-headings:font-heading prose-headings:scroll-mt-24
        prose-a:text-primary prose-a:font-medium
        prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        [&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-muted
        [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5
        prose-img:rounded-lg prose-img:border"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
