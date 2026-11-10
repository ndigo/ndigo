/**
 * `ndigo ai:check` — fail when the generated agent content is stale.
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { appDirPositional } from '../_script-fronts.js';
import { checkAgentContent, DEFAULT_INSTRUCTION_FILE } from './_content.js';

/**
 * The agent-content staleness check.
 */
export const aiCheckCommand = buildCommand({
    async func(flags: { 'instruction-file'?: string }, dir: string) {
        const resolved = resolveAppDir(dir);
        const result = checkAgentContent({
            dir: resolved,
            instructionFile: flags['instruction-file'] ?? DEFAULT_INSTRUCTION_FILE,
            skillsOnly: false,
            mcp: false,
            force: false,
            dryRun: true,
        });
        if (result.stale.length > 0) {
            for (const path of result.stale) process.stdout.write(`stale ${path}\n`);
            process.stdout.write('run `ndigo ai:update --force` to regenerate the agent content\n');
            process.exitCode = 1;
            return;
        }
        process.stdout.write(`agent content current (${result.current.length} files)\n`);
    },
    parameters: {
        flags: {
            'instruction-file': {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Instruction file (default: AGENTS.md).',
                optional: true,
            },
        },
        positional: { kind: 'tuple', parameters: [appDirPositional] },
    },
    docs: { brief: 'Fail when the generated AGENTS.md rules or skills are stale' },
});
