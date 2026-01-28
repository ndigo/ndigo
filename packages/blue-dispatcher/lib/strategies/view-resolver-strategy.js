/**
 * @author Jeff Rose
 */
import { ImportViewResolver } from '@blue/view';
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1yZXNvbHZlci1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJhdGVnaWVzL3ZpZXctcmVzb2x2ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQUUsa0JBQWtCLEVBQWdCLE1BQU0sWUFBWSxDQUFDO0FBUTlEO0dBQ0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixhQUFhLEdBQUcsY0FBYyxFQUM5QixjQUFjLEdBQUcsR0FBRyxhQUFhLEdBQUcsRUFDcEMsb0JBQW9CLEdBQW1CLENBQUMsSUFBSSxrQkFBa0IsRUFBRSxDQUFDLENBQUM7QUFFdEUsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsQ0FDbEMsVUFBYSxFQUMwQixFQUFFLENBQ3pDLEtBQU0sU0FBUSxVQUFVO0lBQ1gsZUFBZSxDQUFTO0lBQ3hCLHlCQUF5QixDQUFTO0lBRTNDLGFBQWEsQ0FBaUI7SUFFOUIsWUFBWSxHQUFHLElBQVc7UUFDdEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3BDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhO1lBQ3hCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUU7WUFDOUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGNBQWM7WUFDekIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsT0FBMkI7UUFDekMsTUFBTSxFQUFFLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxHQUFHLElBQUksQ0FBQztRQUU1RCxJQUFJLENBQUMsc0JBQXNCLENBQ3ZCLE9BQU8sRUFDUCx5QkFBeUIsRUFDekIsZUFBZSxFQUNmLGNBQWMsRUFDZCxvQkFBb0IsQ0FDdkIsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDSixDQUFDIn0=