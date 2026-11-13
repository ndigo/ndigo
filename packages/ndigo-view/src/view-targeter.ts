/**
 * View targeting: choosing the destination a rendered view is committed to.
 */
import type { Route } from '@ndigo/router';
import type { View } from './view.js';
import type { ViewTarget } from './view-target.js';

/**
 * Everything a {@link ViewTargeter} may inspect to choose a destination.
 *
 * The context is assembled by the dispatcher once per render pass and only
 * when a targeter chain is configured — a platform that renders into its
 * single registered target never pays for it.
 */
export interface ViewTargetingContext {
    /**
     * The route being rendered.
     */
    readonly route: Route;

    /**
     * The logical view name, when the result carried one.
     */
    readonly viewName: string | null;

    /**
     * The resolved view instance, when available.
     */
    readonly view: View | null;

    /**
     * The model passed to the view.
     */
    readonly model: unknown;

    /**
     * The negotiated language.
     */
    readonly language: string;
}

/**
 * Chooses the destination for one render pass.
 *
 * Targeters select *where* output is written, never *which representation*
 * is produced — that remains the view-resolver chain's job. Returning `null`
 * declines, handing the decision to the next targeter in the chain.
 */
export interface ViewTargeter {
    /**
     * Resolves the target for the given render pass.
     *
     * @param context - The render pass being targeted.
     * @returns The target, or `null` to defer to the next targeter.
     */
    resolveViewTarget(context: ViewTargetingContext): Promise<ViewTarget | null> | ViewTarget | null;
}

/**
 * Ordered targeter chain: the first non-`null` target wins and later
 * targeters are not consulted.
 *
 * Ordering is therefore policy — put the most specific targeter first. A
 * catch-all placed last deliberately makes the platform's fallback target
 * unreachable.
 */
export class ViewTargeterComposite implements ViewTargeter {
    /**
     * The ordered targeter chain consulted during resolution.
     */
    readonly viewTargeters: ViewTargeter[];

    /**
     * Creates a composite targeter over the given delegate list.
     *
     * @param viewTargeters - The targeters to query in order.
     */
    constructor(viewTargeters: ViewTargeter[] = []) {
        this.viewTargeters = viewTargeters;
    }

    /**
     * Resolves the target by querying delegates in order.
     *
     * Delegates may be synchronous or asynchronous; `await` normalizes both,
     * so no `instanceof Promise` probing is needed (and none would survive a
     * cross-realm promise).
     *
     * @param context - The render pass being targeted.
     * @returns The first resolved target, or `null` when every delegate declines.
     */
    async resolveViewTarget(context: ViewTargetingContext): Promise<ViewTarget | null> {
        const { viewTargeters } = this;
        const length = viewTargeters.length;

        for (let index = 0; index < length; index++) {
            // oxlint-disable-next-line no-await-in-loop -- delegates resolve in priority order with first-match-wins; parallelizing would run every delegate and change which target wins.
            const target = await viewTargeters[index].resolveViewTarget(context);
            if (target) {
                return target;
            }
        }

        return null;
    }
}

/**
 * Always resolves to the same target.
 *
 * Intended for tests, single-surface applications, and platforms whose
 * destination is fixed for the application's lifetime. It is not a fallback:
 * the dispatcher's registered `VIEW_TARGET` already plays that role.
 */
export class FixedViewTargeter implements ViewTargeter {
    /**
     * The target this targeter always returns.
     */
    readonly target: ViewTarget;

    /**
     * Creates a targeter over a fixed target.
     *
     * @param target - The target to resolve to.
     */
    constructor(target: ViewTarget) {
        this.target = target;
    }

    /**
     * Returns the fixed target.
     *
     * @param _context - The render pass being targeted (unused: the target is
     *   fixed for the lifetime of this targeter).
     * @returns The configured target.
     */
    resolveViewTarget(_context: ViewTargetingContext): ViewTarget {
        return this.target;
    }
}
