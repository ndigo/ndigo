/**
 * @author Jeff Rose
 */
const defaults = {
    appResetHeader: 'Alt-Location',
    appResetCode: 205,
};
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXJlc2V0LWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2FwcC1yZXNldC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQU1ILE1BQU0sUUFBUSxHQUFpQjtJQUMzQixjQUFjLEVBQUUsY0FBYztJQUM5QixZQUFZLEVBQUUsR0FBRztDQUNwQixDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0lBQzVCLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBa0IsRUFBRSxRQUFzQjtRQUN4RCxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLEVBQ2xDLFVBQVUsR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUN4QixRQUFRLENBQUMsTUFBTSxLQUFLLFVBQVU7WUFDOUIsUUFBUSxFQUFFLFFBQVEsS0FBSyxXQUFXO1lBQ2xDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQ0o7QUFFRCxlQUFlLG1CQUFtQixDQUFDIn0=