import { AbstractDetectingPathHandlerMapping } from './abstract-path-handler-mapping';

/**
 * Implementation of the {@link RouteHandlerMapping|HandlerMapping} interface that map from paths to handlers with names that start with slash ("/").
 * <p>This is the default implementation used by {@link Dispatcher|the dispatcher} along with {@link RadixMetadataHandlerMapping|RadixMetadataHandlerMapping}.
 * <p>The mapping is from path to handler name. An incoming path "/foo" would map to a handler named "/foo".
 * <p>Supports direct matches and wildcard matches.
 */
/**
 * Map handlers by application-context names that start with `/`.
 */
export class NamePathHandlerMapping extends AbstractDetectingPathHandlerMapping {
    get [Symbol.toStringTag](): string {
        return 'NamePathHandlerMapping';
    }

    /**
     * Use slash-prefixed application-context names as route paths.
     *
     * @param name - The application-context name.
     * @returns The derived paths.
     */
    protected _determinePathsForHandler(name: string): string[] {
        const paths: string[] = [];
        if (name.startsWith('/')) {
            paths.push(...name.split(' '));
        }
        return paths;
    }
}
