/**
 * Consumer agent content: asset loading, marker-block merging, and the
 * plan/apply/check operations behind `ndigo ai:*`.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { usageError } from '../../helpers/app-scripts.js';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'assets', 'agent');

/** Opening marker of the managed AGENTS.md block. */
export const BLOCK_BEGIN = '<!-- BEGIN:ndigo-agent-rules -->';
/** Closing marker of the managed AGENTS.md block. */
export const BLOCK_END = '<!-- END:ndigo-agent-rules -->';
/** Default instruction file, relative to the application directory. */
export const DEFAULT_INSTRUCTION_FILE = 'AGENTS.md';
/** Skills directory, relative to the application directory. */
export const SKILLS_DIR = join('.agents', 'skills');
/** MCP project configuration file, relative to the application directory. */
export const MCP_FILE = '.mcp.json';

/** One generated skill. */
export interface SkillContent {
    /** Skill id (the directory name). */
    readonly id: string;
    /** `SKILL.md` content. */
    readonly content: string;
}

/** The version-matched agent content shipped with this CLI. */
export interface AgentContent {
    /** Managed instructions body. */
    readonly instructions: string;
    /** Compressed docs index. */
    readonly docsIndex: string;
    /** The nine skills. */
    readonly skills: readonly SkillContent[];
}

/** One file the agent-content planner will write. */
export interface PlannedWrite {
    /** Path relative to the application directory. */
    readonly path: string;
    /** Expected content. */
    readonly content: string;
    /** Managed regions are refreshed in place; generated files need `--force` on drift. */
    readonly managed?: boolean;
}

/** Options shared by the init, update, and check operations. */
export interface AgentContentOptions {
    /** Application directory (absolute). */
    readonly dir: string;
    /** Instruction file, relative to `dir`. */
    readonly instructionFile: string;
    /** Write skills only (skip instructions and MCP). */
    readonly skillsOnly: boolean;
    /** Merge the `ndigo` server into `.mcp.json`. */
    readonly mcp: boolean;
    /** Overwrite generated files that differ. */
    readonly force: boolean;
    /** Compute the plan without writing. */
    readonly dryRun: boolean;
}

/** The outcome of an init or update pass. */
export interface ApplyResult {
    /** Files written (or that would be written under `--dry-run`). */
    readonly written: readonly string[];
    /** Files already at the expected content. */
    readonly unchanged: readonly string[];
}

/** The outcome of a check pass. */
export interface CheckResult {
    /** Files at the expected content. */
    readonly current: readonly string[];
    /** Files missing or different from the expected content. */
    readonly stale: readonly string[];
}

/**
 * Loads the agent content shipped next to the compiled CLI.
 *
 * @returns The instructions, docs index, and skills.
 */
export function loadAgentContent(): AgentContent {
    const skillsDir = join(ASSETS, 'skills');
    const skills = readdirSync(skillsDir)
        .filter((entry) => existsSync(join(skillsDir, entry, 'SKILL.md')))
        .sort()
        .map((id) => ({ id, content: readFileSync(join(skillsDir, id, 'SKILL.md'), 'utf8') }));
    return {
        instructions: readFileSync(join(ASSETS, 'instructions.md'), 'utf8'),
        docsIndex: readFileSync(join(ASSETS, 'docs-index.md'), 'utf8'),
        skills,
    };
}

/**
 * Renders the managed block: instructions plus the compressed docs index.
 *
 * @param content - The loaded agent content.
 * @returns The block, without a trailing newline.
 */
