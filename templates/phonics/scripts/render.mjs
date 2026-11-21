// node scripts/render.mjs out.mp4 [from-to]
import fs from "node:fs"; import path from "node:path";
const tmp = "C:/Users/mithi/AppData/Local/Temp/remotion-tmp"; fs.mkdirSync(tmp, { recursive: true }); process.env.TEMP = process.env.TMP = tmp;
const { bundle } = await import("@remotion/bundler"); const { renderMedia, selectComposition } = await import("@remotion/renderer");
const [out, range] = process.argv.slice(2);
const browserExecutable = "C:/Program Files/Google/Chrome/Application/chrome.exe", chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "PhonicsSong", browserExecutable, chromiumOptions });
let last = 0;
await renderMedia({ composition, serveUrl, codec: "h264", crf: 16, outputLocation: out, browserExecutable, chromiumOptions, concurrency: 3, timeoutInMilliseconds: 300000,
  frameRange: range ? range.split("-").map(Number) : undefined, muted: true,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 100); if (p >= last + 10) { last = p; console.log("progress", p + "%"); } } });
console.log("done", out);
