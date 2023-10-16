import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";
import { rimraf } from "rimraf";

/** @type {(str: string) => string} */
const blue = str => `\x1b[34m${str}\x1b[0m`;

/** @type {(str: string) => string} */
const green = str => `\x1b[32m${str}\x1b[0m`;

const CLI_OUT_DIR = `packages/cli/bin`;

/**
 * @type {() => PromiseLike<void>}
 */
export const buildCli = async () => {
  /**
   * @type {import('esbuild').BuildOptions}
   */
  await esbuild.build({
    entryPoints: [path.resolve("packages/cli/src/bin")],
    bundle: true,
    outdir: CLI_OUT_DIR,
    target: "node18",
    platform: "node",
  });
  console.log(`${green("✔︎")} finished build: ${blue(CLI_OUT_DIR)}`);

  // copy jTegaki.zip
  fs.copyFileSync(path.resolve("packages/cli/src/cmd/jTegaki/jTegaki.zip"), path.resolve(`${CLI_OUT_DIR}/jTegaki.zip`));
  console.log(`${green("✔︎")} finished build: ${blue(`${CLI_OUT_DIR}/jTegaki.zip`)}`);

  // copy python script
  fs.copyFileSync(path.resolve("packages/cli/src/cmd/datagen/datagen.py"), path.resolve(`${CLI_OUT_DIR}/datagen.py`));
  console.log(`${green("✔︎")} finished build: ${blue(`${CLI_OUT_DIR}/datagen.py`)}`);
};

/**
 * @type {() => void}
 */
export const clearCliSync = () => {
  rimraf.sync(CLI_OUT_DIR);
};

const PACKAGES = ["tegaki", "frontend", "backend", "dataset", "shared"];

/**
 * @type {() => PromiseLike<import('esbuild').BuildResult<{ entryPoints: string, outdir: string }>>[]}
 */
export const buildTegaki = () =>
  PACKAGES.map(pkg => {
    /**
     * @type {import('esbuild').BuildOptions}
     */
    const res = esbuild.build({
      entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
      bundle: true,
      outdir: `packages/${pkg}/dist`,
    });
    res.then(() => console.log(`${green("✔︎")} finished build: ${blue(`packages/${pkg}/dist`)}`));
    return res;
  });

/**
 * @type {function(): void}
 */
export const clearTegakiSync = () => {
  PACKAGES.map(pkg => `packages/${pkg}/dist`).forEach(dir => rimraf.sync(dir));
};

(async function main() {
  console.log("clear dist...");
  await Promise.allSettled([clearCliSync(), clearTegakiSync()]);
  console.log(`${green("✔︎")} finished clearing dist`);
  console.log("building tegaki...");
  const buildingTegaki = buildTegaki();
  const buildingCli = buildCli();
  await Promise.all([...buildingTegaki, buildingCli]);
})();