export function renderBlock(content: AgentContent): string {
    const index = content.docsIndex.replace(/^<!--[\s\S]*?-->\n/u, '').replace(/^# /mu, '## ');
    return [BLOCK_BEGIN, content.instructions.trim(), '', index.trim(), BLOCK_END].join('\n');
}

/**
 * Inserts or replaces the managed block in an instruction file, preserving
 * everything outside the markers.
 *
 * @param existing - Current file content, or `null` when absent.
 * @param block - The rendered managed block.
 * @returns The file content to write.
 */
export function mergeInstructions(existing: string | null, block: string): string {
    if (existing === null || existing.trim() === '') return `${block}\n`;
    const begin = existing.indexOf(BLOCK_BEGIN);
    const end = existing.indexOf(BLOCK_END);
    if (begin === -1 && end === -1) {
        return `${existing.replace(/\s+$/u, '')}\n\n${block}\n`;
    }
    if (begin === -1 || end === -1 || end < begin) {
        throw usageError(
            'the instruction file has an unmatched ndigo-agent-rules marker — repair the markers, then re-run'
        );
    }
    return `${existing.slice(0, begin)}${block}${existing.slice(end + BLOCK_END.length)}`;
}

/**
 * Merges the `ndigo` server into a `.mcp.json` document, preserving every
 * other key and server.
 *
 * @param existing - Current file content, or `null` when absent.
 * @returns The file content to write.
 */
export function mergeMcpConfig(existing: string | null): string {
    let config: Record<string, unknown> = {};
    if (existing !== null && existing.trim() !== '') {
        let parsed: unknown;
        try {
            parsed = JSON.parse(existing);
        } catch {
            throw usageError(`${MCP_FILE} is not valid JSON — repair it or omit --mcp`);
        }
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw usageError(`${MCP_FILE} must contain a JSON object`);
        }
        config = parsed as Record<string, unknown>; // validated object shape above
    }
    let servers: Record<string, unknown> = {};
    if ('mcpServers' in config) {
        const current = config['mcpServers'];
        if (typeof current !== 'object' || current === null || Array.isArray(current)) {
            throw usageError(`${MCP_FILE} .mcpServers must be a JSON object`);
        }
        servers = current as Record<string, unknown>; // validated object shape above
    }
    servers['ndigo'] = { command: 'ndigo', args: ['mcp', '.'] };
    config['mcpServers'] = servers;
    return `${JSON.stringify(config, null, 2)}\n`;
}

/**
 * Builds the expected writes for the selected content.
 *
 * @param options - Application directory and selection flags.
 * @returns The planned writes, in reporting order.
 */
export function planWrites(options: AgentContentOptions): PlannedWrite[] {
    const content = loadAgentContent();
    const writes: PlannedWrite[] = [];
    if (!options.skillsOnly) {
        const instructionPath = join(options.dir, options.instructionFile);
        const existing = existsSync(instructionPath) ? readFileSync(instructionPath, 'utf8') : null;
        writes.push({
            path: options.instructionFile,
            content: mergeInstructions(existing, renderBlock(content)),
            managed: true,
        });
        if (options.mcp || existsSync(join(options.dir, MCP_FILE))) {
            const mcpPath = join(options.dir, MCP_FILE);
            const mcp = existsSync(mcpPath) ? readFileSync(mcpPath, 'utf8') : null;
            writes.push({ path: MCP_FILE, content: mergeMcpConfig(mcp), managed: true });
        }
    }
    for (const skill of content.skills) {
        writes.push({ path: join(SKILLS_DIR, skill.id, 'SKILL.md'), content: skill.content });
    }
    return writes;
}

/**
 * Applies the agent content, refusing to clobber drifted files without force.
 *
 * @param options - Application directory and selection flags.
 * @returns The written and unchanged paths.
 */
export function applyAgentContent(options: AgentContentOptions): ApplyResult {
    const writes = planWrites(options);
    const written: string[] = [];
    const unchanged: string[] = [];
    const conflicts: string[] = [];

    for (const write of writes) {
        const absolute = join(options.dir, write.path);
        const existing = existsSync(absolute) ? readFileSync(absolute, 'utf8') : null;
        if (existing === write.content) {
            unchanged.push(write.path);
            continue;
        }
        if (existing !== null && options.force !== true && write.managed !== true) conflicts.push(write.path);
        else written.push(write.path);
    }

    if (conflicts.length > 0) {
        throw usageError(
            `refusing to overwrite drifted agent content: ${conflicts.join(', ')} — re-run with --force to replace it`
        );
    }
    if (options.dryRun !== true) {
        for (const write of writes) {
            const absolute = join(options.dir, write.path);
            if (existsSync(absolute) && readFileSync(absolute, 'utf8') === write.content) continue;
            mkdirSync(dirname(absolute), { recursive: true });
            writeFileSync(absolute, write.content, 'utf8');
        }
    }
    return { written, unchanged };
}

/**
 * Compares the expected content with disk without writing.
 *
 * @param options - Application directory and selection flags.
 * @returns The current and stale paths.
 */
export function checkAgentContent(options: AgentContentOptions): CheckResult {
    const writes = planWrites({ ...options, force: false, dryRun: true });
    const current: string[] = [];
    const stale: string[] = [];
    for (const write of writes) {
        const absolute = join(options.dir, write.path);
        if (existsSync(absolute) && readFileSync(absolute, 'utf8') === write.content) current.push(write.path);
        else stale.push(write.path);
    }
    return { current, stale };
}
