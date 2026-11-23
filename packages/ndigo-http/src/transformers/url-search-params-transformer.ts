/**
 * Transforms `URLSearchParams` entries.
 */
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Transforms a single URLSearchParams entry.
 *
 * @example
 * ```ts
 * type _Alias = URLSearchParamsEntryTransform;
 * ```
 */
export type URLSearchParamsEntryTransform = (key: string, value: string) => [string, string] | null;

/**
 * Transforms `URLSearchParams` entries one by one.
 *
 * @example
 * ```ts
 * const transformer = new URLSearchParamsTransformer((key, value) => [key, value]);
 * ```
 */
export class URLSearchParamsTransformer implements HTTPTransformer<URLSearchParams, URLSearchParams> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "URLSearchParamsTransformer".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object URLSearchParamsTransformer]"
     */
    get [Symbol.toStringTag](): string {
        return 'URLSearchParamsTransformer';
    }

    readonly #entryTransform: URLSearchParamsEntryTransform;
    readonly #postProcess?: (params: URLSearchParams) => URLSearchParams;
    readonly #condition?: (body: URLSearchParams, context: TransformContext) => boolean;

    /**
     * Creates a URLSearchParams transformer.
     *
     * @param entryTransform - The per-entry transform to apply.
     * @param postProcess - Optional final adjustment applied after entry transforms.
     * @param condition - Optional predicate that controls whether the transform runs.
     */
    constructor(
        entryTransform: URLSearchParamsEntryTransform,
        postProcess?: (params: URLSearchParams) => URLSearchParams,
        condition?: (body: URLSearchParams, context: TransformContext) => boolean
    ) {
        this.#entryTransform = entryTransform;
        this.#postProcess = postProcess;
        this.#condition = condition;
    }

    /**
     * Tests whether the input is a `URLSearchParams` value that should be transformed.
     *
     * @param body - The body to inspect.
     * @param context - The current transform context.
     * @returns `true` when transformation should run.
     */
    canTransform(body: URLSearchParams, context: TransformContext): boolean {
        if (!(body instanceof URLSearchParams)) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

    /**
     * Applies the entry transform to each URL parameter.
     *
     * @param body - The params to transform.
     * @param context - The current transform context.
     * @returns The transformed params.
     */
    transform(body: URLSearchParams, context: TransformContext): URLSearchParams {
        const transformed = new URLSearchParams();

        for (const [key, value] of body.entries()) {
            const result = this.#entryTransform(key, value);
            if (result !== null) {
                transformed.append(result[0], result[1]);
            }
        }

        return this.#postProcess ? this.#postProcess(transformed) : transformed;
    }
}
