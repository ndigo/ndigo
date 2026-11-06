/**
 * `create-ndigo-app` — scaffold a standalone Ndigo application.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
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
}

function parseArgs(argv: string[]): ParsedArgs {
    const result: ParsedArgs = { yes: false, local: false, force: false };
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
    try {
        return readdirSync(dir).length > 0;
    } catch {
        return false;
    }
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
                deps[name] = 'workspace:*';
            }
        }
    };
    rewrite(manifest.dependencies);
    rewrite(manifest.devDependencies);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 4)}\n`, 'utf8');
}

function printNextSteps(targetDir: string, kind: AppKind): void {
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
}

/**
 * Scaffolds a standalone Ndigo application.
 *
 * @param argv - The raw CLI arguments (flags + positional name).
 * @returns The process exit code (0 success, 1 runtime failure, 2 usage error).
 */
export async function scaffold(argv: string[]): Promise<number> {
    let parsed: ParsedArgs;
    try {
        parsed = parseArgs(argv);
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 2;
    }

    let name = parsed.name;
    if (name === undefined && parsed.targetDir !== undefined) {
        const base = parsed.targetDir.split(/[/\\]/).filter(Boolean).pop() ?? '';
        name = toKebab(base) || 'ndigo-app';
    }
    if (name === undefined) {
        if (parsed.yes) {
            name = 'ndigo-app';
        } else {
            name = await promptLine('App name (kebab-case)', 'ndigo-app');
        }
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
    if (kind === undefined) {
        if (parsed.yes) {
            kind = 'node';
        } else {
            kind = await promptChoice('App kind', ['node', 'browser'] as const, 'node');
        }
    }
    if (!VALID_KINDS.includes(kind)) {
        console.error(`create-ndigo-app: --kind must be one of ${VALID_KINDS.join(', ')}`);
        return 2;
    }

    const description =
        parsed.description ??
        (parsed.yes
            ? `${toPascal(name)} — Ndigo demo application`
            : await promptLine('Description', `${toPascal(name)} — Ndigo demo application`));

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
    });
    try {
        copyTemplate(kind, targetDir, vars);
    } catch (error) {
        console.error(`create-ndigo-app: ${(error as Error).message}`);
        return 1;
    }

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

    printNextSteps(targetDir, kind);
    return 0;
}

function toPascal(slug: string): string {
    return slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}
