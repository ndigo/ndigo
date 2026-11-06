/**
 * Generator that adds/replaces the canonical Ndigo documentation header
 * (a summary-only TSDoc block) on a source file.
 *
 * Ndigo follows the TSDoc standard: the file header carries only a one-line
 * module summary — no `@since`, `@author`, or other tags.
 */
import { type Tree } from '@nx/devkit';

/**
 * Options for the `header` generator: the target file, the summary, and
 * `force` to replace an existing top-of-file block instead of failing.
 */
export interface HeaderGeneratorSchema {
    /** Target file path (src or test). */
    file: string;
    /** One-line summary used as the description in the doc header. */
    summary?: string;
    /** Replace an existing top-of-file doc block instead of failing. */
    force?: boolean;
}

/**
 * Inputs for `buildDocHeader`: the optional one-line summary placed before
 * the tags.
 */
export interface DocHeaderOptions {
    /** Optional one-line summary placed before the tags. */
    summary?: string;
}

/**
 * Builds the canonical Ndigo documentation header block, trailing newline
 * included. The block opens with `slash-star-star` and closes with
 * `star-slash`, and carries only the module summary:
 *
 *   `/**`
 *   ` * <summary>.`
 *   (closing delimiter)
 *
 *
 * No `@module` tag: TypeDoc derives each module's name from its entry-point
 * path, and a package-wide tag collapses every file of the package into one
 * module (or, worse, into `README-1.md`…`README-N.md` duplicates). No tags:
 * Ndigo follows the TSDoc standard, which defines no version/author tags.
 */
export function buildDocHeader(options: DocHeaderOptions): string {
    const { summary } = options;
    const lines: string[] = ['/**'];
    if (summary) {
        lines.push(` * ${summary.trimEnd().replace(/\n+/g, ' ')}.`);
    }
    lines.push(' */');
    return `${lines.join('\n')}\n`;
}

/** Extracts a leading TSDoc block (slash-star-star … star-slash), or null when absent. */
export function getTopDocBlock(content: string): string | null {
    const match = content.match(/^\s*\/\*\*[\s\S]*?\*\//);
    return match ? match[0] : null;
}

/**
 * Standardizes the top-of-file documentation block of a source file to the
 * Ndigo canonical shape (summary-only). Idempotent: files that already carry
 * a doc block are left untouched unless --force is passed.
 */
export default async function headerGenerator(tree: Tree, schema: HeaderGeneratorSchema): Promise<void> {
    const content = tree.read(schema.file, 'utf-8');
    if (content === null) {
        throw new Error(`File not found: ${schema.file}`);
    }

    const existing = getTopDocBlock(content);
    if (existing !== null && !schema.force) {
        throw new Error(
            `${schema.file} already has a top-of-file doc block. Pass --force to replace it with the standard header.`
        );
    }

    const header = buildDocHeader({ summary: schema.summary });

    const rest = existing !== null ? content.slice(existing.length) : content;
    const body = rest.trimStart();
    tree.write(schema.file, `${header}${body}${body.endsWith('\n') ? '' : '\n'}`);
}
