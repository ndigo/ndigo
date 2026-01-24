/**
 * @author Jeff Rose
 */
import { ControllerHandlerAdapter, MetadataHandlerAdapter } from '../route-handler-adapter';
/**
 * @interface module:dispatcher.RouteHandlerAdapterStrategy
 */
/**
 * @member {external:Array<module:dispatcher.HandlerAdapter>} module:dispatcher.RouteHandlerAdapterStrategy#handlerAdapters
 */
/**
 * Initialize the handler adapters used by the class. If no handler adapters are defined, it defaults to {@linkcode module:dispatcher.ControllerHandlerAdapter|ControllerHandlerAdapter}.
 * @function module:dispatcher.RouteHandlerAdapterStrategy#initHandlerAdapters
 * @param {module:core.ApplicationContext} context
 */
/**
 * Return the handler adapter for the given handler.
 * @function module:dispatcher.RouteHandlerAdapterStrategy#getHandlerAdapter
 * @param {module:dispatcher.MaybeHandler} handler The handler to find an adapter for.
 * @returns {module:dispatcher.HandlerAdapter} The adapter for the handler.
 * @throws {external:Error} If no adapter can be found for the handler.
 */
const { defineProperty } = Reflect, HANDLER_ADAPTER = 'handlerAdapter', HANDLER_ADAPTERS = `${HANDLER_ADAPTER}s`, defaultRouteHandlerAdapters = [new ControllerHandlerAdapter(), new MetadataHandlerAdapter()];
export const AsRouteHandlerAdapterStrategy = (superclass) => class extends superclass {
    handlerAdapterKey;
    handlerAdapterCollectionKey;
    handlerAdapters;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'handlerAdapterKey', {
            get: () => HANDLER_ADAPTER,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'handlerAdapterCollectionKey', {
            get: () => HANDLER_ADAPTERS,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(HANDLER_ADAPTERS);
    }
    initHandlerAdapters(context) {
        const { handlerAdapterKey, handlerAdapterCollectionKey } = this;
        this.initCollectionStrategy(context, handlerAdapterCollectionKey, handlerAdapterKey, HANDLER_ADAPTERS, defaultRouteHandlerAdapters);
        console.log('Dispatcher::initHandlerAdapters', this.handlerAdapters);
    }
    getHandlerAdapter(handler) {
        const handlerAdapter = this.handlerAdapters.find((handlerAdapter) => handlerAdapter.supports(handler));
        console.log('Dispatcher::getHandlerAdapter', handlerAdapter);
        if (!handlerAdapter) {
            throw new Error('No handler adapter found for handler');
        }
        return handlerAdapter;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1hZGFwdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmF0ZWdpZXMvcm91dGUtaGFuZGxlci1hZGFwdGVyLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBSUgsT0FBTyxFQUFFLHdCQUF3QixFQUFFLHNCQUFzQixFQUF1QixNQUFNLDBCQUEwQixDQUFDO0FBU2pIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7OztHQU1HO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsZUFBZSxHQUFHLGdCQUFnQixFQUNsQyxnQkFBZ0IsR0FBRyxHQUFHLGVBQWUsR0FBRyxFQUN4QywyQkFBMkIsR0FBMEIsQ0FBQyxJQUFJLHdCQUF3QixFQUFFLEVBQUUsSUFBSSxzQkFBc0IsRUFBRSxDQUFDLENBQUM7QUFFeEgsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsQ0FDekMsVUFBYSxFQUNpQyxFQUFFLENBQ2hELEtBQU0sU0FBUSxVQUFVO0lBQ1gsaUJBQWlCLENBQVM7SUFDMUIsMkJBQTJCLENBQVM7SUFFN0MsZUFBZSxDQUF3QjtJQUV2QyxZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLGNBQWMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdEMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWU7WUFDMUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRTtZQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCO1lBQzNCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsT0FBMkI7UUFDM0MsTUFBTSxFQUFFLGlCQUFpQixFQUFFLDJCQUEyQixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxzQkFBc0IsQ0FDdkIsT0FBTyxFQUNQLDJCQUEyQixFQUMzQixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLDJCQUEyQixDQUM5QixDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELGlCQUFpQixDQUFDLE9BQU87UUFDckIsTUFBTSxjQUFjLEdBQXdCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FDckYsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FDbkMsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztRQUM1RCxDQUFDO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztDQUNKLENBQUMifQ==