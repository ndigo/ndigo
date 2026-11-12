/**
 * Registry README access for Storybook Docs pages.
 *
 * The READMEs are the canonical prose for every item, so the Docs description
 * is read from them at build time instead of being duplicated in each story.
 */

const readmes = (
    import.meta as unknown as {
        // `vite/client` is not referenced globally because its asset modules
        // collide with the repo's ambient http fixtures; the one signature the
        // helper needs is declared here instead.
        glob(pattern: string, options: { query: string; import: string; eager: true }): Record<string, string>;
    }
).glob('../../../packages/ndigo-ui/registry/{ui,blocks}/*/README.md', {
    query: '?raw',
    import: 'default',
    eager: true,
});

const registryReadmePattern = /packages\/ndigo-ui\/registry\/(ui|blocks)\/([^/]+)\/README\.md$/u;

const byItem = new Map<string, string>();
for (const [path, content] of Object.entries(readmes)) {
    const match = registryReadmePattern.exec(path);
    if (match) byItem.set(`${match[1]}/${match[2]}`, content);
}

/** Drops the `# nd-x` heading and returns the remaining top-level blocks. */
function blocks(markdown: string): string[] {
    const lines = markdown.replace(/^#\s+.*$/mu, '').split('\n');
    const found: string[] = [];
    let current: string[] = [];
    const flush = () => {
        const text = current.join('\n').trim();
        if (text) found.push(text);
        current = [];
    };
    for (const line of lines) {
        if (line.startsWith('## ')) break;
        if (line.trim() === '') flush();
        else current.push(line);
    }
    flush();
    return found;
}

/**
 * Docs description for one registry item: the README tagline followed by its
 * first paragraph, as Markdown.
 *
 * @param item - Registry-relative item path, e.g. `ui/button`.
 * @returns Markdown, or an empty string when the item has no README.
 */
export function readmeDescription(item: string): string {
    const markdown = byItem.get(item);
    if (!markdown) return '';
    return blocks(markdown).slice(0, 2).join('\n\n');
}
