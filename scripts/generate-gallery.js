const fs = require('fs');
const path = require('path');

// Scans assets/media for image files (including subfolders) and writes assets/media/index.json
// Output is an object mapping folder keys (relative path inside assets/media, '' for root)
// to arrays of root-relative URLs.
const root = path.join(__dirname, '..');
const mediaDir = path.join(root, 'assets', 'media');
const outFile = path.join(mediaDir, 'index.json');

function generate(){
  if(!fs.existsSync(mediaDir)){
    console.error('media directory missing:', mediaDir);
    process.exit(1);
  }

  const exts = ['.jpg','.jpeg','.png','.gif','.webp','.avif'];

  const map = {}; // key: relative dir from mediaDir ('' for root) -> array of urls

  function walk(dir){
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const relDir = path.relative(mediaDir, dir).replace(/\\/g, '/');
    const key = relDir === '' ? '' : relDir;
    entries.forEach(ent =>{
      const full = path.join(dir, ent.name);
      if(ent.isDirectory()){
        walk(full);
      }else if(ent.isFile()){
        const ext = path.extname(ent.name).toLowerCase();
        if(exts.includes(ext)){
          map[key] = map[key] || [];
          const relPath = path.posix.join('/assets/media', relDir === '' ? ent.name : relDir + '/' + ent.name);
          map[key].push(relPath);
        }
      }
    });
  }

  walk(mediaDir);

  // Sort arrays for consistency
  Object.keys(map).forEach(k => map[k].sort());

  fs.writeFileSync(outFile, JSON.stringify(map, null, 2), 'utf8');
  console.log('Wrote', outFile);
}

// Allow importing the generator in tests without executing on require.
if (require && require.main === module) {
  generate();
}

module.exports = { generate };
