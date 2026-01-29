/**
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';
import { IM_A_TEAPOT } from './response-statuses';
import { is } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzcG9uc2UtZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRS9DLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLE9BQU8sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUE4QixDQUFDO0FBRXJELE1BQU0sT0FBTyxhQUFjLFNBQVEsY0FBYztJQUM3QyxjQUFjLENBQVE7SUFDdEIsU0FBUyxDQUFXO0lBRXBCLElBQUksQ0FBNkI7SUFDakMsUUFBUSxDQUFVO0lBQ2xCLE9BQU8sQ0FBVTtJQUNqQixJQUFJLENBQVM7SUFDYixPQUFPLENBQVM7SUFDaEIsRUFBRSxDQUFVO0lBQ1osVUFBVSxDQUFVO0lBQ3BCLEtBQUssQ0FBVTtJQUNmLE1BQU0sQ0FBUztJQUNmLFVBQVUsQ0FBUztJQUNuQixJQUFJLENBQWU7SUFDbkIsR0FBRyxDQUFTO0lBRVosSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxlQUFlLENBQUM7SUFDM0IsQ0FBQztJQUlELFlBQVksV0FBcUIsSUFBSSxFQUFFLGlCQUFpQyxrQkFBa0I7UUFDdEYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNqRSxJQUFJLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztRQUU1QixJQUFJLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFdEUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQzFCLFFBQVEsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUUxQixjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN6QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJO1lBQzlCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzdCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVE7WUFDbEMsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTztZQUNqQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN2QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzVCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQy9CLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVU7WUFDcEMsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDM0IsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTTtZQUNoQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUMvQixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVO1lBQ3BDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO1lBQ3pCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPO1lBQ2xCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1lBQ3hCLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUc7WUFDN0IsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELEtBQUs7UUFDRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQ3RGLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3RDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN6QixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsT0FBTyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELFdBQVc7UUFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVELElBQUk7UUFDQSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELFFBQVE7UUFDSixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVELElBQUk7UUFDQSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELElBQUk7UUFDQSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVELEtBQUs7UUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNKO0FBRUQsZUFBZSxhQUFhLENBQUMifQ==