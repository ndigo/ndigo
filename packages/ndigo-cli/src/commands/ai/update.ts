/**
 * `ndigo ai:update` — refresh the agent context after a framework update.
 */
import { buildCommand } from '@stricli/core';
import { appDirPositional } from '../_script-fronts.js';
import { runAgentApply } from './_apply.js';
import type { AgentApplyFlags } from './_apply.js';

/**
 * The agent-context refresh command.
 */
export const aiUpdateCommand = buildCommand({
    async func(flags: AgentApplyFlags, dir: string) {
        await runAgentApply(flags, dir);
    },
    parameters: {
        flags: {
            'dry-run': { kind: 'boolean', brief: 'Print the plan without writing.', optional: true },
            force: { kind: 'boolean', brief: 'Replace generated files whose content drifted.', optional: true },
            skills: { kind: 'boolean', brief: 'Write skills only (skip the instruction file).', optional: true },
            mcp: { kind: 'boolean', brief: 'Merge the ndigo server into .mcp.json.', optional: true },
            'instruction-file': {
                kind: 'parsed',
                parse: (value: string) => value,
                brief: 'Instruction file (default: AGENTS.md).',
                optional: true,
            },
        },
        positional: { kind: 'tuple', parameters: [appDirPositional] },
    },
    docs: { brief: 'Refresh AGENTS.md rules and skills from the installed CLI' },
});
