/**
 * Coerces a configured port value from the environment namespace.
 */
/**
 * Coerces a configured `server.port` value — a JSON number or numeric string —
 * to an integer port, returning `undefined` when absent or non-numeric so the
 * caller falls back to its own default. Range validation is deferred to
 * {@link HTTPServer}, which fails fast on an out-of-bounds value rather than
 * silently binding the wrong port.
 */
export function configuredPort(value: unknown): number | undefined {
    if (value === undefined || value === null) return undefined;
    const port = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(port) ? port : undefined;
}
