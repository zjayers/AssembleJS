import path from "path";
import { build } from "vite";
import glob from "glob";
import preact from "@preact/preset-vite";
import { CONSTANTS } from "../../constants/blueprint.constants";

export const startScriptIslandWatcher = async (serverRoot: string) => {
  const scriptIslands = glob
    .sync(`./src/**/*.ts`, {
      cwd: serverRoot,
      ignore: ["./src/server.ts", "./src/**/*.controller.ts"],
    })
    .map((file) => path.join(serverRoot, file))
    .map((fileName) => ({
      fileName,
      baseName: path.basename(fileName),
      outputPath: path.normalize(
        path
          .relative(serverRoot, fileName)
          .replaceAll(/src/g, "./")
          .replaceAll(".ts", ".js")
      ),
    }));

  const buildPromises = [];
  for (const island of scriptIslands) {
    buildPromises.push(
      build({
        mode: "development",
        configFile: false,
        envDir: serverRoot,
        envPrefix: CONSTANTS.env.prefix.key,
        plugins: [
          preact({
            babel: {
              plugins: [
                [
                  "@babel/plugin-transform-react-jsx",
                  { runtime: "automatic", importSource: "preact" },
                ],
              ],
            },
          }),
        ], // We manually add a list of dependencies to be pre-bundled, in order to avoid a page reload at dev start which breaks vite-plugin-ssr's CI
        optimizeDeps: {
          include: [
            "preact/devtools",
            "preact/debug",
            "preact/jsx-runtime",
            "preact",
            "preact/hooks",
          ],
        },
        build: {
          sourcemap: true,
          emptyOutDir: false,
          ssr: true,
          watch: {
            include: ["./src/**/*.ts", "./src/**/*.tsx"],
            buildDelay: 100,
          },
          lib: {
            entry: island.fileName,
            name: island.baseName,
            formats: ["iife"],
            fileName: island.baseName,
          },
          rollupOptions: {
            external: ["assemblejs", "preact"],
            output: {
              globals: {
                asmbl: "AssembleJS",
                preact: "AssembleJS.preact",
                "preact/devtools": "AssembleJS.preact.devtools",
                "preact/hooks": "AssembleJS.preact.hooks",
                "preact/jsx-runtime": "AssembleJS.preact.runtime",
                "preact/debug": "AssembleJS.preact.debug",
              },
              entryFileNames: island.outputPath,
            },
          },
        },
      })
    );
  }

  await Promise.allSettled(buildPromises);
};
