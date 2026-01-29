#!/usr/bin/env node

/**
 * Script to generate category index files with full JSDoc documentation from index.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Load the function-to-category mapping
const mapping = JSON.parse(fs.readFileSync(path.join(__dirname, 'function-category-map.json'), 'utf8'));

// Read the current index.ts
const indexContent = fs.readFileSync(path.join(rootDir, 'src', 'index.ts'), 'utf8');

// Parse export blocks with documentation
// Pattern: export { /** doc */ functionName, } from 'source';
const lines = indexContent.split('\n');
const exports = [];

let currentDoc = '';
let currentFunction = '';
let currentSource = '';
let inDoc = false;
let inExport = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for start of export block
    if (line.trim().startsWith('export {')) {
        inExport = true;
        currentDoc = '';
        currentFunction = '';
        currentSource = '';
        continue;
    }

    if (inExport) {
        // Check for JSDoc start
        if (line.includes('/**')) {
            inDoc = true;
            currentDoc = line;
            continue;
        }

        // Accumulate JSDoc content
        if (inDoc) {
            currentDoc += '\n' + line;
            if (line.includes('*/')) {
                inDoc = false;
            }
            continue;
        }

        // Check for function name (after doc, before closing})
        const funcMatch = line.trim().match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,?\s*$/);
        if (funcMatch && !inDoc && currentDoc) {
            currentFunction = funcMatch[1];
        }

        // Check for source
        const sourceMatch = line.match(/}\s*from\s*['"]([^'"]+)['"]/);
        if (sourceMatch) {
            currentSource = sourceMatch[1];
            inExport = false;

            if (currentFunction && currentDoc) {
                exports.push({
                    name: currentFunction,
                    doc: currentDoc,
                    source: currentSource,
                });
            }
        }
    }
}

console.log(`Extracted ${exports.length} function documentation blocks`);

// Group by category
const byCategory = {
    function: [],
    list: [],
    logic: [],
    math: [],
    object: [],
    relation: [],
    string: [],
    types: [],
};

exports.forEach((exp) => {
    const categories = mapping[exp.name];
    if (!categories) {
        return;
    }

    const catArray = Array.isArray(categories) ? categories : [categories];
    catArray.forEach((cat) => {
        if (byCategory[cat]) {
            byCategory[cat].push(exp);
        }
    });
});

// Load custom function documentation from existing category files
const customDocs = {
    string: [
        'decodeURIComponent',
        'encodeURIComponent',
        'decodeHtml',
        'encodeHtml',
        'interpolate',
        'slugify',
        'toCamel',
        'toPascal',
        'toProper',
        'toSentence',
        'trailingSplit',
    ],
    math: ['guid', 'rand', 'randHex', 'randInt', 'random'],
    list: ['fromRepeatedPairs', 'rangeN', 'regExpRange', 'sample', 'shuffle', 'trailingJoin'],
    types: [
        'isConstructor',
        'isFunction',
        'isNumber',
        'isNumeric',
        'isString',
        'isValidDate',
        'like',
        'likeArray',
        'likePromise',
    ],
};

console.log('\nFunctions per category (Ramda only):');
Object.entries(byCategory).forEach(([cat, funcs]) => {
    console.log(
        `  ${cat}: ${funcs.length} Ramda + ${customDocs[cat]?.length || 0} custom = ${funcs.length + (customDocs[cat]?.length || 0)} total`
    );
});

// Save for next phase
fs.writeFileSync(path.join(__dirname, 'docs-by-category.json'), JSON.stringify(byCategory, null, 2));

console.log('\nDocumentation grouped by category saved to scripts/docs-by-category.json');
