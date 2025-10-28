import js from "@eslint/js";
import tseslint from "typescript-eslint";

const eslintConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    rules: {
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-duplicate-imports": "warn",
      "no-unused-expressions": "warn",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "coverage/**",
      "*.config.js",
      "*.config.mjs",
      "public/sw.js",
      "public/workbox-*.js",
    ],
  },
);

export default eslintConfig;
