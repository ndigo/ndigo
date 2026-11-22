/**
 * Transforms JSON payloads.
 */
import { JSONObject } from '@ndigo/core';
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Applies a pipeline of transforms to JSON bodies.
 *
 * @example
 * ```ts
 * const transformer = new JSONTransformer([(body) => ({ ...body, ts: Date.now() })]);
 * ```
 */
export class JSONTransformer implements HTTPTransformer<JSONObject, JSONObject> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "JSONTransformer".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object JSONTransformer]"
     */
    get [Symbol.toStringTag](): string {
        return 'JSONTransformer';
    }

    readonly #pipeline: (value: JSONObject) => JSONObject;
    readonly #condition?: (body: JSONObject, context: TransformContext) => boolean;

    /**
     * Creates a JSON transformer.
     *
     * @param transforms - The transform pipeline to apply.
     * @param condition - Optional predicate that controls whether the transform runs.
     */
    constructor(
        transforms: Array<(value: JSONObject) => JSONObject>,
        condition?: (body: JSONObject, context: TransformContext) => boolean
    ) {
        const _pipe =
            <T>(...fns: Array<(v: T) => T>) =>
            (x: T): T =>
                fns.reduce((v, f) => f(v), x);

        this.#pipeline = _pipe(...transforms);
        this.#condition = condition;
    }

    /**
     * Tests whether the input is a JSON object that should be transformed.
     *
     * @param body - The body to inspect.
     * @param context - The current transform context.
     * @returns `true` when transformation should run.
     */
    canTransform(body: JSONObject, context: TransformContext): boolean {
        if (typeof body !== 'object' || body === null) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

    /**
     * Applies the JSON transform pipeline.
     *
     * @param body - The JSON body to transform.
     * @param context - The current transform context.
     * @returns The transformed JSON body.
     */
    transform(body: JSONObject, context: TransformContext): JSONObject {
        return this.#pipeline(body);
    }
}
