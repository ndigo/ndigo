/**
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
/**
 * @class module:http.NotOKInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class NotOKInterceptor {
    /**
     * @async
     * @function module:http.NotOKInterceptor#postResponse
     * @param {external:Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        if (!response.ok) {
            throw new ResponseError(response, 'Status Code is not 200-299');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90LW9rLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVyY2VwdG9ycy9ub3Qtb2staW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFHSCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUU5Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQ3pCOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBa0IsRUFBRSxRQUFrQjtRQUNyRCxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2YsTUFBTSxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztRQUNwRSxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=