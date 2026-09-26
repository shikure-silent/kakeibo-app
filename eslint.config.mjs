import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Existing effects hydrate browser-only storage into local component
      // state. This rule cannot distinguish that pattern from a render loop.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "out 2/**",
    "build/**",
    "android/**",
    "ios/**",
    "next-env.d.ts",
  ]),
]);
