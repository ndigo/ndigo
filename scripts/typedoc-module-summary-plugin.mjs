/**
 * TypeDoc plugin: lift the canonical file-header summary (the first non-empty
 * line of the leading doc block) onto the module reflection, so that
 * `api/<file>/README.md` describes the module without reintroducing `@module`.
 *
 * Ndigo file headers carry only a one-line summary (no tags) per STYLE_GUIDE §5.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @param {import('typedoc').Application} app */
export function load(app) {
    const typedoc = require('typedoc');
    const Comment = typedoc.Comment;
    app.converter.on('createDeclaration', (context, reflection) => {
        if (!reflection || reflection.kind !== 2) return; // 2 = Module
        if (reflection.comment && reflection.comment.summary && reflection.comment.summary.length) return;
        const src = reflection.sources && reflection.sources[0];
        if (!src) return;
        const fileName = src.fullFileName || src.fileName;
        if (!fileName) return;
        let text;
        try { text = readFileSync(fileName, 'utf8'); } catch { return; }
        const m = /^\s*\/\*\*([\s\S]*?)\*\//.exec(text);
        if (!m) return;
        const lines = m[1].split('\n').map((l) => l.replace(/^\s*\*\s?/, '').trim()).filter(Boolean);
        const summary = lines.find((l) => !l.startsWith('@'));
        if (!summary) return;
        reflection.comment = new Comment([{ kind: 'text', text: summary }]);
    });
}
