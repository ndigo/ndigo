/**
 * TypeDoc plugin: lift the canonical file-header summary (the first non-empty
 * line of the leading doc block) onto the module reflection, so that
 * `api/<file>/README.md` describes the module without reintroducing `@module`.
 *
 * It also lifts the package README's blockquote tagline onto the project
 * reflection, so the generated package index (`api/README.md`) opens with the
 * package description. `@packageDocumentation` is not used because TypeDoc
 * ignores it under `entryPointStrategy: expand` (probed 2026-11-06).
 *
 * Ndigo file headers carry only a one-line summary (no tags) per STYLE_GUIDE §5.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

/** @param {import('typedoc').Application} app */
export function load(app) {
    const typedoc = require('typedoc');
    const Comment = typedoc.Comment;
    app.converter.on('end', (context) => {
        const project = context.project;
        if (!project || (project.comment && project.comment.summary && project.comment.summary.length)) return;
        // oxlint-disable-next-line @ndigo/no-string-registry-lookup -- TypeDoc's Application.options is an option bag (getValue/setValue), not the Ndigo registry.
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
        if (reflection.comment && reflection.comment.summary && reflection.comment.summary.length) return;
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
        const lines = m[1]
            .split('\n')
            .map((l) => l.replace(/^\s*\*\s?/, '').trim())
            .filter(Boolean);
        const summary = lines.find((l) => !l.startsWith('@'));
        if (!summary) return;
        reflection.comment = new Comment([{ kind: 'text', text: summary }]);
    });
}
