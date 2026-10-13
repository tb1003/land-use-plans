import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" 讓 dist/ 可以直接放在 NAS 任意子目錄下
export default defineConfig({
  base: "./",
  plugins: [react()],
});
