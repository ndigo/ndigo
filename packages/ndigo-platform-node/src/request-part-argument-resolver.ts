/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    passthroughArgumentValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { getNodeRequest } from './node-request';

/**
 * Parses one multipart text-field value as JSON, falling back to the raw
 * string. `MultipartContext.fields` keeps no per-part content-type, so JSON
 * detection is parse-with-raw-fallback (D-6): a JSON part binds as an
 * object, any other text part as its raw string.
 */
function parseJsonPart(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/**
 * Node.js multipart JSON/text-part argument resolver (D-6 —
 * `@requestPart` parity).
 *
 * Matches `requestPart(partName?, Target?)` (`MethodParameterType.REQUEST_PART`)
 * and reads the named part from `request.multipart.fields`. JSON parts parse
 * to an object (raw-text fallback); with a target constructor the parsed
 * object is copied into a real DTO instance, then the shared conversion +
 * Zod `convert` hook pipeline runs. Repeated parts (already collapsed to
 * `string[]` by AD-26) parse per element into an array. File parts are left
 * to `fileValue()`/`MultipartFile` — the resolver ignores them.
 *
 * The part name is the extractor's folded client field (see
 * `toMethodParameter`): the explicit `requestPart('meta')` name, or the
 * method-argument name when inferred. A missing part resolves like any other
 * missing value.
 */
export class NodeRequestPartMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(passthroughArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeRequestPartMethodArgumentResolver';
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        const raw = this.resolveName(parameter.name, parameter, route, mapping);
        const value = raw ?? parameter.defaultValue;

        // Target semantics: copy the parsed object onto a fresh DTO instance
        // (shallow — the part is already nested), then let the shared
        // convert/target pipeline validate and rehydrate it. Non-object parts
        // (raw strings, arrays) bind as-is even with a target.
        let instance: object | undefined;
        let bound = value;
        if (parameter.target && value && typeof value === 'object' && !Array.isArray(value)) {
            instance = new parameter.target();
            Object.assign(instance, value);
            bound = instance;
        }

        return this.resolveConvertedValue(parameter, bound, route, mapping, instance);
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const part = getNodeRequest(route)?.multipart?.fields[name];
        if (part === undefined) {
            return undefined;
        }
        return Array.isArray(part) ? part.map(parseJsonPart) : parseJsonPart(part);
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.REQUEST_PART.equals(parameter.type);
    }
}
