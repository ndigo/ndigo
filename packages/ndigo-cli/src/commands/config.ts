/**
 * `ndigo config` — get/set/list app-level config keys.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const CONFIG_FILE = '.ndigorc.json';

// The config store is a null-prototype object: file keys are user-controlled
// and a `__proto__`-shaped key must never reach the prototype chain
// (`Object.assign`'s CopyDataProperties writes own data properties only,
// and null prototypes have nothing to poison — issue #146, review SEC-007).
function readConfig(): Record<string, unknown> {
    const cfg = Object.create(null) as Record<string, unknown>;
    if (existsSync(CONFIG_FILE)) {
        try {
            Object.assign(cfg, JSON.parse(readFileSync(CONFIG_FILE, 'utf8')) as Record<string, unknown>);
        } catch {
            // A broken config file means "empty", not "capital letters everywhere".
        }
    }
    return cfg;
}

/**
 * The app-config get/set/list command.
 */
export const configCommand = buildCommand({
    async func(flags: { list?: boolean }, action: string, key: string, value: string) {
        const cfg = readConfig();
        if (flags.list || action === 'list') {
            for (const [k, v] of Object.entries(cfg)) process.stdout.write(`${k}=${JSON.stringify(v)}\n`);
            return;
        }
        if (action === 'get') {
            // JSON.stringify drops `undefined` (which printed the literal
            // JS word); an absent key renders as the JSON `null` singleton.
            const stored = cfg[key];
            process.stdout.write(`${stored === undefined ? 'null' : JSON.stringify(stored)}\n`);
            return;
        }
        if (action === 'set') {
            // A missing value used to write an empty-string key silently,
            // corrupting the file (issue #146, review REV-015).
            if (value === '') {
                process.stderr.write(`a value is required: ndigo config set ${key} <value>\n`);
                process.exitCode = 2;
                return;
            }
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
