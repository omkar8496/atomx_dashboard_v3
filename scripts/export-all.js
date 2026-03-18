const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const apps = [
  { name: "Tag Series", dir: "apps/tag_series", outLabel: "tag_series" },
  { name: "LiveLink", dir: "apps/livelink", outLabel: "livelink" },
  { name: "Access Portal", dir: "apps/access_portal", outLabel: "access_portal" },
  { name: "Dashboard", dir: "apps/dashboard", outLabel: "dashboard" },
  { name: "AccessX", dir: "apps/livelink/accessx", outLabel: "livelink/accessx" }
];

function run(command, args, cwd, label) {
  console.log(`\n➜ ${label}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function main() {
  const root = process.cwd();
  const outRoot = path.join(root, "out");
  fs.rmSync(outRoot, { recursive: true, force: true });
  fs.mkdirSync(outRoot, { recursive: true });

  apps.forEach((app) => {
    const appDir = path.join(root, app.dir);
    if (!fs.existsSync(appDir)) {
      console.warn(`⚠ Skipping ${app.name} — missing directory ${app.dir}`);
      return;
    }

    const pkg = path.join(appDir, "package.json");
    if (!fs.existsSync(pkg)) {
      console.warn(`⚠ Skipping ${app.name} — missing package.json in ${app.dir}`);
      return;
    }

    // Ensure stale out folders don't interfere with fresh exports.
    fs.rmSync(path.join(appDir, "out"), { recursive: true, force: true });

    // Force webpack build to avoid Turbopack port-binding panic in this environment.
    run("npx", ["next", "build", "--webpack"], appDir, `Building ${app.name}`);

    let sourceOut = path.join(appDir, "out");
    const nestedOut = path.join(sourceOut, app.outLabel);
    if (fs.existsSync(nestedOut)) {
      sourceOut = nestedOut;
    }
    const targetOut = path.join(outRoot, app.outLabel);
    fs.rmSync(targetOut, { recursive: true, force: true });
    fs.mkdirSync(targetOut, { recursive: true });
    fs.cpSync(sourceOut, targetOut, { recursive: true });
    console.log(`✔ Copied ${app.name} export to ${path.relative(root, targetOut)}`);
  });

  const portalOut = path.join(outRoot, "access_portal");
  if (fs.existsSync(portalOut)) {
    console.log("\n➜ Syncing access portal export to root /out for S3 index");
    for (const entry of fs.readdirSync(portalOut)) {
      const from = path.join(portalOut, entry);
      const to = path.join(outRoot, entry);
      fs.rmSync(to, { recursive: true, force: true });
      fs.cpSync(from, to, { recursive: true });
    }
    console.log("✔ Root /out now serves the access portal build (index.html, assets, etc.)");
  }

  const dashboardOut = path.join(outRoot, "dashboard");
  if (fs.existsSync(dashboardOut)) {
    console.log("\n➜ Overlaying dashboard routes at root /out (for /admin and /Config)");
    for (const entry of fs.readdirSync(dashboardOut)) {
      // Keep access portal shell at root while exposing dashboard routes at root.
      if (entry === "index.html" || entry === "404.html") continue;
      const from = path.join(dashboardOut, entry);
      const to = path.join(outRoot, entry);
      if (entry === "_next" && fs.existsSync(to)) {
        // Merge chunk trees so assets from both apps are available.
        fs.cpSync(from, to, { recursive: true, force: true });
        continue;
      }
      fs.rmSync(to, { recursive: true, force: true });
      fs.cpSync(from, to, { recursive: true, force: true });
    }
    console.log("✔ Root /out now includes dashboard routes (/admin, /Config, etc.)");
  }

  console.log(`\nAll exports completed. Combined output lives in ${path.relative(root, outRoot)}`);
}

main();
