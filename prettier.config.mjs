/** @type {import('prettier').Config} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 80,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["cn", "cva"],
  tailwindStylesheet: "registry/zyx/styles/globals.css",
  // The registry source keeps the style it ships in (no semicolons).
  overrides: [
    {
      files: "registry/zyx/{agent,components,fonts,hooks,lib,styles}/**",
      options: { semi: false },
    },
  ],
};

export default config;
