import * as esbuild from "esbuild";
import path from "path";

/**
 * @type {import('esbuild').BuildOptions}
 */
await esbuild.build({
  entryPoints: [
    path.resolve("packages/core/kanji-canvas.js"),
    path.resolve("packages/dataset/ref-patterns.js"),
  ],
  bundle: true,
  outdir: "dist",
});
