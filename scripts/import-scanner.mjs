/**
 * Shared import-specifier scanner for scripts.
 *
 * Tokenizes source into code/string/comment tokens, then walks the code
 * tokens for import/export statements — plus CJS `require()` — so committed
 * .js bench/scripts can be gated too. Real import specifiers are captured
 * only from code context — fixture code inside string/template literals
 * (e.g. oxlint rule samples) can never be mistaken for real imports.
 *
 * Returns the normalized specifier set (bare package names; `@scope/name`
 * kept whole; `node:`-prefixed, bare builtins and relative imports dropped;
 * subpaths collapsed).
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Directories that are never source at any depth. Build-output names (`lib`,
 * `doc`) are deliberately absent: both walkers only descend from source roots
 * (`src`/`test`/`client`/…), never a package root, so a nested `lib` is genuine
 * source (e.g. `apps/10-ndigo-conduit-web/src/lib`). Skipping it by name hid
 * those imports from `manifest:check` as false dead dependencies.
 */
export const SKIP_DIRS = new Set(['node_modules', '.vitest']);
export const SOURCE_DIRS = new Set(['src']);
export const DEV_DIRS = new Set(['test', 'bench', 'benchmark', 'profile', 'scripts']);

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

/**
 * Bare spellings of Node core modules (e.g. `require('events')` in committed
 * CJS bench files) are host-provided, like their `node:`-prefixed forms.
 */
const NODE_BUILTINS = new Set([
    'assert',
    'async_hooks',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'constants',
    'crypto',
    'dgram',
    'diagnostics_channel',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'http2',
    'https',
    'inspector',
    'module',
    'net',
    'os',
    'path',
    'perf_hooks',
    'process',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    'string_decoder',
    'sys',
    'timers',
    'tls',
    'trace_events',
    'tty',
    'url',
    'util',
    'v8',
    'vm',
    'wasi',
    'worker_threads',
    'zlib',
]);

function normalize(specs) {
    const out = new Set();
    for (const name of specs) {
        if (!name || name.startsWith('.') || name.startsWith('node:') || NODE_BUILTINS.has(name)) continue;
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
                    // CJS require() — the import mechanism of committed .js
                    // bench/scripts; same shape as dynamic import
                    const req = /\brequire(?:\.resolve)?\s*\(\s*(['"])([^'"]+)\1\s*\)/.exec(rest);
                    if (req) {
                        specifiers.push(req[2]);
                        break;
                    }
                    if (/\brequire(?:\.resolve)?\s*\(\s*$/.test(rest)) {
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

/**
 * Collect imports from every file under `dir` (recursively): .ts/.mts/.mjs
 * always; plus .js/.cjs when `scanJs` is set and the file has no TS twin
 * (compiled siblings are skipped so emitted output is never double-counted).
 */
export function collectImports(dir, acc = new Set(), scanJs = false) {
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
            if (!SKIP_DIRS.has(entry)) collectImports(path, acc, scanJs);
        } else if (/\.(ts|mts|mjs)$/.test(entry)) {
            for (const spec of extractImports(readFileSync(path, 'utf8'))) acc.add(spec);
        } else if (scanJs && /\.(js|cjs)$/.test(entry) && !hasTsTwin(dir, entry)) {
            for (const spec of extractImports(readFileSync(path, 'utf8'))) acc.add(spec);
        }
    }
    return acc;
}

/** True when a .ts/.mts sibling exists (the .js/.cjs is then emitted output). */
function hasTsTwin(dir, file) {
    const base = file.replace(/\.(js|cjs)$/, '');
    return ['.ts', '.mts'].some((ext) => existsSync(join(dir, base + ext)));
}

/**
 * Import sets for a package.
 * @param dirs SOURCE_DIRS => runtime imports; DEV_DIRS => + root config files.
 */
export function importsOf(pkgDir, dirs) {
    const acc = new Set();
    for (const dir of dirs) {
        // Committed CJS/ESM .js bench/benchmark/scripts files (no .ts twin)
        // are gated too; the other dev dirs (test/profile) stay .ts/.mjs-only.
        collectImports(join(pkgDir, dir), acc, dir === 'bench' || dir === 'benchmark' || dir === 'scripts');
    }
    if (dirs !== DEV_DIRS) return acc; // root vitest/vite configs are dev-time only
    for (const ext of ['ts', 'js', 'mjs', 'cjs']) {
        for (const file of [`vitest.config.${ext}`, `vite.config.${ext}`]) {
            try {
                for (const spec of extractImports(readFileSync(join(pkgDir, file), 'utf8'))) acc.add(spec);
            } catch {
                // config absent — fine
            }
        }
    }
    return acc;
}
