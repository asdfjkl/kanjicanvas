import * as esbuild from "esbuild";
import path from "path";

/**
 * @type {import('esbuild').BuildOptions}
 */
await esbuild.build({
  entryPoints: [
    path.resolve("packages/frontend/index.js"),
    // path.resolve("packages/backend/index.js"), // coming soon
    path.resolve("packages/dataset/index.js"),
  ],
  bundle: true,
  outdir: "dist",
});
