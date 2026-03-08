/**
 * @author Jeff Rose
 */

import { JSONObject } from '@blue/core';
import { pipe } from '@blue/util/function';
import { HTTPTransformer, TransformContext } from './http-transformer';

export class JSONTransformer implements HTTPTransformer<JSONObject, JSONObject> {
    readonly #pipeline: (value: JSONObject) => JSONObject;
    readonly #condition?: (body: JSONObject, context: TransformContext) => boolean;

    constructor(
        transforms: Array<(value: JSONObject) => JSONObject>,
        condition?: (body: JSONObject, context: TransformContext) => boolean
    ) {
        this.#pipeline = pipe(...transforms);
        this.#condition = condition;
    }

    canTransform(body: JSONObject, context: TransformContext): boolean {
        if (typeof body !== 'object' || body === null) {
            return false;
        }

        return this.#condition ? this.#condition(body, context) : true;
    }

    transform(body: JSONObject, context: TransformContext): JSONObject {
        return this.#pipeline(body);
    }
}
