/**
 * Scaffold parity: `create-ndigo-app` renders the recommended preset into a
 * generated app, and the template is hand-maintained JSON. This test is the
 * link between the two, so a rule added to the preset cannot silently miss new
 * projects (and a template cannot drift into a stale rule set).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { recommended } from '../src/recommended';

const TEMPLATES = resolve(dirname(fileURLToPath(import.meta.url)), '../../create-ndigo-app/templates');

interface TemplateConfig {
    jsPlugins: string[];
    rules: Record<string, unknown>;
    overrides: Array<{ files: string[]; rules: Record<string, unknown> }>;
}

/** Parses one template's `.oxlintrc.json`, which carries no placeholders. */
function templateConfig(kind: 'browser' | 'node'): TemplateConfig {
    return JSON.parse(readFileSync(resolve(TEMPLATES, kind, '.oxlintrc.json.template'), 'utf8')) as TemplateConfig;
}

describe('scaffold lint config', () => {
    test('the browser template is exactly the recommended preset', () => {
        const config = templateConfig('browser');
        expect(config.jsPlugins).toEqual(recommended.jsPlugins);
        expect(config.rules).toEqual(recommended.rules);
        expect(config.overrides).toEqual(recommended.overrides);
    });

    test('the node template is the preset plus the browser-global guard', () => {
        const config = templateConfig('node');
        const { '@ndigo/no-browser-globals': browserGlobals, ...rules } = config.rules;

        expect(config.jsPlugins).toEqual(recommended.jsPlugins);
        expect(browserGlobals).toBe('error');
        expect(rules).toEqual(recommended.rules);
        expect(config.overrides[0]?.rules).toMatchObject({ '@ndigo/no-browser-globals': 'off' });
    });
});
