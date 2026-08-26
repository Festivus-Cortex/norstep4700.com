import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  // Keep generated assets and the imported Once UI source outside project linting.
  globalIgnores([
    ".next/**",
    "build/**",
    ".turbo/**",
    "next-env.d.ts",
    "public/**",
    "src/once-ui/**",
  ]),
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "comma-dangle": ["error", "only-multiline"],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    // This Node CLI intentionally uses CommonJS because the package is not ESM.
    files: ["dev/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
