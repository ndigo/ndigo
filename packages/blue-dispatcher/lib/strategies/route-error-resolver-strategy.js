/**
 * @author Jeff Rose
 */
import { MetadataErrorResolver } from '../route-error-resolver';
/**
 * @interface module:dispatcher.ErrorResolverStrategy
 */
const { defineProperty } = Reflect, ERROR_RESOLVER = 'errorResolver', ERROR_RESOLVERS = `${ERROR_RESOLVER}s`, defaultRouteErrorResolvers = [new MetadataErrorResolver()];
export const AsRouteErrorResolverStrategy = (superclass) => class extends superclass {
    errorResolverKey;
    errorResolverCollectionKey;
    errorResolvers;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'errorResolverKey', {
            get: () => ERROR_RESOLVER,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'errorResolverCollectionKey', {
            get: () => ERROR_RESOLVERS,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(ERROR_RESOLVERS);
    }
    initErrorResolvers(context) {
        const { errorResolverKey, errorResolverCollectionKey } = this;
        this.initCollectionStrategy(context, errorResolverCollectionKey, errorResolverKey, ERROR_RESOLVERS, defaultRouteErrorResolvers);
        console.log('Dispatcher::initRouteErrorResolvers', this.errorResolvers);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtZXJyb3ItcmVzb2x2ZXItc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9yb3V0ZS1lcnJvci1yZXNvbHZlci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBRSxxQkFBcUIsRUFBc0IsTUFBTSx5QkFBeUIsQ0FBQztBQVFwRjs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGNBQWMsR0FBRyxlQUFlLEVBQ2hDLGVBQWUsR0FBRyxHQUFHLGNBQWMsR0FBRyxFQUN0QywwQkFBMEIsR0FBeUIsQ0FBQyxJQUFJLHFCQUFxQixFQUFFLENBQUMsQ0FBQztBQUVyRixNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRyxDQUN4QyxVQUFhLEVBQ2dDLEVBQUUsQ0FDL0MsS0FBTSxTQUFRLFVBQVU7SUFDWCxnQkFBZ0IsQ0FBUztJQUN6QiwwQkFBMEIsQ0FBUztJQUU1QyxjQUFjLENBQXVCO0lBRXJDLFlBQVksR0FBRyxJQUFXO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNyQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsY0FBYztZQUN6QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLDRCQUE0QixFQUFFO1lBQy9DLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxlQUFlO1lBQzFCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELGtCQUFrQixDQUFDLE9BQTJCO1FBQzFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSwwQkFBMEIsRUFBRSxHQUFHLElBQUksQ0FBQztRQUU5RCxJQUFJLENBQUMsc0JBQXNCLENBQ3ZCLE9BQU8sRUFDUCwwQkFBMEIsRUFDMUIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZiwwQkFBMEIsQ0FDN0IsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FDSixDQUFDIn0=