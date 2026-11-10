/**
 * Internal factory for the script-fronting commands (`build`, `test`,
 * `lint`, `format`, `typecheck`): five commands that differ only in the
 * declared script they run and their help text (review REV-013). The
 * shared `dir` positional lives here too so new script-fronting commands
 * cannot drift from it.
 */
import { buildCommand } from '@stricli/core';
import { captureAppOnce, resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';
import { jsonFlag, writeJson } from './_json.js';

/**
 * The application-directory positional every command that addresses an app
 * shares: `dir` with the working directory as default.
 */
export const appDirPositional = {
    parse: (value: string): string => value,
    brief: 'Application directory (default: current directory).',
    default: '.',
    placeholder: 'dir',
} as const;

/**
 * Builds the Stricli command that runs one of the app's declared scripts
 * and propagates its exit code.
 *
 * @param scriptKey - The `scripts.<key>` to front.
 * @param brief - The one-line help brief.
 * @param hint - The missing-script hint shown when the script is absent.
 * @returns The Stricli command definition.
 */
export function createScriptFrontCommand(scriptKey: string, brief: string, hint: string) {
    return buildCommand({
        async func(_flags: {}, dir: string) {
            const resolved = resolveAppDir(dir);
            process.exitCode = await runAppOnce(resolved, scriptKey, hint);
        },
        parameters: {
            flags: {},
            positional: {
                kind: 'tuple',
                parameters: [appDirPositional],
            },
        },
        docs: { brief },
    });
}

/**
 * Builds a script front whose `--json` captures the app script's streams as
 * one document (`{ target, exitCode, stdout, stderr }`). The human path is
 * identical to {@link createScriptFrontCommand}.
 *
 * @param scriptKey - The `scripts.<key>` to front.
 * @param brief - The one-line help brief.
 * @param hint - The missing-script hint shown when the script is absent.
 * @returns The Stricli command definition.
 */
export function createJsonScriptFrontCommand(scriptKey: string, brief: string, hint: string) {
    return buildCommand({
        async func(flags: { json?: boolean }, dir: string) {
            const resolved = resolveAppDir(dir);
            if (flags.json === true) {
                const result = await captureAppOnce(resolved, scriptKey, hint);
                writeJson({ target: scriptKey, ...result });
                process.exitCode = result.exitCode;
                return;
            }
            process.exitCode = await runAppOnce(resolved, scriptKey, hint);
        },
        parameters: {
            flags: { json: jsonFlag },
            positional: {
                kind: 'tuple',
                parameters: [appDirPositional],
            },
        },
        docs: { brief },
    });
}
