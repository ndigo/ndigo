var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { configuration, entry, MetadataConfigApplicationContext, profile, propertySource, property, } from '../src/configuration';
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
    writable: false,
});
Reflect.defineMetadata('config:entry', 'baz', TestConfiguration.prototype, 'baz');
context.register(TestConfiguration);
export default context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdENvbnRleHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0ZXN0Q29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsYUFBYSxFQUNiLEtBQUssRUFDTCxnQ0FBZ0MsRUFDaEMsT0FBTyxFQUNQLGNBQWMsRUFDZCxRQUFRLEdBQ1gsTUFBTSxzQkFBc0IsQ0FBQztBQUU5QixNQUFNLEdBQUc7Q0FBRztBQUVaLE1BQU0sR0FBRztDQUFHO0FBSVosSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7SUFFbkIsUUFBUSxDQUFDO0lBR1QsUUFBUSxDQUFDO0lBSVQsT0FBTztRQUNILE9BQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBSUQsTUFBTTtRQUNGLE9BQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBSUQsR0FBRztRQUNDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBSUQsR0FBRztRQUNDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsaUVBQWlFO0lBQ2pFLEdBQUc7UUFDQyxPQUFPLElBQUksR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztDQUNKLENBQUE7QUFqQ0c7SUFEQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsd0RBQXdEOzs7bURBQ2hFO0FBR1Q7SUFEQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsMkRBQTJEOzs7bURBQ3RFO0FBSVQ7SUFGQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsMkNBQTJDOztJQUMzRCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsb0VBQW9FOzs7OztnREFHakY7QUFJRDtJQUZDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQywwQ0FBMEM7O0lBQ3pELEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxvRUFBb0U7Ozs7OytDQUdqRjtBQUlEO0lBRkMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLDJDQUEyQzs7SUFDM0QsS0FBSyxDQUFDLG9FQUFvRTs7Ozs7NENBRzFFO0FBSUQ7SUFGQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsMkNBQTJDOztJQUMzRCxLQUFLLENBQUMsb0VBQW9FOzs7Ozs0Q0FHMUU7QUE3QkMsaUJBQWlCO0lBRnRCLGFBQWE7SUFDYixjQUFjLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7R0FDOUMsaUJBQWlCLENBbUN0QjtBQUVELE1BQU0sT0FBTyxHQUFHLElBQUksZ0NBQWdDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0QsT0FBTyxDQUFDLFdBQVcsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU5Qyw0RUFBNEU7QUFDNUUsT0FBTyxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFO0lBQ3ZELEtBQUssRUFBRTtRQUNILE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBQ0QsWUFBWSxFQUFFLElBQUk7SUFDbEIsVUFBVSxFQUFFLElBQUk7SUFDaEIsUUFBUSxFQUFFLEtBQUs7Q0FDbEIsQ0FBQyxDQUFDO0FBQ0gsT0FBTyxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUVsRixPQUFPLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFcEMsZUFBZSxPQUFPLENBQUMifQ==