/**
 * @author Jeff Rose
 */

import { entriesIterator, JSONObject, MediaType, MediaTypes } from '@blue/core';
import { identity, T } from '@blue/util/function';
import { cond } from '@blue/util/logic';
import { is, isString } from '@blue/util/types';
import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
import { CONTENT_TYPE } from '../http-headers';
import ResponseError from '../response-error';

export type ResponseParser<T = any> = (mediaType: string) => (response: Response) => Promise<T>;

export type ResponseParserMap = Map<MediaType, ResponseParser>;

export type ResponseParsers =
    | ResponseParserMap
    | { [mediaType: string]: ResponseParser }
    | [[string | MediaType, ResponseParser]];

export type ResponseTypeInit = HTTPInit & {
    responseParsers?: ResponseParsers;
    responseType?: string | MediaType | true;
};

export type ResponseTypeSettings = HTTPInit & { responseParsers: ResponseParserMap; responseType: MediaType | true };

/**
 * @typedef {module:http.HTTPInit} module:http.ResponseTypeInit
 * @property {string | module:core.MediaType | external:boolean} [responseType]
 */

const { defineProperty } = Reflect,
    domParser = new DOMParser(),
    defaultParsers = new Map<MediaType, ResponseParser>(),
    binaryParser: ResponseParser<Blob> = (mediaType: string) => async (response: Response) =>
        new Blob([await response.arrayBuffer()], { type: mediaType }),
    jsonParser: ResponseParser<JSONObject> = (mediaType: string) => async (response: Response) => await response.json(),
    textParser: ResponseParser<string> = (mediaType: string) => async (response: Response) => await response.text(),
    markupParser: ResponseParser<Document> = (mediaType: string) => async (response: Response) =>
        domParser.parseFromString(await response.text(), mediaType as DOMParserSupportedType),
    isBoolean = is(Boolean) as (value) => value is boolean,
    isMediaType = is(MediaType) as (value) => value is MediaType,
    getMediaType = cond([
        [isString, MediaType.for],
        [isMediaType, identity],
        [T, () => null],
    ]) as (value) => MediaType,
    getParser = (mediaType: MediaType, parsers: Map<MediaType, ResponseParser> = defaultParsers) => {
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
export class ResponseTypeInterceptor
    implements InitializationAwareHTTPInterceptor<ResponseTypeInit>, ResponseAwareHTTPInterceptor<ResponseTypeSettings>
{
    /**
     * @param {URL} url The requested URL.
     * @param {module:http.ResponseTypeInit} settings The HTTP request settings, including the `responseType` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: ResponseTypeInit): boolean {
        let parsers: Map<MediaType, ResponseParser>;

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
            parsers = new Map<MediaType, ResponseParser>([...defaultParsers]);

            for (const [type, parser] of entriesIterator(responseParsers)) {
                parsers.set(getMediaType(type), parser);
            }
        } else {
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
    async postResponse(response: Response, settings: ResponseTypeSettings): Promise<void> {
        if ('responseType' in settings) {
            const { responseType, responseParsers } = settings;
            let mediaType: MediaType, parser;

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
            } catch (e) {
                throw new ResponseError(response, e);
            }
        }
    }
}
