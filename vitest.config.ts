import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@/config": resolve(__dirname, "src/__mocks__/config.ts"),
      "@/content.config": resolve(
        __dirname,
        "src/__mocks__/content.config.ts"
      ),
    },
  },
  test: {
    globals: true,
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["src/utils/**/*.ts"],
      exclude: [
        "src/utils/generateOgImages.ts",
        "src/utils/loadGoogleFont.ts",
        "src/utils/transformers/**",
        "src/utils/__tests__/**",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
