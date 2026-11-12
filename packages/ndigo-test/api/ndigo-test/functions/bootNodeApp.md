[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [ndigo-test](../README.md) / bootNodeApp

# Function: bootNodeApp()

> **bootNodeApp**(`sources`): [`NdigoTestApp`](../interfaces/NdigoTestApp.md)

Boot a Ndigo application from configuration/controller classes and wire the
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

[`NdigoTestApp`](../interfaces/NdigoTestApp.md)

A booted app exposing the context and configured dispatcher.

## Example

```ts
const app = bootNodeApp([HelloConfiguration]);
const mockHTTP = new MockHTTP(app);
const res = await mockHTTP.get('/').exec();
```
