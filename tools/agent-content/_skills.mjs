/**
 * Shared discovery and validation for the vendored skill snapshot.
 *
 * The canonical skills live in the `ndigo-skills` repository. The monorepo
 * keeps a pinned copy under `skills/` so `ndigo ai init` works offline;
 * `sync-skills.mjs` refreshes that copy and records provenance in
 * `skills.lock.json`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Skills stay small so an agent can load one without spending its context. */
const MAX_SKILL_LINES = 120;

/**
 * Reads and validates every `<id>/SKILL.md` directory under `root`.
 *
 * @param root - Directory containing the skill directories.
 * @returns Validated skills, sorted by id.
 */
export function readSkills(root) {
    if (!existsSync(root)) throw new Error(`skills directory not found: ${root}`);
    const ids = readdirSync(root)
        .filter((entry) => statSync(join(root, entry)).isDirectory() && existsSync(join(root, entry, 'SKILL.md')))
        .sort();
    if (ids.length === 0) throw new Error(`no skills found in ${root}`);
    return ids.map((id) => ({ id, content: skillContent(root, id) }));
}

/**
 * Reads and validates one skill file.
 *
 * @param root - Directory containing the skill directories.
 * @param id - Skill directory name.
 * @returns The skill file contents.
 */
export function skillContent(root, id) {
    const file = join(root, id, 'SKILL.md');
    const text = readFileSync(file, 'utf8');
    const match = /^---\n([\s\S]*?)\n---\n/u.exec(text);
    if (match === null) throw new Error(`${file} is missing its frontmatter block`);
    const name = /^name:\s*(.+)$/mu.exec(match[1])?.[1]?.trim();
    if (name !== id) throw new Error(`${file} declares name '${name}', expected '${id}'`);
    if (!/^description:\s*\S/mu.test(match[1])) throw new Error(`${file} is missing a description`);
    const bodyLines = text.split('\n').length;
    if (bodyLines > MAX_SKILL_LINES) {
        throw new Error(`${file} is ${bodyLines} lines; keep skills at or below ${MAX_SKILL_LINES}`);
    }
    return text;
}
