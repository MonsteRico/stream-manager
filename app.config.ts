// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    vite: {
        plugins: [
            TanStackRouterVite({ routesDirectory: "./app/routes", enableRouteGeneration: true, generatedRouteTree: "./app/routeTree.gen.ts" }),
            // this is the plugin that enables path aliases
            viteTsConfigPaths({
                projects: ["./tsconfig.json"],
            }),
        ],
    },
    server: {
      preset:"vercel"
    }
});
