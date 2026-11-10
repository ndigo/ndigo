/**
 * Builds a resolver that serves {@link ToonView} for one logical view name,
 * so content negotiation can pick TOON against other representations — the
 * same shape as `@ndigo/view`'s `a2uiViewResolver`. Opt-in per route, never
 * a default (AD-102 D-3): the platform's negotiation wiring registers
 * nothing for `.toon`, and an app opts in by adding this resolver and, if it
 * wants the extension, a `'toon'` entry in its own path-extension map.
 */
import { ToonView } from './toon-view';
import type { ToonEncodeOptions } from './toon-encode';
import type { ViewResolver } from '@ndigo/view';

/**
 * Builds a resolver that serves {@link ToonView} for one logical view name.
 *
 * @param viewName - The logical view name (default `toon`).
 * @param options - TOON encoding options for the produced views.
 * @returns A resolver for that name.
 *
 * @example
 * ```ts
 * resolver.viewResolvers = [toonViewResolver('report'), {
 *     resolveViewName: async () => new JSONView(),
 * }];
 * // Accept: text/toon → ToonView; an unopinionated client gets JSON.
 * ```
 */
export function toonViewResolver(viewName = 'toon', options: ToonEncodeOptions = {}): ViewResolver {
    return {
        resolveViewName: async (name: string) => (name === viewName ? new ToonView(options) : null),
    };
}
