/**
 * @author Jeff Rose
 */

import { anyPass } from '@blue/util/logic';
import { is, like } from '@blue/util/types';

const isResponse = is(Response) as (value) => value is Response;

export const likeResponse = anyPass([
    isResponse,
    like({
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
    }),
]) as (value) => value is Response;
