// copy temp/*.dts files to packages/cli/bin, packages/**/dist

import fs from "node:fs";

/** @type {(str: string) => string} */
const blue = str => `\x1b[34m${str}\x1b[0m`;

/** @type {(str: string) => string} */
const green = str => `\x1b[32m${str}\x1b[0m`;

const generated = dir => console.log(`${green("✔︎")} generate: ${blue(dir)}`);

const getPaths = dir =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap(dirent => (dirent.isFile() ? [`${dir}/${dirent.name}`] : getPaths(`${dir}/${dirent.name}`)));

const getDtsPaths = dir => {
  const paths = getPaths(dir);
  return paths.filter(p => p.endsWith(".d.ts"));
};

const getTargetFiles = pathList =>
  pathList.map(it => {
    const rooted = it.replace(/^temp\//, "");
    const dist_ed = rooted.replace(/\/src\//, `/${/^packages\/cli\/+/.test(rooted) ? "bin" : "dist"}/`);
    const flattened = dist_ed
      .split("/")
      .reduce((acc, cur, i) => {
        if (i === 0) return acc + cur;
        if ([1, 2].includes(i)) return acc + "/" + cur + "/";
        if (i === dist_ed.split("/").length - 1) return acc + cur;
        return acc + cur + "-";
      }, "")
      .replace("//", "/");
    return flattened;
  });

const copyFiles = (sourceList, targetList) => {
  sourceList.forEach((source, i) => {
    fs.copyFileSync(source, targetList[i]);
    generated(targetList[i]);
  });
};

(function main() {
  const TEMP = "temp";
  const dtsFiles = getDtsPaths(TEMP);
  const targetFiles = getTargetFiles(dtsFiles);
  copyFiles(dtsFiles, targetFiles);
})();
