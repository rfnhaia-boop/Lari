"use client";

import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 animate-fade-in-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-border text-muted" : "bg-primary text-primary-fg"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bolha */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-fg"
            : "rounded-tl-sm glass-strong text-slate-100"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-chat space-y-2">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1">{children}</ol>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
