"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import bash from "highlight.js/lib/languages/bash";
import diff from "highlight.js/lib/languages/diff";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { CodeBlock } from "@site/components/CodeBlock";

// Register only the languages used across the courses to keep the client bundle
// small. highlight.js also registers each grammar's aliases (ts, js, sh, html…).
const languages = { bash, diff, javascript, json, python, typescript, xml };

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeHighlight, { languages, detect: true, ignoreMissing: true }],
        ]}
        components={{ pre: CodeBlock }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
