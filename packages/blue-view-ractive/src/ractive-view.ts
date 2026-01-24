// import { Bridge } from '@blue/view';
// import * as Ractive from 'ractive';
// import { ApplicationContext } from '@blue/context';
// import { Deferred, MediaType, JSONObject } from '@blue/core';
// import { AsApacheLogger, EventLogger } from '@blue/logger';
// import { merge } from '@blue/util';

// const ContextLogger = AsApacheLogger( EventLogger );

// export interface SubViewMap {
//     [ key: string ]: Ractive.ComponentPlugin;
// }

// const execFunc = function( view, funcName ): void {
//     view;
//     funcName;
//     if( funcName && view[ funcName ] && typeof view[ funcName ] === 'function' ) {
//         try {
//             return view[ funcName ].call( view );
//         }
//         catch( e ) {
//             view.context.logger.error( 'Error in view ' + view.name + ' ' + funcName + '()', e );
//             throw e;
//         }
//     }
//     else {
//         funcName && view[ funcName ] && view.context.logger.error( 'Error in view ' + view.name + ' ' + funcName + ' not a function' );
//     }
// };

// const cleanup = function( view, subview ) {

//     var perfData = subview
//         ? [ 'blue/reactiveView', 'destroy', 'subview', view.root.name, view.name ] //jshint ignore:line
//         : [ 'blue/reactiveView', 'destroy', 'view', view.name ],
//         // try to exec onDestroy if assigned
//         result = execFunc( view, 'onDestroy' );
//     perfData;

//     if( !view._destroyed ) {
//         view.parent && view.parent.removeChild( view );
//         view.context && view.context.destroy();
//         view._destroyed = true;
//         view._bridge && view._bridge.disable();
//         Reflect.deleteProperty( view, '_bridge' );
//         Reflect.deleteProperty( view, '_views' );
//         Reflect.deleteProperty( view, 'rendered' );
//         Reflect.deleteProperty( view, 'context' );
//         Reflect.deleteProperty( view, 'model' );
//         Reflect.deleteProperty( view, 'root' );
//         Reflect.deleteProperty( view, 'target' );
//         Reflect.deleteProperty( view, 'element' );
//     }

//     // perf.count.apply( { id: view._id }, perfData );

//     return result;
// };

// const getElement = function( selector: string ): Element {
//     return document.querySelector( selector );
// };

// // const getElements = function ( selector ): Array<Element> {
// //     return document.querySelectorAll( selector );
// // }

// const createSubView = function( name: string, view: RactiveView, subViewPrototype: any ): RactiveView {
//     let subView: RactiveView;
//     try {
//         subView = new RactiveView( view.context, subViewPrototype );
//     } catch( e ) {
//         //view.context.logger.error( 'Unable to create sub-view '' + view.name + '.' + name + '':', e );
//         //view.context.page.emtest( 'page:error', {
//         //    code: 'blue:view:error:subviewCreationError',
//         //    description: 'Error in creation of subview ' + view.name + '.' + name + '; ' + e.name + ':' + e.message
//         //} );
//         throw e;
//     }

//     // subView.define( subViewPrototype );
//     // return view.appendChild( subView );
//     view._addChild( subView );
//     return subView;
// };

// const createViewComponent = function( name: string, view: RactiveView, subView: any ): Ractive.ComponentPlugin {
//     var //undef,
//         // peds,
//         // Must create temporary view to get template since template MUST be assigned in initial options object
//         // cache template on subview module
//         // template = subView.template || ( subView.template = getTemplate( subView, view.context.page ) );
//         template = subView.template;

//     return Ractive.extend( {
//         isolated: true,
//         magic: true,
//         template: template,
//         // modifyArrays: ( 'modifyArrays' in view ) ? view.modifyArrays : true,
//         onconstruct: function( componentConfig ) {
//             var childView, partials;

//             // thisRactiveComp._id = '<' + subView.name + 'Subview:' + ( uid++ ) + '>';
//             // // perf.count.call( { id: thisRactiveComp._id, ref: view }, 'blue/reactiveView', 'create', 'subview', view.name, subView.name );

