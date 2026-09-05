[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / bootApp

# Function: bootApp()

> **bootApp**(`sources`): [`BlueTestApp`](../interfaces/BlueTestApp.md)

Defined in: [packages/blue-test/src/blue-test.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/blue-test.ts#lines-50)

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
const mockMVC = new MockMVC(app);
const res = await mockMVC.get('/').exec();
```
