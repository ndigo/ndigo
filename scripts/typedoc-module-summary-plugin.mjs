/**
 * TypeDoc plugin: lift the canonical file-header documentation onto the module
 * reflection, so that `api/<file>/README.md` describes the module without
 * reintroducing `@module`.
 *
 * The file header may carry a multi-paragraph summary followed by block tags
 * (`@remarks`, `@example`, `@see`). All of these are lifted — summary text
 * becomes the module's summary, and block tags become the module's block tags
 * — so module pages can host overviews and cross-cutting examples.
 *
 * It also lifts the package README's blockquote tagline onto the project
 * reflection, so the generated package index (`api/README.md`) opens with the
 * package description. `@packageDocumentation` is not used because TypeDoc
 * ignores it under `entryPointStrategy: expand` (probed 2026-11-06).
 *
 * Ndigo file headers always open with a one-line summary; module files may
 * additionally carry paragraphs, `@remarks`, and `@example` blocks (see
 * STYLE_GUIDE.md §5). Internal (`_*.ts`) files are excluded from generation.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

/**
 * Split a fenced code block fence toggle. Returns true when the line is a
 * fence delimiter.
 *
 * @param {string} line
 * @returns {boolean}
 */
function isFence(line) {
    return /^\s*```/.test(line);
}

/**
 * Parse a file's leading doc block inner text into a summary string and a list
 * of block tags (`{ name, content }`).
 *
 * @param {string} inner
 * @returns {{ summary: string; tags: Array<{ name: string; content: string }> }}
 */
function parseDocBlock(inner) {
    const lines = inner.split('\n').map((l) => l.replace(/^\s*\*\s?/, ''));
    const summaryLines = [];
    const tags = [];
    let currentTag = null;
    let inFence = false;
    let seenTag = false;

    for (const line of lines) {
        if (isFence(line)) {
            inFence = !inFence;
            if (seenTag && currentTag) currentTag.lines.push(line);
            else if (!seenTag) summaryLines.push(line);
            continue;
        }
        const trimmed = line.trim();
        if (!inFence && /^@\w/.test(trimmed)) {
            seenTag = true;
            const parts = trimmed.split(/\s+/);
            const name = parts[0];
            const rest = parts.slice(1).join(' ');
            currentTag = { name, lines: rest ? [rest] : [] };
            tags.push(currentTag);
            continue;
        }
        if (seenTag && currentTag) {
            currentTag.lines.push(line);
        } else if (!seenTag) {
            summaryLines.push(line);
        }
    }

    const summary = summaryLines.join('\n').trim();
    const parsedTags = tags
        .map((t) => ({
            name: t.name,
            content: t.lines.join('\n').trim(),
        }))
        .filter((t) => t.content.length > 0 || t.name === '@example');

    return { summary, tags: parsedTags };
}

/** @param {import('typedoc').Application} app */
export function load(app) {
    const typedoc = require('typedoc');
    const Comment = typedoc.Comment;
    const CommentTag = typedoc.CommentTag;
    app.converter.on('end', (context) => {
        const project = context.project;
        if (!project || (project.comment && project.comment.summary && project.comment.summary.length)) return;
        // oxlint-disable-next-line @ndigo/no-string-token-lookup -- TypeDoc's Application.options is an option bag (getValue/setValue), not the Ndigo registry.
        const entryPoints = app.options.getValue('entryPoints') || [];
        if (!entryPoints.length) return;
        let readme;
        try {
            readme = readFileSync(join(dirname(entryPoints[0]), 'README.md'), 'utf8');
        } catch {
            return;
        }
        const tagline = readme
            .split('\n')
            .map((line) => line.trim())
            .find((line) => line.startsWith('> '));
        if (!tagline) return;
        project.comment = new Comment([{ kind: 'text', text: tagline.slice(2).trim() }]);
    });
    app.converter.on('createDeclaration', (context, reflection) => {
        if (!reflection || reflection.kind !== 2) return; // 2 = Module
        const src = reflection.sources && reflection.sources[0];
        if (!src) return;
        const fileName = src.fullFileName || src.fileName;
        if (!fileName) return;
        let text;
        try {
            text = readFileSync(fileName, 'utf8');
        } catch {
            return;
        }
        const m = /^\s*\/\*\*([\s\S]*?)\*\//.exec(text);
        if (!m) return;
        const { summary, tags } = parseDocBlock(m[1]);
        if (!summary && tags.length === 0) return;
        // Keep an existing richer comment (e.g. TypeDoc-resolved) if it already
        // has both a summary and block tags; otherwise prefer the parsed header.
        if (
            reflection.comment &&
            reflection.comment.summary &&
            reflection.comment.summary.length &&
            reflection.comment.blockTags &&
            reflection.comment.blockTags.length >= tags.length &&
            tags.length === 0
        ) {
            return;
        }
        const summaryParts = summary ? [{ kind: 'text', text: summary }] : [];
        const blockTags = tags.map((t) => new CommentTag(t.name, [{ kind: 'text', text: t.content }]));
        reflection.comment = new Comment(summaryParts, blockTags);
    });
}
