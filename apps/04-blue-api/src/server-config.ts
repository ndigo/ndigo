/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configurationProperties } from '@blue/boot';
import { ContextToken } from '@blue/context';
import { z } from 'zod';

/**
 * Type-safe handle for the bound `ServerConfig` bean (AD-34 D1). The bean is
 * auto-registered as `serverConfig` by `ApplicationBuilder`; consumers
 * resolve it with the token instead of the string.
 */
export const SERVER_CONFIG = new ContextToken<ServerConfig>('serverConfig');

/**
 * Type-safe handle for the bound `SecretsConfig` bean (AD-34 D1).
 */
export const SECRETS_CONFIG = new ContextToken<SecretsConfig>('secretsConfig');

/**
 * Schema for `server.*` — keys, coercion, requiredness and defaults live
 * here and nowhere else (AD-34 D3 schema mode).
 */
const serverSchema = z.object({
    name: z.string().default('blue-api'),
    port: z.coerce.number().default(3000),
});

/**
 * Typed server configuration bound from environment properties:
 * `server.name` / `server.port` — resolved from property sources
 * (env/file/CLI), coerced and defaulted by the schema (AD-34 D3 — replaced
 * the previous per-field `@property`/`@defaultValue` decorations).
 *
 * The `@configurationProperties` decorator auto-registers the bound instance
 * as the `serverConfig` bean when the application runs through
 * `ApplicationBuilder` (add the class to the builder sources).
 */
@configurationProperties('server', { schema: serverSchema })
export class ServerConfig {
    name!: string;
    port!: number;
}

/**
 * Schema for `api.*` (AD-34 D3 schema mode).
 */
const secretsSchema = z.object({
    secretToken: z.string().default('unset'),
});

/**
 * At-rest secrets demo (AD-29 Wave 2): a bound config value that is
 * `{cipher:...}`-encrypted in the environment. With `BLUE_SECRET_KEY` set,
 * `api.secretToken` resolves to its plaintext; without it, the raw marker
 * binds (a reverse-proxy/deployer sets the key, never the repo).
 *
 * The value rides the `properties` source so nothing secret is committed:
 * the *ciphertext* itself may live in any property source under the
 * `api.secretToken` key (env vars reach the property index under their
 * literal names, so no `BLUE_*` variable is probed), with the key in
 * `BLUE_SECRET_KEY` — two separate channels, per the threat model.
 */
@configurationProperties('api', { schema: secretsSchema })
export class SecretsConfig {
    secretToken!: string;
}

/**
 * Schema for `migrations.*` (AD-78 D-4) — the run-on-boot opt-in and the
 * migrations directory, resolved from environment properties with schema
 * defaults.
 */
const migrationsSchema = z.object({
    runOnBoot: z.coerce.boolean().default(false),
    dir: z.string().default('db/migrations'),
});

/**
 * Type-safe handle for the bound `MigrationsConfig` bean (AD-34 D1).
 */
export const MIGRATIONS_CONFIG = new ContextToken<MigrationsConfig>('migrationsConfig');

/**
 * Journaled-migration boot options (AD-78): `migrations.runOnBoot` applies
 * pending file migrations through `migrateOnBoot` before the server starts
 * (fail-closed), against the same store the Drizzle routes read.
 */
@configurationProperties('migrations', { schema: migrationsSchema })
export class MigrationsConfig {
    runOnBoot!: boolean;
    dir!: string;
}
