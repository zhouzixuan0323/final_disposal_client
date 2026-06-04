import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig, loadEnv } from "vite";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBaseUrl = env.VITE_API_BASE_URL || "/api";
  const apiProxyTarget = env.API_PROXY_TARGET || "http://localhost:8888";
  const shouldStripApiPrefix = env.API_PROXY_STRIP_PREFIX !== "false";

  return {
    plugins: [vue()],
    resolve: {
      // 目录别名
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@/": path.resolve(__dirname, "src") + "/"
      },
    },
    server: {
      proxy: {
        [apiBaseUrl]: {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: shouldStripApiPrefix
              ? (proxyPath) => proxyPath.replace(new RegExp(`^${apiBaseUrl}`), "")
              : undefined,
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(`[vite proxy] ${req.method} ${req.url} -> ${apiProxyTarget}${proxyReq.path}`);
            });
            proxy.on("error", (error, req) => {
              console.error(`[vite proxy] ${req.method} ${req.url} proxy failed: ${error.message}`);
            });
          },
        },
      },
    },
    build: {
      outDir: 'final_disposal_client',
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three"],
            echarts: ["echarts"],
            vendor: ["vue", "vue-router", "@vueuse/core", "axios", "d3-geo"]
          }
        }
      }
    }
  };
});
