const fs = require('fs');
const path = require('path');

const gamesRoot = path.resolve(__dirname, '..', 'assets', 'games', 'games');
const outFile = path.resolve(__dirname, '..', 'assets', 'games', 'games.js');

function humanize(name) {
  // Replace common separators and capitalize words
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function findIcon(folder) {
  // look for common filenames or any image in folder or one-level deep
  const exts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  const preferred = ['logo', 'icon', 'splash', 'cover', 'thumbnail', 'thumb'];
  // check files in folder root
  const files = fs.readdirSync(folder, { withFileTypes: true });
  const fileNames = files.filter(f => f.isFile()).map(f => f.name.toLowerCase());
  for (const p of preferred) {
    for (const ext of exts) {
      const candidate = p + ext;
      const idx = fileNames.indexOf(candidate);
      if (idx !== -1) return path.posix.join('assets', 'games', 'games', path.basename(folder), files.filter(f=>f.isFile())[idx].name).replace(/\\/g, '/');
    }
  }
  // fallback: any image file in root
  for (const f of files) {
    if (f.isFile()) {
      const ext = path.extname(f.name).toLowerCase();
      if (ext && exts.includes(ext)) {
        return path.posix.join('assets', 'games', 'games', path.basename(folder), f.name).replace(/\\/g, '/');
      }
    }
  }
  // check one level deep
  for (const f of files) {
    if (f.isDirectory()) {
      try {
        const subFiles = fs.readdirSync(path.join(folder, f.name), { withFileTypes: true });
        for (const sf of subFiles) {
          if (sf.isFile() && exts.includes(path.extname(sf.name).toLowerCase())) {
            return path.posix.join('assets', 'games', 'games', path.basename(folder), f.name, sf.name).replace(/\\/g, '/');
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }
  return null;
}

if (!fs.existsSync(gamesRoot)) {
  console.error('Games folder not found at', gamesRoot);
  process.exit(1);
}

const entries = fs.readdirSync(gamesRoot, { withFileTypes: true }).filter(d => d.isDirectory());
const result = [];

function findEntry(folder) {
  const candidates = [
    'page.html', 'index.html', 'index.htm', 'play.html', 'game.html', 'page.htm',
    path.posix.join('html5game','index.html'),
    path.posix.join('Build','index.html'),
    path.posix.join('webapp','index.html')
  ];
  const files = fs.readdirSync(folder, { withFileTypes: true });
  const fileNames = files.filter(f => f.isFile()).map(f => f.name.toLowerCase());
  for (const c of candidates) {
    const parts = c.split('/');
    if (parts.length === 1) {
      const idx = fileNames.indexOf(c);
      if (idx !== -1) return path.posix.join('assets','games','games', path.basename(folder), files.filter(f=>f.isFile())[idx].name).replace(/\\/g, '/');
    } else {
      // check directory + file
      const dirName = parts[0];
      const fileName = parts[1];
      const dir = files.find(f => f.isDirectory() && f.name.toLowerCase() === dirName.toLowerCase());
      if (dir) {
        const subFiles = fs.readdirSync(path.join(folder, dir.name), { withFileTypes: true });
        const sub = subFiles.find(sf => sf.isFile() && sf.name.toLowerCase() === fileName.toLowerCase());
        if (sub) return path.posix.join('assets','games','games', path.basename(folder), dir.name, sub.name).replace(/\\/g, '/');
      }
    }
  }
  // last resort: look for index-like file anywhere
  for (const f of files) {
    if (f.isFile()) {
      const n = f.name.toLowerCase();
      if (n === 'index.html' || n === 'page.html' || n === 'index.htm') {
        return path.posix.join('assets','games','games', path.basename(folder), f.name).replace(/\\/g, '/');
      }
    }
  }
  return null;
}

for (const d of entries) {
  const folderPath = path.join(gamesRoot, d.name);
  const name = humanize(d.name);
  const icon = findIcon(folderPath);
  const entry = findEntry(folderPath);
  result.push({ name, folder: d.name, icon, entry });
}

fs.writeFileSync(outFile, JSON.stringify(result, null, 4), 'utf8');
console.log('Wrote', outFile, 'with', result.length, 'games');
