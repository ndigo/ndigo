/**
 * Contract test for the consumer rule surface: rule keys, documentation URLs,
 * message suffixes, the recommended preset, and the pages that back them.
 *
 * Every assertion here exists because a formatter or a contributor can drift
 * from the contract silently: oxlint prints rule keys, and the URL is the only
 * thing that turns a one-line violation into an explanation.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { ruleUrl } from '../src/_docs';
import plugin from '../src/index';
import { recommended } from '../src/recommended';

/** One naming scheme: prohibition, requirement, well-formedness. */
const ruleKeyPattern = /^(?:no|require|valid)-[a-z0-9]+(?:-[a-z0-9]+)*$/u;

const DOCS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../docs/lint');
const RULE_KEYS = Object.keys(plugin.rules).sort();

/** Returns a rule's meta, failing the test when the rule has none. */
function metaOf(ruleKey: string) {
    const meta = plugin.rules[ruleKey]?.meta;
    if (meta === undefined) {
        throw new Error(`Rule ${ruleKey} has no meta`);
    }
    return meta;
}

/** Reads one rule's documentation page. */
function pageOf(ruleKey: string): string {
    return readFileSync(resolve(DOCS_DIR, `${ruleKey}.md`), 'utf8');
}

describe('consumer rule contract', () => {
    test('the plugin registers at least one rule', () => {
        expect(RULE_KEYS.length).toBeGreaterThan(0);
    });

    test('every rule key follows the naming scheme', () => {
        for (const ruleKey of RULE_KEYS) {
            expect(ruleKey).toMatch(ruleKeyPattern);
        }
    });

    test('every rule points at its canonical documentation URL', () => {
        for (const ruleKey of RULE_KEYS) {
            expect(metaOf(ruleKey).docs?.url, ruleKey).toBe(ruleUrl(ruleKey));
        }
    });

    test('every message ends with the rule URL', () => {
        for (const ruleKey of RULE_KEYS) {
            const messages = metaOf(ruleKey).messages ?? {};
            const messageIds = Object.keys(messages);
            expect(messageIds.length, `${ruleKey} declares no messages`).toBeGreaterThan(0);
            for (const messageId of messageIds) {
                expect(messages[messageId].endsWith(ruleUrl(ruleKey)), `${ruleKey}.${messageId}`).toBe(true);
            }
        }
    });

    test('every rule has a page, and every page has a rule', () => {
        for (const ruleKey of RULE_KEYS) {
            expect(existsSync(resolve(DOCS_DIR, `${ruleKey}.md`)), `${ruleKey}.md`).toBe(true);
        }

        const pages = readdirSync(DOCS_DIR)
            .filter((entry) => entry.endsWith('.md') && entry !== 'README.md')
            .map((entry) => entry.slice(0, -'.md'.length));
        expect(pages.sort()).toEqual(RULE_KEYS);
    });

    test('docs pages agree with the rule metadata', () => {
        for (const ruleKey of RULE_KEYS) {
            const page = pageOf(ruleKey);
            const recommended = metaOf(ruleKey).docs?.recommended === true;
            expect(page, ruleKey).toContain(`rule: '@ndigo/${ruleKey}'`);
            expect(page, ruleKey).toContain(`recommended: ${recommended}`);
        }
    });

    test('the recommended preset is exactly the rules marked recommended', () => {
        const expected = RULE_KEYS.filter((ruleKey) => metaOf(ruleKey).docs?.recommended === true);
        const configured = Object.keys(recommended.rules ?? {})
            .filter((name) => name.startsWith('@ndigo/'))
            .map((name) => name.slice('@ndigo/'.length))
            .sort();
        expect(configured).toEqual(expected);
        expect(recommended.jsPlugins).toEqual(['@ndigo/oxlint-plugin']);
    });

    test('the recommended preset only relaxes a rule for test files', () => {
        const configured = new Set(Object.keys(recommended.rules ?? {}));
        for (const override of recommended.overrides ?? []) {
            for (const [name, setting] of Object.entries(override.rules ?? {})) {
                // An override may only silence a rule the preset enables.
                expect(configured.has(name), `${name} is not in the preset`).toBe(true);
                expect(['off', 'warn'], name).toContain(setting);
            }
            expect(override.files?.length, 'override without files').toBeGreaterThan(0);
        }
    });
});
