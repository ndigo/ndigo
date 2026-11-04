/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractDataBindingArgumentResolver, type DataBindingSource } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { getNodeRequest } from './node-request';

/**
 * The explicit Node bindable-source allow-list (D-3): `data-body:value` is
 * the `@ModelAttribute` equivalent (urlencoded/JSON body → DTO); the form
 * gap needs only `body` — whole-`query`/`header` binding is deferred until a
 * use case shows up. Kind validation in `SOURCES_BY_KIND` is the outer
 * guard; this set keeps a stray `data-*` source (e.g. `data-query` on a
 * node dispatch) from silently binding nothing.
 */
const NODE_BINDABLE_SOURCES: readonly DataBindingSource[] = ['body', 'cookie'];

/**
 * Node.js whole-source data-binding argument resolver.
 *
 * Reads a whole wire source (the parsed `request.body` — form-urlencoded or
 * JSON — or `request.cookies`) and binds it into one nested object via
 * `DataBinder`, optionally through a target constructor
 * (`dataBinderValue('body', ProfileForm)` → a real `ProfileForm` instance),
 * then through the shared conversion + Zod `convert` hook pipeline of the
 * `AbstractDataBindingArgumentResolver` base.
 */
export class NodeDataBindingMethodArgumentResolver extends AbstractDataBindingArgumentResolver {
    protected readonly bindableSources = NODE_BINDABLE_SOURCES;

    get [Symbol.toStringTag](): string {
        return 'NodeDataBindingMethodArgumentResolver';
    }

    /** Retrieves the Node wire source identified by the source name. */
    protected getSourceData(source: string, route: Route): Record<string, unknown> | undefined {
        const request = getNodeRequest(route);
        if (!request) {
            return undefined;
        }
        switch (source) {
            case 'body':
                return request.body;
            case 'cookie':
                return request.cookies;
            default:
                return undefined;
        }
    }
}
