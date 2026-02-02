const { cpSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');

const templatesSrc = join(__dirname, '..', 'src', 'templates');
const templatesDest = join(__dirname, '..', 'dist', 'templates');

if (!existsSync(templatesSrc)) {
  console.warn(`[post-office] templates directory not found at ${templatesSrc}`);
  process.exit(0);
}

mkdirSync(templatesDest, { recursive: true });
cpSync(templatesSrc, templatesDest, { recursive: true });
console.log(`[post-office] copied templates to ${templatesDest}`);
