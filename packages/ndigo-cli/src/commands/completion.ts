/**
 * `ndigo completion` — print a shell completion script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
// Derived from the shared route-list source of truth (src/commands/_routes.ts):
// the hand-maintained copy that used to live here drifted the moment the
// wave-2/3 commands landed (review REV-011, issue #148).
import { COMPLETION_WORDS } from './_routes.js';

export const completionCommand = buildCommand({
    async func(flags: { shell?: string }) {
        const shell = flags.shell ?? 'bash';
        if (shell !== 'bash') {
            process.stderr.write(`Unsupported shell: ${shell} (only bash for now).\n`);
            process.exitCode = 2;
            return;
        }
        process.stdout.write(
            `# ndigo bash completion\n_ndigo() {\n  local cur="\${COMP_WORDS[COMP_CWORD]}"\n  COMPREPLY=( $(compgen -W "${COMPLETION_WORDS.join(' ')}" -- "$cur") )\n}\ncomplete -F _ndigo ndigo\n`
        );
    },
    parameters: {
        flags: {
            shell: { kind: 'parsed', parse: (v: string) => v, brief: 'Shell (bash).', optional: true },
        },
        positional: { kind: 'tuple', parameters: [] },
    },
    docs: { brief: 'Print a shell completion script' },
});
