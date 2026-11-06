/**
 * The `ndigo db generate` decision logic — pure, so the destructive/silent-
 * failure gates are unit-testable without running the script (REV-002,
 * REV-006). `db-generate.ts` is the thin IO shell around it.
 *
 * Two gates block generation until the operator acknowledges them:
 * 1. **destructive drops** (`delta.drops`, REV-006) — an entity rename or
 *    removal would otherwise render `DROP TABLE IF EXISTS` / `DROP COLUMN`
 *    into a migration without review;
 * 2. **unexpressible changes** (`delta.unsupported`, REV-002) — previously
 *    these printed a stderr WARNING and exited 0 while the snapshot still
 *    advanced, so type/nullability edits silently diverged the DB from the
 *    entities (and the CI freshness gate could not see it, because a
 *    second run was a byte-identical no-op).
 */
import { diffProjections, nextMigrationVersion, type SchemaSnapshot } from '@ndigo/orm-drizzle';

/**
 * The generation plan: the migration file to write (when the delta has
 * writeable statements) plus the warnings the operator must see.
 */
export interface GeneratePlan {
    /** The next free migration version. */
    version: number;
    /** The filename slug (description normalized; empty when nothing is written). */
    slug: string;
    /** The SQL statements for the migration body. */
    statements: string[];
    /** The human summary used as the migration description. */
    description: string;
    /** The warnings to surface on stderr (accepted drops + unexpressible changes). */
    warnings: string[];
}

/**
 * Raised by {@link planGeneration} when the delta needs an explicit
 * acknowledgment the operator has not given. The message names the
 * `NDIGO_DB_ACCEPT_*` escape hatch; a blocked generate exits non-zero, so
 * neither CI nor a developer can miss the pending hand-work.
 */
export class GenerationBlockedError extends Error {
    /** The statements/changes that triggered the block. */
    readonly warnings: readonly string[];

    /**
     * @param message - The block reason and the environment-flag escape hatch.
     * @param warnings - The destructive/unexpressible statements.
     */
    constructor(message: string, warnings: readonly string[]) {
        super(message);
        this.warnings = warnings;
    }
}

/**
 * Options for {@link planGeneration} — the acknowledgment flags default to
 * blocked.
 */
export interface GeneratePlanOptions {
    /** The migrations directory, for the next free version (scaffold contract). */
    dir: string;
    /** Acknowledges the destructive `DROP` statements (`NDIGO_DB_ACCEPT_DROPS`). */
    acceptDrops?: boolean;
    /** Acknowledges changes the predicate cannot express (`NDIGO_DB_ACCEPT_UNSUPPORTED`). */
    acceptUnsupported?: boolean;
}

/**
 * Plans the next migration from the entity projection: diffs against the
 * committed snapshot, applies the acknowledgment gates, and derives the
 * next version + filename slug. Never throws for a *clean* delta — a
 * no-op run returns empty statements and a fresh-`dir`-derived version.
 *
 * @param snapshot - The committed projection, or `null` when none exists.
 * @param projection - The current projection (from `projectEntities`).
 * @param options - The directory and acknowledgment flags.
 * @returns The plan.
 * @throws {GenerationBlockedError} When drops or unexpressible changes have
 *   not been acknowledged.
 */
export async function planGeneration(
    snapshot: SchemaSnapshot | null,
    projection: SchemaSnapshot,
    options: GeneratePlanOptions
): Promise<GeneratePlan> {
    const delta = diffProjections(snapshot, projection);

    if (delta.drops.length > 0 && !options.acceptDrops) {
        throw new GenerationBlockedError(
            `db:generate blocked: ${delta.drops.length} destructive DROP statement(s) — ` +
                `review them (${delta.drops[0]} …) and re-run with NDIGO_DB_ACCEPT_DROPS=true to include them`,
            delta.drops
        );
    }
    if (delta.unsupported.length > 0 && !options.acceptUnsupported) {
        throw new GenerationBlockedError(
            `db:generate blocked: ${delta.unsupported.length} schema change(s) the predicate cannot express — ` +
                'hand-write this migration; re-run with NDIGO_DB_ACCEPT_UNSUPPORTED=true ' +
                '(the snapshot still advances)',
            delta.unsupported
        );
    }

    const version = await nextMigrationVersion(options.dir);
    return {
        version,
        slug: delta.description
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
        statements: delta.statements,
        description: delta.description,
        warnings: [...delta.unsupported, ...(options.acceptDrops ? delta.drops : [])],
    };
}
