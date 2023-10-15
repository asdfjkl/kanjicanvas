import { defineCommand } from "citty";
import consola from "consola";
import path from "node:path";

const PYTHON_SCRIPT = path.join(__dirname, "datagen.py");

export const datagen = defineCommand({
  meta: {
    name: "datagen",
    description: "generate data from xml stroke data",
  },
  run: async () => {
    try {
      const py = await getPythonCmd();
      if (!py) {
        consola.error("python not found");
        return;
      }
      const { spawn } = await import("child_process");
      const child = spawn(py, [PYTHON_SCRIPT]);
      child.stdout.on("data", data => {
        console.log(data.toString());
      });
      child.stderr.on("data", data => {
        console.log(data.toString());
      });
      child.on("close", code => {
        console.log(`child process exited with code ${code}`);
      });
    } catch (e) {
      process.exit(1);
    }
  },
});

const getPythonCmd = async (): Promise<"python" | "python3" | null> => {
  let python = "python";
  const { exec } = await import("child_process");

  try {
    const { stdout } = exec(`which ${python}`);
    if (!stdout) throw new Error("command not found: python");

    const { stdout: version } = exec(`${python} --version`);
    if (!version?.toString().startsWith("Python 3")) {
      throw new Error("python version is not 3");
    }
    consola.info(`Using ${version}`);
    return "python";
  } catch (err) {
    try {
      // pythonが見つからない場合、python3を探す
      const { stdout } = exec(`which python3`);
      if (stdout) {
        return "python3";
      } else {
        consola.error("command not found: python or python3");
        throw err;
      }
    } catch (err) {
      return null;
    }
  }
};
