import pluginPrettier from "eslint-config-prettier";

import js from "@eslint/js";

/**
 * @type {import('eslint').Linter.Config}
 */
const config = [
  { ignores: ["node_modules", "dist"] },
  js.configs.recommended,
  {
    rules: {
      ...pluginPrettier.rules,

      /*
       * NOTE:
       *
       * really want to make it an error, but for compatibility,
       *
       * it is a warning. When the migration is complete, it will be set as an error.
       */
      "no-redeclare": "warn",
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
  },
];

export default config;
