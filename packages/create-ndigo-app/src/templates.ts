/**
 * Template resolution, substitution, and the file-write plan for the scaffold.
 *
 * Templates live under `templates/<kind>/` and use `{{key}}` placeholders
 * (distinct from the `${...}` template literals that appear in the
 * generated TypeScript, so the two never collide).
 *
 * The scaffold resolves a complete {@link PlannedFile} list before writing
 * anything: the template tree contributes its entries and the optional
 * `--ui` pointer appends its own, so no conditional file becomes a second
 * copy of registry content under `templates/`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AppKind, PlannedFile, ScaffoldOptions } from './types.js';

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
        // `--ui` owns the stylesheet, so the entry module imports it only then.
        // The leading newline keeps the unset case free of a blank line.
        uiStylesImport: options.ui ? "\nimport './styles.css';" : '',
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
 * Resolves the template tree for a kind into a file plan, applying `{{...}}`
 * substitution to file contents and `__name__` substitution to file names.
 * Strips a trailing `.template` suffix. Reads only; writes nothing.
 *
 * @param kind - The application kind whose template tree is planned.
 * @param vars - The `{{key}}` substitution map.
 * @returns One entry per template file, in directory order.
 */
export function planTemplate(kind: AppKind, vars: Record<string, string | number>): PlannedFile[] {
    const src = kindTemplateDir(kind);
    if (!existsSync(src)) {
        throw new Error(`Template directory not found: ${src}`);
    }
    const plan: PlannedFile[] = [];
    walk(src, '', vars, plan);
    return plan;
}

function walk(srcDir: string, prefix: string, vars: Record<string, string | number>, plan: PlannedFile[]): void {
    for (const entry of readdirSync(srcDir)) {
        const srcPath = join(srcDir, entry);
        const stat = statSync(srcPath);
        if (stat.isDirectory()) {
            walk(srcPath, join(prefix, entry), vars, plan);
            continue;
        }
        let destName = entry;
        if (destName.includes('__name__')) {
            destName = destName.replace(/__name__/g, String(vars.name));
        }
        if (destName.endsWith('.template')) {
            destName = destName.slice(0, -'.template'.length);
        }
        const content = substitute(readFileSync(srcPath, 'utf8'), vars);
        const template = join(prefix, entry).split('\\').join('/');
        plan.push({ destination: join(prefix, destName), content, template });
    }
}

/**
 * Writes a resolved plan into `targetDir`, creating directories as needed.
 *
 * @param targetDir - The destination directory.
 * @param plan - The resolved file plan.
 * @returns Nothing; writes the plan to disk.
 */
export function applyPlan(targetDir: string, plan: readonly PlannedFile[]): void {
    for (const file of plan) {
        const destination = join(targetDir, file.destination);
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, file.content, 'utf8');
    }
}
