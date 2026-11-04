/**
 * Root-tooling lane for `import-scanner.mjs` (manifest:check correctness).
 *
 * Pins the `SKIP_DIRS` contract: build-output names (`lib`, `doc`) must not be
 * skipped at any depth, because both walkers descend only from source roots
 * (`src`/`test`/…), never a package root — so a nested `src/lib` is genuine
 * source. Skipping it by name hid those imports from `pnpm manifest:check` and
 * surfaced them as false "dead dependency" failures (the defect hit by app 11's
 * `src/lib`).
 *
 * Runs under `pnpm test:tooling` (`node --test scripts/test-import-scanner.mjs`
 * — no vitest, no nx). The name deliberately escapes vitest's `*.test.*` glob.
 *
 * @module scripts/import-scanner.test
 * @since 1.0.0
 * @author Jeff Rose
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { importsOf, collectImports, SOURCE_DIRS } from './import-scanner.mjs';

/** Runs `run` against a throwaway package dir and always removes it afterwards. */
function withFixture(run) {
    const root = mkdtempSync(join(tmpdir(), 'import-scanner-'));
    try {
        return run(root);
    } finally {
        rmSync(root, { recursive: true, force: true });
    }
}

test('scans a nested src/lib directory instead of treating it as build output', () => {
    withFixture((root) => {
        mkdirSync(join(root, 'src', 'lib'), { recursive: true });
        writeFileSync(join(root, 'src', 'app.ts'), "import '@ndigo/app';\n");
        writeFileSync(join(root, 'src', 'lib', 'probe.ts'), "import '@ndigo/nested-lib';\n");

        const imports = collectImports(join(root, 'src'));

        assert.ok(imports.has('@ndigo/nested-lib'), 'nested src/lib import must be seen');
        assert.ok(imports.has('@ndigo/app'));
    });
});

test('still skips node_modules and .vitest at any depth', () => {
    withFixture((root) => {
        mkdirSync(join(root, 'src', 'node_modules', 'pkg'), { recursive: true });
        mkdirSync(join(root, 'src', '.vitest'), { recursive: true });
        writeFileSync(join(root, 'src', 'app.ts'), "import '@ndigo/app';\n");
        writeFileSync(join(root, 'src', 'node_modules', 'pkg', 'index.ts'), "import '@ndigo/skipped-nm';\n");
        writeFileSync(join(root, 'src', '.vitest', 'probe.ts'), "import '@ndigo/skipped-vitest';\n");

        const imports = collectImports(join(root, 'src'));

        assert.ok(imports.has('@ndigo/app'));
        assert.ok(!imports.has('@ndigo/skipped-nm'), 'node_modules must stay skipped');
        assert.ok(!imports.has('@ndigo/skipped-vitest'), '.vitest must stay skipped');
    });
});

test('importsOf(src) includes imports living under a nested lib', () => {
    withFixture((root) => {
        mkdirSync(join(root, 'src', 'lib'), { recursive: true });
        writeFileSync(join(root, 'src', 'lib', 'probe.ts'), "import '@ndigo/nested-lib';\n");

        assert.ok(importsOf(root, SOURCE_DIRS).has('@ndigo/nested-lib'));
    });
});
