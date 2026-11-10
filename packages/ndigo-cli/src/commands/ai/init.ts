/**
 * `ndigo ai:init` — write the version-matched agent context.
 */
import { buildCommand } from '@stricli/core';
import { appDirPositional } from '../_script-fronts.js';
import { runAgentApply } from './_apply.js';
import type { AgentApplyFlags } from './_apply.js';

/**
 * The agent-context initialization command.
 */
export const aiInitCommand = buildCommand({
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
    docs: { brief: 'Write AGENTS.md rules, skills, and optional MCP wiring' },
});
