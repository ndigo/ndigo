/**
 * @author Jeff Rose
 */
import { FixedThemeResolver } from '../theme-resolver';
/**
 * @interface module:dispatcher.ThemeResolverStrategy
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtcmVzb2x2ZXItc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy90aGVtZS1yZXNvbHZlci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBRSxrQkFBa0IsRUFBaUIsTUFBTSxtQkFBbUIsQ0FBQztBQVF0RTs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGNBQWMsR0FBRyxlQUFlLEVBQ2hDLG9CQUFvQixHQUFrQixJQUFJLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRXJFLE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLENBQ25DLFVBQWEsRUFDMkIsRUFBRSxDQUMxQyxLQUFNLFNBQVEsVUFBVTtJQUNYLGdCQUFnQixDQUFTO0lBRWxDLGFBQWEsQ0FBZ0I7SUFFN0IsWUFBWSxHQUFHLElBQVc7UUFDdEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3JDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxjQUFjO1lBQ3pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELGlCQUFpQixDQUFDLE9BQTJCO1FBQ3pDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVsQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUVuRixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNyRSxDQUFDO0NBQ0osQ0FBQyJ9