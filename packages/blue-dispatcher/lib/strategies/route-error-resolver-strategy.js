/**
 * @author Jeff Rose
 */
import { MetadataErrorResolver } from '../route-error-resolver';
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtZXJyb3ItcmVzb2x2ZXItc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9yb3V0ZS1lcnJvci1yZXNvbHZlci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBRSxxQkFBcUIsRUFBc0IsTUFBTSx5QkFBeUIsQ0FBQztBQVFwRjtHQUNHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsY0FBYyxHQUFHLGVBQWUsRUFDaEMsZUFBZSxHQUFHLEdBQUcsY0FBYyxHQUFHLEVBQ3RDLDBCQUEwQixHQUF5QixDQUFDLElBQUkscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0FBRXJGLE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLENBQ3hDLFVBQWEsRUFDZ0MsRUFBRSxDQUMvQyxLQUFNLFNBQVEsVUFBVTtJQUNYLGdCQUFnQixDQUFTO0lBQ3pCLDBCQUEwQixDQUFTO0lBRTVDLGNBQWMsQ0FBdUI7SUFFckMsWUFBWSxHQUFHLElBQVc7UUFDdEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3JDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFjO1lBQ3pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsNEJBQTRCLEVBQUU7WUFDL0MsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGVBQWU7WUFDMUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRUQsa0JBQWtCLENBQUMsT0FBMkI7UUFDMUMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLDBCQUEwQixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTlELElBQUksQ0FBQyxzQkFBc0IsQ0FDdkIsT0FBTyxFQUNQLDBCQUEwQixFQUMxQixnQkFBZ0IsRUFDaEIsZUFBZSxFQUNmLDBCQUEwQixDQUM3QixDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUUsQ0FBQztDQUNKLENBQUMifQ==