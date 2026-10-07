/**
 * The item route (`#/item/:id`): one story/job plus its bounded comment tree.
 *
 * The service is keyed by id, so re-dispatching the same route (or reloading the
 * deep link) re-renders the resident state instead of re-fetching it; a reload
 * with no memory falls back to the persisted snapshot, then the network.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@blue/context';
import { Null } from '@blue/core';
import { ModelAndView, parameters, pathVariable, routeMapping } from '@blue/dispatcher';
import { HN_SERVICE } from '../app/hn-tokens';
import type { ItemModel } from '../views/models';

@routeMapping('/item')
export default class ItemController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves one item and its comment tree.
     *
     * @param id - The numeric item id bound from the route.
     * @returns The item model and its view name.
     */
    @routeMapping('/:id')
    @parameters({ id: pathVariable('id') })
    async handleItem(id: string): Promise<ModelAndView> {
        const service = this.applicationContext.getValue(HN_SERVICE);
        const numericId = Number.parseInt(id, 10);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            throw new Error(`Invalid HN item id: "${id}"`);
        }
        await service.ensureItem(numericId);
        const model: ItemModel = { service, id: numericId };
        return new ModelAndView('hn-item', model);
    }
}
