[**@blue/test v0.0.1**](../README.md)

***

[@blue/test](../README.md) / bootApp

# Function: bootApp()

> **bootApp**(`sources`): [`BlueTestApp`](../interfaces/BlueTestApp.md)

Boot a Blue application from configuration/controller classes and wire the
dispatcher.

Each source is registered into a `MetadataConfigApplicationContext`:
a `configuration` class is handed to `context.register`; a plain
`@getMapping` controller class is instantiated and stored by its class name,
which the handler mapping discovers during `init`.

## Parameters

### sources

`Function`[]

Application configuration and/or controller classes.

## Returns

[`BlueTestApp`](../interfaces/BlueTestApp.md)

A booted app exposing the context and configured dispatcher.

## Example

```ts
const app = bootApp([HelloConfiguration]);
const mockHTTP = new MockHTTP(app);
const res = await mockHTTP.get('/').exec();
```
