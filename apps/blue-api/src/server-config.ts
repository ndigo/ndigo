/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configurationProperties, defaultValue, property } from '@blue/boot';

/**
 * Typed server configuration bound from environment properties (AD-15):
 * `server.name` / `server.port` — resolved from property sources
 * (env/file/CLI), falling back to the `@defaultValue`s.
 *
 * The `@configurationProperties` decorator auto-registers the bound instance
 * as the `serverConfig` bean when the application runs through
 * `ApplicationBuilder` (add the class to the builder sources).
 */
@configurationProperties('server')
export class ServerConfig {
    @property('name') @defaultValue('blue-api') name: string = 'blue-api';
    @property('port') @defaultValue('3000') port: number = 3000;
}

/**
 * At-rest secrets demo (AD-29 Wave 2): a bound config value that is
 * `{cipher:...}`-encrypted in the environment. With `BLUE_SECRET_KEY` set,
 * `api.secret-token` resolves to its plaintext; without it, the raw marker
 * binds (a reverse-proxy/deployer sets the key, never the repo).
 *
 * The value rides the `properties` source so nothing secret is committed:
 * the *ciphertext* itself may live in env (`BLUE_API_SECRET_TOKEN`), with
 * the key in `BLUE_SECRET_KEY` — two separate channels, per the threat model.
 */
@configurationProperties('api')
export class SecretsConfig {
    @property('secretToken') @defaultValue('unset') secretToken: string = 'unset';
}
