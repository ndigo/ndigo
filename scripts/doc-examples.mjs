#!/usr/bin/env node
/**
 * TSDoc example syntax check.
 *
 * Extracts fenced code blocks from `@example` tags in package source and
 * parses each as TypeScript; reports syntax errors. Ndigo's standard requires
 * `@example` code to be valid TypeScript (see STYLE_GUIDE §5).
 */
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript-6');

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const PACKAGES = join(ROOT, 'packages');

function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        if (['node_modules', 'lib', 'dist', 'api'].includes(entry)) continue;
        const p = join(dir, entry);
        const st = statSync(p);
        if (st.isDirectory()) walk(p, out);
        else if (entry.endsWith('.ts') && !entry.endsWith('.spec.ts') && !entry.startsWith('_')) out.push(p);
    }
    return out;
}

let files = 0;
let blocks = 0;
let errors = 0;
for (const pkg of readdirSync(PACKAGES)) {
    const src = join(PACKAGES, pkg, 'src');
    let filesHere;
    try {
        filesHere = walk(src);
    } catch {
        continue;
    }
    for (const file of filesHere) {
        files++;
        const text = readFileSync(file, 'utf8');
        // Find @example blocks, then a fenced code block immediately after.
        const exampleRe = /@example\b[\s\S]*?```(?:ts|typescript)?\n([\s\S]*?)```/g;
        let m;
        let idx = 0;
        while ((m = exampleRe.exec(text)) !== null) {
            const code = m[1]
                .split('\n')
                .map((line) => line.replace(/^\s*\*\s?/, ''))
                .join('\n');
            idx++;
            blocks++;
            const res = ts.transpileModule(code, {
                compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, noEmit: true },
                reportDiagnostics: true,
            });
            const diags = (res.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
            if (diags.length) {
                errors += diags.length;
                for (const d of diags) {
                    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
                    console.error(`${file.replace(ROOT + '/', '')}: example #${idx}: ${msg}`);
                }
            }
        }
    }
}

console.log(`checked ${files} files, ${blocks} example blocks, ${errors} error(s)`);
process.exit(errors ? 1 : 0);
