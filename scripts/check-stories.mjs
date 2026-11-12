#!/usr/bin/env node
/**
 * Storybook coverage gate.
 *
 * Every registry item is presented by one hand-authored story file, and every
 * story file belongs to a registry item. Generated stories are retired: a new
 * registry item without a story fails here, and a story for an item that no
 * longer exists (an orphan) fails too. `theme` and `lib` are foundations
 * rather than components, so they map to the two `foundations/` stories.
 *
 * Story ids derive from the `title:` in each file (`ui-button--default`), which
 * keeps them stable for site deep links. `Default` is the required export in
 * every file, so that id always exists.
 *
 * Run: `node scripts/check-stories.mjs` (wired into `pnpm storybook:check`).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = join(root, 'packages', 'ndigo-ui', 'registry.json');
const storiesDir = join(root, 'apps', '22-ndigo-ui-storybook', 'src', 'stories');

/** Registry items that are foundations, not components, and their stories. */
const FOUNDATIONS = new Map([
    ['theme', 'foundations/tokens.stories.ts'],
    ['lib', 'foundations/base.stories.ts'],
]);

/** Registry item types that map one-to-one onto a story directory. */
const COMPONENT_DIRECTORIES = new Map([
    ['registry:ui', 'ui'],
    ['registry:block', 'blocks'],
]);

const failures = [];

/**
 * Lists every `.stories.ts` file under the stories tree, relative to it.
 * @param {string} directory - Directory to walk.
 * @returns {string[]} Relative paths, sorted.
 */
function listStories(directory) {
    const found = [];
    for (const entry of readdirSync(directory)) {
        const path = join(directory, entry);
        if (statSync(path).isDirectory()) found.push(...listStories(path));
        else if (entry.endsWith('.stories.ts')) found.push(relative(storiesDir, path).split('\\').join('/'));
    }
    return found.sort();
}

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const expected = new Map();

for (const item of registry.items) {
    const foundation = FOUNDATIONS.get(item.name);
    if (foundation !== undefined) {
        expected.set(item.name, foundation);
        continue;
    }
    const directory = COMPONENT_DIRECTORIES.get(item.type);
    if (directory === undefined) {
        failures.push(`registry item "${item.name}" has unsupported type "${item.type}"`);
        continue;
    }
    expected.set(item.name, `${directory}/${item.name}.stories.ts`);
}

const actual = listStories(storiesDir);
const actualSet = new Set(actual);

for (const [item, file] of expected) {
    if (!actualSet.has(file)) {
        failures.push(`registry item "${item}" has no story file (expected src/stories/${file})`);
        continue;
    }
    const source = readFileSync(join(storiesDir, file), 'utf8');
    if (!/^export const Default\b/mu.test(source)) {
        failures.push(`src/stories/${file} does not export \`Default\` (the stable story id)`);
    }
    const title = /title:\s*'([^']+)'/u.exec(source)?.[1];
    if (title === undefined) {
        failures.push(`src/stories/${file} has no quoted title`);
    } else if (file.startsWith('ui/') && !title.startsWith('UI/')) {
        failures.push(`src/stories/${file} title "${title}" must start with "UI/"`);
    } else if (file.startsWith('blocks/') && !title.startsWith('Blocks/')) {
        failures.push(`src/stories/${file} title "${title}" must start with "Blocks/"`);
    } else if (file.startsWith('foundations/') && !title.startsWith('Foundations/')) {
        failures.push(`src/stories/${file} title "${title}" must start with "Foundations/"`);
    }
}

const expectedFiles = new Set(expected.values());
for (const file of actual) {
    if (!expectedFiles.has(file)) {
        failures.push(`src/stories/${file} has no registry item (orphan story)`);
    }
}

if (failures.length > 0) {
    process.stderr.write(`\nstorybook:check: ${failures.length} problem(s)\n\n`);
    for (const failure of failures) process.stderr.write(`  - ${failure}\n`);
    process.exit(1);
}

process.stdout.write(
    `storybook:check: ${registry.items.length} registry items covered by ${actual.length} story files ` +
        `(${actual.filter((file) => file.startsWith('ui/')).length} ui, ` +
        `${actual.filter((file) => file.startsWith('blocks/')).length} blocks, ` +
        `${actual.filter((file) => file.startsWith('foundations/')).length} foundations).\n`
);
