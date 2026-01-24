/**
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';
export declare class ResponseError extends FrameworkError implements Error, Response {
    #private;
    body: ReadableStream<Uint8Array>;
    bodyUsed: boolean;
    headers: Headers;
    name: string;
    message: string;
    ok: boolean;
    redirected: boolean;
    stack?: string;
    status: number;
    statusText: string;
    type: ResponseType;
    url: string;
    get [Symbol.toStringTag](): string;
    constructor(response?: Response, message?: string);
    constructor(response?: Response, error?: Error);
    clone(): Response;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    formData(): Promise<FormData>;
    json(): Promise<any>;
    text(): Promise<string>;
    bytes(): Promise<Uint8Array>;
}
export default ResponseError;
//# sourceMappingURL=response-error.d.ts.map