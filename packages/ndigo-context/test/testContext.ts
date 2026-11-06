/**
 */
import { configuration, entry, MetadataConfigApplicationContext, propertySource, property } from '../src/configuration';
import { whenProfile } from '@ndigo/core';

class Bar {}

class Qux {}

@configuration
@propertySource({ foo: 12, bar: 34, fuu: [56, 78] })
class TestConfiguration {
    @property('foo') // Get value for property "foo" from the property source
    fooValue: unknown;

    @property('fuu[1]') // Get value for property "fuu[1]" from the property source
    fuuValue: unknown;

    @whenProfile('test') // Run only if the active profile is "test"
    @entry('bar') // Create an entry "bar" in context with the result from the factory
    testBar() {
        return new Bar();
    }

    @whenProfile('dev') // Run only if the active profile is "dev"
    @entry('bar') // Create an entry "bar" in context with the result from the factory
    devBar() {
        return new Bar();
    }

    @whenProfile('test') // Run only if the active profile is "test"
    @entry() // Create an entry "foo" in context with the result from the factory
    foo() {
        return this.fooValue;
    }

    @whenProfile('test') // Run only if the active profile is "test"
    @entry() // Create an entry "fuu" in context with the result from the factory
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
// With TC39 decorators, we need to manually add to Symbol.metadata
Reflect.defineProperty(TestConfiguration.prototype, 'baz', {
    value: function () {
        return this.fooValue;
    },
    configurable: true,
    enumerable: true,
    writable: false,
});
// Add the entry metadata using the TC39 approach
const metadataTarget = TestConfiguration as { [Symbol.metadata]?: Record<string, unknown> };
const metadata = metadataTarget[Symbol.metadata] || {};
metadataTarget[Symbol.metadata] = metadata;
// String entry names are stored directly; ContextTokens add typed lookup metadata.
metadata['config:entry:baz'] = { name: 'baz', token: undefined };

context.register(TestConfiguration);

export default context;
