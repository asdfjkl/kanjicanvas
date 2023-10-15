import { defineCommand, runMain, runCommand } from "citty";
import { unicodegen } from "./cmd/unicodegen";
import { openJTegaki } from "./cmd/jTegaki";
import { datagen } from "./cmd/datagen";

const main = defineCommand({
  meta: { name: "tegaki cli tools" },
  async run({ rawArgs }) {
    const [command] = rawArgs;
    switch (command) {
      case "unicodegen":
        await runCommand(unicodegen, {
          rawArgs: rawArgs.slice(1),
        });
        break;
      case "jTegaki":
        await runCommand(openJTegaki, {
          rawArgs: rawArgs.slice(1),
        });
        break;
      case "datagen":
        await runCommand(datagen, {
          rawArgs: rawArgs.slice(1),
        });
        break;
      default: {
        console.log(`Usage: tegaki <command> [options]
available commands:
  - unicodegen
  - jTegaki
  - datagen`);
        break;
      }
    }
  },
});

runMain(main);
