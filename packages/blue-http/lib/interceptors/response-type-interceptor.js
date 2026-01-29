/**
 * @author Jeff Rose
 */
import { entriesIterator, MediaType, MediaTypes } from '@blue/core';
import { identity, T } from '@blue/util/function';
import { cond } from '@blue/util/logic';
import { is, isString } from '@blue/util/types';
import { CONTENT_TYPE } from '../http-headers';
import ResponseError from '../response-error';
/**
 * @typedef {module:http.HTTPInit} module:http.ResponseTypeInit
 * @property {string | module:core.MediaType | external:boolean} [responseType]
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
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class ResponseTypeInterceptor {
    /**
     * @param {URL} url The requested URL.
     * @param {module:http.ResponseTypeInit} settings The HTTP request settings, including the `responseType` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
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
     * @param {Response} response
     * @param {module:http.ResponseTypeSettings} settings
     * @returns {Promise<external:void>}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtdHlwZS1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcmNlcHRvcnMvcmVzcG9uc2UtdHlwZS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxlQUFlLEVBQWMsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNoRixPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRWhELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQWtCOUM7OztHQUdHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsU0FBUyxHQUFHLElBQUksU0FBUyxFQUFFLEVBQzNCLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBNkIsRUFDckQsWUFBWSxHQUF5QixDQUFDLFNBQWlCLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxRQUFrQixFQUFFLEVBQUUsQ0FDckYsSUFBSSxJQUFJLENBQUMsQ0FBQyxNQUFNLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQ2pFLFVBQVUsR0FBK0IsQ0FBQyxTQUFpQixFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBa0IsRUFBRSxFQUFFLENBQUMsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQ25ILFVBQVUsR0FBMkIsQ0FBQyxTQUFpQixFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBa0IsRUFBRSxFQUFFLENBQUMsTUFB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