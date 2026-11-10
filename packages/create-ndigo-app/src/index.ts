/**
 * `create-ndigo-app` — scaffold a standalone Ndigo application.
 */
import {
    appendFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    rmSync,
    writeFileSync,
    readFileSync,
    realpathSync,
} from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { promptChoice, promptLine } from './prompts.js';
import { applyPlan, planTemplate, templateVars } from './templates.js';
import { UI_AGENTS_SECTION, UI_NEXT_STEP, planUiPointer } from './ui-pointer.js';
import type { AppKind, PlannedFile } from './types.js';

const VALID_KINDS: readonly AppKind[] = ['browser', 'node'];

interface ParsedArgs {
    name?: string;
    kind?: AppKind;
    description?: string;
    port?: number;
    targetDir?: string;
    yes: boolean;
    local: boolean;
    force: boolean;
    agents?: boolean;
    ui?: boolean;
    help: boolean;
    version: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
    const result: ParsedArgs = { yes: false, local: false, force: false, help: false, version: false };
    let i = 0;
    while (i < argv.length) {
        const token = argv[i];
        if (token === '--kind') {
            result.kind = argv[++i] as AppKind;
        } else if (token === '--name') {
            result.name = argv[++i];
        } else if (token === '--description') {
            result.description = argv[++i];
        } else if (token === '--port') {
            result.port = Number(argv[++i]);
        } else if (token === '--dir') {
            result.targetDir = argv[++i];
        } else if (token === '--yes' || token === '-y') {
            result.yes = true;
        } else if (token === '--local') {
            result.local = true;
        } else if (token === '--force') {
            result.force = true;
        } else if (token === '--agents') {
            result.agents = true;
        } else if (token === '--no-agents') {
            result.agents = false;
        } else if (token === '--ui') {
            result.ui = true;
        } else if (token === '--no-ui') {
            result.ui = false;
        } else if (token === '--help' || token === '-h') {
            result.help = true;
        } else if (token === '--version') {
            result.version = true;
        } else if (token.startsWith('--')) {
            throw new Error(`Unknown flag: ${token}`);
        } else if (result.targetDir === undefined && (token.includes('/') || token.includes('\\\\'))) {
            // A path-like positional is the target directory; the name derives
            // from its basename.
            result.targetDir = token;
        } else if (result.name === undefined) {
            result.name = token;
        } else {
            throw new Error(`Unexpected argument: ${token}`);
        }
        i++;
    }
    return result;
}

