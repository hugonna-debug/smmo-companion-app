import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isPreview = process.env.VITE_IS_PREVIEW === "true" || !process.env.CONVEX_DEPLOY_KEY;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        ...(isPreview ? {
          "convex/react": path.resolve(import.meta.dirname, "src/mocks/convex-react-mock.tsx"),
          "@convex-dev/auth/react": path.resolve(import.meta.dirname, "src/mocks/convex-auth-mock.tsx"),
        } : {}),
      },
    },
    cacheDir: "/tmp/vite-cache",
  };
});
