/**
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type Tree } from '@nx/devkit';
import { basename } from 'node:path';

export interface HeaderGeneratorSchema {
    /** Target file path (src or test). */
    file: string;
    /** Module name for the `@module` tag; inferred from the file path when omitted. */
    module?: string;
    /** One-line summary used as the description in the doc header. */
    summary?: string;
    /** Value for the `@author` tag (defaults to `Jeff Rose`). */
    author?: string;
    /** Replace an existing top-of-file doc block instead of failing. */
    force?: boolean;
}

export interface DocHeaderOptions {
    /** Module name for the `@module` tag (e.g. `blue-core`). */
    module: string;
    /** Optional one-line summary placed before the tags. */
    summary?: string;
    /** Author value for the `@author` tag. */
    author?: string;
    /** Since-version stamp for the `@since` tag. */
    since?: string;
}

/**
 * Builds the canonical BlueJS documentation header block, trailing newline
 * included. The block opens with `slash-star-star` and closes with
 * `star-slash`:
 *
 *   ` * @module <module>`
 *   ` * @since 1.0.0`
 *   ` * @author Jeff Rose`
 *   ` * @author` may be omitted when the file-level author equals the
 *   repository default.
 */
export function buildDocHeader(options: DocHeaderOptions): string {
    const { module, summary, author = 'Jeff Rose', since = '1.0.0' } = options;
    const lines: string[] = ['/**'];
    if (summary) {
        lines.push(` * ${summary.trimEnd().replace(/\n+/g, ' ')}.`);
        lines.push(' *');
    }
    lines.push(` * @module ${module}`);
    lines.push(` * @since ${since}`);
    lines.push(` * @author ${author}`);
    lines.push(' */');
    return `${lines.join('\n')}\n`;
}

/** Extracts a leading TSDoc block (slash-star-star … star-slash), or null when absent. */
export function getTopDocBlock(content: string): string | null {
    const match = content.match(/^\s*\/\*\*[\s\S]*?\*\//);
    return match ? match[0] : null;
}

/**
 * Derives the module name from a file path: the `blue-*` package directory
 * for package sources, the app directory for apps, else the file basename.
 */
export function inferModule(file: string): string {
    const parts = file.split('/');
    const packagesIndex = parts.indexOf('packages');
    if (packagesIndex >= 0 && parts[packagesIndex + 1]?.startsWith('blue-')) {
        return parts[packagesIndex + 1];
    }
    const appsIndex = parts.indexOf('apps');
    if (appsIndex >= 0 && parts[appsIndex + 1]) {
        return parts[appsIndex + 1];
    }
    return basename(file).replace(/\.(ts|mjs|js)$/, '');
}

/**
 * Standardizes the top-of-file documentation block of a source file to the
 * BlueJS canonical shape (@module, @since, @author tags). Idempotent: files
 * that already carry a doc block are left untouched unless --force is passed.
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

    const header = buildDocHeader({
        module: schema.module ?? inferModule(schema.file),
        summary: schema.summary,
        author: schema.author ?? 'Jeff Rose',
    });

    const rest = existing !== null ? content.slice(existing.length) : content;
    const body = rest.trimStart();
    // Intentionally no formatFiles: the header is canonical by construction,
    // and the formatting hook pulls in the classic TypeScript API that the
    // TypeScript 7 runtime no longer exposes.
    tree.write(schema.file, `${header}${body}${body.endsWith('\n') ? '' : '\n'}`);
}
