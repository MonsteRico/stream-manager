// app.config.ts
import { defineConfig } from "@tanstack/start/config";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      TanStackRouterVite({ routesDirectory: "./app/routes", enableRouteGeneration: true, route }),
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ["./tsconfig.json"]
      })
    ]
  }
});
export {
  app_config_default as default
};
