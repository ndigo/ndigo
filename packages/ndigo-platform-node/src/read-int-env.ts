/**
 * Environment integer parsing shared by the platform-node resolvers (HG-9).
 *
 * The socket limits, socket registry, and managed-server resolvers read
 * integer bounds from env vars with one fail-fast contract: absent or empty
 * means "use the default"; anything else must be an all-digits literal (no
 * sign, whitespace, exponent, or hex) and, unless `allowZero` is set,
 * greater than zero. Invalid values throw a `RangeError` naming the
 * variable, so boot fails fast instead of silently coercing
 * (`Number('') === 0`, `Number(' 80 ') === 80`, `Number('1e3') === 1000`).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Options for {@link readIntEnv}.
 */
export interface ReadIntEnvOptions {
    /** Accept `0` as a valid value (default `false`: the value must be positive). */
    allowZero?: boolean;
}

/**
 * Reads an integer environment variable.
 *
 * @param env - The environment record to read.
 * @param name - The variable name (used in the error message).
 * @param options - `allowZero` to accept `0` (default rejects it).
 * @returns The parsed integer, or `undefined` when unset or empty.
 * @throws {RangeError} When the value is not an allowed integer literal.
 */
export function readIntEnv(
    env: Readonly<Record<string, string | undefined>>,
    name: string,
    options: ReadIntEnvOptions = {}
): number | undefined {
    const raw = env[name];
    if (raw === undefined || raw === '') {
        return undefined;
    }
    if (!/^\d+$/.test(raw)) {
        throw new RangeError(
            `${name} must be ${options.allowZero ? 'a non-negative' : 'a positive'} integer, got: ${raw}`
        );
    }
    const value = Number(raw);
    if (!options.allowZero && value === 0) {
        throw new RangeError(`${name} must be a positive integer, got: ${raw}`);
    }
    return value;
}
