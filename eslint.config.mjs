import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // External agent skill packs — vendored docs, not project source.
    ".agent/**",
    ".agents/**",
  ]),
  {
    rules: {
      // Cap effective lines per file. Counts code only — blank lines and
      // comment lines are skipped so docstrings and section dividers
      // don't push files over the limit. See CLAUDE.md.
      "max-lines": [
        "error",
        { max: 700, skipBlankLines: true, skipComments: true },
      ],
    },
  },
]);

export default eslintConfig;
