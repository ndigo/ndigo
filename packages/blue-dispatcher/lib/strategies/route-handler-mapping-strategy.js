/**
 * @author Jeff Rose
 */
import { MetadataHandlerMapping, NamePathHandlerMapping } from '../route-handler-mapping';
const { defineProperty } = Reflect, HANDLER_MAPPING = 'handlerMapping', HANDLER_MAPPINGS = `${HANDLER_MAPPING}s`, defaultRouteHandlerMappings = [new NamePathHandlerMapping(), new MetadataHandlerMapping()];
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1tYXBwaW5nLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmF0ZWdpZXMvcm91dGUtaGFuZGxlci1tYXBwaW5nLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBSUgsT0FBTyxFQUFFLHNCQUFzQixFQUFFLHNCQUFzQixFQUF1QixNQUFNLDBCQUEwQixDQUFDO0FBVy9HLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGVBQWUsR0FBRyxnQkFBZ0IsRUFDbEMsZ0JBQWdCLEdBQUcsR0FBRyxlQUFlLEdBQUcsRUFDeEMsMkJBQTJCLEdBQTBCLENBQUMsSUFBSSxzQkFBc0IsRUFBRSxFQUFFLElBQUksc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO0FBRXRIO0dBQ0c7QUFFSCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxDQUN6QyxVQUFhLEVBQ2lDLEVBQUUsQ0FDaEQsS0FBTSxTQUFRLFVBQVU7SUFDWCxpQkFBaUIsQ0FBUztJQUMxQiwyQkFBMkIsQ0FBUztJQUU3QyxlQUFlLENBQXdCO0lBRXZDLFlBQVksR0FBRyxJQUFXO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN0QyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZTtZQUMxQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLDZCQUE2QixFQUFFO1lBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0I7WUFDM0IsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxPQUEyQjtRQUMzQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsMkJBQTJCLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFaEUsSUFBSSxDQUFDLHNCQUFzQixDQUN2QixPQUFPLEVBQ1AsMkJBQTJCLEVBQzNCLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsMkJBQTJCLENBQzlCLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQVk7UUFDbkIsTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksRUFDNUIsTUFBTSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDMUMsTUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RCxJQUFJLE9BQU8sRUFBRSxDQUFDO2dCQUNWLE9BQU8sT0FBTyxDQUFDO1lBQ25CLENBQUM7UUFDTCxDQUFDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKLENBQUMifQ==