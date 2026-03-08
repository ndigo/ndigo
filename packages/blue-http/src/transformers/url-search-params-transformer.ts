/**
 * @author Jeff Rose
 */

import { HTTPTransformer, TransformContext } from './http-transformer';

export type URLSearchParamsEntryTransform = (key: string, value: string) => [string, string] | null;

export class URLSearchParamsTransformer implements HTTPTransformer<URLSearchParams, URLSearchParams> {
    readonly #entryTransform: URLSearchParamsEntryTransform;
    readonly #postProcess?: (params: URLSearchParams) => URLSearchParams;
    readonly #condition?: (body: URLSearchParams, context: TransformContext) => boolean;

    constructor(
        entryTransform: URLSearchParamsEntryTransform,
        postProcess?: (params: URLSearchParams) => URLSearchParams,
        condition?: (body: URLSearchParams, context: TransformContext) => boolean
    ) {
        this.#entryTransform = entryTransform;
        this.#postProcess = postProcess;
        this.#condition = condition;
    }

    canTransform(body: URLSearchParams, context: TransformContext): boolean {
        if (!(body instanceof URLSearchParams)) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

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
