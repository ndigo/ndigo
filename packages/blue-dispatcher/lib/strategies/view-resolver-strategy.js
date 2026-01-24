/**
 * @author Jeff Rose
 */
import { ImportViewResolver } from '@blue/view';
/**
 * @interface module:dispatcher.ViewResolverStrategy
 */
const { defineProperty } = Reflect, VIEW_RESOLVER = 'viewResolver', VIEW_RESOLVERS = `${VIEW_RESOLVER}s`, defaultViewResolvers = [new ImportViewResolver()];
export const AsViewResolverStrategy = (superclass) => class extends superclass {
    viewResolverKey;
    viewResolverCollectionKey;
    viewResolvers;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'viewResolverKey', {
            get: () => VIEW_RESOLVER,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'viewResolverCollectionKey', {
            get: () => VIEW_RESOLVERS,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(VIEW_RESOLVERS);
    }
    initViewResolvers(context) {
        const { viewResolverKey, viewResolverCollectionKey } = this;
        this.initCollectionStrategy(context, viewResolverCollectionKey, viewResolverKey, VIEW_RESOLVERS, defaultViewResolvers);
        console.log('Dispatcher::initViewResolvers', this.viewResolvers);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1yZXNvbHZlci1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJhdGVnaWVzL3ZpZXctcmVzb2x2ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQUUsa0JBQWtCLEVBQWdCLE1BQU0sWUFBWSxDQUFDO0FBUTlEOztHQUVHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsYUFBYSxHQUFHLGNBQWMsRUFDOUIsY0FBYyxHQUFHLEdBQUcsYUFBYSxHQUFHLEVBQ3BDLG9CQUFvQixHQUFtQixDQUFDLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0FBRXRFLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLENBQ2xDLFVBQWEsRUFDMEIsRUFBRSxDQUN6QyxLQUFNLFNBQVEsVUFBVTtJQUNYLGVBQWUsQ0FBUztJQUN4Qix5QkFBeUIsQ0FBUztJQUUzQyxhQUFhLENBQWlCO0lBRTlCLFlBQVksR0FBRyxJQUFXO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNwQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYTtZQUN4QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLDJCQUEyQixFQUFFO1lBQzlDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFjO1lBQ3pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGlCQUFpQixDQUFDLE9BQTJCO1FBQ3pDLE1BQU0sRUFBRSxlQUFlLEVBQUUseUJBQXlCLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFNUQsSUFBSSxDQUFDLHNCQUFzQixDQUN2QixPQUFPLEVBQ1AseUJBQXlCLEVBQ3pCLGVBQWUsRUFDZixjQUFjLEVBQ2Qsb0JBQW9CLENBQ3ZCLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyRSxDQUFDO0NBQ0osQ0FBQyJ9