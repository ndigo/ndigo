/**
 * The container configuration: what the app registers as beans.
 *
 * One instance owns the data port and the state service and exposes both under
 * their tokens; the route controllers are entries too, because the dispatcher
 * discovers `@routeMapping` handlers by scanning the context.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry } from '@blue/context';
import ItemController from '../controllers/item-controller';
import ListController from '../controllers/list-controller';
import { createHnApiClient, type HNAPIClient } from '../api/hn-api';
import { HnService } from '../services/hn-service';
import { HN_API, HN_SERVICE } from './hn-tokens';

@configuration
export class HnConfiguration {
    readonly #api: HNAPIClient = createHnApiClient();
    readonly #service = new HnService(this.#api);

    /** The HTTP-backed HN data port. */
    @entry(HN_API)
    hnApi() {
        return this.#api;
    }

    /** The reader's state service. */
    @entry(HN_SERVICE)
    hnService() {
        return this.#service;
    }

    /** The feed list routes (`#/`, `#/new`, …). */
    @entry()
    listController() {
        return new ListController();
    }

    /** The item/thread route (`#/item/:id`). */
    @entry()
    itemController() {
        return new ItemController();
    }
}
