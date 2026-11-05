/**
 * The feed-list routes: `#/` (top), `#/new`, `#/best`, `#/ask`, `#/show`,
 * `#/jobs`.
 *
 * Controllers are deliberately thin: they await the service that owns the data
 * (`ensureFeed` loads only when the feed changed), then hand the view a model.
 * The class-level `@routeMapping('/')` is the path prefix each method route is
 * merged with.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ModelAndView, routeMapping } from '@ndigo/dispatcher';
import { FEED_LABELS, type HnFeedKey } from '../hn-types';
import { HN_SERVICE } from '../app/hn-tokens';
import type { ListModel } from '../views/models';

@routeMapping('/')
export default class ListController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves the default top feed (`#/`).
     *
     * @returns The list model and its view name.
     */
    @routeMapping('/')
    async handleTop(): Promise<ModelAndView> {
        return this.#feed('top');
    }

    /**
     * Serves the newest feed (`#/new`).
     *
     * @returns The list model and its view name.
     */
    @routeMapping('/new')
    async handleNew(): Promise<ModelAndView> {
        return this.#feed('new');
    }

    /**
     * Serves the best feed (`#/best`).
     *
     * @returns The list model and its view name.
     */
    @routeMapping('/best')
    async handleBest(): Promise<ModelAndView> {
        return this.#feed('best');
    }

    /**
     * Serves the Ask HN feed (`#/ask`).
     *
     * @returns The list model and its view name.
     */
    @routeMapping('/ask')
    async handleAsk(): Promise<ModelAndView> {
        return this.#feed('ask');
    }

    /**
     * Serves the Show HN feed (`#/show`).
     *
     * @returns The list model and its view name.
     */
    @routeMapping('/show')
    async handleShow(): Promise<ModelAndView> {
        return this.#feed('show');
    }

    /**
     * Serves the jobs feed (`#/jobs`).
     *
     * @returns The list model and its view name.
     */
    @routeMapping('/jobs')
    async handleJobs(): Promise<ModelAndView> {
        return this.#feed('jobs');
    }

    /** Shared body: load the feed, then build its model. */
    async #feed(key: HnFeedKey): Promise<ModelAndView> {
        const service = this.applicationContext.getValue(HN_SERVICE);
        await service.ensureFeed(key);
        const model: ListModel = { service, feed: key, label: FEED_LABELS[key] };
        return new ModelAndView('hn-list', model);
    }
}
