/**
 * @author Jeff Rose
 */
/**
 */
/**
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseCodeAwareHTTPInterceptor} interceptor
 */
export class MappedResponseCodeHTTPInterceptor {
    #interceptor;
    /**
     * @readonly
     */
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor) {
        this.#interceptor = interceptor;
    }
    /**
     * @async
     * @param {Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {Promise<external:void>}
     */
    async postResponse(response, settings) {
        const { status } = response;
        if (status in this.#interceptor) {
            await this.#interceptor[status](response, settings);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY29kZS1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvcmVzcG9uc2UtY29kZS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQVlIO0dBQ0c7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8saUNBQWlDO0lBQzFDLFlBQVksQ0FBbUM7SUFFL0M7O09BRUc7SUFDSCxJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELFlBQVksV0FBNkM7UUFDckQsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFrQixFQUFFLFFBQWtCO1FBQ3JELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDNUIsSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzlCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEQsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9