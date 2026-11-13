/**
 * View targeter that selects a destination from a route attribute.
 */
import type { ViewTargetSelector } from './selector-view-targeter';
import { SelectorViewTargeter, type SelectorViewTargeterOptions } from './selector-view-targeter';

/**
 * Options for {@link AttributeViewTargeter}.
 */
export interface AttributeViewTargeterOptions extends SelectorViewTargeterOptions {
    /**
     * Route-attribute key holding the selector. Defaults to `viewTarget`.
     *
     * The value must be selector text from static configuration. Route
     * attributes can carry request-derived data, so never populate this key
     * from user input without escaping.
     */
    attribute?: string;
}

/**
 * Targets the element named by a route attribute.
 *
 * A handler or interceptor sets the attribute; the targeter reads it. When
 * the attribute is absent or is not a non-empty string, the targeter declines.
 *
 * @example
 * ```ts
 * route.attributes.viewTarget = '#site-footer';
 * ```
 */
export class AttributeViewTargeter extends SelectorViewTargeter {
    /**
     * Creates an attribute-driven targeter.
     *
     * @param options - Attribute key, mount mode, event map, and document.
     */
    constructor(options: AttributeViewTargeterOptions = {}) {
        const { attribute = 'viewTarget', ...targeterOptions } = options;

        const select: ViewTargetSelector = (context) => {
            const value = context.route?.attributes?.[attribute];
            return typeof value === 'string' && value.length > 0 ? value : null;
        };

        super(select, targeterOptions);
    }
}
