// node scripts/stills.mjs outPrefix frame,frame,... [scale]
import fs from "node:fs"; import path from "node:path";
const tmp = "C:/Users/mithi/AppData/Local/Temp/remotion-tmp"; fs.mkdirSync(tmp, { recursive: true }); process.env.TEMP = process.env.TMP = tmp;
const { bundle } = await import("@remotion/bundler"); const { renderStill, selectComposition } = await import("@remotion/renderer");
const [prefix, frames, scale] = process.argv.slice(2);
const browserExecutable = "C:/Program Files/Google/Chrome/Application/chrome.exe", chromiumOptions = { gl: "angle" };
fs.mkdirSync(path.dirname(prefix), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "PhonicsSong", browserExecutable, chromiumOptions });
for (const f of frames.split(",").map(Number)) {
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${String(f).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale || 0.5), browserExecutable, chromiumOptions });
  console.log("still", f);
}
