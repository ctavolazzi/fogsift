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
        ThemePicker: "readonly",
        Modal: "readonly",
        Nav: "readonly",
        SleepMode: "readonly",
        CookieConsent: "readonly",
        Debug: "readonly",
        SiteSearch: "readonly",
        CopyPageText: "readonly",
        MatrixRain: "readonly",
        QueueUI: "readonly",
        App: "readonly",
        ExampleModal: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^(Toast|Theme|ThemePicker|Modal|Nav|App|ExampleModal|SleepMode|CookieConsent|Debug|SiteSearch|CopyPageText|MatrixRain|QueueUI)$"
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
