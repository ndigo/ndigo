#!/usr/bin/env node
/**
 * Explicit quarantine for DOM targets the jsdom harness cannot execute.
 *
 * The Svelte, Vue, and Ndigo TodoMVC bundles use `import.meta`/module scripts;
 * jsdom rejects them, and running them in a classic script produces a
 * misleading "no results" timeout. A real-browser (Playwright) runner is the
 * Phase 3 replacement; until then this command fails fast with the reason.
 */
const target = process.argv[2] ?? 'this target';
console.error(
    `benchmark quarantine: ${target} cannot run in the jsdom harness.\n` +
        'The bundle uses module-script features (import.meta) that jsdom does not implement.\n' +
        'Use a real-browser runner (see docs/plans/2026-11-10_BENCHMARK_REFRESH.md, Phase 3).\n' +
        'Working jsdom targets today: react, vanilla.'
);
process.exit(1);
