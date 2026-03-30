const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DEST = path.resolve(__dirname, "..", "data");

const DIRS_TO_COPY = ["Tasks", "Inbox", "OKRs", "Journal"];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Clean and recreate
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true });
}
fs.mkdirSync(DEST, { recursive: true });

for (const dir of DIRS_TO_COPY) {
  const src = path.join(ROOT, dir);
  const dest = path.join(DEST, dir);
  if (fs.existsSync(src)) {
    copyRecursive(src, dest);
    console.log(`Copied ${dir}/`);
  } else {
    console.log(`Skipped ${dir}/ (not found)`);
  }
}

console.log("Data copy complete.");
