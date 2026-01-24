/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';
import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
export type ResponseParser<T = any> = (mediaType: string) => (response: Response) => Promise<T>;
export type ResponseParserMap = Map<MediaType, ResponseParser>;
export type ResponseParsers = ResponseParserMap | {
    [mediaType: string]: ResponseParser;
} | [[string | MediaType, ResponseParser]];
export type ResponseTypeInit = HTTPInit & {
    responseParsers?: ResponseParsers;
    responseType?: string | MediaType | true;
};
export type ResponseTypeSettings = HTTPInit & {
    responseParsers: ResponseParserMap;
    responseType: MediaType | true;
};
/**
 * @class module:http.ResponseTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export declare class ResponseTypeInterceptor implements InitializationAwareHTTPInterceptor<ResponseTypeInit>, ResponseAwareHTTPInterceptor<ResponseTypeSettings> {
    /**
     * @function module:http.ResponseTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ResponseTypeInit} settings The HTTP request settings, including the `responseType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: ResponseTypeInit): boolean;
    /**
     * @async
     * @function module:http.ResponseTypeInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.ResponseTypeSettings} settings
     * @returns {external:Promise<external:void>}
     */
    postResponse(response: Response, settings: ResponseTypeSettings): Promise<void>;
}
//# sourceMappingURL=response-type-interceptor.d.ts.map