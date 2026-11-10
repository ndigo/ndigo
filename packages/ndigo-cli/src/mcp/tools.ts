/**
 * Tool implementations behind `ndigo mcp`: the application manifest,
 * diagnostics, logs, script targets, best-practice docs, and recorded rules.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectDiagnostics } from '../commands/_diagnostics.js';
import { captureAppOnce, usageError } from '../helpers/app-scripts.js';
import { readLogTail, resolveLogFile } from '../helpers/log-tail.js';

/** The `scripts.inspect` hint, identical to `ndigo inspect` (AD-70). */
const INSPECT_HINT =
    'add an "inspect" script that builds and prints the manifest, e.g. "inspect": "tsx src/inspect.ts" (AD-70)';

/** A manifest route, projected from `@ndigo/inspect` v1. */
export interface AppRoute {
    readonly name: string;
    readonly path: string;
}

/** A manifest configuration key, projected from `@ndigo/inspect` v1. */
export interface AppConfigEntry {
    readonly key: string;
    readonly type?: string;
    readonly origin?: string;
    readonly hasValue: boolean;
}

/** The parts of the `@ndigo/inspect` v1 manifest the CLI consumes. */
export interface AppManifest {
    readonly version: number;
    readonly app?: { readonly name?: string; readonly profiles?: readonly string[] };
    readonly routes: readonly AppRoute[];
    readonly config: readonly AppConfigEntry[];
}

/** Per-server application context; the manifest is built once and cached. */
export interface AppToolContext {
    /** The application directory (absolute). */
    readonly dir: string;
    /** The application manifest, built by `scripts.inspect`. */
    manifest(): Promise<AppManifest>;
}

/**
 * Creates the tool context for one server. A failed manifest build is not
 * cached, so a later call can succeed after the application is fixed.
 *
 * @param dir - The application directory (absolute).
 * @returns The context shared by every manifest-derived tool.
 */
export function createAppToolContext(dir: string): AppToolContext {
    let pending: Promise<AppManifest> | undefined;
    return {
        dir,
        manifest() {
            pending ??= loadManifest(dir).catch((error: unknown) => {
                pending = undefined;
                throw error;
            });
            return pending;
        },
    };
}

async function loadManifest(dir: string): Promise<AppManifest> {
    const result = await captureAppOnce(dir, 'inspect', INSPECT_HINT);
    if (result.exitCode !== 0) {
        const detail = result.stderr.trim() || result.stdout.trim();
        throw usageError(`"inspect" exited with code ${result.exitCode}${detail === '' ? '' : `: ${detail}`}`);
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(result.stdout);
    } catch {
        const detail = result.stderr.trim();
        throw usageError(`"inspect" did not print a JSON manifest on stdout${detail === '' ? '' : `: ${detail}`}`);
    }
    if (!likeManifest(parsed)) {
        throw usageError('"inspect" printed JSON that is not an inspect manifest (version, routes, config)');
    }
    return parsed;
}

function likeManifest(value: unknown): value is AppManifest {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate['version'] === 'number' &&
        Array.isArray(candidate['routes']) &&
        Array.isArray(candidate['config'])
    );
}

/**
 * Returns the application manifest exactly as `scripts.inspect` printed it.
 *
 * @param context - The application context.
 * @returns The manifest.
 */
export async function getManifest(context: AppToolContext): Promise<AppManifest> {
    return context.manifest();
}

/**
 * Returns the declarative routes from the manifest.
 *
 * @param context - The application context.
 * @returns The route list.
 */
export async function getRoutes(context: AppToolContext): Promise<{ routes: readonly AppRoute[] }> {
    return { routes: (await context.manifest()).routes };
}

/**
 * Returns the declared configuration keys. Values are never part of the
 * manifest, so they cannot leak through this tool.
 *
 * @param context - The application context.
 * @returns The value-free configuration entries.
 */
export async function getConfigKeys(context: AppToolContext): Promise<{ keys: readonly AppConfigEntry[] }> {
    return { keys: (await context.manifest()).config };
}

/** One section of a best-practice document. */
export interface PracticeSection {
    readonly title: string;
    readonly content: string;
}

/** Request for {@link getBestPractices}. */
export interface PracticeRequest {
    /** Case-insensitive heading filter. Omit for the section index. */
    readonly topic?: string;
}

/**
 * Renders `STYLE_GUIDE.md` and `ARCHITECTURE.md` sections. Without a topic
 * this is an index (titles only); with one, the matching bodies are returned.
 *
 * @param context - The application context (document discovery starts here).
 * @param request - The optional topic filter.
 * @returns The source paths and selected sections.
 */
export async function getBestPractices(
    context: AppToolContext,
    request: PracticeRequest = {}
): Promise<{ sources: readonly string[]; sections: readonly PracticeSection[] }> {
    const docs = findDocs(context.dir);
    if (docs === undefined) {
        throw usageError(
            'Ndigo best-practice docs not found — run inside the Ndigo workspace, or set NDIGO_DOCS_DIR ' +
                'to the directory containing STYLE_GUIDE.md and ARCHITECTURE.md'
        );
    }
    const topic = request.topic?.toLowerCase();
    const sections = docs
        .flatMap((doc) => sectionsOf(doc.text))
        .filter((section) => topic === undefined || section.title.toLowerCase().includes(topic))
        .map((section) => ({ title: section.title, content: topic === undefined ? '' : section.content }));
    return { sources: docs.map((doc) => doc.path), sections };
}

