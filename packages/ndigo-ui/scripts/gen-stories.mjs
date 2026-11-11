#!/usr/bin/env node
/**
 * Generate baseline Storybook stories from the Ndigo UI registry READMEs.
 *
 * Usage: node packages/ndigo-ui/scripts/gen-stories.mjs [--out <dir>]
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const REGISTRY = join(ROOT, 'packages', 'ndigo-ui', 'registry');
const DEFAULT_OUT = resolve(ROOT, 'apps', '22-ndigo-ui-storybook', 'src', 'stories');

const args = process.argv.slice(2);
let out = DEFAULT_OUT;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') out = resolve(args[++i]);
}

function firstHtmlBlock(readme) {
    const match = readme.match(/```html\s*\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
}

function titleCase(name) {
    return name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function genStory(name, category, htmlBlock) {
    const title = `${category}/${titleCase(name)}`;
    const template = htmlBlock ? htmlBlock : `<div>TODO: add markup for ${name}</div>`;
    return `/**
 * Storybook stories for the Ndigo UI ${name} component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: '${title}',
    tags: ['autodocs'],
    render: () => html\`${template}\`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
`;
}

mkdirSync(out, { recursive: true });

for (const section of ['ui', 'blocks']) {
    const category = section === 'ui' ? 'UI' : 'Blocks';
    const dir = join(REGISTRY, section);
    for (const name of readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()) {
        const readmePath = join(dir, name, 'README.md');
        let readme = '';
        try {
            readme = readFileSync(readmePath, 'utf8');
        } catch {
            // no README; generate placeholder
        }
        const block = firstHtmlBlock(readme);
        const story = genStory(name, category, block);
        const fileName = `${name}.stories.ts`;
        writeFileSync(join(out, fileName), story, 'utf8');
        console.log(`wrote ${fileName}${block ? '' : ' (placeholder)'}`);
    }
}

console.log(`Done. Output: ${out}`);
