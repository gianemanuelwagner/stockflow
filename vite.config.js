import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@firebase/firestore")) return "firestore";
          if (id.includes("@firebase/auth")) return "authentication";
          if (id.includes("node_modules/react")) return "react";
        },
      },
    },
  },
});
