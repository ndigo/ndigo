var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { configuration, entry, MetadataConfigApplicationContext, profile, propertySource, property } from '../src/configuration';
class Bar {
}
class Qux {
}
let TestConfiguration = class TestConfiguration {
    fooValue;
    fuuValue;
    testBar() {
        return new Bar();
    }
    devBar() {
        return new Bar();
    }
    foo() {
        return this.fooValue;
    }
    fuu() {
        return this.fuuValue;
    }
    // This is not labeled as an entry and will not appear on context
    qux() {
        return new Qux();
    }
};
__decorate([
    property('foo') // Get value for property "foo" from the property source
    ,
    __metadata("design:type", Object)
], TestConfiguration.prototype, "fooValue", void 0);
__decorate([
    property('fuu[1]') // Get value for property "fuu[1]" from the property source
    ,
    __metadata("design:type", Object)
], TestConfiguration.prototype, "fuuValue", void 0);
__decorate([
    profile('test') // Run only if the active profile is "test"
    ,
    entry('bar') // Create an entry "bar" in context with the result from the factory
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestConfiguration.prototype, "testBar", null);
__decorate([
    profile('dev') // Run only if the active profile is "dev"
    ,
    entry('bar') // Create an entry "bar" in context with the result from the factory
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestConfiguration.prototype, "devBar", null);
__decorate([
    profile('test') // Run only if the active profile is "test"
    ,
    entry // Create an entry "foo" in context with the result from the factory
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestConfiguration.prototype, "foo", null);
__decorate([
    profile('test') // Run only if the active profile is "test"
    ,
    entry // Create an entry "fuu" in context with the result from the factory
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TestConfiguration.prototype, "fuu", null);
TestConfiguration = __decorate([
    configuration,
    propertySource({ foo: 12, bar: 34, fuu: [56, 78] })
], TestConfiguration);
const context = new MetadataConfigApplicationContext('test');
context.environment.activeProfiles = ['test'];
// This value is being defined programmatically rather than using decorators
Reflect.defineProperty(TestConfiguration.prototype, 'baz', {
    value: function () {
        return this.fooValue;
    },
    configurable: true,
    enumerable: true,
    writable: false
});
Reflect.defineMetadata('config:entry', 'baz', TestConfiguration.prototype, 'baz');
context.register(TestConfiguration);
export default context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0ZXN0Q29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxnQ0FBZ0MsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWpJLE1BQU0sR0FBRztDQUFHO0FBRVosTUFBTSxHQUFHO0NBQUc7QUFJWixJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjtJQUVuQixRQUFRLENBQUM7SUFHVCxRQUFRLENBQUM7SUFJVCxPQUFPO1FBQ0gsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFJRCxNQUFNO1FBQ0YsT0FBTyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFJRCxHQUFHO1FBQ0MsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFJRCxHQUFHO1FBQ0MsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxpRUFBaUU7SUFDakUsR0FBRztRQUNDLE9BQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0NBQ0osQ0FBQTtBQWpDRztJQURDLFFBQVEsQ0FBRSxLQUFLLENBQUUsQ0FBSSx3REFBd0Q7OzttREFDckU7QUFHVDtJQURDLFFBQVEsQ0FBRSxRQUFRLENBQUUsQ0FBQywyREFBMkQ7OzttREFDeEU7QUFJVDtJQUZDLE9BQU8sQ0FBRSxNQUFNLENBQUUsQ0FBSSwyQ0FBMkM7O0lBQ2hFLEtBQUssQ0FBRSxLQUFLLENBQUUsQ0FBTyxvRUFBb0U7Ozs7O2dEQUd6RjtBQUlEO0lBRkMsT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFLLDBDQUEwQzs7SUFDL0QsS0FBSyxDQUFFLEtBQUssQ0FBRSxDQUFPLG9FQUFvRTs7Ozs7K0NBR3pGO0FBSUQ7SUFGQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUksMkNBQTJDOztJQUNoRSxLQUFLLENBQWdCLG9FQUFvRTs7Ozs7NENBR3pGO0FBSUQ7SUFGQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUksMkNBQTJDOztJQUNoRSxLQUFLLENBQWdCLG9FQUFvRTs7Ozs7NENBR3pGO0FBN0JDLGlCQUFpQjtJQUZ0QixhQUFhO0lBQ2IsY0FBYyxDQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFFLEVBQUUsRUFBRSxFQUFFLENBQUUsRUFBRSxDQUFFO0dBQ2xELGlCQUFpQixDQW1DdEI7QUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdDQUFnQyxDQUFFLE1BQU0sQ0FBRSxDQUFDO0FBQy9ELE9BQU8sQ0FBQyxXQUFXLENBQUMsY0FBYyxHQUFHLENBQUUsTUFBTSxDQUFFLENBQUM7QUFFaEQsNEVBQTRFO0FBQzVFLE9BQU8sQ0FBQyxjQUFjLENBQUUsaUJBQWlCLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRTtJQUN4RCxLQUFLLEVBQUU7UUFDSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUNELFlBQVksRUFBRSxJQUFJO0lBQ2xCLFVBQVUsRUFBRSxJQUFJO0lBQ2hCLFFBQVEsRUFBRSxLQUFLO0NBQ2xCLENBQUUsQ0FBQztBQUNKLE9BQU8sQ0FBQyxjQUFjLENBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFFcEYsT0FBTyxDQUFDLFFBQVEsQ0FBRSxpQkFBaUIsQ0FBRSxDQUFDO0FBRXRDLGVBQWUsT0FBTyxDQUFDIn0=