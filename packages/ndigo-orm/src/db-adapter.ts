/**
 * Database-adapter abstraction (AD-96): the contract `@ndigo/cli`'s
 * `db *` commands talk to, plus the in-app runner that dispatches them.
 *
 * The ORM package defines the contract; concrete engines
 * (`@ndigo/orm-drizzle`, future `@ndigo/orm-*`) implement it. The CLI depends
 * on this module only, never on a specific engine.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/** Status of a single migration in the journal. */
export type MigrationStatus = {
    version: number;
    description: string;
    applied: boolean;
    appliedAt?: Date;
};

/** Engine-agnostic database adapter used by `ndigo db *`. */
export interface NdigoDatabaseAdapter {
    /** Stable, unique name used for selection (`--db <name>`). */
    readonly name: string;

    /** Human-readable engine label, e.g. "Drizzle (libSQL)". */
    readonly engine: string;

    /** Apply pending migrations. */
    migrate(): Promise<void>;

    /** Generate the next migration from entity metadata. */
    generate(): Promise<void>;

    /** Report applied/pending migration state. */
    status(): Promise<MigrationStatus[]>;

    /** Push schema directly to the database (dev convenience). */
    push?(): Promise<void>;

    /** Pull schema from the database into entity metadata. */
    pull?(): Promise<void>;

    /** Launch an interactive database browser. */
    studio?(): Promise<void>;

    /** Run seed data. */
    seed?(): Promise<void>;

    /** Roll back the last (or N) applied migration. */
    rollback?(count?: number): Promise<void>;

    /** Close connections / release resources. */
    close?(): Promise<void>;
}

const SUPPORTED_ACTIONS = [
    'list',
    'migrate',
    'generate',
    'status',
    'push',
    'pull',
    'studio',
    'seed',
    'rollback',
] as const;

type DbAction = (typeof SUPPORTED_ACTIONS)[number];

/**
 * Parses `--db <name>` out of an argv, returning the name (if any) and the
 * remaining argv.
 */
function extractDbFlag(argv: string[]): { db?: string; rest: string[] } {
    const rest: string[] = [];
    let db: string | undefined;
    for (let i = 0; i < argv.length; i++) {
        const token = argv[i];
        if (token === '--db' || token === '--adapter') {
            db = argv[++i];
            continue;
        }
        if (token.startsWith('--db=') || token.startsWith('--adapter=')) {
            db = token.slice(token.indexOf('=') + 1);
            continue;
        }
        rest.push(token);
    }
    return { db, rest };
}

function printUsage(registry: Record<string, NdigoDatabaseAdapter>): void {
    const names = Object.keys(registry);
    process.stdout.write('Usage: ndigo db <action> [--db <name>]\n\n');
    process.stdout.write('Actions: ' + SUPPORTED_ACTIONS.join(', ') + '\n');
    if (names.length > 0) {
        process.stdout.write('Adapters: ' + names.join(', ') + '\n');
    }
}

/**
 * In-app runner used by `ndigo db *`. Resolves the adapter for the requested
 * (or default) database, invokes the action, and returns a process exit code.
 *
 * Selection rules:
 *  - `--db <name>` wins.
 *  - Otherwise the configured default.
 *  - Otherwise, if exactly one adapter is registered, it is used.
 *  - Otherwise (multiple, no default) fail with exit code 2 listing names.
 */
export async function runDbCommand(
    registry: Record<string, NdigoDatabaseAdapter>,
    defaultName: string | undefined,
    argv: string[]
): Promise<number> {
    const { db: requested, rest } = extractDbFlag(argv);
    const action = rest[0] as DbAction | undefined;
    const actionArgs = rest.slice(1);

    const names = Object.keys(registry);

    if (action === 'list' || (action === undefined && rest.length === 0)) {
        if (names.length === 0) {
            process.stdout.write('No database adapters registered.\n');
            return 0;
        }
        process.stdout.write('Registered database adapters:\n');
        for (const name of names) {
            const adapter = registry[name];
            const marker = name === defaultName ? ' (default)' : '';
            process.stdout.write(`  ${name} — ${adapter.engine}${marker}\n`);
        }
        if (action === undefined) {
            printUsage(registry);
            return 2;
        }
        return 0;
    }

    if (!action || !(SUPPORTED_ACTIONS as readonly string[]).includes(action)) {
        process.stderr.write(`Unknown db action: ${action ?? '(none)'}\n`);
        printUsage(registry);
        return 2;
    }

    // Resolve adapter.
    let selectedName = requested ?? defaultName;
    if (selectedName === undefined) {
        if (names.length === 1) {
            selectedName = names[0];
        } else {
            process.stderr.write(
                `Multiple database adapters registered (${names.join(', ')}); ` + `pass --db <name>.\n`
            );
            return 2;
        }
    }
    const adapter = registry[selectedName];
    if (adapter === undefined) {
        process.stderr.write(`Unknown database adapter '${selectedName}'. Available: ${names.join(', ')}.\n`);
        return 2;
    }

    try {
        switch (action) {
            case 'migrate':
                await adapter.migrate();
                break;
            case 'generate':
                await adapter.generate();
                break;
            case 'status': {
                const rows = await adapter.status();
                for (const row of rows) {
                    process.stdout.write(
                        `${String(row.version).padStart(4, '0')}  ${row.description}  ${row.applied ? 'applied' : 'pending'}\n`
                    );
                }
                break;
            }
            case 'push':
                if (!adapter.push) {
                    process.stderr.write(`'push' is not supported by ${adapter.engine}.\n`);
                    return 2;
                }
                await adapter.push();
                break;
            case 'pull':
                if (!adapter.pull) {
                    process.stderr.write(`'pull' is not supported by ${adapter.engine}.\n`);
                    return 2;
                }
                await adapter.pull();
                break;
            case 'studio':
                if (!adapter.studio) {
                    process.stderr.write(`'studio' is not supported by ${adapter.engine}.\n`);
                    return 2;
                }
                await adapter.studio();
                break;
            case 'seed':
                if (!adapter.seed) {
                    process.stderr.write(`'seed' is not supported by ${adapter.engine}.\n`);
                    return 2;
                }
                await adapter.seed();
                break;
            case 'rollback': {
                if (!adapter.rollback) {
                    process.stderr.write(`'rollback' is not supported by ${adapter.engine}.\n`);
                    return 2;
                }
                const count = actionArgs[0] ? Number(actionArgs[0]) : 1;
                await adapter.rollback(count);
                break;
            }
            default:
                process.stderr.write(`Unhandled db action: ${action}\n`);
                return 2;
        }
    } catch (error) {
        process.stderr.write(`ndigo db ${action} failed: ${(error as Error).message}\n`);
        return 1;
    } finally {
        await adapter.close?.();
    }

    return 0;
}
