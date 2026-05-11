import { useState, useCallback, useSyncExternalStore, memo } from "react";
import type { UIMessage } from "ai";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { createMockChat } from "./mock-chat";

const chat = createMockChat();

function useChat() {
  const messages = useSyncExternalStore(
    chat.subscribe,
    () => chat.messages,
  );
  const status = useSyncExternalStore(
    chat.subscribe,
    () => chat.status,
  );
  return { messages, status, sendMessage: chat.sendMessage };
}

const ChatMessage = memo(
  ({ msg, isStreaming }: { msg: UIMessage; isStreaming: boolean }) => (
    <Message from={msg.role}>
      <MessageContent>
        {msg.role === "assistant" ? (
          <MessageResponse caret={isStreaming ? "block" : undefined}>
            {msg.content}
          </MessageResponse>
        ) : (
          <span>{msg.content}</span>
        )}
      </MessageContent>
    </Message>
  ),
  (prev, next) => {
    if (prev.isStreaming !== next.isStreaming) return false;
    if (prev.msg.id !== next.msg.id) return false;
    if (prev.isStreaming) return false;
    return prev.msg.content === next.msg.content;
  },
);

export function App() {
  const { messages, status, sendMessage } = useChat();
  const isStreaming = status === "streaming";
  const hasMessages = messages.length > 0;

  const handleSubmit = useCallback(
    ({ text }: { text: string }) => {
      if (!text.trim() || isStreaming) return;
      sendMessage(text);
    },
    [isStreaming, sendMessage],
  );

  const handleStop = useCallback(() => {}, []);

  const promptInput = (
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputTextarea
        autoFocus
        placeholder={
          hasMessages
            ? "Ask a follow-up..."
            : "Ask something about Bazel + Vite..."
        }
      />
      <PromptInputFooter>
        <span className="text-xs text-muted-foreground">mock responses</span>
        <PromptInputSubmit status={isStreaming ? "streaming" : "ready"} onStop={handleStop} />
      </PromptInputFooter>
    </PromptInput>
  );

  if (!hasMessages) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-background px-4 pb-16">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8">
          <h1 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Bazel + Vite Demo
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            AI chat UI built with AI Elements, bundled by Vite inside Bazel
          </p>
          {promptInput}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4">
          {messages.map((msg, i) => (
            <div key={msg.id} className="py-3">
              <ChatMessage
                msg={msg}
                isStreaming={isStreaming && i === messages.length - 1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="shrink-0 bg-background px-4 pb-4 pt-2">
        <div className="mx-auto max-w-2xl">{promptInput}</div>
      </div>
    </div>
  );
}
