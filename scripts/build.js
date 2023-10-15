import path from "path";

import * as esbuild from "esbuild";
import { rimraf } from "rimraf";

const OUT_DIR = "dist";

// cleanup dist
rimraf.sync(OUT_DIR);

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
  outdir: OUT_DIR,
});

/**
 * @type {import('esbuild').BuildOptions}
 */
await esbuild.build({
  entryPoints: [path.resolve("packages/cli/bin")],
  bundle: true,
  outdir: `${OUT_DIR}/cli`,
  target: "node18",
  platform: "node",
  outExtension: { ".js": ".cjs" },
});

// copy jTegaki.zip
import fs from "fs";
fs.copyFileSync(path.resolve("packages/cli/cmd/jTegaki/jTegaki.zip"), path.resolve(`${OUT_DIR}/cli/jTegaki.zip`));

// copy python
fs.copyFileSync(path.resolve("packages/cli/cmd/datagen/datagen.py"), path.resolve(`${OUT_DIR}/cli/datagen.py`));
