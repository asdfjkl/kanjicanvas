import path from "node:path";
import AdmZip from "adm-zip";
import { defineCommand } from "citty";

const J_TEGAKI_ZIP_PATH = path.join(__dirname, "./jTegaki.zip");
const J_TEGAKI_DIR_PATH = path.join(__dirname, "./jTegaki.jar");

export const openJTegaki = defineCommand({
  meta: { name: "jTegaki", description: "open jTegaki GUI Took" },
  run: async () => {
    await unzipJTegaki();
    await openJar();
  },
});

const openJar = async () => {
  const { spawn } = await import("child_process");
  const child = spawn("java", ["-jar", J_TEGAKI_DIR_PATH]);
  child.stdout.on("data", data => {
    console.log(data.toString());
  });
  child.stderr.on("data", data => {
    console.log(data.toString());
  });
  child.on("close", code => {
    console.log(`child process exited with code ${code}`);
  });
  child.on("error", err => {
    console.error(err);
  });
};

const unzipJTegaki = async () => {
  const zip = new AdmZip(J_TEGAKI_ZIP_PATH);
  zip.extractAllTo(path.join(__dirname, "."), true);
};
