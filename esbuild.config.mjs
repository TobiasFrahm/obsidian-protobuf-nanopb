import * as esbuild from "esbuild";

const options = {
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "cjs",
  platform: "browser",
  target: "es2020",
  outfile: "main.js",
  external: ["obsidian", "@codemirror/state", "@codemirror/view"],
  logLevel: "info",
  banner: { js: "/* Protobuf & Nanopb Highlighting | MIT License */" }
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context({ ...options, sourcemap: "inline" });
  await context.watch();
} else {
  await esbuild.build({ ...options, minify: true });
}
