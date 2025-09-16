import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to flatten nested JSON keys
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

test.describe('i18n Key Parity Verification', () => {
  let en: any, ar: any;

  test.beforeAll(() => {
    en = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/en.json'), 'utf-8'));
    ar = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/i18n/ar.json'), 'utf-8'));
  });

  test('ar.json should have all keys that en.json has', () => {
    const enKeys = flatKeys(en);
    const arKeys = new Set(flatKeys(ar));
    
    const missingInAr = enKeys.filter(k => !arKeys.has(k));
    
    expect(missingInAr, `Missing ${missingInAr.length} keys in ar.json: ${missingInAr.slice(0, 10).join(', ')}${missingInAr.length > 10 ? '...' : ''}`).toEqual([]);
  });

  test('en.json should have all keys that ar.json has', () => {
    const enKeys = new Set(flatKeys(en));
    const arKeys = flatKeys(ar);
    
    const missingInEn = arKeys.filter(k => !enKeys.has(k));
    
    expect(missingInEn, `Missing ${missingInEn.length} keys in en.json: ${missingInEn.slice(0, 10).join(', ')}${missingInEn.length > 10 ? '...' : ''}`).toEqual([]);
  });

  test('critical header keys should exist in both files', () => {
    const criticalKeys = ['header.brand', 'header.features', 'header.pricing'];
    
    criticalKeys.forEach(key => {
      const enVal = key.split('.').reduce((o, p) => o?.[p], en);
      const arVal = key.split('.').reduce((o, p) => o?.[p], ar);
      
      expect(enVal, `Missing key "${key}" in en.json`).toBeDefined();
      expect(arVal, `Missing key "${key}" in ar.json`).toBeDefined();
    });
  });

  test('placeholder parity between en.json and ar.json', () => {
    const enKeys = flatKeys(en);
    let mismatches: string[] = [];

    enKeys.forEach(key => {
      const enVal = key.split('.').reduce((o, p) => o?.[p], en);
      const arVal = key.split('.').reduce((o, p) => o?.[p], ar);

      if (typeof enVal === 'string' && typeof arVal === 'string') {
        const enPlaceholders = getPlaceholders(enVal);
        const arPlaceholders = getPlaceholders(arVal);

        const areEqual = enPlaceholders.size === arPlaceholders.size && 
                         [...enPlaceholders].every(p => arPlaceholders.has(p));

        if (!areEqual) {
          mismatches.push(`${key}: EN[${[...enPlaceholders].join(', ')}] vs AR[${[...arPlaceholders].join(', ')}]`);
        }
      }
    });

    expect(mismatches, `Found ${mismatches.length} placeholder mismatches:\n${mismatches.slice(0, 5).join('\n')}${mismatches.length > 5 ? '\n...' : ''}`).toEqual([]);
  });
});