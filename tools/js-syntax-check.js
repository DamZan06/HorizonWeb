const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function collectJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

const jsFiles = collectJsFiles(path.join(root, 'js')).concat(collectJsFiles(path.join(root, 'tools')));
let failed = false;

for (const file of jsFiles) {
  const source = fs.readFileSync(file, 'utf8');
  try {
    new Function(source);
  } catch (error) {
    console.error(`Syntax error in ${path.relative(root, file)}: ${error.message}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Validated ${jsFiles.length} JavaScript files without syntax errors.`);
