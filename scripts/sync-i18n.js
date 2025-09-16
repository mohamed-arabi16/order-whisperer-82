import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enPath = path.join(__dirname, '../src/i18n/en.json');
const arPath = path.join(__dirname, '../src/i18n/ar.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

let missingKeysCount = 0;

/**
 * Recursively synchronizes the Arabic object with the English object.
 * It only adds missing keys from the English object to the Arabic one.
 * It does NOT remove or modify existing keys.
 * @param {object} enObj - The English source object.
 * @param {object} arObj - The Arabic target object to synchronize.
 * @param {string} [prefix=''] - The current key prefix for logging.
 */
function syncObjects(enObj, arObj, prefix = '') {
  for (const key in enObj) {
    if (Object.prototype.hasOwnProperty.call(enObj, key)) {
      const enValue = enObj[key];
      const currentKey = prefix ? `${prefix}.${key}` : key;

      if (typeof enValue === 'object' && enValue !== null && !Array.isArray(enValue)) {
        if (!arObj[key] || typeof arObj[key] !== 'object') {
          arObj[key] = {}; // Create the nested object if it doesn't exist
        }
        syncObjects(enValue, arObj[key], currentKey);
      } else if (!Object.prototype.hasOwnProperty.call(arObj, key)) {
        arObj[key] = enValue; // Add missing keys with English text as placeholder
        missingKeysCount++;
        console.log(`Added missing key: ${currentKey}`);
      }
    }
  }
}

console.log('Starting non-destructive synchronization of ar.json with en.json...');
syncObjects(en, ar);

if (missingKeysCount > 0) {
  // Write the updated Arabic JSON back to the file with pretty printing.
  fs.writeFileSync(arPath, JSON.stringify(ar, null, 2) + '\n');
  console.log(`\nSuccessfully added ${missingKeysCount} missing keys to ar.json.`);
} else {
  console.log('\nNo missing keys found. ar.json is already in sync.');
}
