/**
 * Canonical ordered list of property-source names from HIGHEST to LOWEST
 * precedence (Q7, AD-13).
 *
 * The precedence doctrine is a spec artifact: this constant is the single
 * source of truth the doc table references and the integration test asserts
 * the wired registry order equals. If a new source is added or the order
 * changes, update this list, the docs, and the test together — drift here is
 * a failing spec, not a surprise.
 *
 * The `application` source holds the deep-merged config files (base +
 * active-profile variants); the `*` markers denote the profile-internal
 * merge that precedes as one source.
 */
export const PRECEDENCE = [
    'commandLine', // --key=value (highest)
    'boot', // ApplicationBuilder.properties(...)
    'systemEnvironment', // process.env snapshot
    'dotenv', // .env file
    'application', // application.json + application-{profile}.json (deep-merged)
    'defaults', // always present, empty when unused (lowest)
] as const;

export type PrecedenceSource = (typeof PRECEDENCE)[number];
