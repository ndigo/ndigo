/**
 * @author Jeff Rose
 */
import { NavigatorLanguageResolver } from '../language-resolver';
/**
 */
const { defineProperty } = Reflect, LANGUAGE_RESOLVER = 'languageResolver', defaultLanguageResolver = new NavigatorLanguageResolver('en-US');
export const AsLanguageResolverStrategy = (superclass) => class extends superclass {
    languageResolverKey;
    languageResolver;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'languageResolverKey', {
            get: () => LANGUAGE_RESOLVER,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(LANGUAGE_RESOLVER);
    }
    initLanguageResolver(context) {
        const { languageResolverKey } = this;
        this.initStrategy(context, languageResolverKey, LANGUAGE_RESOLVER, defaultLanguageResolver);
        console.log('Dispatcher::initLanguageResolver', this.languageResolver);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2UtcmVzb2x2ZXItc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9sYW5ndWFnZS1yZXNvbHZlci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBb0IseUJBQXlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQVFuRjtHQUNHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsaUJBQWlCLEdBQUcsa0JBQWtCLEVBQ3RDLHVCQUF1QixHQUFxQixJQUFJLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXZGLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLENBQ3RDLFVBQWEsRUFDOEIsRUFBRSxDQUM3QyxLQUFNLFNBQVEsVUFBVTtJQUNYLG1CQUFtQixDQUFTO0lBRXJDLGdCQUFnQixDQUFtQjtJQUVuQyxZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLGNBQWMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDeEMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGlCQUFpQjtZQUM1QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELG9CQUFvQixDQUFDLE9BQTJCO1FBQzVDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVyQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBRTVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDM0UsQ0FBQztDQUNKLENBQUMifQ==