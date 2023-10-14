import { defineConfig } from "vite";

export default defineConfig({
  resolve: { alias: { tegaki: `${process.cwd()}/../../packages` } },
});
