/**
 */
import { HTTPTransformer, TransformContext } from './http-transformer';

/**
 * Transforms a single URLSearchParams entry.
 */
export type URLSearchParamsEntryTransform = (key: string, value: string) => [string, string] | null;

/**
 * Transforms `URLSearchParams` entries one by one.
 */
export class URLSearchParamsTransformer implements HTTPTransformer<URLSearchParams, URLSearchParams> {
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
