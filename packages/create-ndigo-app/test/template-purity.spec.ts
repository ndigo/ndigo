/**
 * Registry-content guard: the scaffold writes pointers, never design-system
 * content. Tokens, components, and the lockfile stay the registry's single
 * source (`packages/ndigo-ui/registry/`), and `--ui` resolves its files through
 * `planUiPointer()` instead of a template directory.
 *
 * This test exists so a future "just inline the theme into the template" change
 * fails loudly rather than forking the registry into a second source.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, test } from 'vitest';
import { templatesRoot } from '../src/templates';

const ROOT = templatesRoot();

function templateFiles(dir: string = ROOT): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            files.push(...templateFiles(path));
            continue;
        }
        files.push(path);
    }
    return files;
}

describe('create-ndigo-app templates stay registry-free', () => {
    const files = templateFiles();

    test('ships no stylesheet, so tokens cannot be copied in', () => {
        const stylesheets = files.map((file) => relative(ROOT, file)).filter((file) => file.endsWith('.css'));
        expect(stylesheets).toEqual([]);
    });

    test('ships no ndigo-ui pointer files', () => {
        const pointers = files
            .map((file) => relative(ROOT, file))
            .filter((file) => file.endsWith('ndigo.ui.json') || file.endsWith('ui.lock.json'));
        expect(pointers).toEqual([]);
    });

    test('declares no --nd-* tokens and imports no registry targets', () => {
        for (const file of files) {
            const content = readFileSync(file, 'utf8');
            const name = relative(ROOT, file);
            expect(content, name).not.toMatch(/--nd-[a-z0-9-]+\s*:/u);
            expect(content, name).not.toMatch(/"registry:(ui|theme|block|lib|file)"/u);
            expect(content, name).not.toMatch(/target["']?\s*:\s*["']@(ui|lib|components|hooks)\//u);
        }
    });
});
