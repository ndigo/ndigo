[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / configuration

# Variable: configuration

> `const` **configuration**: `ClassDecorator`

Defined in: packages/blue-context/src/configuration.ts:86

Indicates that a class declares one or more @entry\|@entry methods and may be processed to provide the method results at runtime. For example:
```javascript
&#064;Configuration
class FooBarConfig {
 &#064;Value
 foo(){
     return 'foo';
 }
 &#064;Value
 bar(){
     return new Bar();
 }
}
```
@configuration\|@configuration classes are bootstrapped using the [MetadataConfigApplicationContext](../classes/MetadataConfigApplicationContext.md).
```javascript
const context = new MetadataConfigApplicationContext( 'foobar' );
context.register( FooBarConfig );
context.getValue( 'foo' ); // "foo"
```

## See

[MetadataConfigApplicationContext](../classes/MetadataConfigApplicationContext.md)
