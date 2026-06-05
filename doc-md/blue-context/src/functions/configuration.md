[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / configuration

# Function: configuration()

> **configuration**\<`T`\>(`target`, `context`): `T`

Defined in: packages/blue-context/src/configuration.ts:98

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

## Type Parameters

### T

`T` *extends* (...`args`) => `any`

## Parameters

### target

`T`

The configuration class constructor.

### context

`ClassDecoratorContext`

The decorator context.

## Returns

`T`

The original class constructor.

## See

[MetadataConfigApplicationContext](../classes/MetadataConfigApplicationContext.md)
