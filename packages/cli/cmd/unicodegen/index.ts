import { consola } from "consola";
import { defineCommand } from "citty";

export const unicodegen = defineCommand({
  meta: { name: "unicodegen", description: "generate unicode" },
  args: {
    map: { type: "boolean", alias: ["m"], description: "print map char and unicode map", required: false },
    separator: { type: "string", alias: ["s"], description: "separator", default: "\n" },
  },
  run: ({ args }) => {
    const { map: isMap, separator, _: chars } = args;
    let buffer = "";
    if (isMap) {
      buffer += genMap("char", "unicode");
      buffer += "\n";
      chars.forEach((char: string) => {
        if (char.length !== 1) {
          consola.error(`char length is not 1: ${char}`);
          return;
        }
        buffer += genMap(char, getHexUnicode(char));
        buffer += "\n";
      });
    } else {
      chars.forEach((char: string) => {
        if (char.length !== 1) {
          consola.error(`char length is not 1: ${char}`);
          return;
        }
        buffer += getHexUnicode(char);
        buffer += separator;
      });
    }

    console.log(buffer);
  },
});

const getHexUnicode = (char: string) => {
  const codePoint = char.codePointAt(0);
  if (!codePoint) {
    throw new Error(`codePoint is null: ${char}`);
  }
  return codePoint.toString(16).toUpperCase();
};

const genMap = (s1: string, s2: string) => `${s1}\t${s2}`;
