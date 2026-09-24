import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// Regra propria: texto literal em JSX so e permitido dentro de src/i18n (strings de UI vem do dicionario).
const noLiteralJsxText = {
  meta: {
    type: "problem",
    docs: { description: "Disallow literal text in JSX outside src/i18n" },
    messages: { literal: "Literal JSX text is not allowed; use the i18n dictionary (src/i18n/messages.ts)." },
    schema: [],
  },
  create(context) {
    const file = context.filename.split("\\").join("/");
    if (file.includes("/src/i18n/")) return {};
    return {
      JSXText(node) {
        if (node.value.trim() !== "") context.report({ node, messageId: "literal" });
      },
    };
  },
};

const EM_DASH = String.fromCharCode(0x2014);
const emDashMessage = "The em dash character (U+2014) is forbidden; use a comma, colon, parentheses or a hyphen.";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/**",
      "data-source/**",
      "design/**",
      ".forge/**",
      "prints/**",
      "tools/dataset/out/**",
      "tools/dataset/.cache/**",
      "test-results/**",
      "playwright-report/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      "react-hooks": reactHooks,
      pontindex: { rules: { "no-literal-jsx-text": noLiteralJsxText } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "pontindex/no-literal-jsx-text": "error",
      "no-restricted-syntax": [
        "error",
        { selector: `Literal[value=/${EM_DASH}/]`, message: emDashMessage },
        { selector: `TemplateElement[value.raw=/${EM_DASH}/]`, message: emDashMessage },
        { selector: `JSXText[value=/${EM_DASH}/]`, message: emDashMessage },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);
