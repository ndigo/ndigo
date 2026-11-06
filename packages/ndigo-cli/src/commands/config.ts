/**
 * `ndigo config` — get/set/list app-level config keys.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const CONFIG_FILE = '.ndigorc.json';

function readConfig(): Record<string, unknown> {
    if (!existsSync(CONFIG_FILE)) return {};
    try {
        return JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as Record<string, unknown>;
    } catch {
        return {};
    }
}

export const configCommand = buildCommand({
    async func(flags: { list?: boolean }, action: string, key: string, value: string) {
        const cfg = readConfig();
        if (flags.list || action === 'list' || action === undefined) {
            for (const [k, v] of Object.entries(cfg)) process.stdout.write(`${k}=${JSON.stringify(v)}\n`);
            return;
        }
        if (action === 'get') {
            process.stdout.write(`${JSON.stringify(cfg[key])}\n`);
            return;
        }
        if (action === 'set') {
            cfg[key] = value;
            writeFileSync(CONFIG_FILE, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
            process.stdout.write(`set ${key}\n`);
            return;
        }
        process.stderr.write(`Unknown config action: ${action}\n`);
        process.exitCode = 2;
    },
    parameters: {
        flags: { list: { kind: 'boolean', brief: 'List all config keys.', optional: true } },
        positional: {
            kind: 'tuple',
            parameters: [
                { parse: (v: string) => v, brief: 'Action: get|set|list.', default: 'list', placeholder: 'action' },
                { parse: (v: string) => v, brief: 'Config key.', default: '', placeholder: 'key' },
                { parse: (v: string) => v, brief: 'Value (for set).', default: '', placeholder: 'value' },
            ],
        },
    },
    docs: { brief: 'Get/set/list app-level config keys (.ndigorc.json)' },
});
