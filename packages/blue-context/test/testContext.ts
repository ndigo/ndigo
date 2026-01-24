import {
    configuration,
    entry,
    MetadataConfigApplicationContext,
    profile,
    propertySource,
    property,
} from '../src/configuration';

class Bar {}

class Qux {}

@configuration
@propertySource({ foo: 12, bar: 34, fuu: [56, 78] })
class TestConfiguration {
    @property('foo') // Get value for property "foo" from the property source
    fooValue;

    @property('fuu[1]') // Get value for property "fuu[1]" from the property source
    fuuValue;

    @profile('test') // Run only if the active profile is "test"
    @entry('bar') // Create an entry "bar" in context with the result from the factory
    testBar() {
        return new Bar();
    }

    @profile('dev') // Run only if the active profile is "dev"
    @entry('bar') // Create an entry "bar" in context with the result from the factory
    devBar() {
        return new Bar();
    }

    @profile('test') // Run only if the active profile is "test"
    @entry // Create an entry "foo" in context with the result from the factory
    foo() {
        return this.fooValue;
    }

    @profile('test') // Run only if the active profile is "test"
    @entry // Create an entry "fuu" in context with the result from the factory
    fuu() {
        return this.fuuValue;
    }

    // This is not labeled as an entry and will not appear on context
    qux() {
        return new Qux();
    }
}

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
