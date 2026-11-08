/**
 * Argument resolver that binds uploaded multipart files.
 */
import {
    AbstractPlatformArgumentResolver,
    MethodParameter,
    MethodParameterType,
    passthroughArgumentValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
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

    /**
     * Reads the uploaded file(s) bound to the parameter.
     *
     * @param _name - The value name (unused).
     * @param parameter - The method parameter.
     * @param route - The current route.
     * @param _mapping - The route mapping (unused).
     * @returns The file, an array of files, or `undefined`.
     */
    protected resolveName(_name: string, parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const parts = getNodeRequest(route)?.multipart?.files.get(parameter.name);
        if (!parts || parts.length === 0) {
            return undefined;
        }
        // Erased types: one part → the file itself, several → an array.
        return parts.length === 1 ? parts[0] : parts;
    }

    /**
     * Whether this resolver supports multipart-file parameters.
     *
     * @param parameter - The method parameter to test.
     * @returns Whether the parameter type matches.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.MULTIPART_FILE.equals(parameter.type);
    }
}
