/**
 * Declared `@column({ type })` classification shared by the Zod schema mapping
 * (`baseSchemaForType`) and the Drizzle-backed SQLite storage mapping
 * (`sqliteTypeForColumnType`), so both agree on which declared types are
 * integer-, real-, blob-, boolean-, json- and text-like.
 */

/**
 * The broad family a declared column type belongs to. `unknown` covers both an
 * omitted type and any type outside the recognized families.
 */
export type ColumnTypeFamily = 'integer' | 'real' | 'blob' | 'boolean' | 'json' | 'text' | 'date' | 'unknown';

/**
 * Word tokens that identify each family. Matching is token-based (the declared
 * type is split on non-alphanumeric characters), never substring-based: a type
 * like `point`, `interval` or `print` must not be read as `int` (DAT-N1).
 * Size/precision suffixes (`varchar(255)`, `numeric(10, 2)`, `int unsigned`)
 * fall away with the split.
 */
const FAMILY_TOKENS: Record<Exclude<ColumnTypeFamily, 'unknown'>, readonly string[]> = {
    integer: ['int', 'integer', 'bigint', 'smallint', 'tinyint', 'mediumint', 'int2', 'int4', 'int8'],
    real: ['real', 'float', 'double'],
    blob: ['blob'],
    boolean: ['bool', 'boolean'],
    json: ['json', 'jsonb'],
    text: ['text', 'char', 'character', 'varchar', 'nvarchar', 'string', 'clob'],
    date: ['date', 'datetime', 'timestamp'],
};

/** Families in match precedence order. */
const FAMILY_ORDER: ReadonlyArray<Exclude<ColumnTypeFamily, 'unknown'>> = [
    'integer',
    'real',
    'blob',
    'boolean',
    'json',
    'text',
    'date',
];

/**
 * Classifies a declared column type into its {@link ColumnTypeFamily} using
 * whole-word matching, so unrelated types (`point`, `interval`) are not
 * mistaken for `int`.
 *
 * @param type - The declared column type; `undefined` for untyped columns.
 * @returns The matched family, or `'unknown'` when no family applies.
 */
export function columnTypeFamily(type: string | undefined): ColumnTypeFamily {
    const words = (type ?? '')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 0);

    for (const family of FAMILY_ORDER) {
        const tokens = FAMILY_TOKENS[family];
        if (words.some((word) => tokens.includes(word))) {
            return family;
        }
    }

    return 'unknown';
}
