/**
 * Parses response bodies by type.
 */
import { entriesIterator, JSONObject, MediaType, MediaTypes } from '@ndigo/core';
import { is, isString } from '@ndigo/util/types';
import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
import { CONTENT_TYPE } from '../http-headers';
import ResponseError from '../response-error';

/**
 * Resolved parser that reads a response body into typed data.
 */
export type ResponseBodyParser<T = unknown> = (response: Response) => Promise<T>;

/**
 * Factory that produces a parser for a specific media type.
 */
export type ResponseParser<T = unknown> = (mediaType: string) => ResponseBodyParser<T>;

/**
 * Map of media types to response parsers.
 */
export type ResponseParserMap = Map<MediaType, ResponseParser>;

/**
 * Supported parser collections accepted by {@link ResponseTypeInterceptor}.
 */
export type ResponseParsers =
    | ResponseParserMap
    | { [mediaType: string]: ResponseParser }
    | [[string | MediaType, ResponseParser]];

/**
 * Request settings for {@link ResponseTypeInterceptor}.
 */
export type ResponseTypeInit = HTTPInit & {
    responseParsers?: ResponseParsers;
    responseType?: string | MediaType | true;
};

/**
 * Normalized request settings used after initialization.
 */
export type ResponseTypeSettings = HTTPInit & { responseParsers: ResponseParserMap; responseType: MediaType | true };

const { defineProperty } = Reflect,
    domParser = typeof DOMParser !== 'undefined' ? new DOMParser() : null,
    defaultParsers = new Map<MediaType, ResponseParser>(),
    binaryParser: ResponseParser<Blob> = (mediaType: string) => async (response: Response) =>
        new Blob([await response.arrayBuffer()], { type: mediaType }),
    jsonParser: ResponseParser<JSONObject> = (mediaType: string) => async (response: Response) => await response.json(),
    textParser: ResponseParser<string> = (mediaType: string) => async (response: Response) => await response.text(),
    markupParser: ResponseParser<Document | null> = (mediaType: string) => async (response: Response) =>
        domParser?.parseFromString(await response.text(), mediaType as DOMParserSupportedType) ?? null,
    isBoolean = is(Boolean) as (value: unknown) => value is boolean,
    isMediaType = is(MediaType) as (value: unknown) => value is MediaType,
    getMediaType = (value: unknown): MediaType | null => {
        if (isString(value)) {
            return MediaType.for(value);
        }
        if (isMediaType(value)) {
            return value;
        }
        return null;
    },
    getParser = (mediaType: MediaType, parsers: Map<MediaType, ResponseParser> = defaultParsers) => {
        const type = mediaType;
        const parser = parsers.get(type);
        return parser ? parser(type.toString()) : null;
    };

const addDefaultParser = (mediaType: MediaType | null, parser: ResponseParser): void => {
    if (mediaType !== null) {
        defaultParsers.set(mediaType, parser);
    }
};

addDefaultParser(MediaTypes.APPLICATION_JSON, jsonParser);
addDefaultParser(MediaTypes.APPLICATION_PDF, binaryParser);
addDefaultParser(MediaTypes.APPLICATION_XML, markupParser);
addDefaultParser(MediaTypes.IMAGE_BMP, binaryParser);
addDefaultParser(MediaTypes.IMAGE_GIF, binaryParser);
addDefaultParser(MediaTypes.IMAGE_JPEG, binaryParser);
addDefaultParser(MediaTypes.IMAGE_PNG, binaryParser);
addDefaultParser(MediaTypes.IMAGE_SVG_XML, markupParser);
addDefaultParser(MediaTypes.IMAGE_TIFF, binaryParser);
addDefaultParser(MediaTypes.IMAGE_X_ICON, binaryParser);
addDefaultParser(MediaTypes.IMAGE_WEBP, binaryParser);
addDefaultParser(MediaTypes.TEXT_HTML, markupParser);
addDefaultParser(MediaTypes.TEXT_JSON, jsonParser);
addDefaultParser(MediaTypes.TEXT_PLAIN, textParser);
addDefaultParser(MediaTypes.TEXT_XML, markupParser);

/**
 * Parses response bodies into typed data and attaches the result as `data`.
 */
export class ResponseTypeInterceptor
    implements InitializationAwareHTTPInterceptor<ResponseTypeInit>, ResponseAwareHTTPInterceptor<ResponseTypeSettings>
{
    /**
     * @param url - The requested URL.
     * @param settings - The HTTP request settings, including the `responseType` setting.
     * @returns Whether or not the http request should continue execution.
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
            parsers = new Map<MediaType, ResponseParser>(defaultParsers);

            if (responseParsers) {
                for (const [type, parser] of entriesIterator(responseParsers)) {
                    const mediaType = getMediaType(type);
                    if (mediaType) {
                        parsers.set(mediaType, parser);
                    }
                }
            }
        } else {
            parsers = defaultParsers;
        }
        settings.responseParsers = parsers;

        return true;
    }

    /**

     * @param response - The HTTP response.
     * @param settings - The HTTP request settings.
     * @returns Whether or not the request should continue.
     */
    async postResponse(response: Response, settings: ResponseTypeSettings): Promise<Response | void> {
        if ('responseType' in settings) {
            const { responseType, responseParsers } = settings;
            let mediaType: MediaType | null = null,
                parser: ResponseBodyParser<unknown> | null = null;

            if (!isBoolean(responseType)) {
                const mt = getMediaType(responseType);
                if (mt) {
                    mediaType = mt;
                    parser = getParser(mediaType, responseParsers);
                }
            }

            if (!parser && 'headers' in response) {
                const contentType = CONTENT_TYPE.get(response.headers) || '';
                const mt = getMediaType(contentType);
                if (mt) {
                    mediaType = mt;
                    parser = getParser(mediaType, responseParsers);
                }
            }

            if (!parser) {
                const textPlain = MediaTypes.TEXT_PLAIN;
                if (textPlain !== null) {
                    parser = getParser(textPlain, responseParsers);
                }
            }

            try {
                if (parser) {
                    // Parse through a clone so the original response body stays
                    // readable for later interceptors and the caller — a parser
                    // that consumed the live body would turn a 200 into an
                    // empty/disturbed response downstream (HTT-REV-003).
                    const data = await parser(response.clone());
                    defineProperty(response, 'data', {
                        value: data,
                        configurable: true,
                        enumerable: true,
                        writable: false,
                    });
                }
            } catch (e) {
                throw new ResponseError(response, e as Error);
            }
        }
    }
}
