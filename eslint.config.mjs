import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // Cambiar a warning en lugar de error
      "@typescript-eslint/no-unused-vars": [
        "warn", // Cambiar a warning
        { 
          "varsIgnorePattern": "^_", // Ignorar variables que empiecen con _
          "argsIgnorePattern": "^_" // Ignorar argumentos que empiecen con _
        }
      ],
      "react-hooks/exhaustive-deps": "warn" // Cambiar a warning
    }
  }
];

export default eslintConfig;
