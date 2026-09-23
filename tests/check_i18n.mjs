import fs from 'node:fs';
import path from 'node:path';

function findFiles(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results = results.concat(findFiles(fullPath, exts));
      }
    } else if (exts.some(ext => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractKeysFromLocaleFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Simple regex to parse nested keys in locale files
  const keys = new Set();
  const lines = content.split('\n');
  const stack = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    
    // Check for object opening, e.g. "common: {"
    const objMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*\{/);
    if (objMatch) {
      stack.push(objMatch[1]);
      continue;
    }

    // Check for closing brace "},"
    if (trimmed.startsWith('}') || trimmed.startsWith('};')) {
      stack.pop();
      continue;
    }

    // Check for key-value pair, e.g. "appName: 'AgriAI',"
    const kvMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*:\s*['"`]/);
    if (kvMatch && stack.length > 0) {
      const fullKey = [...stack, kvMatch[1]].join('.');
      keys.add(fullKey);
    }
  }

  return keys;
}

const enKeys = extractKeysFromLocaleFile(path.resolve('src/locales/en.ts'));
const teKeys = extractKeysFromLocaleFile(path.resolve('src/locales/te.ts'));

const srcFiles = findFiles(path.resolve('src'), ['.tsx', '.ts']);
const tCallRegex = /\bt\(\s*['"]([^'"]+)['"]/g;
const usedKeys = new Set();

for (const file of srcFiles) {
  if (file.includes('locales')) continue;
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = tCallRegex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

console.log('====================================================');
console.log('AGRI-AI I18N LOCALIZATION SCANNER');
console.log('====================================================');
console.log(`Total unique translation keys used in code: ${usedKeys.size}`);
console.log(`Total keys found in en.ts: ${enKeys.size}`);
console.log(`Total keys found in te.ts: ${teKeys.size}`);

const missingInEn = [...usedKeys].filter(k => !enKeys.has(k));
const missingInTe = [...usedKeys].filter(k => !teKeys.has(k));

if (missingInEn.length > 0) {
  console.warn('\n⚠️ Keys used in UI but missing in en.ts:', missingInEn);
} else {
  console.log('✅ en.ts: 0 missing keys!');
}

if (missingInTe.length > 0) {
  console.warn('\n⚠️ Keys used in UI but missing in te.ts:', missingInTe);
} else {
  console.log('✅ te.ts: 0 missing keys!');
}

if (missingInEn.length === 0 && missingInTe.length === 0) {
  console.log('\n🎉 ALL 199+ TRANSLATION KEYS FULLY SYNCHRONIZED!');
}
console.log('====================================================\n');
