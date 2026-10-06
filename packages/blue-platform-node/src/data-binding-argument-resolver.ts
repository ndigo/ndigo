/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    convertArgumentValue,
    type DataBindingSource,
} from '@blue/dispatcher';
import { Route } from '@blue/router';
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
 * then through the shared conversion + Zod `convert` hook pipeline.
 */
export class NodeDataBindingMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeDataBindingMethodArgumentResolver';
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        return this.resolveBoundArgument(parameter, route, mapping, (source, currentRoute) =>
            this.getSourceData(source, currentRoute)
        );
    }

    /** Retrieves the Node wire source identified by the source name. */
    private getSourceData(source: string, route: Route): Record<string, unknown> | undefined {
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

    supportsParameter(parameter: MethodParameter): boolean {
        return NODE_BINDABLE_SOURCES.some((source) => MethodParameterType.data(source).equals(parameter.type));
    }

    protected resolveName(): null {
        // Whole-source binding overrides `resolveArgument` entirely; this
        // stub satisfies the abstract named-value contract and is never called.
        return null;
    }
}
