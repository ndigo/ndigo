#!/usr/bin/env node
/**
 * Final script to apply JSDoc documentation from docs-by-category.json to category index files
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
 * Extract function names from imports
 */
function extractFunctionImports(lines, endIndex) {
    const functions = [];
    let inImport = false;
    let importText = '';

    for (let i = 0; i <= endIndex; i++) {
        const line = lines[i];
        if (line.includes('import {')) {
            inImport = true;
        }
        if (inImport) {
            importText += line + ' ';
        }
        if (line.includes('// Import custom functions for re-export')) {
            break;
        }
    }

    // Extract function names from the collected import text
    const match = importText.match(/import\s*{\s*([^}]+)\s*}\s*from\s*'/);
    if (match) {
        const funcList = match[1];
        // Split by comma and clean up
        funcList.split(',').forEach((func) => {
            const name = func.trim();
            if (name && !name.startsWith('//')) {
                functions.push(name);
            }
        });
    }

    return functions;
}

/**
 * Create documentation lookup map
 */
function createDocMap(categoryName) {
    const docs = docsData[categoryName];
    if (!docs) return new Map();

    const docMap = new Map();
    docs.forEach((item) => {
        // Clean up the doc string - remove leading 4 spaces from each line
        const docLines = item.doc.split('\n');
        const cleanedDoc = docLines
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
function updateCategoryFile(categoryName, filePath, docMap) {
    const fullPath = join(rootDir, filePath);
    let content = readFileSync(fullPath, 'utf-8');
    let lines = content.split('\n');

    // Find where imports end (marked by comment)
    const importBoundaryIndex = lines.findIndex((line) => line.includes('// Import custom functions for re-export'));
    if (importBoundaryIndex === -1) {
        console.log(`⚠️  No import boundary marker found in ${filePath}`);
        return { documented: 0, notFound: 0 };
    }

    // Extract function names from imports
    const functionImports = extractFunctionImports(lines, importBoundaryIndex);

    // Find where export statements start for Ramda functions
    let firstExportIndex = -1;
    for (let i = ramdaImportEndIndex + 1; i < lines.length; i++) {
        // Look for either a JSDoc comment or an export statement
        if (
            (lines[i].trim().startsWith('/**') || lines[i].trim().startsWith('export {')) &&
            !lines[i].includes('export default')
        ) {
            firstExportIndex = i;
            break;
        }
    }

    if (firstExportIndex === -1) {
        console.log(`⚠️  No exports found in ${filePath}`);
        return { documented: 0, notFound: 0 };
    }

    // Find where custom exports/default export start
    let customExportIndex = -1;
    for (let i = lines.length - 1; i >= firstExportIndex; i--) {
        if (lines[i].includes('export default {')) {
            customExportIndex = i;
            break;
        }
    }

    // Also look for custom function comments/exports before default export
    let customSectionStart = customExportIndex;
    if (customExportIndex > 0) {
        for (let i = customExportIndex - 1; i >= firstExportIndex; i--) {
            if (lines[i].includes('// Custom functions') || lines[i].includes('// Export custom functions')) {
                customSectionStart = i;
                break;
            }
        }
    }

    // Keep everything before the first export
    const prefix = lines.slice(0, firstExportIndex);

    // Keep custom exports and default export
    const suffix = customSectionStart !== -1 ? lines.slice(customSectionStart) : lines.slice(customExportIndex);

    // Build new exports
    const newExports = [];
    let documented = 0;
    let notFound = 0;

    functionImports.forEach((funcName) => {
        const doc = docMap.get(funcName);
        if (doc) {
            newExports.push(doc);
            newExports.push(`export { ${funcName} };`);
            newExports.push('');
            documented++;
        } else {
            console.log(`  ⚠️  No doc for: ${funcName} in ${categoryName}`);
            notFound++;
        }
    });

    // Combine everything
    const newContent = [...prefix, '', ...newExports, ...suffix].join('\n');

    writeFileSync(fullPath, newContent, 'utf-8');
    return { documented, notFound };
}

// Process each category
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

console.log('📝 Applying JSDoc documentation to category files...\n');

Object.entries(categories).forEach(([category, filePath]) => {
    const docMap = createDocMap(category);
    console.log(`Processing ${category} (${docMap.size} docs available)...`);

    const result = updateCategoryFile(category, filePath, docMap);
    console.log(`  ✅ Documented ${result.documented} functions`);
    if (result.notFound > 0) {
        console.log(`  ⚠️  ${result.notFound} functions not documented`);
    }
});

console.log('\n✨ Done!');
