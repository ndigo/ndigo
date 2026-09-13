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
