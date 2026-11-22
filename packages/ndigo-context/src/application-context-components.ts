/**
 * Application context component assembly helpers.
 */
import { Null } from '@ndigo/core';
import { AsApplicationContextAware } from './context-aware-mixin';

/**
 * Root of the component hierarchy: context-aware (`AsApplicationContextAware`)
 * and otherwise empty, so `BusinessComponent` and `ViewComponent` share one
 * ancestor without inheriting behavior.
 *
 * @example
 * ```ts
 * const component = new BusinessComponent();
 * component.setApplicationContext(applicationContext);
 * ```
 */
export class ApplicationComponent extends AsApplicationContextAware(Null) {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ApplicationComponent".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ApplicationComponent]"
     */
    get [Symbol.toStringTag](): string {
        return 'ApplicationComponent';
    }
}

/**
 * Base class for business logic components.
 * Encapsulates domain rules and state orchestration.
 *
 * @example
 * ```ts
 * class OrderComponent extends BusinessComponent {}
 * ```
 */
export class BusinessComponent extends ApplicationComponent {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "BusinessComponent".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object BusinessComponent]"
     */
    get [Symbol.toStringTag](): string {
        return 'BusinessComponent';
    }
}

/**
 * Base class for view components.
 * Encapsulates presentation logic and DOM interaction.
 *
 * @example
 * ```ts
 * class OrdersView extends ViewComponent {}
 * ```
 */
export class ViewComponent extends ApplicationComponent {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ViewComponent".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ViewComponent]"
     */
    get [Symbol.toStringTag](): string {
        return 'ViewComponent';
    }
}
