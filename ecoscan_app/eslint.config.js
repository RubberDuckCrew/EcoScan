const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ["dist/*"],
  },
  {
    settings: {
      react: {
        version: "19.1",
      },
    },
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [".*"],
        },
      ],
    },
  },
]);
