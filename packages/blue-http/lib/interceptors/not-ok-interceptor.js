/**
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
/**
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class NotOKInterceptor {
    /**
     * @async
     * @param {Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {Promise<external:void>}
     */
    async postResponse(response, settings) {
        if (!response.ok) {
            throw new ResponseError(response, 'Status Code is not 200-299');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90LW9rLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVyY2VwdG9ycy9ub3Qtb2staW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUU5Qzs7R0FFRztBQUNILE1BQU0sT0FBTyxnQkFBZ0I7SUFDekI7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQWtCLEVBQUUsUUFBa0I7UUFDckQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9