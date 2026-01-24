/**
 * @author Jeff Rose
 */

import { Null } from '@blue/core';
import { View } from '@blue/view';
import { Route } from '@blue/router';

import { NoHandlerFoundError, NoViewFoundError } from './error';
import { RouteHandlerAdapter } from './route-handler-adapter';
import RouteHandlerExecutionChain from './route-handler-execution-chain';
import { ModelAndView } from './model-and-view';
import { RouteErrorResolver } from './route-error-resolver';
import { AsRouteHandlerAdapterStrategy } from './strategies/route-handler-adapter-strategy';
import { AsRouteHandlerMappingStrategy } from './strategies/route-handler-mapping-strategy';
import { AsLanguageResolverStrategy } from './strategies/language-resolver-strategy';
import { AsRouteToViewNameTranslatorStrategy } from './strategies/route-to-view-name-translator-strategy';
import { AsThemeResolverStrategy } from './strategies/theme-resolver-strategy';
import { AsRouteErrorResolverStrategy } from './strategies/route-error-resolver-strategy';
import { AsViewResolverStrategy } from './strategies/view-resolver-strategy';
import { AsStrategyInitializer } from './strategies/strategy-initializer';

export interface RouteDispatcher {
    dispatch( route: Route ): Promise<void>;
}

export interface RouteRenderer {
    render( mv: ModelAndView, route: Route ): Promise<void>;
}

/**
 * An interface for creating application dispatchers. Dispatches to registered handlers for processing a route, providing convenient mapping and exception handling facilities.
 *
 * It can be used with just about any workflow, with the installation of the appropriate strategies and adapter classes.
 * @interface module:router.RouteDispatcher
 */

/**
 * Initialize the strategy objects that this dispatcher uses.
 * @function module:router.RouteDispatcher#initStrategies
 * @param {module:core.ApplicationContext} context
 */

/**
 * Process the route by dispatching to the handler.
 * @function module:router.RouteDispatcher#dispatch
 * @param {module:router.Route} route
 * @returns {external:Promise}
 */

/**
 * @interface module:router.RouteRenderer
 */

/**
 * @function module:router.RouteRenderer#render
 * @param {module:dispatcher.ModelAndView} mv
 * @param {module:router.Route} route
 * @returns {external:Promise}
 */

