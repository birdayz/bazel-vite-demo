# bazel-vite-demo

Demo project for [Frontend builds in Bazel with Vite and rules_js](https://birdayz.github.io/bazel_frontend_vite/).

AI chat UI built with [AI Elements](https://elements.ai-sdk.dev/), bundled by Vite inside Bazel using [rules_js](https://github.com/aspect-build/rules_js).

## Build

```
cd app && pnpm install
bazel build //app:bundle
```

Output lands in `bazel-bin/app/dist/`.

## Dev

```
cd app && pnpm dev
```
