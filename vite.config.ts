import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Blocked request. This host ("30cdeac99311.ngrok-free.app") is not allowed.
// To allow this host, add "30cdeac99311.ngrok-free.app" to `server.allowedHosts` in vite.config.js.

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        // Allow all ngrok subdomains
        /^https?:\/\/([a-z0-9-]+\.)*ngrok(-free)?\.app$/i,
      ],
      credentials: true,
    },
    // Allow specific ngrok hosts and all ngrok subdomains
    allowedHosts: [
      "30cdeac99311.ngrok-free.app",
      ".ngrok-free.app",
      ".ngrok.app"
    ],
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));