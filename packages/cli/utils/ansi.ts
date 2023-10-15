export const ansi = {
  /** font color */
  c: {
    black: (s: string) => `\x1b[30m${s}\x1b[0m`,
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
    green: (s: string) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
    blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
    magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
    white: (s: string) => `\x1b[37m${s}\x1b[0m`,
    gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
    grey: (s: string) => `\x1b[90m${s}\x1b[0m`,
  },

  /** background color */
  bgc: {
    black: (s: string) => `\x1b[40m${s}\x1b[0m`,
    red: (s: string) => `\x1b[41m${s}\x1b[0m`,
    green: (s: string) => `\x1b[42m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[43m${s}\x1b[0m`,
    blue: (s: string) => `\x1b[44m${s}\x1b[0m`,
    magenta: (s: string) => `\x1b[45m${s}\x1b[0m`,
    cyan: (s: string) => `\x1b[46m${s}\x1b[0m`,
    white: (s: string) => `\x1b[47m${s}\x1b[0m`,
  },

  // font styles
  f: {
    bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
    dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
    italic: (s: string) => `\x1b[3m${s}\x1b[0m`,
    underline: (s: string) => `\x1b[4m${s}\x1b[0m`,
    blink: (s: string) => `\x1b[5m${s}\x1b[0m`,
    reverse: (s: string) => `\x1b[7m${s}\x1b[0m`,
    hidden: (s: string) => `\x1b[8m${s}\x1b[0m`,
  },
} as const;
