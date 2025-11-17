const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const apps = [
  { name: "Tag Series", dir: "apps/tag_series", outLabel: "tag_series" },
  { name: "LiveLink", dir: "apps/livelink", outLabel: "livelink" },
  { name: "Access Portal", dir: "apps/access_portal", outLabel: "access_portal" }
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
    run("npm", ["run", "build"], appDir, `Building ${app.name}`);
    run("npx", ["next", "export", "-o", "out"], appDir, `Exporting ${app.name}`);

    const sourceOut = path.join(appDir, "out");
    const targetOut = path.join(outRoot, app.outLabel);
    fs.rmSync(targetOut, { recursive: true, force: true });
    fs.mkdirSync(targetOut, { recursive: true });
    fs.cpSync(sourceOut, targetOut, { recursive: true });
    console.log(`✔ Copied ${app.name} export to ${path.relative(root, targetOut)}`);
  });

  console.log(`\nAll exports completed. Combined output lives in ${path.relative(root, outRoot)}`);
}

main();
