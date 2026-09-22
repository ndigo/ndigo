/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractPlatformArgumentResolver, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { passthroughArgumentValue } from './_resolver-util';
import { getNodeRequest } from './node-request';

/**
 * Node.js multipart/form-data file-part argument resolver.
 *
 * Matches `fileValue()` (`MethodParameterType.MULTIPART_FILE`) parameters and
 * reads the parsed parts from `request.multipart.files`. The part name is the
 * extractor's folded client field (see `toMethodParameter`): the explicit
 * `fileValue('field')` name, or the method-argument name when inferred.
 *
 * A single upload binds to a lone file; several uploads under the same field
 * bind to an array — TypeScript types are erased at runtime, so arity is
 * disambiguated by part count. A missing part on a required parameter fails
 * like any other missing value (handled by the shared pipeline).
 */
export class NodeMultipartFileMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(passthroughArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeMultipartFileMethodArgumentResolver';
    }

    protected resolveName(_name: string, parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const parts = getNodeRequest(route)?.multipart?.files.get(parameter.name);
        if (!parts || parts.length === 0) {
            return undefined;
        }
        // Erased types: one part → the file itself, several → an array.
        return parts.length === 1 ? parts[0] : parts;
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.MULTIPART_FILE.equals(parameter.type);
    }
}