/**
 * Dispatcher for brower-based handlers.
 * * It can use any {@linkcode module:router.RouteHandlerMapping|RouteHandlerMapping} implementation - pre-built or provided as part of an application - to control the routing of routes to handlers. Default is {@linkcode module:dispatcher.NamePathHandlerMapping|NamePathHandlerMapping} and {@linkcode module:dispatcher.MetadataHandlerMapping|MetadataHandlerMapping}. HandlerMapping objects can be defined as values in the application context, implementing the HandlerMapping interface, overriding the default HandlerMapping if present. HandlerMappings can be given any value name.
 * * It can use any {@linkcode module:dispatcher.HandlerAdapter|HandlerAdapter}; this allows for using any handler interface. Default adapters are {@linkcode module:dispatcher.MetadataHandlerAdapter|MetadataHandlerAdapter}, {@linkcode module:dispatcher.ControllerHandlerAdapter|ControllerHandlerAdapter}, for {@linkcode module:router.RouteMappingHandler|RouteMappingHandler} and {@linkcode module:dispatcher.Controller|Controller} interfaces, respectively. A default {@linkcode module:dispatcher.MetadataHandlerAdapter|MetadataHandlerAdapter} will be registered as well. RouteHandlerAdapter objects can be added as values in the application context, overriding the default RouteHandlerAdapters. Like HandlerMappings, RouteHandlerAdapters can be given any name.
 * * The dispatcher's error resolution strategy can be specified via a {@linkcode module:router.RouteHandlerErrorResolver|HandlerErrorResolver}, for example mapping certain exceptions to error pages. Default is {@linkcode module:dispatcher.DefaultRouteHandlerErrorResolver|DefaultRouteHandlerErrorResolver}. HandlerErrorResolvers can be overridden through the application context. HandlerErrorResolver can be given any name.
 * * Its view resolution strategy can be specified via a {@linkcode module:view.ViewResolver|ViewResolver} implementation, resolving symbolic view names into {@linkcode module:view.View|View} objects. Default is {@linkcode module:dispatcher.InternalResourceViewResolver|InternalResourceViewResolver}. ViewResolver objects can be added as values in the application context, overriding the default ViewResolver. ViewResolvers can be given any name.
 * * Its language resolution strategy is determined by a {@linkcode module:dispatcher.LanguageResolver|LanguageResolver}. The out-of-the-box implementation works via {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Navigator|navigator} object. The LanguageResolver name is "languageResolver"; default is {@linkcode module:dispatcher.NavigatorLanguageResolver|NavigatorLanguageResolver}.
 * * Its theme resolution strategy is determined by a {@linkcode module:dispatcher.ThemeResolver|ThemeResolver}. Implementations for a fixed theme and cookie resolved theme are included. The ThemeResolver name is "themeResolver"; default is {@linkcode module:dispatcher.FixedThemeResolver|FixedThemeResolver}.
 * @class module:dispatcher.BrowserDispatcher
 * @implements module:router.RouteDispatcher
 * @implements module:router.RouteRenderer
 * @mixes module:dispatcher.AsRouteHandlerAdapterStrategy
 * @mixes module:dispatcher.AsRouteHandlerMappingStrategy
 * @mixes module:dispatcher.AsRouteErrorResolverStrategy
 * @mixes module:dispatcher.AsLanguageResolverStrategy
 * @mixes module:dispatcher.AsRouteToViewNameTranslatorStrategy
 * @mixes module:dispatcher.AsThemeResolverStrategy
 * @mixes module:dispatcher.AsViewMappingStrategy
 * @mixes module:dispatcher.AsViewResolverStrategy
 */
export class BrowserDispatcher extends AsViewResolverStrategy( AsRouteErrorResolverStrategy( AsThemeResolverStrategy( AsRouteToViewNameTranslatorStrategy( AsLanguageResolverStrategy( AsRouteHandlerMappingStrategy( AsRouteHandlerAdapterStrategy( AsStrategyInitializer( Null ) ) ) ) ) ) ) ) implements RouteDispatcher, RouteRenderer {
    defaultViewName: string = 'index';

    get [ Symbol.toStringTag ](): string {
        return 'BrowserDispatcher';
    }

    async dispatch( route: Route ): Promise<void> {
        let dispatchError: Error = null,
            mappedHandler: RouteHandlerExecutionChain = null,
            mv: ModelAndView = null;
        console.log( 'Dispatcher::dispatch', route );
        try {
            mappedHandler = this.getHandler( route );
            console.log( '- Dispatcher::Mapped Handler', mappedHandler );
            if( !mappedHandler ){
                throw new NoHandlerFoundError( route );
            }

            const handlerAdapter: RouteHandlerAdapter = this.getHandlerAdapter( mappedHandler.handler );
            console.log( '- Dispatcher::Handler Adapter', handlerAdapter );

            if( mappedHandler.applyPreHandle( route ) === false ){
                return;
            }

            mv = await handlerAdapter.handle( route, mappedHandler.handler );
            this._applyDefaultViewName( route, mv );
            mappedHandler.applyPostHandle( route, mv );
        } catch( error ){
            dispatchError = error;
        }

        return this._processDispatchResult( route, mappedHandler, mv, dispatchError )
            .catch( function( error: Error ){
                mappedHandler?.triggerCompleteHandle( route, error );
                // TODO Using logging system
                console.log( error );
            } );
    }

