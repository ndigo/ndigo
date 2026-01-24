/**
 * @author Jeff Rose
 */

import { Constructable, FrameworkError, ApplicationError } from '@blue/core';
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
import { ApplicationContextAware, ApplicationContext } from '@blue/context';
import { RouteHandlerMethod, ErrorHandlerMethod } from './route-handler-method';
import { errorMapping, likeErrorHandler } from './error-mapping';
import { $aware } from '@blue/factory';

export interface RouteErrorResolver {
    resolveError( route: Route, handler, error: Error ): ModelAndView;
}

/**
 * Interface to be implemented by classes that can resolve errors thrown during route mapping or execution. Implementors are typically registered as values in the application context.
 * @interface module:router.RouteErrorResolver
 */

/**
 * Try to resolve the error that was thrown during route handler execution, returning a {@linkcode module:dispatcher.ModelAndView|ModelAndView} that represents the specific error page, if appropriate.
 * The returned `ModelAndView` may be empty to indicate the error has been resolved but that no view should be rendered.
 * @function module:router.RouteErrorResolver#resolveError
 * @param {module:router.Route} route The current route
 * @param {*} handler The executed route handler or `null` if none chosen at the time of the error.
 * @param {external:Error} error
 * @returns {module:dispatcher.ModelAndView} A corresponding `ModelAndView` to forward to or `null`.
 */

const
    { defineProperty, getPrototypeOf } = Reflect,
    { keys } = Object,
    getErrorHandlerMethodForError = function( errorHandler, error ): ErrorHandlerMethod {
        const
            /**
             * ! THIS DID NOT WORK UNLESS getPrototypeOf WAS USED!!!!
             */
            handlerKeys = keys( getPrototypeOf( errorHandler ) ),
            length = handlerKeys.length;
        if( length ){
            for( let index = 0; index < length; index++ ){
                const key = handlerKeys[ index ];
                if( errorMapping.has( errorHandler, key ) ){
                    const errorClasses = errorMapping.get( errorHandler, key );
                    if( errorClasses.some( ( errorClass ) => error instanceof errorClass ) ){
                        return new ErrorHandlerMethod( errorHandler, key );
                    }
                }
            }
        }

        return null;
    };

export abstract class AbstractRouteErrorResolver implements RouteErrorResolver {
    mappedHandlers: any[];
    mappedHandlerClasses: Constructable[];

    get [ Symbol.toStringTag ](): string {
        return 'HandlerErrorResolver';
    }

    constructor(){
        this.mappedHandlers = null;
        this.mappedHandlerClasses = [ Object ];
    }

    resolveError( route: Route, handler, error: Error ): ModelAndView {
        if( this._shouldApplyTo( route, handler ) ){
            const result: ModelAndView = this._resolveError( route, handler, error );
            return result;
        } else {
            return null;
        }
    }

    protected _shouldApplyTo( route: Route, handler: object ): boolean {
        const { mappedHandlers, mappedHandlerClasses } = this;
        if( handler ){
            if( mappedHandlers && mappedHandlers.indexOf( handler ) !== -1 ){
                return true;
            }
            if( mappedHandlerClasses ){
                const length = mappedHandlerClasses.length;
                if( length ){
                    for( let index = 0; index < length; index++ ){
                        const mappedHandlerClass = mappedHandlerClasses[ index ];
                        if( handler instanceof mappedHandlerClass ){
                            return true;
                        }
                    }
                }
            }
        }

        return ( !mappedHandlers && !mappedHandlerClasses );
    }

    protected abstract _resolveError( route: Route, handler: object, error: Error ): ModelAndView;
}

export abstract class AbstractHandlerMethodErrorResolver extends AbstractRouteErrorResolver {
    protected _shouldApplyTo( route: Route, handler: object ): boolean {
        if( !handler ){
            return super._shouldApplyTo( route, null );
        } else if( handler instanceof RouteHandlerMethod ){
            return super._shouldApplyTo( route, ( handler as RouteHandlerMethod ).handler );
        }

        return false;
    }

    protected _resolveError( route: Route, handler: object, error: Error ): ModelAndView {
        return this._resolveHandlerMethodError( route, handler as RouteHandlerMethod, error );
    }

    protected abstract _resolveHandlerMethodError( route: Route, handlerMethod: RouteHandlerMethod, error: Error ): ModelAndView;
}

/**
 * @abstract
 * @class module:dispatcher.AbstractRouteErrorResolver
 * @implements module:router.RouteErrorResolver
 */

/**
 * @abstract
 * @protected
 * @function module:dispatcher.AbstractRouteErrorResolver#_resolveError
 */

/**
 * @abstract
 * @class module:dispatcher.AbstractHandlerMethodErrorResolver
 * @extends module:dispatcher.AbstractRouteErrorResolver
 */

/**
 * The default implementation of the {@linkcode module:router.RouteErrorResolver|RouteErrorResolver} interface, resolving standard BlueJS exceptions.
 *
 * This error resolver is enabled by default in the {@linkcode module:dispatcher.WebDispatcher|WebDispatcher}.
 * @class module:dispatcher.DefaultRouteErrorResolver
 * @extends module:dispatcher.AbstractRouteErrorResolver
 */
