#!/usr/bin/env node
/**
 * Apply full JSDoc documentation from docs-by-category.json to category index files
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load the documentation
const docsData = JSON.parse(readFileSync(join(__dirname, 'docs-by-category.json'), 'utf-8'));

/**
  * Extract function names from imports (handles both single-line and multi-line)
  */
function extractFunctionImports(lines, endIndex) {
    let importText = '';
    for (let i = 0; i <= endIndex; i++) {
        importText += lines[i] + ' ';
    }

    const match = importText.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'/);
    if (!match) return [];

    return match[1]
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f && !f.startsWith('//'));
}

/**
 * Create documentation lookup map
 */
function createDocMap(categoryName) {
    const docs = docsData[categoryName] || [];
    const docMap = new Map();

    docs.forEach((item) => {
        const cleanedDoc = item.doc
            .split('\n')
            .map((line) => (line.startsWith('    ') ? line.slice(4) : line))
            .join('\n')
            .trim();
        docMap.set(item.name, cleanedDoc);
    });

    return docMap;
}

/**
 * Update a category file
 */
function updateCategoryFile(categoryName, filePath) {
    const fullPath = join(rootDir, filePath);
    const content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Find where imports end (marked by comment)
    const importBoundaryIndex = lines.findIndex((line) => line.includes('// Import custom functions for re-export'));
    if (importBoundaryIndex === -1) {
        console.log(`⚠️  No import boundary marker in ${filePath}`);
        return { documented: 0, notFound: 0 };
    }

    // Extract function names from imports
    const functionImports = extractFunctionImports(lines, importBoundaryIndex);
    const docMap = createDocMap(categoryName);

    // Find where custom imports end (if any)
    let customImportsEnd = importBoundaryIndex;
    for (let i = importBoundaryIndex + 1; i < lines.length; i++) {
        if (lines[i].includes('import') && lines[i].includes('.js')) {
            customImportsEnd = i;
        } else if (lines[i].trim() && !lines[i].startsWith('//') && !lines[i].trim().startsWith('import')) {
            break;
        }
    }

    // Find where default export starts
    const defaultExportIndex = lines.findIndex((line) => line.includes('export default {'));
    if (defaultExportIndex === -1) {
        console.log(`⚠️  No default export in ${filePath}`);
        return { documented: 0, notFound: 0 };
    }

    // Find custom function exports section (between last import and default export)
    let customExportStart = -1;
    let customExportEnd = -1;
    for (let i = customImportsEnd + 1; i < defaultExportIndex; i++) {
        if (lines[i].includes('// Export custom') || lines[i].includes('// Custom functions')) {
            customExportStart = i;
            // Find the end of this export statement
            for (let j = i + 1; j < defaultExportIndex; j++) {
                if (lines[j].includes('};') && !lines[j].includes('export default')) {
                    customExportEnd = j;
                    break;
                }
                if (lines[j].trim() === '' && lines[j + 1]?.includes('export default')) {
                    customExportEnd = j - 1;
                    break;
                }
            }
            break;
        }
    }

    // Build new file content
    const newLines = [];

    // 1. Keep everything up to and including custom imports
    newLines.push(...lines.slice(0, customImportsEnd + 1));
    newLines.push('');

    // 2. Add documented function exports
    let documented = 0;
    let notFound = 0;

    functionImports.forEach((funcName) => {
        const doc = docMap.get(funcName);
        if (doc) {
            newLines.push(doc);
            newLines.push(`export { ${funcName} };`);
            newLines.push('');
            documented++;
        } else {
            console.log(`  ⚠️  No doc for: ${funcName}`);
            notFound++;
        }
    });

    // 3. Add custom function exports (if they exist)
    if (customExportStart !== -1 && customExportEnd !== -1) {
        newLines.push(...lines.slice(customExportStart, customExportEnd + 1));
        newLines.push('');
    }

    // 4. Add default export
    newLines.push(...lines.slice(defaultExportIndex));

    // Write back
    writeFileSync(fullPath, newLines.join('\n'), 'utf-8');
    return { documented, notFound };
}

// Process all categories
const categories = {
    function: 'src/function/index.ts',
    list: 'src/list/index.ts',
    logic: 'src/logic/index.ts',
    math: 'src/math/index.ts',
    object: 'src/object/index.ts',
    relation: 'src/relation/index.ts',
    string: 'src/string/index.ts',
    types: 'src/type/index.ts',
};

console.log('📝 Applying full JSDoc documentation to category files...\n');

let totalDocumented = 0;
let totalNotFound = 0;

Object.entries(categories).forEach(([category, filePath]) => {
    const docMap = createDocMap(category);
    console.log(`Processing ${category} (${docMap.size} docs available)...`);

    const result = updateCategoryFile(category, filePath);
    console.log(`  ✅ Documented ${result.documented} functions`);
    if (result.notFound > 0) {
        console.log(`  ⚠️  ${result.notFound} functions not documented`);
    }

    totalDocumented += result.documented;
    totalNotFound += result.notFound;
});

console.log('\n✨ Done!');
console.log(`\n📊 Summary:`);
console.log(`   Total documented: ${totalDocumented} functions`);
console.log(`   Not found in docs: ${totalNotFound} functions`);
