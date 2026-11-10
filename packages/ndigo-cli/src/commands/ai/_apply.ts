/**
 * Shared implementation for `ndigo ai:init` and `ndigo ai:update`.
 */
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { DEFAULT_INSTRUCTION_FILE, applyAgentContent } from './_content.js';

/** Flags shared by init and update. */
export interface AgentApplyFlags {
    /** Print the plan without writing. */
    'dry-run'?: boolean;
    /** Replace generated files whose content drifted. */
    force?: boolean;
    /** Write skills only (skip the instruction file and MCP). */
    skills?: boolean;
    /** Merge the `ndigo` server into `.mcp.json`. */
    mcp?: boolean;
    /** Instruction file, relative to the application directory. */
    'instruction-file'?: string;
}

/**
 * Writes the version-matched agent content into the application.
 *
 * @param flags - Selection and overwrite flags.
 * @param dir - Application directory (positional).
 * @returns A promise that resolves once the files are written.
 */
export async function runAgentApply(flags: AgentApplyFlags, dir: string): Promise<void> {
    const resolved = resolveAppDir(dir);
    const result = applyAgentContent({
        dir: resolved,
        instructionFile: flags['instruction-file'] ?? DEFAULT_INSTRUCTION_FILE,
        skillsOnly: flags.skills === true,
        mcp: flags.mcp === true,
        force: flags.force === true,
        dryRun: flags['dry-run'] === true,
    });
    const prefix = flags['dry-run'] === true ? 'would write' : 'wrote';
    for (const path of result.written) process.stdout.write(`${prefix} ${path}\n`);
    for (const path of result.unchanged) process.stdout.write(`unchanged ${path}\n`);
}
