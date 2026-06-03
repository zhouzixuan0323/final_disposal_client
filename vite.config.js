import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 目录别名
    alias: {
      "@/": path.resolve(__dirname, '/src')
    },
  },
  build: {
    outDir: 'final_disposal_client'
  }
});
