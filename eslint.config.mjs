import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {files: ["src/**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.node }},
  ...tseslint.configs.recommended,
];