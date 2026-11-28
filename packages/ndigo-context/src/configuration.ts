/**
 * Configuration decorators: `@configuration`, `@entry`, `@environment`, `@configurationProperties`.
 *
 * Apply these decorators to classes/methods to declare configuration entries and
 * property binding; the context processes them during refresh.
 *
 * @example
 * ```ts
 * @configuration
 * class AppConfig {
 *     @entry('app.name')
 *     name = 'ndigo';
 * }
 * ```
 */
import '@tsmetadata/polyfill';

export * from './configuration-decorators.js';
export * from './entry-decorator.js';
export * from './configuration-processor.js';
