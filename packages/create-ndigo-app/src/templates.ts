/**
 * Template resolution and substitution for the scaffold.
 *
 * Templates live under `templates/<kind>/` and use `{{key}}` placeholders
 * (distinct from the `${...}` template literals that appear in the
 * generated TypeScript, so the two never collide).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppKind, ScaffoldOptions } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Absolute path to the templates root shipped with the package.
 *
 * @returns The absolute `templates/` directory.
 */
export function templatesRoot(): string {
    return resolve(__dirname, '..', 'templates');
}

/**
 * Absolute path to the template directory for a kind.
 *
 * @param kind - The application kind.
 * @returns The absolute template directory for `kind`.
 */
export function kindTemplateDir(kind: AppKind): string {
    return join(templatesRoot(), kind);
}

/**
 * Substitution variables derived from the scaffold options.
 *
 * @param options - The scaffold options.
 * @returns The `{{key}}` substitution map.
 */
export function templateVars(options: ScaffoldOptions): Record<string, string | number> {
    const className = toPascal(options.name);
    const camelName = className.charAt(0).toLowerCase() + className.slice(1);
    return {
        name: options.name,
        className,
        camelName,
        upperName: options.name.toUpperCase(),
        entryMethod: `${camelName}Controller`,
        description: options.description,
        port: options.port,
    };
}

/** PascalCase conversion for slugs (`todo-widget` → `TodoWidget`). */
function toPascal(slug: string): string {
    return slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

/**
 * Replaces `{{key}}` placeholders; unknown keys are left untouched.
 *
 * @param content - The template content.
 * @param vars - The substitution map.
 * @returns The content with known placeholders replaced.
 */
export function substitute(content: string, vars: Record<string, string | number>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
        if (!(key in vars)) return match;
        return String(vars[key]);
    });
}

/**
 * Recursively copies a template tree into `targetDir`, applying `{{...}}`
 * substitution to file contents and `__name__` substitution to file names.
 * Strips a trailing `.template` suffix.
 *
 * @param kind - The application kind whose template tree is copied.
 * @param targetDir - The destination directory.
 * @param vars - The `{{key}}` substitution map.
 * @returns Nothing; writes the tree to disk.
 */
export function copyTemplate(kind: AppKind, targetDir: string, vars: Record<string, string | number>): void {
    const src = kindTemplateDir(kind);
    if (!existsSync(src)) {
        throw new Error(`Template directory not found: ${src}`);
    }
    copyDir(src, targetDir, vars);
}

function copyDir(srcDir: string, destDir: string, vars: Record<string, string | number>): void {
    mkdirSync(destDir, { recursive: true });
    for (const entry of readdirSync(srcDir)) {
        const srcPath = join(srcDir, entry);
        const stat = statSync(srcPath);
        if (stat.isDirectory()) {
            copyDir(srcPath, join(destDir, entry), vars);
            continue;
        }
        let destName = entry;
        if (destName.includes('__name__')) {
            destName = destName.replace(/__name__/g, String(vars.name));
        }
        if (destName.endsWith('.template')) {
            destName = destName.slice(0, -'.template'.length);
        }
        const raw = readFileSync(srcPath, 'utf8');
        const content = substitute(raw, vars);
        writeFileSync(join(destDir, destName), content, 'utf8');
    }
}
