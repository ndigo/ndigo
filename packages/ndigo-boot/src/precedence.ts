/**
 * Canonical ordered list of property-source names from HIGHEST to LOWEST.
 */
export const PRECEDENCE = [
    'commandLine', // --key=value (highest)
    'boot', // ApplicationBuilder.properties(...)
    'systemEnvironment', // process.env snapshot
    'configServer', // remote config source
    'dotenv', // .env file
    'application', // application.json + application-{profile}.json (deep-merged)
    'defaults', // always present, empty when unused (lowest)
] as const;

/**
 * The name of one property source in `PRECEDENCE` order — `commandLine`,
 * `boot`, `systemEnvironment`, `configServer`, `dotenv`, `application`,
 * `defaults`. Used to attribute a resolved value to the source that won.
 *
 * @example
 * ```ts
 * type _Alias = PrecedenceSource;
 * ```
 */
export type PrecedenceSource = (typeof PRECEDENCE)[number];
