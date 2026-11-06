/**
 */
import { is, like } from '@ndigo/util/types';

const isResponse = is(Response) as (value: unknown) => value is Response;

/**
 * Tests whether a value behaves like a `Response`.
 *
 * The check accepts real `Response` instances and compatible response-shaped
 * objects so interceptors can work across environments.
 *
 * @param value - The value to test.
 * @returns `true` when the value matches the `Response` shape.
 */
export const likeResponse = (value: unknown): value is Response => isResponse(value) || likeResponseShape(value);

const likeResponseShape = like({
    body: ReadableStream,
    bodyUsed: Boolean,
    headers: Headers,
    ok: Boolean,
    redirected: Boolean,
    status: Number,
    statusText: String,
    //trailer: Promise,
    type: String,
    url: String,
    clone: Function,
    arrayBuffer: Function,
    blob: Function,
    formData: Function,
    json: Function,
    text: Function,
});
