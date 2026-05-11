import type { UIMessage } from "ai";

const responses = [
  "This project is built with **Bazel** and **Vite**. The frontend is a React SPA bundled by `vite build` inside Bazel's sandbox.\n\n```starlark\njs_run_binary(\n    name = \"bundle\",\n    srcs = _SRCS + [\"index.html\", \"vite.config.ts\"],\n    args = [\"build\"],\n    tool = \":vite_bin\",\n)\n```\n\nThe output is one JS bundle, one CSS file, and an `index.html`. Bazel caches it all.",
  "Vite uses **esbuild** for TypeScript transpilation. esbuild strips type annotations without type-checking. For type safety, you run **tsgo** separately as a `js_test` target.\n\nBoth tsgo and esbuild are written in Go. The entire frontend toolchain compiles to native binaries.",
  "The key insight is that `rules_js` from Aspect Build is the only thing you need. No `rules_ts`, no `rules_swc`. Vite handles transpilation via esbuild internally.\n\nThe `.npmrc` must have `hoist=false` because rules_js mirrors pnpm's flat layout inside Bazel's output tree.",
  "For local development, run `vite dev` directly via pnpm. Bazel's sandbox makes HMR slow. Vite gives sub-50ms HMR with native ESM.\n\nThe dev server proxies API requests to whatever backend you run:\n\n```typescript\nserver: {\n  proxy: {\n    \"/api\": { target: \"http://localhost:8080\" },\n  },\n},\n```",
  "The whole SSR push is a business model. Vercel sells server compute. Server components need servers. If you self-host, SSR is pure overhead.\n\nVite respects the separation: it's a bundler with no opinions about your server. You pick your router, your data fetching. It just does the build step.",
];

let responseIndex = 0;

export function createMockChat() {
  let messages: UIMessage[] = [];
  let listeners: Set<() => void> = new Set();
  let status: "ready" | "streaming" = "ready";

  function notify() {
    listeners.forEach((fn) => fn());
  }

  function subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  async function sendMessage(content: string) {
    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      parts: [{ type: "text", text: content }],
    };
    messages = [...messages, userMsg];
    notify();

    const fullResponse = responses[responseIndex % responses.length];
    responseIndex++;

    const assistantMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      parts: [{ type: "text", text: "" }],
    };
    messages = [...messages, assistantMsg];
    status = "streaming";
    notify();

    for (let i = 0; i < fullResponse.length; i++) {
      await new Promise((r) => setTimeout(r, 8 + Math.random() * 12));
      const partial = fullResponse.slice(0, i + 1);
      assistantMsg.content = partial;
      assistantMsg.parts = [{ type: "text", text: partial }];
      messages = [...messages.slice(0, -1), { ...assistantMsg }];
      notify();
    }

    status = "ready";
    notify();
  }

  return {
    get messages() {
      return messages;
    },
    get status() {
      return status;
    },
    sendMessage,
    subscribe,
  };
}
