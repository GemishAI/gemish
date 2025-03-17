import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Check, Copy } from "lucide-react";
import Marked, { type ReactRenderer } from "marked-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CitationLink {
  text: string;
  link: string;
}

interface LinkMetadata {
  title: string;
  description: string;
}

const isValidUrl = (str: string) => {
  try {
    return Boolean(new URL(str));
  } catch {
    return false;
  }
};

export function ChatMarkdown({ content }: { content: string }) {
  const citationLinks = useMemo(
    () =>
      Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(
        ([_, text, link]) => ({ text, link })
      ),
    [content]
  );

  const CodeBlock: React.FC<{ language?: string; children: string }> = ({
    language,
    children,
  }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }, [children]);

    return (
      <div className="relative group font-mono">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {children}
        </SyntaxHighlighter>
        <Button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-neutral-700 dark:bg-neutral-600 bg-opacity-80 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          variant="ghost"
          size="sm"
        >
          {isCopied ? (
            <Check size={16} className="text-green-500" />
          ) : (
            <Copy size={16} className="text-neutral-200" />
          )}
        </Button>
      </div>
    );
  };

  const LinkPreview: React.FC<{ href: string }> = ({ href }) => {
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null);

    const domain = new URL(href).hostname;
    return (
      <div className="flex flex-col space-y-2 bg-white dark:bg-neutral-800 rounded-md shadow-md overflow-hidden">
        <div className="flex items-center space-x-2 p-3 bg-neutral-100 dark:bg-neutral-700">
          <Image
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=256`}
            alt="Favicon"
            width={20}
            height={20}
            className="rounded-sm"
          />
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">
            {domain}
          </span>
        </div>
        <div className="px-3 pb-3">
          <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
            {metadata?.title || "Untitled"}
          </h3>
          {metadata?.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
              {metadata.description}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderHoverCard = (
    href: string,
    text: React.ReactNode,
    isCitation = false
  ) => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isCitation
              ? "cursor-pointer text-sm text-primary py-0.5 px-1.5 m-0 bg-neutral-200 dark:bg-neutral-700 rounded-full no-underline"
              : "text-teal-600 dark:text-teal-400 no-underline hover:underline"
          }
        >
          {text}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-80 p-0 shadow-lg">
        <LinkPreview href={href} />
      </HoverCardContent>
    </HoverCard>
  );

  const renderer: Partial<ReactRenderer> = {
    paragraph: (children) => (
      <p className=" text-neutral-800 py-1.5 dark:text-neutral-200">
        {children}
      </p>
    ),
    code: (children, language) => (
      <CodeBlock language={language}>{String(children)}</CodeBlock>
    ),
    heading: (children, level) =>
      React.createElement(
        `h${level}`,
        {
          className: `text-${
            4 - level
          }xl font-bold my-4 text-neutral-800 dark:text-neutral-100`,
        },
        children
      ),
    link: (href, text) => {
      const citationIndex = citationLinks.findIndex(
        (link) => link.link === href
      );
      return citationIndex !== -1 ? (
        <sup>{renderHoverCard(href, citationIndex + 1, true)}</sup>
      ) : isValidUrl(href) ? (
        renderHoverCard(href, text)
      ) : (
        <a
          href={href}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {text}
        </a>
      );
    },
    list: (children, ordered) =>
      React.createElement(
        ordered ? "ol" : "ul",
        {
          className:
            "list-inside list-disc my-4 pl-4 text-neutral-800 dark:text-neutral-200",
        },
        children
      ),
    listItem: (children) => (
      <li className="my-2 text-neutral-800 dark:text-neutral-200">
        {children}
      </li>
    ),
    blockquote: (children) => (
      <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic my-4 text-neutral-700 dark:text-neutral-300">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className="markdown-body dark:text-neutral-200">
      <Marked renderer={renderer}>{content}</Marked>
    </div>
  );
}