    /**
     * Render the given `ModelAndView`. This is the last stage of handling a route.
     * @function module:dispatcher.BrowserDispatcher#render
     * @param {module:dispatcher.ModelAndView} mv
     * @param {module:router.Route} route
     * @returns {external:Promise}
     */
    async render( mv: ModelAndView, route: Route ): Promise<void> {
        console.log( 'Dispatcher::render', mv, route );
        const
            language = this.languageResolver ? this.languageResolver.resolveLanguage( route ): '',
            viewName = mv.viewName;

        let view: View;

        if( viewName ){
            console.log( 'Dispatcher::render::viewName', viewName );
            view = await this._resolveViewName( viewName, language );
            if( !view ){
                throw new NoViewFoundError( viewName, route );
            }
        } else {
            view = mv.view;
            if( !view ){
                throw new NoViewFoundError( viewName, route );
            }
        }

        try {
            view.render( mv, route );
        } catch( e ){
            // TODO ADD A REAL CATCH BLOCK
            console.log( 'UNABLE TO RENDER' );
        }
    }

    protected _processHandlerError( route: Route, handler, error: Error ): ModelAndView {
        let mav: ModelAndView = null;
        console.log( 'Dispatcher::_processHandlerError', route, handler, error.message );
        this.errorResolvers.some( function( resolver: RouteErrorResolver ): boolean {
            mav = resolver.resolveError( route, handler, error );
            console.log( 'Dispatcher::_processHandlerError::resolver', resolver, mav );
            return !!mav;
        } );

        if( mav ){
            if( !mav.view && !mav.viewName ){
                mav.viewName = this.defaultViewName;
            }
            return mav;
        }

        throw new TypeError( 'view name is undefined' );
    }

    protected async _resolveViewName( viewName: string, language: string ): Promise<View> {
        console.log( 'Dispatcher::resolveViewName', viewName, language );
        let index = 0,
            view: View = null;
        const length = this.viewResolvers.length;

        for( ; index < length; index++ ){
            view = await this.viewResolvers[ index ].resolveViewName( viewName, language );
            if( view ){
                return view;
            }
        }

        return view;
    }

    private _applyDefaultViewName( route: Route, mv: ModelAndView ){
        console.log( 'Dispatcher::_applyDefaultViewName', route, mv );
        if( mv && !mv.hasView ){
            const defaultViewName = this.getDefaultViewName( route );
            if( defaultViewName ){
                mv.viewName = defaultViewName;
            }
        }
    }

    private async _processDispatchResult( route: Route, mappedHandler: RouteHandlerExecutionChain, mv: ModelAndView, error: Error ): Promise<void> {
        console.log( 'Dispatcher::_processDispatchResult', route, mappedHandler, mv, error && error.message );
        if( error ){
            const handler = mappedHandler instanceof RouteHandlerExecutionChain ? mappedHandler.handler : null;
            mv = this._processHandlerError( route, handler, error );
        }

        if( mv ){
            try {
                await this.render( mv, route );
                mappedHandler ?? mappedHandler.triggerCompleteHandle( route, null );
            } catch( e ){
                // TODO Better error handling. Use logger.
                console.error( e );
            }
        }
    }
}

/**
 * * Developer Notes
 * ? Should abstract classes be created?
 * Two abstract classes could be derived from BrowserDispatcher, an AbstractRouteDispatcher and an AbstractRouteRenderer. Then BrowserDispatcher would extend those two classes and provide
 * an implementation of _processDispatchResult which would unify the two abstract classes.
 *
 * ? Should EventEmitter be used?
 * There should either be an Event-based implementation of Dispatcher that mixes in AsEventEmitter or that should be intrisic to BrowserDispatcher itself. This would allow Dispatcher to emit
 * lifecycle events similar to today's sysytem. There could even be an event-based implementation of RouteHandlerInterceptors; however currently if a RouteHandlerInterceptor preHandle returns false, handler
 * execution stops. That may not be possible with an event based system without enhancements to Emitter.
 */
