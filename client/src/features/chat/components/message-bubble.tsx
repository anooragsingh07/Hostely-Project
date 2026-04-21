import type { ChatMessage } from "@hostely/shared";
import { cn } from "@/lib/cn";
import { formatRelative } from "@/lib/format";

interface MessageBubbleProps {
  message: ChatMessage;
  mine: boolean;
}

export const MessageBubble = ({ message, mine }: MessageBubbleProps) => (
  <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
    <div
      className={cn(
        "shadow-subtle max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
        mine
          ? "bg-primary text-primary-foreground rounded-br-md"
          : "bg-accent text-foreground rounded-bl-md",
      )}
    >
      <p className="whitespace-pre-wrap break-words">{message.body}</p>
      <p
        className={cn(
          "mt-1 text-[10px]",
          mine ? "text-primary-foreground/70" : "text-muted-foreground",
        )}
      >
        {formatRelative(message.createdAt)}
      </p>
    </div>
  </div>
);
