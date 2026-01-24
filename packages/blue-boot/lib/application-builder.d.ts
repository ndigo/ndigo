/**
 * @author Jeff Rose
 */
import { ApplicationContext, ConfigurableEnvironment } from '@blue/context';
import { JSONObject } from '@blue/core';
import { Application } from './application';
/**
 * @class module:boot.ApplicationBuilder
 */
export declare class ApplicationBuilder {
    #private;
    get application(): Application;
    get context(): ApplicationContext;
    constructor(sources: Function[], parent?: ApplicationBuilder);
    build(): Application;
    child(...sources: Function[]): ApplicationBuilder;
    environment(environment: ConfigurableEnvironment): ApplicationBuilder;
    parent(...sources: Function[]): ApplicationBuilder;
    profiles(...profiles: string[]): ApplicationBuilder;
    properties(properties: JSONObject): ApplicationBuilder;
    run(...args: any[]): ApplicationContext;
    sources(sources: Function[]): ApplicationBuilder;
}
//# sourceMappingURL=application-builder.d.ts.map