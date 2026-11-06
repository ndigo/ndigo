#!/usr/bin/env node
/**
 * TSDoc coverage ratchet for the Ndigo monorepo.
 *
 * Scans package source trees (TypeScript AST, no build) and reports per-package
 * documentation depth: module summaries, undocumented members, missing
 * `@param`/`@returns`, and example/remarks counts. `--check` compares against
 * the committed baseline (`docs/tsdoc-baseline.json`) and fails on regression;
 * `--write-baseline` refreshes the baseline as packages are cleaned.
 *
 * Usage:
 *   node scripts/doc-coverage.mjs                 # print table
 *   node scripts/doc-coverage.mjs --json          # machine-readable
 *   node scripts/doc-coverage.mjs --write-baseline # refresh baseline
 *   node scripts/doc-coverage.mjs --check         # ratchet check (CI)
 */
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const require = createRequire(join(ROOT, 'package.json'));
const ts = require('typescript-6');

const PACKAGES = join(ROOT, 'packages');
const BASELINE = join(ROOT, 'docs', 'tsdoc-baseline.json');

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const WRITE = args.includes('--write-baseline');
const CHECK = args.includes('--check');

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

function hasDoc(node) { return (ts.getJSDocCommentsAndTags(node) ?? []).length > 0; }
function tagsOf(node) {
    const jsdoc = ts.getJSDocCommentsAndTags(node) ?? [];
    const tags = [];
    for (const d of jsdoc) if (d.tags) for (const t of d.tags) tags.push(t);
    return tags;
}
function tagName(t) { return t.tagName.getText().replace(/^@/, '').toLowerCase(); }

function topBlockSummary(text) {
    const m = /^\s*\/\*\*([\s\S]*?)\*\//.exec(text);
    if (!m) return false;
    const lines = m[1].split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim()).filter(Boolean);
    return lines.some((l) => !l.startsWith('@'));
}

function isExported(node) {
    return !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
}

function scanPackage(dir) {
    const src = join(PACKAGES, dir, 'src');
    if (!existsSync(src)) return null;
    const stats = {
        modules: 0, modulesWithoutSummary: 0,
        members: 0, membersUndocumented: 0,
        methodsWithParams: 0, methodsMissingParam: 0,
        functionsWithReturns: 0, functionsMissingReturns: 0,
        examples: 0, remarks: 0,
    };
    for (const file of walk(src)) {
        const text = readFileSync(file, 'utf8');
        stats.modules++;
        if (!topBlockSummary(text)) stats.modulesWithoutSummary++;
        const sf = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
        for (const stmt of sf.statements) {
            if (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) continue;
            if (!isExported(stmt)) continue;

            if (ts.isClassDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) {
                for (const m of stmt.members ?? []) {
                    if (ts.isConstructorDeclaration(m)) continue;
                    const nameNode = m.name;
                    if (!nameNode) continue;
                    const name = nameNode.getText?.() ?? '';
                    if (name.startsWith('#') || name.startsWith('[')) continue;
                    if (m.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.PrivateKeyword)) continue;
                    stats.members++;
                    if (!hasDoc(m)) stats.membersUndocumented++;
                    if ((ts.isMethodDeclaration(m) || ts.isMethodSignature(m)) && m.parameters?.length) {
                        stats.methodsWithParams++;
                        const tags = tagsOf(m);
                        const paramNames = [...m.parameters].filter((p) => ts.isIdentifier(p.name)).map((p) => p.name.getText());
                        const documented = new Set(tags.filter((t) => tagName(t) === 'param').map((t) => t.name?.getText?.() ?? ''));
                        if (paramNames.some((n) => !documented.has(n))) stats.methodsMissingParam++;
                    }
                }
                continue;
            }

            if (ts.isFunctionDeclaration(stmt)) {
                const tags = tagsOf(stmt);
                if (stmt.parameters.length) {
                    stats.methodsWithParams++;
                    const paramNames = stmt.parameters.filter((p) => ts.isIdentifier(p.name)).map((p) => p.name.getText());
                    const documented = new Set(tags.filter((t) => tagName(t) === 'param').map((t) => t.name?.getText?.() ?? ''));
                    if (paramNames.some((n) => !documented.has(n))) stats.methodsMissingParam++;
                }
                const rt = stmt.type?.getText();
                if (rt && !/^\s*(void|never)\s*$/.test(rt)) {
                    stats.functionsWithReturns++;
                    if (!tags.some((t) => tagName(t) === 'returns' || tagName(t) === 'return')) stats.functionsMissingReturns++;
                }
                stats.examples += tags.filter((t) => tagName(t) === 'example').length;
                stats.remarks += tags.filter((t) => tagName(t) === 'remarks').length;
                continue;
            }

            if (ts.isTypeAliasDeclaration(stmt)) {
                const tags = tagsOf(stmt);
                stats.examples += tags.filter((t) => tagName(t) === 'example').length;
                stats.remarks += tags.filter((t) => tagName(t) === 'remarks').length;
                continue;
            }
        }
    }
    return stats;
}

const dirs = readdirSync(PACKAGES).filter((d) => existsSync(join(PACKAGES, d, 'package.json')) && existsSync(join(PACKAGES, d, 'src'))).sort();
const results = {};
for (const dir of dirs) {
    const s = scanPackage(dir);
    if (s) results[dir] = s;
}

if (WRITE) {
    writeFileSync(BASELINE, JSON.stringify(results, null, 2) + '\n');
    console.log(`Wrote baseline for ${Object.keys(results).length} packages to ${BASELINE}`);
    process.exit(0);
}

if (JSON_OUT) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
}

// Table output
const pad = (s, n) => String(s).padStart(n);
console.log('package'.padEnd(26), 'mods', 'noSum', 'members', 'undoc', 'paramMiss', 'retMiss', 'ex', 'rmk');
for (const dir of dirs) {
    const s = results[dir];
    if (!s) continue;
    console.log(
        dir.padEnd(26),
        pad(s.modules, 4), pad(s.modulesWithoutSummary, 5),
        pad(s.members, 7), pad(s.membersUndocumented, 5),
        pad(s.methodsMissingParam, 9), pad(s.functionsMissingReturns, 7),
        pad(s.examples, 2), pad(s.remarks, 3)
    );
}

if (CHECK) {
    if (!existsSync(BASELINE)) {
        console.error('✗ No baseline found at', BASELINE, '— run --write-baseline first');
        process.exit(1);
    }
    const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
    let regressions = 0;
    for (const dir of dirs) {
        const cur = results[dir];
        const base = baseline[dir];
        if (!cur || !base) continue;
        const badKeys = ['modulesWithoutSummary', 'membersUndocumented', 'methodsMissingParam', 'functionsMissingReturns'];
        for (const k of badKeys) {
            if (cur[k] > base[k]) {
                regressions++;
                console.error(`✗ ${dir}: ${k} regressed ${base[k]} → ${cur[k]}`);
            }
        }
    }
    if (regressions) {
        console.error(`\n✗ ${regressions} regression(s) vs baseline`);
        process.exit(1);
    }
    console.log('\n✓ No regressions vs baseline');
}
