/**
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';
import { IM_A_TEAPOT } from './response-statuses';
import { is } from '@blue/util';
import { likeResponse } from './like-response';
const { defineProperty } = Reflect, isError = is(Error);
export class ResponseError extends FrameworkError {
    #originalError;
    #response;
    body;
    bodyUsed;
    headers;
    name;
    message;
    ok;
    redirected;
    stack;
    status;
    statusText;
    type;
    url;
    get [Symbol.toStringTag]() {
        return 'ResponseError';
    }
    constructor(response = null, messageOrError = 'Invalid response') {
        super(isError(messageOrError) ? messageOrError.message : messageOrError);
        this.stack = isError(messageOrError) ? messageOrError.stack : '';
        this.name = 'ResponseError';
        this.#originalError = isError(messageOrError) ? messageOrError : null;
        if (!likeResponse(response)) {
            response = IM_A_TEAPOT.createResponse(null);
        }
        this.#response = response;
        defineProperty(this, 'body', {
            get: () => this.#response.body,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'bodyUsed', {
            get: () => this.#response.bodyUsed,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'headers', {
            get: () => this.#response.headers,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'ok', {
            get: () => this.#response.ok,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'redirected', {
            get: () => this.#response.redirected,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'status', {
            get: () => this.#response.status,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'statusText', {
            get: () => this.#response.statusText,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'type', {
            get: () => 'error',
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'url', {
            get: () => this.#response.url,
            configurable: true,
            enumerable: true,
        });
    }
    clone() {
        const error = isError(this.#originalError) ? this.#originalError : new Error(this.message), response = this.#response.clone();
        error.stack = this.stack;
        error.name = this.name;
        return new ResponseError(response, error);
    }
    arrayBuffer() {
        return this.#response.arrayBuffer();
    }
    blob() {
        return this.#response.blob();
    }
    formData() {
        return this.#response.formData();
    }
    json() {
        return this.#response.json();
    }
    text() {
        return this.#response.text();
    }
    bytes() {
        return this.#response.bytes();
    }
}
export default ResponseError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzcG9uc2UtZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUUvQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixPQUFPLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBOEIsQ0FBQztBQUVyRCxNQUFNLE9BQU8sYUFBYyxTQUFRLGNBQWM7SUFDN0MsY0FBYyxDQUFRO0lBQ3RCLFNBQVMsQ0FBVztJQUVwQixJQUFJLENBQTZCO0lBQ2pDLFFBQVEsQ0FBVTtJQUNsQixPQUFPLENBQVU7SUFDakIsSUFBSSxDQUFTO0lBQ2IsT0FBTyxDQUFTO0lBQ2hCLEVBQUUsQ0FBVTtJQUNaLFVBQVUsQ0FBVTtJQUNwQixLQUFLLENBQVU7SUFDZixNQUFNLENBQVM7SUFDZixVQUFVLENBQVM7SUFDbkIsSUFBSSxDQUFlO0lBQ25CLEdBQUcsQ0FBUztJQUVaLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFJRCxZQUFZLFdBQXFCLElBQUksRUFBRSxpQkFBaUMsa0JBQWtCO1FBQ3RGLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMs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