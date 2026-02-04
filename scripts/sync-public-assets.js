const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const packagesRoot = path.join(root, "packages", "public-assets");
const appsDir = path.join(root, "apps");

const shareMap = [
  { source: "assets", target: "" },
  { source: "fonts", target: "fonts" },
  { source: "logos", target: "logos" }
];

if (!fs.existsSync(packagesRoot)) {
  console.warn("Shared assets package missing. Skipping sync.");
  process.exit(0);
}

const apps = fs
  .readdirSync(appsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function copyBucket(appName, sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return false;
  }
  

  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(targetDir, { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  return true;
}

apps.forEach((appName) => {
  shareMap.forEach(({ source, target }) => {
    const sourceDir = path.join(packagesRoot, source);
    const targetDir = path.join(appsDir, appName, "public", "shared", target);
    if (copyBucket(appName, sourceDir, targetDir)) {
      console.log(
        `✓ ${source} synced to ${path.relative(root, targetDir || path.join(appsDir, appName, "public", "shared"))}`
      );
    }
  });
});

// Manual sync for accessx
const accessxDir = path.join(appsDir, "livelink", "accessx");
if (fs.existsSync(accessxDir)) {
  console.log("\n➜ Syncing assets for accessx");
  shareMap.forEach(({ source, target }) => {
    const sourceDir = path.join(packagesRoot, source);
    const targetDir = path.join(accessxDir, "public", "shared", target);
    if (copyBucket("accessx", sourceDir, targetDir)) {
      console.log(
        `✓ ${source} synced to ${path.relative(root, targetDir || path.join(accessxDir, "public", "shared"))}`
      );
    }
  });
}
