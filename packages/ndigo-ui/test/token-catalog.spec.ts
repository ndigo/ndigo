/**
 * Token contract tests: the stylesheet and the TypeScript catalog must agree
 * exactly, and the stylesheet must stay consumer-agnostic.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getTokenDefinition, TOKEN_GROUPS, TOKEN_NAMES, TOKENS, resolveToken } from '@ndigo/ui';
import type { TokenGroup } from '@ndigo/ui';

const STYLESHEET_PATH = [
    resolve(process.cwd(), 'tokens/ndigo-tokens.css'),
    resolve(process.cwd(), 'packages/ndigo-ui/tokens/ndigo-tokens.css'),
].find((candidate) => existsSync(candidate));

if (!STYLESHEET_PATH) {
    throw new Error(`Cannot locate tokens/ndigo-tokens.css from ${process.cwd()}`);
}

const STYLESHEET = readFileSync(STYLESHEET_PATH, 'utf8');
const CSS = STYLESHEET.replace(/\/\*[\s\S]*?\*\//g, '');
const declarationRe = /(--nd-[a-z0-9-]+)\s*:/g;
const selectorBlockRe = /^[ \t]*([^@\s][^\n{}]*?)[ \t]*\{[ \t]*$/gm;
const allowedSelectorRe = /^:root(?::not\(\[data-theme\]\)|\[data-theme='(?:dark|light)'\])?$/;

/** Custom properties declared inside the first block whose selector matches. */
function declarationsIn(css: string, selector: string): Set<string> {
    const start = css.indexOf(selector);
    expect(start, `selector ${selector} must exist`).toBeGreaterThanOrEqual(0);
    const open = css.indexOf('{', start);
    const close = css.indexOf('}', open);
    const block = css.slice(open + 1, close);
    return new Set([...block.matchAll(declarationRe)].map((match) => match[1]));
}

describe('token stylesheet', () => {
    it('declares every token in the catalog', () => {
        const declared = new Set([...CSS.matchAll(declarationRe)].map((match) => match[1]));
        expect([...declared].sort()).toEqual([...TOKEN_NAMES].sort());
    });

    it('declares no token twice in the catalog', () => {
        expect(new Set(TOKEN_NAMES).size).toBe(TOKEN_NAMES.length);
    });

    it('covers every token group', () => {
        const groups = new Set<TokenGroup>(TOKENS.map((token) => token.group));
        expect([...groups].sort()).toEqual([...TOKEN_GROUPS].sort());
    });

    it('declares the same semantic colors for dark and light', () => {
        const dark = declarationsIn(CSS, ":root[data-theme='dark']");
        const light = declarationsIn(CSS, ":root[data-theme='light']");
        expect([...light].sort()).toEqual([...dark].sort());
    });

    it('stays consumer-agnostic: no imports, font files, or element selectors', () => {
        expect(CSS).not.toMatch(/@import|@font-face|url\(/);
        const selectors = [...CSS.matchAll(selectorBlockRe)]
            .flatMap((match) => match[1].split(','))
            .map((selector) => selector.trim())
            .filter((selector) => selector.length > 0);
        expect(selectors.length).toBeGreaterThan(0);
        for (const selector of selectors) {
            expect(selector).toMatch(allowedSelectorRe);
        }
    });
});

describe('token catalog', () => {
    it('looks up a known token', () => {
        expect(getTokenDefinition('--nd-color-bg')?.group).toBe('color');
    });

    it('returns undefined for an uncatalogued name', () => {
        expect(getTokenDefinition('--nd-not-a-token')).toBeUndefined();
    });

    it('builds a plain var() reference', () => {
        expect(resolveToken('--nd-space-4')).toBe('var(--nd-space-4)');
    });

    it('builds a var() reference with a fallback', () => {
        expect(resolveToken('--nd-space-4', '1rem')).toBe('var(--nd-space-4, 1rem)');
    });
});
