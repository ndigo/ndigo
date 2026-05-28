import { StandardEnvironment } from '@blue/context';

/**
 * Browser-specific environment implementation for `@blue/platform-web` applications.
 *
 * Extends `StandardEnvironment` as a marker type so that dependency injection
 * containers and bootstrap utilities can discriminate between browser and
 * non-browser environments by class identity (e.g., `instanceof BrowserEnvironment`).
 *
 * All environment property resolution is inherited from `StandardEnvironment`.
 */
export class BrowserEnvironment extends StandardEnvironment {}
