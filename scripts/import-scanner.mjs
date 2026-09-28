/**
 * Shared import-specifier scanner for scripts.
 *
 * Tokenizes source into code/string/comment tokens, then walks the code
 * tokens for import/export statements. Real import specifiers are captured
 * only from code context — fixture code inside string/template literals
 * (e.g. oxlint rule samples) can never be mistaken for real imports.
 *
 * Returns the normalized specifier set (bare package names; `@scope/name`
 * kept whole; `node:` and relative imports dropped; subpaths collapsed).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const SKIP_DIRS = new Set(['node_modules', '.vitest', 'lib', 'doc']);
export const SOURCE_DIRS = new Set(['src']);
export const DEV_DIRS = new Set(['test', 'bench', 'profile', 'scripts']);

/**
 * @returns {Array<{kind: 'code'|'str'|'comment', text: string}>}
 */
export function tokenize(source) {
    const tokens = [];
    let code = '';
    let i = 0;
    const n = source.length;

    const flushCode = () => {
        if (code) {
            tokens.push({ kind: 'code', text: code });
            code = '';
        }
    };

    while (i < n) {
        const c = source[i];
        const next = i + 1 < n ? source[i + 1] : '';
        if (c === '/' && next === '/') {
            flushCode();
            let end = source.indexOf('\n', i);
            if (end === -1) end = n;
            tokens.push({ kind: 'comment', text: source.slice(i, end) });
            i = end;
        } else if (c === '/' && next === '*') {
            flushCode();
            const end = source.indexOf('*/', i + 2);
            const stop = end === -1 ? n : end + 2;
            tokens.push({ kind: 'comment', text: source.slice(i, stop) });
            i = stop;
        } else if (c === '"' || c === "'" || c === '`') {
            flushCode();
            const quote = c;
            let j = i + 1;
            while (j < n) {
                if (source[j] === '\\') j += 2;
                else if (source[j] === quote) {
                    j++;
                    break;
                } else j++;
            }
            tokens.push({ kind: 'str', text: source.slice(i, j) });
            i = j;
        } else {
            code += c;
            i++;
        }
    }
    flushCode();
    return tokens;
}

function normalize(specs) {
    const out = new Set();
    for (const name of specs) {
        if (!name || name.startsWith('.') || name.startsWith('node:')) continue;
        if (name.startsWith('@')) out.add(name.split('/').slice(0, 2).join('/'));
        else out.add(name.split('/')[0]);
    }
    return out;
}

/** @returns {Set<string>} normalized import specifiers (code context only) */
export function extractImports(source) {
    const specifiers = [];
    let inStatement = false;
    let brace = 0;
    let expectFrom = false;
    let barePending = false;
    let expectDynamic = false;

    const endStatement = () => {
        inStatement = false;
        expectFrom = false;
        barePending = false;
        expectDynamic = false;
        brace = 0;
    };

    for (const token of tokenize(source)) {
        if (token.kind === 'comment') continue; // expectations survive comments

        if (token.kind === 'str') {
            if (expectDynamic) {
                const content = token.text.slice(1, -1);
                if (content) specifiers.push(content);
                expectDynamic = false;
                continue;
            }
            if (inStatement && brace === 0 && (barePending || expectFrom)) {
                const content = token.text.slice(1, -1);
                if (content) specifiers.push(content);
                endStatement();
            }
            continue;
        }

        // --- code token: process `;`-separated segments ---
        let rest = token.text;
        while (rest.length > 0) {
            if (!inStatement) {
                const m = /(?:^|[;{}\s])(?:import(?!\s*\()|export)\b/.exec(rest);
                if (!m) {
                    // dynamic import elsewhere, e.g. `await import('x')` — captured
                    // either within this token or at the next string token
                    const dyn = /\bimport\s*\(\s*(['"])([^'"]+)\1\s*\)/.exec(rest);
                    if (dyn) {
                        specifiers.push(dyn[2]);
                        break;
                    }
                    if (/\bimport\s*\(\s*$/.test(rest)) {
                        expectDynamic = true;
                        break;
                    }
                    break;
                }
                inStatement = true;
                rest = rest.slice(m.index + m[0].length);
                // specifier/quoted dynamic import right after the keyword: `import 'x'`, `import("x")`
                const same = /^\s*(?:type\s+)?(['"])([^'"]+)\1|^\s*\(\s*(['"])([^'"]+)\3\s*\)/.exec(rest);
                if (same) {
                    specifiers.push(same[1] ?? same[4]);
                    endStatement();
                    continue;
                }
                // bare `import 'x'` can only follow when the keyword is the whole
                // statement prefix — any other content invalidates it
                barePending = /^\s*(?:type\s+)?\s*$/.test(rest);
            }

            // mid-statement: scan for `;` at brace depth 0 or EOF of this token
            let k = 0;
            let ended = false;
            for (; k < rest.length; k++) {
                const ch = rest[k];
                if (ch === '{') brace++;
                else if (ch === '}') brace = Math.max(0, brace - 1);
                else if (ch === ';' && brace === 0) {
                    ended = true;
                    break;
                }
            }
            if (inStatement && brace === 0 && /\bfrom\b(?:\s|\{|$)/.test(rest.slice(0, ended ? k : rest.length))) {
                expectFrom = true;
            }
            if (ended) {
                rest = rest.slice(k + 1);
                endStatement();
                continue; // next segment may start a new statement
            }
            rest = '';
        }
    }
    return normalize(specifiers);
}

/** Collect imports from every .ts/.mjs file under `dir` (recursively). */
export function collectImports(dir, acc = new Set()) {
    let entries;
    try {
        entries = readdirSync(dir);
    } catch {
        return acc;
    }
    for (const entry of entries) {
        const path = join(dir, entry);
        const stat = statSync(path);
        if (stat.isDirectory()) {
            if (!SKIP_DIRS.has(entry)) collectImports(path, acc);
        } else if (/\.(ts|mjs)$/.test(entry)) {
            for (const spec of extractImports(readFileSync(path, 'utf8'))) acc.add(spec);
        }
    }
    return acc;
}

/**
 * Import sets for a package.
 * @param dirs SOURCE_DIRS => runtime imports; DEV_DIRS => + root config files.
 */
export function importsOf(pkgDir, dirs) {
    const acc = new Set();
    for (const dir of dirs) collectImports(join(pkgDir, dir), acc);
    if (dirs !== DEV_DIRS) return acc; // root vitest/vite configs are dev-time only
    for (const file of ['vitest.config.ts', 'vite.config.ts']) {
        try {
            for (const spec of extractImports(readFileSync(join(pkgDir, file), 'utf8'))) acc.add(spec);
        } catch {
            // config absent — fine
        }
    }
    return acc;
}
