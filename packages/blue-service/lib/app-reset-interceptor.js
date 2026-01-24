/**
 * @author Jeff Rose
 */
const defaults = {
    appResetHeader: 'Alt-Location',
    appResetCode: 205,
};
/**
 * @class module:http.AppResetInterceptor
 * @implements module:http.ResultAwareServiceInterceptor
 */
export class AppResetInterceptor {
    async postSuccess(response, settings) {
        settings = Object.assign({}, defaults, settings);
        const header = settings.appResetHeader, statusCode = settings.appResetCode;
        response.headers.has(header) &&
            response.status === statusCode &&
            location?.hostname !== 'localhost' &&
            location.reload();
    }
}
export default AppResetInterceptor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXJlc2V0LWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC1yZXNldC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQU1ILE1BQU0sUUFBUSxHQUFpQjtJQUMzQixjQUFjLEVBQUUsY0FBYztJQUM5QixZQUFZLEVBQUUsR0FBRztDQUNwQixDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQUM1QixLQUFLLENBQUMsV0FBVyxDQUFDLFFBQWtCLEVBQUUsUUFBc0I7UUFDeEQsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxFQUNsQyxVQUFVLEdBQUcsUUFBUSxDQUFDLFlBQVksQ0FBQztRQUN2QyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDeEIsUUFBUSxDQUFDLE1BQU0sS0FBSyxVQUFVO1lBQzlCLFFBQVEsRUFBRSxRQUFRLEtBQUssV0FBVztZQUNsQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUNKO0FBRUQsZUFBZSxtQkFBbUIsQ0FBQyJ9