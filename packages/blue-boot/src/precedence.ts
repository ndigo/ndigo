/**
 * Canonical ordered list of property-source names from HIGHEST to LOWEST.
 * * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
export const PRECEDENCE = [
    'commandLine', // --key=value (highest)
    'boot', // ApplicationBuilder.properties(...)
    'systemEnvironment', // process.env snapshot
    'configServer', // remote config source (AD-29 Wave 3, D-7)
    'dotenv', // .env file
    'application', // application.json + application-{profile}.json (deep-merged)
    'defaults', // always present, empty when unused (lowest)
] as const;

export type PrecedenceSource = (typeof PRECEDENCE)[number];
