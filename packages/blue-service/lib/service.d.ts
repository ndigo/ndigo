import { HTTPInit, ContentTypeInit, DataParameterInit, ResponseTypeInit, IfModifiedInit, TimeoutInit } from '@blue/http';
export type ServiceInit = HTTPInit & ContentTypeInit & DataParameterInit & ResponseTypeInit & IfModifiedInit & TimeoutInit & {};
export interface CompletionAwareServiceInterceptor {
    postRequest(request: Request): void;
}
export interface ErrorAwareServiceInterceptor {
    postFailure(error: Error, request: Request): void;
}
export interface InitializationAwareServiceInterceptor<T extends ServiceInit = ServiceInit> {
    preInit(url: URL, settings: T): boolean;
}
export interface RequestAwareServiceInterceptor {
    preRequest(request: Request): Promise<Request | void>;
}
export interface ResponseAwareServiceInterceptor<T extends ServiceInit = ServiceInit> {
    postSuccess(response: Response, settings: T): Promise<void>;
}
type ServiceInterceptor = CompletionAwareServiceInterceptor | ErrorAwareServiceInterceptor | InitializationAwareServiceInterceptor | RequestAwareServiceInterceptor | ResponseAwareServiceInterceptor;
export declare class MappedServiceInterceptor {
    #private;
    get interceptor(): ServiceInterceptor;
    constructor(interceptor: ServiceInterceptor, includePatterns: string[], excludePatterns?: string[]);
    matches(path: string, matcher?: any): boolean;
    setExcludePatterns(excludePatterns?: string[]): void;
    setIncludePatterns(includePatterns?: string[]): void;
}
export {};
//# sourceMappingURL=service.d.ts.map