/**
 * @author Jeff Rose
 */
import { MetadataHandlerMapping, NamePathHandlerMapping } from '../route-handler-mapping';
const { defineProperty } = Reflect, HANDLER_MAPPING = 'handlerMapping', HANDLER_MAPPINGS = `${HANDLER_MAPPING}s`, defaultRouteHandlerMappings = [new NamePathHandlerMapping(), new MetadataHandlerMapping()];
/**
 * @interface module:dispatcher.RouteHandlerMappingStrategy
 */
export const AsRouteHandlerMappingStrategy = (superclass) => class extends superclass {
    handlerMappingKey;
    handlerMappingCollectionKey;
    handlerMappings;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'handlerMappingKey', {
            get: () => HANDLER_MAPPING,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'handlerMappingCollectionKey', {
            get: () => HANDLER_MAPPINGS,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(HANDLER_MAPPINGS);
    }
    initHandlerMappings(context) {
        const { handlerMappingKey, handlerMappingCollectionKey } = this;
        this.initCollectionStrategy(context, handlerMappingCollectionKey, handlerMappingKey, HANDLER_MAPPINGS, defaultRouteHandlerMappings);
        console.log('Dispatcher::initHandlerMappings', this.handlerMappings);
    }
    getHandler(route) {
        const { handlerMappings } = this, length = handlerMappings.length;
        console.log('Dispatcher::getHandler', route);
        for (let index = 0; index < length; index++) {
            const handler = handlerMappings[index].getHandler(route);
            if (handler) {
                return handler;
            }
        }
        return null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1tYXBwaW5nLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmF0ZWdpZXMvcm91dGUtaGFuZGxlci1tYXBwaW5nLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBSUgsT0FBTyxFQUFFLHNCQUFzQixFQUFFLHNCQUFzQixFQUF1QixNQUFNLDBCQUEwQixDQUFDO0FBVy9HLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGVBQWUsR0FBRyxnQkFBZ0IsRUFDbEMsZ0JBQWdCLEdBQUcsR0FBRyxlQUFlLEdBQUcsRUFDeEMsMkJBQTJCLEdBQTBCLENBQUMsSUFBSSxzQkFBc0IsRUFBRSxFQUFFLElBQUksc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO0FBRXRIOztHQUVHO0FBRUgsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsQ0FDekMsVUFBYSxFQUNpQyxFQUFFLENBQ2hELEtBQU0sU0FBUSxVQUFVO0lBQ1gsaUJBQWlCLENBQVM7SUFDMUIsMkJBQTJCLENBQVM7SUFFN0MsZUFBZSxDQUF3QjtJQUV2QyxZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLGNBQWMsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdEMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWU7WUFDMUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSw2QkFBNkIsRUFBRTtZQUNoRCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsZ0JBQWdCO1lBQzNCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsbUJBQW1CLENBQUMsT0FBMkI7UUFDM0MsTUFBTSxFQUFFLGlCQUFpQixFQUFFLDJCQUEyQixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWhFLElBQUksQ0FBQyxzQkFBc0IsQ0FDdkIsT0FBTyxFQUNQLDJCQUEyQixFQUMzQixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLDJCQUEyQixDQUM5QixDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFZO1FBQ25CLE1BQU0sRUFBRSxlQUFlLEVBQUUsR0FBRyxJQUFJLEVBQzVCLE1BQU0sR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDO1FBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sT0FBTyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekQsSUFBSSxPQUFPLEVBQUUsQ0FBQztnQkFDVixPQUFPLE9BQU8sQ0FBQztZQUNuQixDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSixDQUFDIn0=