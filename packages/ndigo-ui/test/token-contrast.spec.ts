/**
 * Semantic token contrast contract: every text/background pair the system
 * declares must meet WCAG AA (4.5:1) in both themes. This is the deterministic
 * counterpart to the jsdom axe specs, which disable `color-contrast` because
 * jsdom has no layout.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packageRoot } from './_package-root.js';

const PACKAGE_ROOT = packageRoot('tokens/ndigo-tokens.css');

const CSS = readFileSync(join(PACKAGE_ROOT, 'tokens/ndigo-tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const declarationRe = /(--nd-[a-z0-9-]+)\s*:\s*([^;]+);/g;

function declarationsIn(selector: string): Map<string, string> {
    const start = CSS.indexOf(selector);
    expect(start, `selector ${selector} must exist`).toBeGreaterThanOrEqual(0);
    const open = CSS.indexOf('{', start);
    const close = CSS.indexOf('}', open);
    return new Map([...CSS.slice(open + 1, close).matchAll(declarationRe)].map((match) => [match[1], match[2].trim()]));
}

const ROOT = declarationsIn(':root');
const DARK = declarationsIn(":root[data-theme='dark']");
const LIGHT = declarationsIn(":root[data-theme='light']");

function valueOf(name: string, scope: Map<string, string>): string {
    const raw = scope.get(name) ?? ROOT.get(name);
    expect(raw, `token ${name} must be declared`).toBeDefined();
    const reference = /^var\((--nd-[a-z0-9-]+)\)$/.exec(raw ?? '');
    return reference ? valueOf(reference[1], scope) : (raw ?? '');
}

function luminance(hex: string): number {
    const match = /^#([0-9a-f]{6})$/i.exec(hex);
    expect(match, `expected a 6-digit hex color, got ${hex}`).not.toBeNull();
    const value = match?.[1] ?? '000000';
    const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
    const linear = channels.map((channel) =>
        channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground: string, background: string): number {
    const first = luminance(foreground);
    const second = luminance(background);
    const lighter = Math.max(first, second);
    const darker = Math.min(first, second);
    return (lighter + 0.05) / (darker + 0.05);
}

const BACKGROUNDS = ['--nd-color-bg', '--nd-color-surface', '--nd-color-surface-raised'];
const FOREGROUNDS = [
    '--nd-color-text',
    '--nd-color-text-muted',
    '--nd-color-accent-strong',
    '--nd-color-success',
    '--nd-color-warning',
    '--nd-color-danger',
    '--nd-color-info',
];

describe.each([
    ['dark', DARK],
    ['light', LIGHT],
])('%s theme token contrast', (_name, scope) => {
    for (const background of BACKGROUNDS) {
        for (const foreground of FOREGROUNDS) {
            it(`${foreground} on ${background} meets AA`, () => {
                expect(contrast(valueOf(foreground, scope), valueOf(background, scope))).toBeGreaterThanOrEqual(4.5);
            });
        }
    }

    it('on-accent text meets AA on the accent surface', () => {
        expect(
            contrast(valueOf('--nd-color-on-accent', scope), valueOf('--nd-color-accent', scope))
        ).toBeGreaterThanOrEqual(4.5);
    });
});
