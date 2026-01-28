[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / AsEventEmitter

# Function: AsEventEmitter()

> **AsEventEmitter**\<`T`\>(`superclass`): [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)\<[`EventEmitter`](../interfaces/EventEmitter.md)\> & `T`

Defined in: packages/blue-context/src/event-emitter.ts:618

## Type Parameters

### T

`T` *extends* [`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)

## Parameters

### superclass

`T`

## Returns

[`Constructable`](../../../blue-core/src/type-aliases/Constructable.md)\<[`EventEmitter`](../interfaces/EventEmitter.md)\> & `T`

## Example

```ts
const
 MyEmitter = AsEventEmitter( {} ),
 greeter = new MyEmitter();
greeter.on( 'hello', () => console.log( 'Hello!' ) );
greeter.emtest( 'hello' ); // true
// Hello!
```
