/**
 * Route attribute keys and helpers.
 */
import type { Route } from './route';

/**
 * Route attribute carrying the raw `Accept-Language` header value. Platform
 * adapters set it when building a route so language negotiation stays
 * transport-agnostic (consumed by language resolvers).
 */
export const ACCEPT_LANGUAGE_ATTRIBUTE = 'acceptLanguage';

/**
 * Route attribute carrying the resolved request language. Dispatchers write
 * the language after negotiation so views, templates, and islands can
 * format and look up messages consistently for the request.
 */
export const LANGUAGE_ATTRIBUTE = 'language';

/**
 * Records the negotiated request language on the route.
 *
 * Dispatchers call this after negotiation so views and templates can format
 * consistently for the request. No-op on attribute-less routes (partial
 * hand-rolled routes, test doubles).
 *
 * @param route - The current route.
 * @param language - The resolved language tag.
 */
export const applyNegotiatedLanguage = (route: Route, language: string): void => {
    if (route.attributes) {
        route.attributes[LANGUAGE_ATTRIBUTE] = language;
    }
};
