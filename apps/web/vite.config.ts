import { transformSync } from "@babel/core";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// From vite-plugin-relay
const relayPlugin = {
  name: "vite:relay",
  config: () => ({
    define: {
      global: "globalThis",
    },
  }),
  transform(src, id) {
    let code = src;
    if (/.(t|j)sx?/.test(id) && src.includes("graphql`")) {
      const out = transformSync(src, {
        plugins: [
          [
            require.resolve("babel-plugin-relay"),
            {
              eagerESModules: true,
            },
          ],
        ],
        code: true,
      });

      if (!out?.code) throw new Error("relay plugin failed to build file");
      code = out.code;
    }

    return {
      code,
      map: null,
    };
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), relayPlugin],
});
