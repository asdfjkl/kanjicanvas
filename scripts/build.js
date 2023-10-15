import * as esbuild from "esbuild";
import path from "path";

/**
 * @type {import('esbuild').BuildOptions}
 */
await esbuild.build({
  entryPoints: [
    path.resolve("packages/tegaki/index"),
    path.resolve("packages/frontend/index"),
    path.resolve("packages/backend/index"),
    path.resolve("packages/dataset/index"),
    path.resolve("packages/utils/index"),
  ],
  bundle: true,
  outdir: "dist",
});
