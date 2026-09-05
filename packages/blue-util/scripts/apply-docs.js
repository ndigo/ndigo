#!/usr/bin/env node
/**
 * Script to apply JSDoc documentation from docs-by-category.json to category index files
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Map JSON category names to file paths
const categoryFileMap = {
    function: 'src/function/index.ts',
    list: 'src/list/index.ts',
    logic: 'src/logic/index.ts',
    math: 'src/math/index.ts',
    object: 'src/object/index.ts',
    relation: 'src/relation/index.ts',
    string: 'src/string/index.ts',
    types: 'src/type/index.ts', // Note: "types" in JSON maps to "type" folder
};

// Load the documentation
const docsData = JSON.parse(readFileSync(join(__dirname, 'docs-by-category.json'), 'utf-8'));

// Process each category
Object.entries(categoryFileMap).forEach(([category, filePath]) => {
    const fullPath = join(rootDir, filePath);
    const docs = docsData[category];

    if (!docs || docs.length === 0) {
        console.log(`⚠️  No docs found for category: ${category}`);
        return;
    }

    console.log(`\n📝 Processing ${category} (${docs.length} functions)...`);

    // Read the current file
    let content = readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Build a map of function name to doc
    const docMap = new Map();
    docs.forEach((item) => {
        // Clean up the doc string - remove leading spaces from each line
        const docLines = item.doc.split('\n');
        const cleanedDoc = docLines
            .map((line) => {
                // Remove leading 4 spaces if present (the indentation from main index.ts)
                if (line.startsWith('    ')) {
                    return line.slice(4);
                }
                return line;
            })
            .join('\n');
        docMap.set(item.name, cleanedDoc.trim());
    });

    // Find the import section end (marked by comment)
    let importsEndIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('// Import custom functions for re-export')) {
            importsEndIndex = i;
            break;
        }
    }

    if (importsEndIndex === -1) {
        console.log(`⚠️  Could not find import boundary marker in ${filePath}`);
        return;
    }

    // Extract function names from the imports (everything before the marker)
    const functionImports = [];
    let inImport = false;
    for (let i = 0; i <= importsEndIndex; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import {')) {
            inImport = true;
        }
        if (inImport && line !== '' && !line.startsWith('import') && !line.startsWith('//')) {
            // Extract function name
            const match = line.match(/^(\w+),?/);
            if (match) {
                functionImports.push(match[1]);
            }
        }
        if (line.includes('} from')) {
            inImport = false;
        }
    }

    // Find custom imports section (if any)
    let customImportsStart = -1;
    let customImportsEnd = -1;
    for (let i = importsEndIndex + 1; i < lines.length; i++) {
        if (lines[i].includes('import') && !lines[i].includes('from')) {
            if (customImportsStart === -1) {
                customImportsStart = i;
            }
            customImportsEnd = i;
        }
        if (lines[i].trim().startsWith('export') || lines[i].trim().startsWith('/**')) {
            break;
        }
    }

    // Find where default export starts
    let defaultExportStart = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('export default {')) {
            defaultExportStart = i;
            break;
        }
    }

    if (defaultExportStart === -1) {
        console.log(`⚠️  Could not find default export in ${filePath}`);
        return;
    }

    // Find custom function exports section (between custom imports and export default)
    const customExportLines = [];
    if (customImportsEnd !== -1) {
        // Look for export statements that are for custom functions
        // Pattern: export { funcName, ... };
        let foundCustomExports = false;
        for (let i = customImportsEnd + 1; i < defaultExportStart; i++) {
            const line = lines[i];
            // Look for export { ... } that's not a ramda export
            if ((line.trim().startsWith('export {') && !line.includes('from')) || line.trim() === 'export {') {
                if (!foundCustomExports) {
                    customExportLines.push('');
                    customExportLines.push('// Custom functions');
                    foundCustomExports = true;
                }
                // Capture the whole export statement
                let j = i;
                while (j < defaultExportStart && !lines[j].includes('};')) {
                    customExportLines.push(lines[j]);
                    j++;
                }
                if (j < defaultExportStart && lines[j].includes('};')) {
                    customExportLines.push(lines[j]); // Include the closing line
                }
                break;
            }
        }
    }

    // Preserve everything up to where custom imports end (or import marker if no custom imports)
    const endOfImports = customImportsEnd !== -1 ? customImportsEnd : importsEndIndex;
    const preservedPrefix = lines.slice(0, endOfImports + 1);

    // Preserve default export
    const defaultExport = lines.slice(defaultExportStart);

    // Build new exports section with full docs
    const newExports = [];
    newExports.push('');

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
            // Keep minimal doc as fallback
            console.log(`  ⚠️  No doc found for: ${funcName}`);
            newExports.push(`/** @category ${category.charAt(0).toUpperCase() + category.slice(1)} */`);
            newExports.push(`export { ${funcName} };`);
            newExports.push('');
            notFound++;
        }
    });

    // Add custom exports if any
    if (customExportLines.length > 0) {
        newExports.push(...customExportLines);
        newExports.push('');
    }

    // Combine everything
    const newContent = [...preservedPrefix, ...newExports, ...defaultExport].join('\n') + '\n';

    // Write back
    writeFileSync(fullPath, newContent, 'utf-8');

    console.log(`  ✅ Documented ${documented} functions`);
    if (notFound > 0) {
        console.log(`  ⚠️  ${notFound} functions not found in docs`);
    }
});

console.log('\n✨ Done!');
