import { build } from "vite";
if (process.argv[2] === "build") {
  await build();
}
