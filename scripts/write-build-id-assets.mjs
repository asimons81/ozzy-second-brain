import fs from "fs";
import path from "path";

const root = process.cwd();
const nextBuildIdPath = path.join(root, ".next", "BUILD_ID");
const publicDir = path.join(root, "public");
const publicBuildIdPath = path.join(publicDir, "BUILD_ID");

function safeRead(p) {
  try {
    return fs.readFileSync(p, "utf8").trim();
  } catch {
    return null;
  }
}

const buildId = safeRead(nextBuildIdPath);

if (!buildId) {
  console.error(`[build-id] Missing .next/BUILD_ID at: ${nextBuildIdPath}`);
  process.exit(1);
}

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(publicBuildIdPath, buildId + "\n", "utf8");

console.log(`[build-id] Wrote public/BUILD_ID = ${buildId}`);
