/**
 * The machine-readable command index: types, route-map collection, and the
 * registry that `buildCliApp` records for `ndigo commands` and the MCP
 * `get_commands` tool.
 */
import type { CommandContext, RouteMap } from '@stricli/core';

/** The CLI-wide exit-code contract every command follows. */
export interface CommandExitCodes {
    /** Success. */
    readonly ok: 0;
    /** Usage error (bad flag, missing argument, unknown action). */
    readonly usage: 2;
    /** Runtime failure. */
    readonly runtime: 1;
}

/** The shared exit-code contract. */
export const CLI_EXIT_CODES: CommandExitCodes = { ok: 0, usage: 2, runtime: 1 };

/** One flag of a command. */
export interface CommandFlagIndex {
    /** Flag name without the `--` prefix. */
    readonly name: string;
    /** Stricli flag kind: boolean, counter, enum, or parsed. */
    readonly kind: string;
    /** One-line help text. */
    readonly brief: string;
    /** Whether the flag may be omitted. */
    readonly optional: boolean;
    /** Default value, when declared. */
    readonly default?: unknown;
    /** Allowed values for an enum flag. */
    readonly values?: readonly string[];
    /** Value placeholder for the usage line. */
    readonly placeholder?: string;
    /** Variadic flag separator (`true` when space-separated). */
    readonly variadic?: boolean | string;
}

/** One positional parameter of a command. */
export interface CommandPositionalIndex {
    /** Placeholder name (`dir`, `action`, …). */
    readonly name: string;
    /** One-line help text. */
    readonly brief: string;
    /** Whether the parameter may be omitted. */
    readonly optional: boolean;
    /** Default value, when declared. */
    readonly default?: string;
    /** Explicit placeholder, when declared. */
    readonly placeholder?: string;
    /** `true` for an array positional. */
    readonly variadic?: boolean;
    /** Minimum entries for an array positional. */
    readonly minimum?: number;
    /** Maximum entries for an array positional. */
    readonly maximum?: number;
}

/** One command in the index. */
export interface CommandIndexEntry {
    /** Space-joined verb path, e.g. `db status`. */
    readonly command: string;
    /** Verb path segments. */
    readonly path: readonly string[];
    /** One-line help text. */
    readonly brief: string;
    /** Declared flags, in definition order. */
    readonly flags: readonly CommandFlagIndex[];
    /** Declared positional parameters, in definition order. */
    readonly positionals: readonly CommandPositionalIndex[];
    /** The exit-code contract for the command. */
    readonly exitCodes: CommandExitCodes;
}

/** The full command index. */
export interface CommandIndex {
    /** Commands in route-map order. */
    readonly commands: readonly CommandIndexEntry[];
}

interface FlagShape {
    readonly kind: string;
    readonly brief: string;
    readonly optional?: boolean;
    readonly default?: unknown;
    readonly values?: readonly string[];
    readonly placeholder?: string;
    readonly variadic?: boolean | string;
    readonly hidden?: boolean;
}

interface PositionalShape {
    readonly brief: string;
    readonly placeholder?: string;
    readonly default?: string;
    readonly optional?: boolean;
}

interface TuplePositionals {
    readonly kind: 'tuple';
    readonly parameters: readonly PositionalShape[];
}

interface ArrayPositionals {
    readonly kind: 'array';
    readonly parameter: PositionalShape;
    readonly minimum?: number;
    readonly maximum?: number;
}

interface CommandShape {
    readonly brief: string;
    readonly parameters: {
        readonly flags?: Readonly<Record<string, FlagShape>>;
        readonly positional?: TuplePositionals | ArrayPositionals;
    };
}

interface RouteEntryShape {
    readonly name: { readonly original: string };
    readonly target: unknown;
    readonly hidden: boolean;
}

interface RouteMapShape {
    readonly getAllEntries: () => readonly RouteEntryShape[];
}

/** Narrows a routing target to a command by its parameter block. */
function likeCommand(target: unknown): target is CommandShape {
    if (typeof target !== 'object' || target === null) return false;
    if (!('parameters' in target) || !('brief' in target)) return false;
    return typeof target.parameters === 'object' && target.parameters !== null && typeof target.brief === 'string';
}

/** Narrows a routing target to a nested route map by its enumerator. */
function likeRouteMap(target: unknown): target is RouteMapShape {
    return (
        typeof target === 'object' &&
        target !== null &&
        'getAllEntries' in target &&
        typeof target.getAllEntries === 'function'
    );
}

/**
 * Derives the command index from the built route map: every visible command,
 * its flags and positionals as Stricli resolved them, and the exit contract.
 *
 * @param root - The root route map registered on the application.
 * @returns The index, in route-map order.
 */
export function collectCommandIndex(root: RouteMap<CommandContext>): CommandIndex {
    const commands: CommandIndexEntry[] = [];
    walk(root, [], commands);
    return { commands };
}

function walk(routeMap: RouteMapShape, prefix: readonly string[], out: CommandIndexEntry[]): void {
    for (const entry of routeMap.getAllEntries()) {
        if (entry.hidden) continue;
        const path = [...prefix, entry.name.original];
        if (likeRouteMap(entry.target)) {
            walk(entry.target, path, out);
        } else if (likeCommand(entry.target)) {
            out.push(toEntry(entry.target, path));
        }
    }
}

function toEntry(command: CommandShape, path: readonly string[]): CommandIndexEntry {
    const flags = Object.entries(command.parameters.flags ?? {})
        .filter(([, flag]) => flag.hidden !== true)
        .map(([name, flag]) => toFlag(name, flag));
    return {
        command: path.join(' '),
        path,
        brief: command.brief,
        flags,
        positionals: toPositionals(command.parameters.positional),
        exitCodes: CLI_EXIT_CODES,
    };
}

function toFlag(name: string, flag: FlagShape): CommandFlagIndex {
    return {
        name,
        kind: flag.kind,
        brief: flag.brief,
        optional: flag.optional === true,
        ...(flag.default === undefined ? {} : { default: flag.default }),
        ...(flag.values === undefined ? {} : { values: flag.values }),
        ...(flag.placeholder === undefined ? {} : { placeholder: flag.placeholder }),
        ...(flag.variadic === undefined || flag.variadic === false ? {} : { variadic: flag.variadic }),
    };
}

function toPositionals(positional: TuplePositionals | ArrayPositionals | undefined): CommandPositionalIndex[] {
    if (positional === undefined) return [];
    if (positional.kind === 'array') {
        return [
            {
                name: positional.parameter.placeholder ?? 'args',
                brief: positional.parameter.brief,
                optional: true,
                variadic: true,
                ...(positional.minimum === undefined ? {} : { minimum: positional.minimum }),
                ...(positional.maximum === undefined ? {} : { maximum: positional.maximum }),
            },
        ];
    }
    return positional.parameters.map((parameter, index) => ({
        name: parameter.placeholder ?? `arg${index + 1}`,
        brief: parameter.brief,
        optional: parameter.optional === true || parameter.default !== undefined,
        ...(parameter.default === undefined ? {} : { default: parameter.default }),
        ...(parameter.placeholder === undefined ? {} : { placeholder: parameter.placeholder }),
    }));
}

let current: CommandIndex | undefined;

/**
 * Records the index for the current application.
 *
 * @param index - The index derived from the built route map.
 */
export function setCommandIndex(index: CommandIndex): void {
    current = index;
}

/**
 * Returns the recorded index, failing when no application has been built.
 *
 * @returns The recorded index.
 */
export function requireCommandIndex(): CommandIndex {
    if (current === undefined) {
        throw new Error('command index is unavailable — build the CLI application first');
    }
    return current;
}