//             childView = createSubView( name, view, subView );
//             if( typeof childView === 'undefined' ) { return; }
//             this.view = childView;

//             // BLUEJS-2860 - Make partials a shallow clone of original partials because pedApply may modify the object
//             partials = merge( {}, childView.partials || {} );
//             // peds = pedExtract( partials );

//             componentConfig.partials = partials;
//             // componentConfig.transitions = childView.transitions || {};
//             // if ( is.defined( childView.decorators ) && is.plainObject( childView.decorators ) ) {
//             //     componentConfig.decorators = childView.createDecorators( childView.decorators );
//             // }
//             componentConfig.components = childView._views;
//         },
//         onconfig: function() {
//             // var thisRactiveComp = this,
//             //     receivedModel = thisRactiveComp.get(),
//             //     // Apply view model properties to Ractive data model, skipping any
//             //     // properties already defined in Ractive model so that Ractive values
//             //     // will take precedence over default view values.
//             //     comboModel = filter( thisRactiveComp.view.model, function ( v, k ) {
//             //         return typeof receivedModel[ k ] === 'undefined';
//             //     } );
//             // thisRactiveComp.set( comboModel );

//             this.view.ractive = this;

//             // // Apply Ractive model properties/values onto view model
//             // mixIn( thisRactiveComp.view.model, receivedModel );
//             // // make model observable for backwards compatibility
//             // Reflect.defineProperty( thisRactiveComp.view, 'model', {
//             //     get: function () {
//             //         var value = thisRactiveComp.get();
//             //         // we only need to make top level properties observable
//             //         // as sub properties are made observable by ractive itself
//             //         Object.keys( value ).forEach( function ( key ) {
//             //             // skip properties that are already have getters/setters
//             //             if ( Object.getOwnPropertyDescriptor( value, key ).get ) { return; }
//             //             Reflect.defineProperty( value, key, {
//             //                 get: function () { return thisRactiveComp.get( key ); },
//             //                 set: function ( value ) { thisRactiveComp.set( key, value ); },
//             //                 enumerable: !0
//             //             } );
//             //         } );
//             //         return value;
//             //     },
//             //     set: function ( value ) { thisRactiveComp.set( value ); },
//             //     enumerable: !0
//             // } );
//         },
//         oninit: function() {
//             // var thisRactiveComp = this,
//             //     nodes = thisRactiveComp.fragment.items.length;
//             // if ( nodes !== 1 ) {
//             //     thisRactiveComp.view.context.logger.warn( 'View template must contains exactly one root node. ' + nodes + ' found' );
//             // }
//             // pedApply( peds, thisRactiveComp );
//         },
//         onchange: function( changed ) {
//             // var prop;
//             // for ( prop in changed ) {
//             //     if ( prop[ 0 ] !== '$' ) {
//             //         perf.count( 'blue/reactiveView', 'change', 'subview', view.name, subView.name, prop );
//             //     }
//             // }
//         },
//         onunrender: function() {
//             // var thisRactiveComp = this;
//             // !thisRactiveComp.view._rendered &&
//             //     thisRactiveComp.view.context &&
//             //     thisRactiveComp.view.context.logger.warn( '[' + subView.name + '] Possible optimization: subview destroyed before render completed' );
//             cleanup( this.view, true );
//             // perf.count.call( { id: thisRactiveComp._id }, 'blue/reactiveView', 'destroy', 'subview', view.name, subView.name );
//             Reflect.deleteProperty( this.view, 'ractive' );
//             Reflect.deleteProperty( this, 'view' );
//         },
//         onrender: function() {
//             // var thisRactiveComp = this,
//             //     node, bridge, rootBridge;

//             if( !this.view ) { return; }

//             // perf.count( 'blue/reactiveView', 'onrender', 'subview', view.name, subView.name );

//             // thisRactiveComp.view.ractive = thisRactiveComp;

