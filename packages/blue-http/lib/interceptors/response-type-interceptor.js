/**
 * @author Jeff Rose
 */
import { entriesIterator, MediaType, MediaTypes } from '@blue/core';
import { cond, is, isString, identity, T } from '@blue/util';
import { CONTENT_TYPE } from '../http-headers';
import ResponseError from '../response-error';
/**
 * @typedef {module:http.HTTPInit} module:http.ResponseTypeInit
 * @property {external:string | module:core.MediaType | external:boolean} [responseType]
 */
const { defineProperty } = Reflect, domParser = new DOMParser(), defaultParsers = new Map(), binaryParser = (mediaType) => async (response) => new Blob([await response.arrayBuffer()], { type: mediaType }), jsonParser = (mediaType) => async (response) => await response.json(), textParser = (mediaType) => async (response) => await response.text(), markupParser = (mediaType) => async (response) => domParser.parseFromString(await response.text(), mediaType), isBoolean = is(Boolean), isMediaType = is(MediaType), getMediaType = cond([
    [isString, MediaType.for],
    [isMediaType, identity],
    [T, () => null],
]), getParser = (mediaType, parsers = defaultParsers) => {
    const type = mediaType;
    return parsers.has(type) ? parsers.get(type)(type.toString()) : null;
};
defaultParsers.set(MediaTypes.APPLICATION_JSON, jsonParser);
defaultParsers.set(MediaTypes.APPLICATION_PDF, binaryParser);
defaultParsers.set(MediaTypes.APPLICATION_XML, markupParser);
defaultParsers.set(MediaTypes.IMAGE_BMP, binaryParser);
defaultParsers.set(MediaTypes.IMAGE_GIF, binaryParser);
defaultParsers.set(MediaTypes.IMAGE_JPEG, binaryParser);
defaultParsers.set(MediaTypes.IMAGE_PNG, binaryParser);
defaultParsers.set(MediaTypes.IMAGE_SVG_XML, markupParser);
defaultParsers.set(MediaTypes.IMAGE_TIFF, binaryParser);
defaultParsers.set(MediaTypes.IMAGE_X_ICON, binaryParser);
defaultParsers.set(MediaTypes.IMAGE_WEBP, binaryParser);
defaultParsers.set(MediaTypes.TEXT_HTML, markupParser);
defaultParsers.set(MediaTypes.TEXT_JSON, jsonParser);
defaultParsers.set(MediaTypes.TEXT_PLAIN, textParser);
defaultParsers.set(MediaTypes.TEXT_XML, markupParser);
/**
 * @class module:http.ResponseTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class ResponseTypeInterceptor {
    /**
     * @function module:http.ResponseTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ResponseTypeInit} settings The HTTP request settings, including the `responseType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        let parsers;
        if ('responseType' in settings) {
            const { responseType } = settings;
            if (!isBoolean(responseType)) {
                const mediaType = getMediaType(responseType);
                if (!mediaType) {
                    throw new TypeError(`Invalid responseType ${responseType}`);
                }
                settings.responseType = mediaType;
            }
        }
        if ('responseParsers' in settings) {
            const { responseParsers } = settings;
            parsers = new Map([...defaultParsers]);
            for (const [type, parser] of entriesIterator(responseParsers)) {
                parsers.set(getMediaType(type), parser);
            }
        }
        else {
            parsers = defaultParsers;
        }
        settings.responseParsers = parsers;
        return true;
    }
    /**
     * @async
     * @function module:http.ResponseTypeInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.ResponseTypeSettings} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        if ('responseType' in settings) {
            const { responseType, responseParsers } = settings;
            let mediaType, parser;
            if (!isBoolean(responseType)) {
                mediaType = getMediaType(responseType);
                parser = getParser(mediaType, responseParsers);
            }
            if (!parser && 'headers' in response) {
                const contentType = CONTENT_TYPE.get(response.headers) || '';
                mediaType = getMediaType(contentType);
                parser = getParser(mediaType, responseParsers);
            }
            if (!parser) {
                parser = getParser(MediaTypes.TEXT_PLAIN, responseParsers);
            }
            try {
                const data = await parser(response);
                defineProperty(response, 'data', {
                    value: data,
                    configurable: true,
                    enumerable: true,
                    writable: false,
                });
            }
            catch (e) {
                throw new ResponseError(response, e);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtdHlwZS1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvcmVzcG9uc2UtdHlwZS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxlQUFlLEVBQWMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNoRixPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUU3RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxhQUFhLE1BQU0sbUJBQW1CLENBQUM7QUFrQjlDOzs7R0FHRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxFQUMzQixjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQTZCLEVBQ3JELFlBQVksR0FBeUIsQ0FBQyxTQUFpQixFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBa0IsRUFBRSxFQUFFLENBQ3JGLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUNqRSxVQUFVLEdBQStCLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQWtCLEVBQUUsRUFBRSxDQUFDLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxFQUNuSCxVQUFVLEdBQTJCLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQWtCLEVBQUUsRUFBRSxDQUFDLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxFQUMvRyxZQUFZLEdBQTZCLENBQUMsU0FBaUIsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLFFBQWtCLEVBQUUsRUFBRSxDQUN6RixTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLFNBQW1DLENBQUMsRUFDekYsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQWdDLEVBQ3RELFdBQVcsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFrQyxFQUM1RCxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDekIsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQztDQUNsQixDQUF5QixFQUMxQixTQUFTLEdBQUcsQ0FBQyxTQUFvQixFQUFFLFVBQTBDLGNBQWMsRUFBRSxFQUFFO0lBQzNGLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQztJQUN2QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN6RSxDQUFDLENBQUM7QUFFTixjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1RCxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDN0QsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzdELGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN2RCxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDdkQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3hELGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN2RCxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDM0QsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3hELGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMxRCxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDeEQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQ3ZELGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNyRCxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDdEQsY0FBYyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXREOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sdUJBQXVCO0lBR2hDOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLEdBQVEsRUFBRSxRQUEwQjtRQUN4QyxJQUFJLE9BQXVDLENBQUM7UUFFNUMsSUFBSSxjQUFjLElBQUksUUFBUSxFQUFFLENBQUM7WUFDN0IsTUFBTSxFQUFFLFlBQVksRUFBRSxHQUFHLFFBQVEsQ0FBQztZQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNiLE1BQU0sSUFBSSxTQUFTLENBQUMsd0JBQXdCLFlBQVksRUFBRSxDQUFDLENBQUM7Z0JBQ2hFLENBQUM7Z0JBQ0QsUUFBUSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7WUFDdEMsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLGlCQUFpQixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2hDLE1BQU0sRUFBRSxlQUFlLEVBQUUsR0FBRyxRQUFRLENBQUM7WUFDckMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUE0QixDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQztZQUVsRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksZUFBZSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVDLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLE9BQU8sR0FBRyxjQUFjLENBQUM7UUFDN0IsQ0FBQztRQUNELFFBQVEsQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDO1FBRW5DLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFDLFFBQWtCLEVBQUUsUUFBOEI7UUFDakUsSUFBSSxjQUFjLElBQUksUUFBUSxFQUFFLENBQUM7WUFDN0IsTUFBTSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsR0FBRyxRQUFRLENBQUM7WUFDbkQsSUFBSSxTQUFvQixFQUFFLE1BQU0sQ0FBQztZQUVqQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLFNBQVMsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sR0FBRyxTQUFTLENBQUMsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ25ELENBQUM7WUFFRCxJQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDbkMsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUM3RCxTQUFTLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNuRCxDQUFDO1lBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNWLE1BQU0sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBRUQsSUFBSSxDQUFDO2dCQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwQyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRTtvQkFDN0IsS0FBSyxFQUFFLElBQUk7b0JBQ1gsWUFBWSxFQUFFLElBQUk7b0JBQ2xCLFVBQVUsRUFBRSxJQUFJO29CQUNoQixRQUFRLEVBQUUsS0FBSztpQkFDbEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ1QsTUFBTSxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0oifQ==