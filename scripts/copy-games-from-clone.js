const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve(__dirname, '..', 'assets', 'games', 'HTML-Games-V2');
const destRoot = path.resolve(__dirname, '..', 'assets', 'games', 'games');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const ent of entries) {
    const srcPath = path.join(src, ent.name);
    const destPath = path.join(dest, ent.name);
    if (ent.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      // copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(srcRoot)) {
  console.error('Source clone not found at', srcRoot);
  process.exit(1);
}

if (!fs.existsSync(destRoot)) {
  fs.mkdirSync(destRoot, { recursive: true });
}

const items = fs.readdirSync(srcRoot, { withFileTypes: true }).filter(d => d.isDirectory());
for (const d of items) {
  const srcDir = path.join(srcRoot, d.name);
  const destDir = path.join(destRoot, d.name);
  if (fs.existsSync(destDir)) {
    console.log('Skipping existing:', d.name);
    continue;
  }
  console.log('Copying:', d.name);
  copyDir(srcDir, destDir);
}

console.log('Done.');