//             // bridge = getInternals( thisRactiveComp.view ).bridge,
//             //     rootBridge = getInternals( thisRactiveComp.view.root ).bridge;
//             // !bridge.__enabled && rootBridge && bridge.enable( rootBridge.downstreamOutput );

//             // if ( is.defined( thisRactiveComp._triggers ) ) {
//             //     thisRactiveComp._triggers.forEach( function ( trigger ) {
//             //         if ( trigger.event === 'render' ) {
//             //             is.function( trigger.action ) && trigger.action();
//             //         } else {
//             //             thisRactiveComp.on( trigger.event, trigger.action );
//             //         }
//             //     } );
//             // }

//             // node = thisRactiveComp.fragment.items[ 0 ].node;
//             // node && Object.getOwnPropertyNames( thisRactiveComp.view.htmlAttrs ).forEach( function ( attr ) {
//             //     node.setAttribute( attr, thisRactiveComp.view.htmlAttrs[ attr ] );
//             // } );

//             // thisRactiveComp.view.$element = $( node );
//             // thisRactiveComp.view._rendered = true;
//             // execFunc( thisRactiveComp.view, 'onReady' );

//             this.view.root._addReady();
//         }
//     } );
// };

// let uid: number = 0,
//     noop: Function = function(): void { };

// export class RactiveView implements TemplateView, WebView {
//     // *****************************************************************************
//     // View
//     readonly id: number;
//     mediaType: MediaType;
//     readonly name: string;
//     readonly timestamp: number;
//     readonly context: ApplicationContext;
//     model: { [ key: string ]: any };
//     private _destroyed: boolean;

//     // *****************************************************************************
//     // PathBasedView
//     readonly path: string;

//     // *****************************************************************************
//     // TemplateView
//     readonly template: any;
//     rendered: Deferred<any>;

//     // *****************************************************************************
//     // WebView
//     target: Element;
//     element: Element;

//     // *****************************************************************************
//     // RactiveView
//     root: RactiveView;
//     parent: RactiveView;
//     children: Set<RactiveView>;
//     _views: Ractive.ComponentPlugins;
//     private _spec: { [ key: string ]: any };
//     private _bridge: Bridge;
//     private _lifecycle: { [ key: string ]: any };
//     private ractive: Ractive.Ractive;
//     private partials: { [ key: string ]: string | object };

//     set views( subViewMap: { [ key: string ]: any } ) {
//         this._views = this._views || {};
//         for( let name in subViewMap ) {
//             this._views[ name ] = createViewComponent( name, this, subViewMap[ name ] );
//         }
//     }

//     // View's bridge is only a 'set' property. Internal methods here may use private this._bridge if needed.
//     get spec(): { [ key: string ]: any } {
//         return this._spec;
//     }
//     set spec( spec: { [ key: string ]: any } ) {
//         var s = spec || {};

//         // Only use a spec to create a bridge once. Don't want to deal with shutting down an old bridge and making a new one.
//         if( !this._bridge ) {
//             this._spec = s;
//             this._bridge = new Bridge( s );
//         }
//     }

//     constructor(
//         parentContext: ApplicationContext,
//         config: {
//             name: string;
//             path: string;
//             template: any;
//             spec?: { [ key: string ]: any };
//             partials?: { [ key: string ]: any };
//             views?: { [ key: string ]: any };
//         } ) {

//         // View
//         this.id = uid++;
//         this.name = config.name;
//         this.timestamp = Date.now();
//         this.context = parentContext.newChild( name, {
//             logger: new ContextLogger( config.name )
//         } );
//         parentContext;

//         this.model = {};

//         // PathBasedView
//         this.path = config.path;

//         // TemplateView
//         this.template = config.template;
//         this.rendered = new Deferred();

//         // RactiveView
//         this.root = this;
//         this.parent = null;
//         this.children = new Set();
//         this._lifecycle = {
//             descendantCount: 0,
//             readyCount: 0,
//             readyFired: false
//         };
//         this.target = null;
//         this.element = null;

