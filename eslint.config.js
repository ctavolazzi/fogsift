import globals from "globals";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        Toast: "readonly",
        Theme: "readonly",
        Modal: "readonly",
        Nav: "readonly",
        SleepMode: "readonly",
        CookieConsent: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^(Toast|Theme|Modal|Nav|App|SleepMode|CookieConsent)$"
      }],
      "no-undef": "error",
      "no-empty": "warn",
      "no-constant-condition": "warn"
    }
  },
  {
    ignores: ["dist/**", "node_modules/**"]
  }
];
