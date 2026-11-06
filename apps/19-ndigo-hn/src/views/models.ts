/**
 * The models the controllers hand to the views.
 *
 * These are the render contracts: a controller builds one from the route plus
 * the service signals, and the matching web component renders it. Keeping them
 * in one module means a field cannot be added to a controller and forgotten by
 * its view, or vice versa.
 *
 * Unlike a server view model, these carry the live `HnService`: the list and
 * thread views subscribe to its signals so hydration, incremental rendering,
 * and stale/online transitions re-render in place.
 */
import type { HnFeedKey } from '../hn-types';
import type { HnService } from '../services/hn-service';

/** The feed-list page (`#/`, `#/new`, …). */
export interface ListModel extends Record<string, unknown> {
    readonly service: HnService;
    readonly feed: HnFeedKey;
    readonly label: string;
}

/** The item/thread page (`#/item/:id`). */
export interface ItemModel extends Record<string, unknown> {
    readonly service: HnService;
    readonly id: number;
}
