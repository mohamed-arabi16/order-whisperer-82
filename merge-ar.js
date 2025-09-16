// merge-ar.js
import fs from "fs";
import JSON5 from "json5";

const readLoose = (path) => {
  const raw = fs.readFileSync(path, "utf8")
    .replace(/\uFEFF/g, "")                 // strip BOM
    .replace(/[“”]/g, '"')                  // smart quotes → "
    .replace(/[‘’]/g, "'");                 // smart single quotes → '
  // JSON5 tolerates comments, trailing commas, single quotes, etc.
  return JSON5.parse(raw);
};

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

/**
 * Detect placeholders (ICU, sprintf-like) to protect them during merge
 * Examples: {name}, {0}, %s, %1$s
 */
const extractPlaceholders = (s) => {
  if (typeof s !== "string") return [];
  const icu = [...s.matchAll(/\{[a-zA-Z0-9_]+\}/g)].map(m => m[0]);
  const printf = [...s.matchAll(/%(\d+\$)?[sdif]/g)].map(m => m[0]);
  const numericBraces = [...s.matchAll(/\{\d+\}/g)].map(m => m[0]);
  return Array.from(new Set([...icu, ...printf, ...numericBraces]));
};

const samePlaceholders = (a, b) => {
  const A = extractPlaceholders(a).sort().join("|");
  const B = extractPlaceholders(b).sort().join("|");
  return A === B;
};

/**
 * Merge policy (for strings):
 * - If base missing → take incoming.
 * - If base empty/placeholder-only → take incoming.
 * - If both non-empty and differ:
 *    - If placeholders don’t match → keep base, mark conflict.
 *    - Else prefer the more "Arabic-looking" one if base is EN and incoming is AR.
 *    - Otherwise keep base and mark conflict (manual review).
 */
const looksArabic = (s) => /[\u0600-\u06FF]/.test(s);

const conflicts = [];   // {path, base, incoming, reason}
const additions  = [];  // {path, value}
const updates    = [];  // {path, from, to}

function merge(base, incoming, path = "") {
  if (isObject(base) && isObject(incoming)) {
    const out = {};
    const keys = Array.from(new Set([...Object.keys(base), ...Object.keys(incoming)])).sort();
    for (const k of keys) {
      const p = path ? `${path}.${k}` : k;
      if (k in base && k in incoming) {
        out[k] = merge(base[k], incoming[k], p);
      } else if (k in base) {
        out[k] = base[k];
      } else {
        out[k] = incoming[k];
        additions.push({ path: p, value: incoming[k] });
      }
    }
    return out;
  }

  // Arrays: prefer union for arrays of strings; else prefer base and mark conflict if different
  if (Array.isArray(base) && Array.isArray(incoming)) {
    const bothStrings = base.every(x => typeof x === "string") && incoming.every(x => typeof x === "string");
    if (bothStrings) {
      const set = new Set([...base, ...incoming]);
      const arr = Array.from(set);
      if (arr.length !== base.length) updates.push({ path, from: base, to: arr });
      return arr;
    } else {
      if (JSON.stringify(base) !== JSON.stringify(incoming)) {
        conflicts.push({ path, base, incoming, reason: "array-shape-diff" });
      }
      return base; // conservative
    }
  }

  // Primitive/string merging
  if (typeof base === "string" || typeof incoming === "string") {
    const b = (base ?? "").trim();
    const i = (incoming ?? "").trim();

    if (!b && i) {
      updates.push({ path, from: base, to: incoming });
      return incoming;
    }
    if (b && !i) return base;

    if (b === i) return base;

    if (!samePlaceholders(b, i)) {
      conflicts.push({ path, base, incoming, reason: "placeholder-mismatch" });
      return base; // preserve safe string
    }

    // Prefer Arabic if base is EN and incoming is AR
    if (!looksArabic(b) && looksArabic(i)) {
      updates.push({ path, from: base, to: incoming });
      return incoming;
    }

    // Otherwise keep base, flag for manual review
    conflicts.push({ path, base, incoming, reason: "string-diff" });
    return base;
  }

  // Different primitive types → keep base, flag
  if (JSON.stringify(base) !== JSON.stringify(incoming)) {
    conflicts.push({ path, base, incoming, reason: "type-mismatch" });
  }
  return base;
}

/** Stable, pretty JSON writer (2 spaces) */
const writeJSON = (path, data) => {
  const pretty = (obj) => {
    if (Array.isArray(obj)) return obj.map(pretty);
    if (isObject(obj)) {
      const out = {};
      for (const k of Object.keys(obj).sort()) out[k] = pretty(obj[k]);
      return out;
    }
    return obj;
  };
  fs.writeFileSync(path, JSON.stringify(pretty(data), null, 2) + "\n", "utf8");
};

const base = readLoose("ar.original.json");
const incoming = readLoose("ar.jules.json");

const merged = merge(base, incoming);

// Basic validation: ensure all placeholders preserved
// (already handled per-key, but we can do a last sweep if needed)

writeJSON("merged_ar.json", merged);

// Report
let report = "# Merge Report (ar)\n\n";
report += `- Additions: ${additions.length}\n- Updates: ${updates.length}\n- Conflicts: ${conflicts.length}\n\n`;

if (additions.length) {
  report += "## Additions\n";
  for (const a of additions) report += `- **${a.path}** ← ${JSON.stringify(a.value)}\n`;
  report += "\n";
}
if (updates.length) {
  report += "## Updates (auto-applied)\n";
  for (const u of updates) report += `- **${u.path}**: ${JSON.stringify(u.from)} → ${JSON.stringify(u.to)}\n`;
  report += "\n";
}
if (conflicts.length) {
  report += "## Conflicts (manual review needed)\n";
  for (const c of conflicts) {
    report += `- **${c.path}** [${c.reason}]\n  - base: ${JSON.stringify(c.base)}\n  - inc : ${JSON.stringify(c.incoming)}\n`;
  }
  report += "\n";
}
fs.writeFileSync("merge_report.md", report, "utf8");

console.log("Done → merged_ar.json + merge_report.md");