//         // Default to an empty bridge. This may be replaced by app's view module.
//         if( config.spec ) {
//             this.spec = config.spec;
//         }
//         if( config.partials ) {
//             this.partials = config.partials;
//         }
//         if( config.views ) {
//             this.views = config.views;
//         }
//     }

//     // *****************************************************************************
//     // View
//     async destroy(): Promise<void> {
//         let thisView: RactiveView = this;
//         if( this._destroyed ) {
//             return;
//         }
//         cleanup( this, false );
//         try {
//             if( thisView.ractive ) {
//                 await thisView.ractive.teardown();
//                 thisView.ractive = undefined;
//             }
//         } catch( e ) {
//             throw ( e );
//         }
//     }

//     onData( name: string, handler: Function, options?: { [ key: string ]: any } ): Function {
//         let pos: number,
//             listeners: Array<Function>,
//             template: Ractive.Ractive = this.ractive,
//             args: [ string, Function, { [ key: string ]: any } ] = [
//                 name.split( '.' )[ 0 ], // only support top level observation
//                 handler,
//                 merge( { context: this }, options ) // handler scope is this
//             ];
//         if( template ) {
//             return ( template.observe.apply( template, args ) || { cancel: noop } ).cancel;
//         } else {
//             pos;
//             listeners;
//             // listeners = this._dataListeners;
//             // pos = listeners.length;
//             // listeners.push( args );
//             // return function () {
//             //     var unlisten = listeners[ pos ];
//             //     if ( unlisten && unlisten.constructor === Function ) {
//             //         unlisten();
//             //     }
//             //     listeners[ pos ] = null;
//             // };
//         }
//     }

//     trigger( name: string, data: JSONObject ): void {
//         let template: Ractive.Ractive = this.ractive;
//         if( template ) {
//             template.fire( name, data );
//         }
//         else if( this.context ) {
//             //this.context.logger.warn( 'Cannot trigger ' + name + '' on '' + this.name + '' without a template instance' );
//         }
//     }

//     // *****************************************************************************
//     // PathBasedView

//     // *****************************************************************************
//     // TemplateView
//     render( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void> {
//         let thisView = this,
//             // done = perf.count.call( { id: thisView._id, ref: thisView, time: 1, bucket: 'render' }, 'blue/reactiveView', 'create', 'view', thisView.name ),
//             // BLUEJS-2860 - Make partials a shallow clone of original partials because pedApply may modify the object
//             partials = merge( {}, thisView.partials || {} ),
//             // peds = pedExtract( partials ),
//             // decorators = {},
//             // hasTransitions = thisView.transitions && !is.empty( thisView.transitions ),
//             append: boolean = options ? !!options.append : false,
//             ractive: Ractive.Ractive,
//             realInsert = function(): void {
//                 let rootNodeCount: number = 0;
//                 thisView.ractive = ractive = new Ractive( {
//                     append: append,
//                     template: thisView.template,
//                     partials: partials,
//                     // decorators: decorators,
//                     // transitions: thisView.transitions || {},
//                     // noIntro: !hasTransitions,
//                     // transitionsEnabled: hasTransitions,
//                     components: thisView._views,
//                     data: data,
//                     magic: false,
//                     // modifyArrays: ( 'modifyArrays' in thisView ) ? thisView.modifyArrays : true,
//                     onchange: function( changed ) {
//                         changed;
//                         if( !thisView.isInDOM() ) {
//                             //thisView.context.logger.error( 'View is no longer in the DOM' );
//                         }
//                         // var prop;
//                         // for ( prop in changed ) {
//                         //     if ( prop[ 0 ] !== '$' ) {
//                         //         perf.count( 'blue/reactiveView', 'change', 'view', thisView.name, prop );
//                         //     }
//                         // }
//                     },
//                     onrender: function() {
//                         thisView.element = this.fragment.items[0] ? this.fragment.items[0].node : undefined;
//                         // mark inserted view
//                         thisView.element && thisView.element.setAttribute( 'data-is-view', `${ thisView.name }-${ thisView.id }` );
//                         // No need to execute if root view has already been destroyed when this code runs
//                         if( thisView.root ) {
//                             // // BLUEJS-2567 - don't resolve CAV promise until view has completed adding to DOM
//                             // callback.call( thisView );
//                             // thisView._rendered = true;
//                             thisView.root._addReady();
//                         }
//                         // thisView.rendered.resolve();
//                     }
//                 } );

