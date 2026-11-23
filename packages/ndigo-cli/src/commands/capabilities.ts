/**
 * `ndigo capabilities` — list, inspect, and validate the installable
 * capabilities and UI registry items a project can add.
 */
import { buildCommand } from '@stricli/core';
import { getCatalogEntry, listCatalog, loadCatalog } from '../capabilities/catalog.js';
import type { CapabilityOp } from '../capabilities/catalog.js';
import { loadCatalogReferences, validateCatalog } from '../capabilities/validate.js';
import { usageError } from '../helpers/app-scripts.js';
import { CLI_EXIT_CODES } from './_command-registry.js';
import { jsonFlag, writeJson } from './_output.js';

/** The actions the single verb accepts. */
const ACTIONS = ['list', 'get', 'check'] as const;

type Action = (typeof ACTIONS)[number];

/**
 * The capability catalog command.
 */
export const capabilitiesCommand = buildCommand({
    async func(flags: { json?: boolean }, action: string, id?: string) {
        if (!ACTIONS.includes(action as Action)) {
            throw usageError(`unknown action '${action}' — use list, get, or check`);
        }
        if (action === 'get') {
            get(flags, id);
            return;
        }
        if (action === 'check') {
            if (id !== undefined) throw usageError('check takes no id — it validates the whole catalog');
            check(flags);
            return;
        }
        if (id !== undefined) throw usageError('list takes no id — use `ndigo capabilities get <id>`');
        list(flags);
    },
    parameters: {
        flags: { json: jsonFlag },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Action: list, get, or check (default: list).',
                    default: 'list',
                    placeholder: 'action',
                },
                {
                    parse: (value: string) => value,
                    brief: 'Capability or item id (get only).',
                    optional: true,
                    placeholder: 'id',
                },
            ],
        },
    },
    docs: { brief: 'List, inspect, and validate installable capabilities' },
});

function list(flags: { json?: boolean }): void {
    const entries = listCatalog();
    if (flags.json === true) {
        writeJson({ version: 1, count: entries.length, entries });
        return;
    }
    for (const entry of entries) {
        const column = entry.install ?? entry.packages?.join(', ') ?? '';
        process.stdout.write(`${entry.id}\t${entry.kind}\t${column}\n`);
    }
}

function get(flags: { json?: boolean }, id: string | undefined): void {
    if (id === undefined) throw usageError('get requires a capability or item id');
    const entry = getCatalogEntry(id);
    if (entry === undefined) throw usageError(`unknown capability or item '${id}'`);

    if (flags.json === true) {
        writeJson({
            ...entry.record,
            ...(entry.install === undefined ? {} : { install: entry.install }),
        });
        return;
    }
    const rows: [string, string][] = [
        ['id', entry.id],
        ['kind', entry.kind],
        ['summary', entry.summary],
    ];
    if (entry.install !== undefined) rows.push(['install', entry.install]);
    if (entry.record.kind === 'capability') {
        rows.push(['guide', entry.record.guide]);
        rows.push(['packages', entry.record.packages.join(', ')]);
        if (entry.record.variables !== undefined) {
            rows.push(['variables', entry.record.variables.map((variable) => variable.name).join(', ')]);
        }
        rows.push(['checks', entry.record.checks.join(', ')]);
        if (entry.record.skill !== undefined) rows.push(['skill', entry.record.skill]);
        rows.push(['ops', entry.record.ops.map(describeOp).join('; ')]);
    } else {
        rows.push(['type', entry.record.type]);
        if (entry.record.categories !== undefined) rows.push(['categories', entry.record.categories.join(', ')]);
    }
    for (const [label, value] of rows) process.stdout.write(`${label}\t${value}\n`);
}

function check(flags: { json?: boolean }): void {
    const catalog = loadCatalog();
    const loaded = loadCatalogReferences();
    const errors = [...loaded.errors, ...validateCatalog(catalog, loaded.references)];
    const valid = errors.length === 0;
    if (flags.json === true) {
        writeJson({
            valid,
            capabilities: catalog.capabilities.length,
            items: catalog.items.length,
            errors,
        });
    } else if (valid) {
        process.stdout.write(`capabilities: ${catalog.capabilities.length}, items: ${catalog.items.length} — ok\n`);
    } else {
        for (const error of errors) process.stderr.write(`✗ ${error}\n`);
    }
    if (!valid) process.exitCode = CLI_EXIT_CODES.runtime;
}

function describeOp(op: CapabilityOp): string {
    switch (op.op) {
        case 'addDependency':
            return `addDependency ${op.packages.join(', ')}`;
        case 'writeFile':
            return `writeFile ${op.template} -> ${op.path}`;
        case 'editJson':
            return `editJson ${op.path}#${op.pointer}`;
    }
}
