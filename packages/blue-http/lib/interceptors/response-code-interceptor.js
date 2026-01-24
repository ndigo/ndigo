/**
 * @author Jeff Rose
 */
/**
 * @interface module:http.ResponseCodeAwareHTTPInterceptor
 */
/**
 * @class module:http.MappedResponseCodeHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseCodeAwareHTTPInterceptor} interceptor
 */
export class MappedResponseCodeHTTPInterceptor {
    #interceptor;
    /**
     * @readonly
     * @member {module:http.ResponseCodeAwareHTTPInterceptor} module:http.MappedResponseCodeHTTPInterceptor#interceptor
     */
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor) {
        this.#interceptor = interceptor;
    }
    /**
     * @async
     * @function module:http.MappedResponseCodeHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        const { status } = response;
        if (status in this.#interceptor) {
            await this.#interceptor[status](response, settings);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY29kZS1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvcmVzcG9uc2UtY29kZS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQVlIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxpQ0FBaUM7SUFDMUMsWUFBWSxDQUFtQztJQUUvQzs7O09BR0c7SUFDSCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELFlBQVksV0FBNkM7UUFDckQsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBa0IsRUFBRSxRQUFrQjtRQUNyRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO1FBQzVCLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hELENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==