/**
 * @author Jeff Rose
 */
import { ControllerHandlerAdapter, MetadataHandlerAdapter } from '../route-handler-adapter';
/**
 */
/**
 */
/**
 * Initialize the handler adapters used by the class. If no handler adapters are defined, it defaults to {@link ControllerHandlerAdapter|ControllerHandlerAdapter}.
 * @param {module:core.ApplicationContext} context
 */
/**
 * Return the handler adapter for the given handler.
 * @param {module:dispatcher.MaybeHandler} handler The handler to find an adapter for.
 * @returns {module:dispatcher.HandlerAdapter} The adapter for the handler.
 * @throws {Error} If no adapter can be found for the handler.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1hZGFwdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmF0ZWdpZXMvcm91dGUtaGFuZGxlci1hZGFwdGVyLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBSUgsT0FBTyxFQUFFLHdCQUF3QixFQUFFLHNCQUFzQixFQUF1QixNQUFNLDBCQUEwQixDQUFDO0FBU2pIO0dBQ0c7QUFFSDtHQUNHO0FBRUg7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixlQUFlLEdBQUcsZ0JBQWdCLEVBQ2xDLGdCQUFnQixHQUFHLEdBQUcsZUFBZSxHQUFHLEVBQ3hDLDJCQUEyQixHQUEwQixDQUFDLElBQUksd0JBQXdCLEVBQUUsRUFBRSxJQUFJLHNCQUFzQixFQUFFLENBQUMsQ0FBQztBQUV4SCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxDQUN6QyxVQUFhLEVBQ2lDLEVBQUUsQ0FDaEQsS0FBTSxTQUFRLFVBQVU7SUFDWCxpQkFBaUIsQ0FBUztJQUMxQiwyQkFBMkIsQ0FBUztJQUU3QyxlQUFlLENBQXdCO0lBRXZDLFlBQVksR0FBRyxJQUFXO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN0QyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZTtZQUMxQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0I7WUFDM0IsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxPQUEyQjtRQUMzQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsMkJBQTJCLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFaEUsSUFBSSxDQUFDLHNCQUFzQixDQUN2QixPQUFPLEVBQ1AsMkJBQTJCLEVBQzNCLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsMkJBQTJCLENBQzlCLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsaUJBQWlCLENBQUMsT0FBTztRQUNyQixNQUFNLGNBQWMsR0FBd0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUNyRixjQUFjLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUNuQyxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0NBQ0osQ0FBQyJ9