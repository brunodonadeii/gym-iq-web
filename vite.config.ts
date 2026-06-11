import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { tanstackRouter } from "@tanstack/router-vite-plugin";

export default defineConfig({
  plugins: [tanstackRouter(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.module.css",
        "src/**/types.ts",
        "src/**/constants.ts",
        "src/main.tsx",
        "src/test/**",
        "src/routes/**",
        "src/routeTree.gen.ts",
        "src/pages/**/list/**",
        "src/pages/**/create/**",
        "src/pages/**/edit/**",
        "src/pages/**/details/**",
        "src/pages/**/renew/**",
        "src/pages/Dashboard/components/chartConfig.ts",
        "src/**/*.d.ts",
      ],
    },
  },
});