export class DefaultRouteErrorResolver extends AbstractRouteErrorResolver {
    protected _resolveError( route: Route, handler: object, error: Error ): ModelAndView {
        try {
            switch( error.constructor ){
                case FrameworkError: {
                    // TODO provide real implementation
                    return new ModelAndView( 'default' );
                }
                case ApplicationError: {
                    // TODO provide real implementation
                    return new ModelAndView( 'default' );
                }
                default: {
                    // TODO provide real implementation
                    return new ModelAndView( 'default' );
                }
            }
        } catch( e ){
            // TODO Use real logger
            console.warn( 'Failure while trying to resolve error', e );
        }

        return null;
    }
}

/**
 * An {@linkcode module:dispatcher.AbstractRouteErrorResolver|AbstractRouteErrorResolver} that resolves exceptions through 'error:mapping' metadata.
 * @class module:dispatcher.MetadataErrorResolver
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @implements module:context.ApplicationContextAware
 * @implements module:context.Initializable
 */
export class MetadataErrorResolver extends AbstractHandlerMethodErrorResolver implements ApplicationContextAware {
    applicationContext: ApplicationContext;

    get [ $aware ](): boolean {
        return true;
    }

    setApplicationContext( applicationContext: ApplicationContext ): void {
        defineProperty( this, 'applicationContext', {
            value: applicationContext,
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    protected _getErrorHandlerMethod( handlerMethod: RouteHandlerMethod, error: Error ): ErrorHandlerMethod {
        let errorHandlerMethod: ErrorHandlerMethod = null;

        if( handlerMethod ){
            errorHandlerMethod = getErrorHandlerMethodForError( handlerMethod.handler, error );
        }

        if( !errorHandlerMethod ){
            const { applicationContext } = this;
            if( applicationContext ){
                const
                    contextKeys = keys( applicationContext ),
                    length = contextKeys.length;
                if( length ){
                    for( let index = 0; index < length; index++ ){
                        const
                            key = contextKeys[ index ],
                            value = applicationContext.getValue( key );
                        if( likeErrorHandler( value ) ){
                            errorHandlerMethod = getErrorHandlerMethodForError( value, error );
                            if( errorHandlerMethod ){
                                return errorHandlerMethod;
                            }
                        }
                    }
                }
            }
        }

        return errorHandlerMethod;
    }

    protected _resolveHandlerMethodError( route: Route, handlerMethod: RouteHandlerMethod, error: Error ): ModelAndView {
        const errorHandlerMethod = this._getErrorHandlerMethod( handlerMethod, error );

        if( !errorHandlerMethod ){
            return null;
        }

        try {
            return errorHandlerMethod.invoke( route, error, handlerMethod );
        } catch( e ){
            return null;
        }
    }
}

/**
 * {@linkcode module:router.RouteErrorResolver|RouteErrorResolver} implementation that allows for mapping exception class names to view names, either for a set of given handlers or for all handlers in the {@linkcode module:dispatcher.Dispatcher|Dispatcher}.
 * @class module:dispatcher.SimpleMappingErrorResolver
 * @extends module:dispatcher.AbstractRouteErrorResolver
 * @see {@link module:dispatcher.Dispatcher}
 */
export class SimpleMappingErrorResolver extends AbstractRouteErrorResolver {
    defaultErrorView: string;
    errorMappings: Map<string, string>;

    get [ Symbol.toStringTag ](): string {
        return 'SimpleMappingErrorResolver';
    }

    constructor( defaultErrorView?: string ){
        super();
        /**
         * @member {external:Map} module:dispatcher.SimpleMappingErrorResolver#defaultErrorView
         */
        defineProperty( this, 'defaultErrorView', {
            value: defaultErrorView || null,
            configurable: true,
            enumerable: false,
            writable: true
        } );
        /**
         * Set the mappings between error class names and error view names. The error class name can be a substring, with no wildcard support.
         *
         * Consider carefully how specific the pattern is. For example, "Error" will match nearly anything, and will probably hide other rules.
         * @member {external:Map} module:dispatcher.SimpleMappingErrorResolver#errorMappings
         */
        defineProperty( this, 'errorMappings', {
            value: new Map<string, string>(),
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    /**
     * Actually resolve the given error that got thrown during on handler execution, returning a `ModelAndView` that represents a specific error page if appropriate.
     *
     * May be overridden in subclasses, in order to apply specific error checks.
     * @protected
     * @function module:dispatcher.SimpleMappingErrorResolver#_resolveError
     * @param {module:router.Route} route The current route.
     * @param {*} handler The executed handler or `null` if none chosen at the time of the error.
     * @param {external:Error} error The error that was thrown during execution.
     * @returns {module:dispatcher.ModelAndView} The corresponding `ModelAndView` to forward to or `null` for default processing in the resolution chain.
     */
    protected _resolveError( route: Route, handler: object, error: Error ): ModelAndView {
        const
            { errorMappings } = this,
            errorView: string = errorMappings.has( error.name ) ?
                errorMappings.get( error.name ) :
                this.defaultErrorView;

        if( errorView ){
            const mv = new ModelAndView( errorView );
            //mv.error = error;
            return mv;
        }

        return null;
    }
}