//                 // pedApply( peds, ractive );

//                 // thisView._dataListeners.forEach( function ( args, pos ) {
//                 //     if ( !args || args.constructor !== Array ) { return; }
//                 //     thisView._dataListeners[ pos ] = thisView.onData.apply( thisView, args );
//                 // } );

//                 // get root node count (filter out inline partials and plain text)
//                 rootNodeCount = ( thisView.template && thisView.template.filter && thisView.template.filter( function( template ) {
//                     return template && template.constructor === Object;
//                 } ).length ) || 0;

//                 if( rootNodeCount !== 1 ) {
//                     // thisView.context.logger.warn( 'View template must contains exactly one root node. ' + rootNodeCount + ' found' );
//                     // thisView.context.page.emtest( 'page:error', {
//                     //     code: 'blue:view:error:illegalTemplateError',
//                     //     description: 'View template for '' + thisView.viewName + '' must contains exactly one root node. ' + rootNodeCount + ' found'
//                     // } );
//                 }

//                 // ??? Typescript won't let me do this - do we need it?
//                 // ractive.view = thisView;

//                 // nodeDictionary.add( thisView.target, thisView );

//                 // BLUEJS-2567 - don't resolve CAV promise until view has completed adding to DOM.
//                 // Removed target from initial template config, then we explicitly render to the target later.
//                 thisView.ractive.render( selector );
//             };

//         thisView.target = getElement( selector );

//         // if ( is.defined( thisView.decorators ) && is.plainObject( thisView.decorators ) ) {
//         //     decorators = thisView.createDecorators( thisView.decorators );
//         // }

//         options = options ? options : {};
//         if( !options.append ) {
//             // check to see if selector is inside a ractive template - if so, throw error
//         }

//         try {
//             realInsert();
//         } catch( e ) {
//             // thisView._rendered || done();
//             // thisView.context.logger.error( 'Unable to render view '' + thisView.name + '':', e );
//             // thisView.context.page.emtest( 'page:error', {
//             //     code: 'blue:view:error:viewRenderError',
//             //     description: 'Unable to render view '' + thisView.name + ''' + '; ' + e.name + ':' + e.message
//             // } );
//             thisView.rendered.reject( e );
//         }
//         return thisView.rendered.promise;
//     }

//     // *****************************************************************************
//     // WebView
//     async appendTo( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void> {
//         options = options ? options : {};
//         options.append = true;
//         return this.render( selector, data, options );
//     }

//     async replaceIn( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void> {
//         options = options ? options : {};
//         options.append = false;
//         return this.render( selector, data, options );
//     }

//     // *****************************************************************************
//     // RactiveView
//     isRoot(): boolean {
//         return this.root === this;
//     }

//     isInDOM(): boolean {
//         if( this.element ) {
//             return document.body.contains( this.element );
//         }
//         return false;
//     }

//     _addChild( subView: RactiveView ): void {
//         subView.root = this.root;
//         subView.parent = this;
//         // subView.children.add( view );
//         this.root._lifecycle.descendantCount++;
//     }
//     _addReady(): void {
//         this.root._lifecycle.readyCount++;
//         if( this.root._lifecycle.readyCount > this.root._lifecycle.descendantCount && !this.root._lifecycle.readyFired ) {
//             this.root._lifecycle.readyFired = true;
//             this.root.rendered.resolve();
//             // this.isRoot() && this.bridge.... emit 'ready' on bridge
//             execFunc( this.root, 'onReady' );
//         }
//     }
// };

// // export const AsRactiveView = <T extends Constructor<RactiveView>>( superclass: T ) => class extends superclass {
// //     async tick( type: EventType, ...data: any[] ): Promise<void> {
// //         return tickAllEvents( this, type, data );
// //     }
// // };