function toKebab(slug: string): string {
    return slug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

function isNonEmpty(dir: string): boolean {
    if (!existsSync(dir)) return false;
    return readdirSync(dir).length > 0;
}

function rewriteLocalDeps(targetDir: string): void {
    const manifestPath = join(targetDir, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
    };
    const rewrite = (deps: Record<string, string> | undefined) => {
        if (!deps) return;
        for (const [name, version] of Object.entries(deps)) {
            if (name.startsWith('@ndigo/') && version === '~0.0.1') {
                // Dev mode: workspace link only resolves when the scaffolded app
                // is a member of this pnpm workspace (see the printed hint).
                // `file:` links cannot be used pre-publish because workspace
                // packages declare `catalog:` specifiers that are only resolved
                // by `pnpm publish` (F-28).
                deps[name] = 'workspace:*';
            }
        }
    };
    rewrite(manifest.dependencies);
    rewrite(manifest.devDependencies);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function addUiDependency(targetDir: string): void {
    const manifestPath = join(targetDir, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        dependencies?: Record<string, string>;
    };
    const dependencies = { ...manifest.dependencies, '@ndigo/ui': '~0.0.1' };
    manifest.dependencies = Object.fromEntries(
        Object.entries(dependencies).sort(([left], [right]) => left.localeCompare(right))
    );
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

function printNextSteps(targetDir: string, kind: AppKind, agents: boolean, ui: boolean): void {
    console.log(`\nScaffolded ${kind} app at ${targetDir}\n`);
    console.log('Next steps:');
    console.log(`  cd ${targetDir}`);
    console.log('  pnpm install');
    if (kind === 'node') {
        console.log('  pnpm start   # or: pnpm test');
    } else {
        console.log('  pnpm dev     # or: pnpm test');
    }
    console.log('  pnpm test');
    if (ui) console.log(`  ${UI_NEXT_STEP}`);
    if (!agents) console.log('  ndigo ai:init   # add agent context (AGENTS.md + skills)');
}

/**
 * Resolves and constrains a scaffold target directory to the current working
 * directory. Symlinks are rejected, so the resolved path can neither escape the
 * caller's project root nor escape a non-directory target.
 *
 * @param targetDir - User-supplied target path.
 * @returns The canonical absolute target directory.
 * @throws On path escapes, symlinks, and non-directory targets.
 */
function ensureSafeTargetDir(targetDir: string): string {
    const absolute = resolve(targetDir);
    const cwd = process.cwd();
    const relativePath = relative(cwd, absolute);
    if (relativePath.startsWith('..') && relativePath !== '') {
        throw new Error(`create-ndigo-app: target directory must be inside cwd — received ${absolute}`);
    }
    if (existsSync(absolute)) {
        const stat = lstatSync(absolute);
        if (stat.isSymbolicLink()) {
            throw new Error(`create-ndigo-app: refusing to write through a symlink: ${absolute}`);
        }
        if (!stat.isDirectory()) {
            throw new Error(`create-ndigo-app: target directory is a file: ${absolute}`);
        }
        if (realpathSync(absolute) !== absolute) {
            throw new Error(`create-ndigo-app: refusing to scaffold into a reassigned path: ${absolute}`);
        }
    }
    return absolute;
}

/**
 * Scaffolds a standalone Ndigo application.
 *
 * @param argv - The raw CLI arguments (flags + positional name).
 * @returns The process exit code (0 success, 1 runtime failure, 2 usage error).
 *
 * @example
 * ```ts
 * const code = await scaffold(['my-app', '--kind', 'node', '--yes']);
 * process.exitCode = code;
 * ```
 */
export async function scaffold(argv: string[]): Promise<number> {
    let parsed: ParsedArgs;
    try {
        parsed = parseArgs(argv);
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }

    if (parsed.help) {
        console.log(`create-ndigo-app — scaffold a standalone Ndigo application

Usage: create-ndigo-app [name|target-dir] [options]

Options:
  --kind <node|browser>   Application kind (default: node, or browser with --ui)
  --name <slug>           App slug (kebab-case)
  --description <text>    One-line description
  --port <n>              Dev port (default: 3000)
  --dir <path>            Target directory
  --yes, -y               Accept defaults without prompting
  --local                 Rewrite @ndigo/* deps to workspace:* links (dev mode)
  --force                 Overwrite a non-empty target directory
  --agents                Write the AGENTS.md agent bootstrap (default: on)
  --no-agents             Skip the agent bootstrap
  --ui                    Add the Ndigo UI design system (browser kind only; default: off)
  --no-ui                 Skip the design-system pointer
  --help, -h              Show this help
  --version               Show version
`);
        return 0;
    }
    if (parsed.version) {
        console.log('create-ndigo-app 0.0.1');
        return 0;
    }

    let name = parsed.name;
    if (process.env.CREATE_NDIGO_APP_LOCAL === '1' || process.env.CREATE_NDIGO_APP_LOCAL === 'true') {
        parsed.local = true;
    }

    if (name === undefined && parsed.targetDir !== undefined) {
        const base = parsed.targetDir.split(/[/\\]/).filter(Boolean).pop() ?? '';
        name = toKebab(base) || 'ndigo-app';
    }
    try {
        if (name === undefined) {
            if (parsed.yes) {
                name = 'ndigo-app';
            } else {
                name = await promptLine('App name (kebab-case)', 'ndigo-app');
            }
        }
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }
    name = toKebab(name ?? '');
    if (name.length === 0) {
        console.error('create-ndigo-app: an app name is required');
        return 2;
    }
    if (!/^[a-z]/.test(name)) {
        console.error('create-ndigo-app: app name must start with a letter');
        return 2;
    }

    if (parsed.ui === true && parsed.kind === 'node') {
        console.error('create-ndigo-app: --ui requires --kind browser');
        return 2;
    }

    let kind = parsed.kind;
    try {
        if (kind === undefined) {
            if (parsed.ui === true) {
                // `--ui` is browser-only; implying the kind keeps the flag usable
                // on its own instead of erroring on the node default.
                kind = 'browser';
            } else if (parsed.yes) {
                kind = 'node';
            } else {
                kind = await promptChoice('App kind', ['node', 'browser'] as const, 'node');
            }
        }
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }
    if (!VALID_KINDS.includes(kind)) {
        console.error(`create-ndigo-app: --kind must be one of ${VALID_KINDS.join(', ')}`);
        return 2;
    }

    let agents: boolean;
    try {
        agents =
            parsed.agents ??
            (parsed.yes
                ? true
                : (await promptChoice('Agent context (AGENTS.md)', ['yes', 'no'] as const, 'yes')) === 'yes');
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }

    let ui: boolean;
    try {
        ui =
            parsed.ui ??
            (kind !== 'browser'
                ? false
                : parsed.yes
                  ? false
                  : (await promptChoice('Add the Ndigo UI design system?', ['yes', 'no'] as const, 'no')) === 'yes');
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }

    let description: string;
    try {
        description =
            parsed.description ??
            (parsed.yes
                ? `${toPascal(name)} — Ndigo demo application`
                : await promptLine('Description', `${toPascal(name)} — Ndigo demo application`));
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }

    const port = parsed.port ?? 3000;
    if (!Number.isInteger(port) || port < 0 || port > 65_535) {
        console.error(`create-ndigo-app: invalid port ${port}`);
        return 2;
    }

    const targetDir = ensureSafeTargetDir(parsed.targetDir ?? `./${name}`);
    if (isNonEmpty(targetDir) && !parsed.force) {
        console.error(`create-ndigo-app: target directory is not empty: ${targetDir} (use --force to overwrite)`);
        return 1;
    }

    if (isNonEmpty(targetDir) && parsed.force) {
        const forbidden =
            targetDir === '/' ||
            targetDir === resolve(process.env.HOME ?? '/') ||
            targetDir.includes(`${sep}node_modules`) ||
            targetDir.endsWith('.git');
        if (forbidden) {
            console.error(`create-ndigo-app: refusing to overwrite protected path: ${targetDir}`);
            return 1;
        }
        rmSync(targetDir, { recursive: true, force: true });
    }
    mkdirSync(targetDir, { recursive: true });

    const vars = templateVars({
        name,
        kind,
        description,
        port,
        targetDir,
        yes: parsed.yes,
        local: parsed.local,
        force: parsed.force,
        agents,
        ui,
    });
    try {
        const plan: PlannedFile[] = planTemplate(kind, vars);
        if (ui) plan.push(...planUiPointer());
        applyPlan(targetDir, plan);
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 1;
    }
    if (!agents) {
        rmSync(join(targetDir, 'AGENTS.md'), { force: true });
    } else if (ui) {
        appendFileSync(join(targetDir, 'AGENTS.md'), UI_AGENTS_SECTION, 'utf8');
    }

    try {
        if (ui) addUiDependency(targetDir);
        if (parsed.local) rewriteLocalDeps(targetDir);
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 1;
    }
    if (parsed.local) {
        console.log('  (dev mode: @ndigo/* rewritten to workspace:* — run pnpm install from the workspace root,');
        console.log('   with this directory added to pnpm-workspace.yaml or placed under apps/.)');
    }

    printNextSteps(targetDir, kind, agents, ui);
    return 0;
}

function toPascal(slug: string): string {
    return slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
