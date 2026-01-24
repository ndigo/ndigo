/**
 * @author Jeff Rose
 */
import { NavigatorLanguageResolver } from '../language-resolver';
/**
 * @interface module:dispatcher.LanguageResolverStrategy
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2UtcmVzb2x2ZXItc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9sYW5ndWFnZS1yZXNvbHZlci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBb0IseUJBQXlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQVFuRjs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGlCQUFpQixHQUFHLGtCQUFrQixFQUN0Qyx1QkFBdUIsR0FBcUIsSUFBSSx5QkFBeUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUV2RixNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxDQUN0QyxVQUFhLEVBQzhCLEVBQUUsQ0FDN0MsS0FBTSxTQUFRLFVBQVU7SUFDWCxtQkFBbUIsQ0FBUztJQUVyQyxnQkFBZ0IsQ0FBbUI7SUFFbkMsWUFBWSxHQUFHLElBQVc7UUFDdEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQ3hDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUI7WUFDNUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxPQUEyQjtRQUM1QyxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFckMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsaUJBQWlCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUU1RixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzNFLENBQUM7Q0FDSixDQUFDIn0=