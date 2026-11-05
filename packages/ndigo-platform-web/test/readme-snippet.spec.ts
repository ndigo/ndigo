/**
 * PWB-REV-012: the README's getting-started snippet must reference exports the
 * `@ndigo/platform-web` barrel actually provides. It documents
 * `import { Cookies } from '@ndigo/platform-web'`, which the barrel previously
 * did not export.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import * as platformWeb from '../src/index';

const README_PATH = join(process.cwd(), 'README.md');

describe('README getting-started snippet', () => {
    test('every named import from the snippet is exported by the barrel', () => {
        const readme = readFileSync(README_PATH, 'utf8');
        const snippet = readme.match(/import\s*\{([^}]*)\}\s*from\s*'@ndigo\/platform-web'/);

        expect(snippet).not.toBeNull();

        const names = (snippet?.[1] ?? '')
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean);

        expect(names.length).toBeGreaterThan(0);

        const missing = names.filter((name) => !(name in platformWeb));
        expect(missing).toEqual([]);
    });
});
