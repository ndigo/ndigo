/**
 * `create-ndigo-app` — scaffold a standalone Ndigo application.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { promptChoice, promptLine } from './prompts.js';
import { copyTemplate, templateVars } from './templates.js';
import type { AppKind } from './types.js';

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

function printNextSteps(targetDir: string, kind: AppKind, agents: boolean): void {
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
    if (!agents) console.log('  ndigo ai:init   # add agent context (AGENTS.md + skills)');
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
  --kind <node|browser>   Application kind (default: node)
  --name <slug>           App slug (kebab-case)
  --description <text>    One-line description
  --port <n>              Dev port (default: 3000)
  --dir <path>            Target directory
  --yes, -y               Accept defaults without prompting
  --local                 Rewrite @ndigo/* deps to file: links (dev mode)
  --force                 Overwrite a non-empty target directory
  --agents                Write the AGENTS.md agent bootstrap (default: on)
  --no-agents             Skip the agent bootstrap
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

    let kind = parsed.kind;
    try {
        if (kind === undefined) {
            if (parsed.yes) {
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

    const targetDir = resolve(parsed.targetDir ?? `./${name}`);
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
    });
    try {
        copyTemplate(kind, targetDir, vars);
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 1;
    }
    if (!agents) rmSync(join(targetDir, 'AGENTS.md'), { force: true });

    if (parsed.local) {
        try {
            rewriteLocalDeps(targetDir);
        } catch (error) {
            console.error(`create-ndigo-app: ${(error as Error).message}`);
            return 1;
        }
        console.log('  (dev mode: @ndigo/* rewritten to workspace:* — run pnpm install from the workspace root,');
        console.log('   with this directory added to pnpm-workspace.yaml or placed under apps/.)');
    }

    printNextSteps(targetDir, kind, agents);
    return 0;
}

function toPascal(slug: string): string {
    return slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
