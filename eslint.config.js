import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "graphify-out", ".opencode"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["api/**/*.ts", "prerender.ts", "*.config.*", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
);