interface DocSource {
    readonly path: string;
    readonly text: string;
}

function findDocs(start: string): DocSource[] | undefined {
    const candidates = [process.env['NDIGO_DOCS_DIR'], start, dirname(fileURLToPath(import.meta.url))];
    for (const candidate of candidates) {
        if (candidate === undefined) continue;
        let current = candidate;
        for (;;) {
            const style = join(current, 'STYLE_GUIDE.md');
            const architecture = join(current, 'ARCHITECTURE.md');
            if (existsSync(style) && existsSync(architecture)) {
                return [
                    { path: style, text: readFileSync(style, 'utf8') },
                    { path: architecture, text: readFileSync(architecture, 'utf8') },
                ];
            }
            const parent = dirname(current);
            if (parent === current) break;
            current = parent;
        }
    }
    return undefined;
}

function sectionsOf(text: string): PracticeSection[] {
    const sections: PracticeSection[] = [];
    let title = '';
    let body: string[] = [];
    const flush = (): void => {
        if (title !== '') sections.push({ title, content: body.join('\n').trim() });
    };
    for (const line of text.split('\n')) {
        if (line.startsWith('## ')) {
            flush();
            title = line.slice(3).trim();
            body = [];
        } else if (title !== '') {
            body.push(line);
        }
    }
    flush();
    return sections;
}

/**
 * Collects the environment and workspace diagnostics for the application.
 *
 * @param context - The application context.
 * @returns The printable rows, failures, and exit code.
 */
export async function getDiagnostics(context: AppToolContext) {
    const report = await collectDiagnostics(context.dir);
    return {
        ok: report.failures.length === 0,
        exitCode: report.failures.length === 0 ? 0 : 1,
        rows: report.rows,
        failures: report.failures,
    };
}

/** Request for {@link getLogs}. */
export interface LogRequest {
    /** Log path override (defaults to `<dir>/logs/app.log`). */
    readonly file?: string;
    /** Number of tail lines (default 50). */
    readonly lines?: number;
}

/**
 * Returns the tail of the application log file.
 *
 * @param context - The application context.
 * @param request - The path override and line count.
 * @returns The resolved path and retained text.
 */
export async function getLogs(context: AppToolContext, request: LogRequest = {}) {
    const file = resolveLogFile(context.dir, request.file);
    if (!existsSync(file)) {
        throw usageError(`log file not found: ${file}`);
    }
    const lines = request.lines ?? 50;
    return { file, lines, content: readLogTail(file, lines) };
}

const TARGET_HINTS = {
    build: 'add a "build" script to package.json',
    test: 'add a "test" script to package.json',
    lint: 'add a "lint" script to package.json',
} as const;

/** The app scripts `run_target` can front. */
export type AppTarget = keyof typeof TARGET_HINTS;

/**
 * Runs one of the application's build, test, or lint scripts and captures
 * its output.
 *
 * @param context - The application context.
 * @param request - The target script to run.
 * @returns The target, its exit code, and captured output.
 */
export async function runTarget(context: AppToolContext, request: { readonly target: AppTarget }) {
    const result = await captureAppOnce(context.dir, request.target, TARGET_HINTS[request.target]);
    return { target: request.target, ...result };
}

/** Request for {@link recordRule}. */
export interface RuleRequest {
    /** Human-readable rule name; also the source of the file slug. */
    readonly name: string;
    /** The rule text. */
    readonly rule: string;
    /** Replace an existing rule file (default false). */
    readonly replace?: boolean;
}

/**
 * Writes one rule to `.ndigo/rules/<slug>.md` and regenerates the index.
 *
 * @param context - The application context.
 * @param request - The rule name, text, and overwrite choice.
 * @returns The written paths relative to the application directory.
 */
export async function recordRule(context: AppToolContext, request: RuleRequest) {
    const name = request.name.trim();
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, '-')
        .replace(/^-+|-+$/gu, '');
    if (slug === '') {
        throw usageError('rule name must contain at least one letter or digit');
    }
    const rulesDir = join(context.dir, '.ndigo', 'rules');
    const file = join(rulesDir, `${slug}.md`);
    if (existsSync(file) && request.replace !== true) {
        throw usageError(`refusing to overwrite ${relative(context.dir, file)} (pass replace:true)`);
    }
    mkdirSync(rulesDir, { recursive: true });
    writeFileSync(file, `# ${name}\n\n${request.rule.trim()}\n`);
    writeRuleIndex(rulesDir);
    return {
        path: relative(context.dir, file),
        index: relative(context.dir, join(rulesDir, 'INDEX.md')),
    };
}

function writeRuleIndex(rulesDir: string): void {
    const entries = readdirSync(rulesDir)
        .filter((entry) => entry.endsWith('.md') && entry !== 'INDEX.md')
        .sort()
        .map((entry) => `- [${ruleTitle(join(rulesDir, entry), entry)}](${entry})`);
    const body = entries.length === 0 ? '' : `${entries.join('\n')}\n`;
    writeFileSync(join(rulesDir, 'INDEX.md'), `# Application rules\n\n${body}`);
}

function ruleTitle(file: string, fallback: string): string {
    const firstLine = readFileSync(file, 'utf8').split('\n', 1)[0] ?? '';
    return firstLine.startsWith('# ') ? firstLine.slice(2).trim() : fallback.replace(/\.md$/u, '');
}
