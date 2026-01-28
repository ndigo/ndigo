/**
 * @author Jeff Rose
 */
import { FixedThemeResolver } from '../theme-resolver';
/**
 */
const { defineProperty } = Reflect, THEME_RESOLVER = 'themeResolver', defaultThemeResolver = new FixedThemeResolver('');
export const AsThemeResolverStrategy = (superclass) => class extends superclass {
    themeResolverKey;
    themeResolver;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'themeResolverKey', {
            get: () => THEME_RESOLVER,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(THEME_RESOLVER);
    }
    initThemeResolver(context) {
        const { themeResolverKey } = this;
        this.initStrategy(context, themeResolverKey, THEME_RESOLVER, defaultThemeResolver);
        console.log('Dispatcher::initThemeResolver', this.themeResolver);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtcmVzb2x2ZXItc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy90aGVtZS1yZXNvbHZlci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBRSxrQkFBa0IsRUFBaUIsTUFBTSxtQkFBbUIsQ0FBQztBQVF0RTtHQUNHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsY0FBYyxHQUFHLGVBQWUsRUFDaEMsb0JBQW9CLEdBQWtCLElBQUksa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFckUsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsQ0FDbkMsVUFBYSxFQUMyQixFQUFFLENBQzFDLEtBQU0sU0FBUSxVQUFVO0lBQ1gsZ0JBQWdCLENBQVM7SUFFbEMsYUFBYSxDQUFnQjtJQUU3QixZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLGNBQWMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUU7WUFDckMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGNBQWM7WUFDekIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsT0FBMkI7UUFDekMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRWxDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBRW5GLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDSixDQUFDIn0=