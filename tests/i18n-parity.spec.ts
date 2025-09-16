import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const en = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/en.json'), 'utf-8'));
const ar = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/ar.json'), 'utf-8'));

// Helper function to flatten the JSON object keys
function flatKeys(obj: any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object'
      ? flatKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  );
}

// Helper function to extract placeholders like {name} or {{name}}
function getPlaceholders(s: string): Set<string> {
  return new Set((s.match(/{\s*[\w.]+\s*}/g) || []).map(x => x.trim()));
}

test.describe('i18n Key and Placeholder Parity', () => {
  test('ar.json should have all the keys that en.json has', () => {
    const enKeys = flatKeys(en);
    const arKeys = new Set(flatKeys(ar));

    const missingInAr = enKeys.filter(k => !arKeys.has(k));

    expect(missingInAr, `Missing ${missingInAr.length} keys in ar.json: ${missingInAr.join(', ')}`).toEqual([]);
  });

  test('ar.json should have the same placeholders as en.json for corresponding keys', () => {
    const enKeys = flatKeys(en);
    let mismatches: string[] = [];

    enKeys.forEach(key => {
      const enVal = key.split('.').reduce((o, p) => o?.[p], en);
      const arVal = key.split('.').reduce((o, p) => o?.[p], ar);

      if (typeof enVal === 'string' && typeof arVal === 'string') {
        const enPlaceholders = getPlaceholders(enVal);
        const arPlaceholders = getPlaceholders(arVal);

        const areEqual = enPlaceholders.size === arPlaceholders.size && [...enPlaceholders].every(p => arPlaceholders.has(p));

        if (!areEqual) {
          mismatches.push(`Key: ${key}, EN: "${[...enPlaceholders].join(', ')}", AR: "${[...arPlaceholders].join(', ')}"`);
        }
      }
    });

    expect(mismatches, `Found ${mismatches.length} placeholder mismatches:\n${mismatches.join('\n')}`).toEqual([]);
  });
});
