[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [trace/decorators](../README.md) / traced

# Function: traced()

> **traced**(`nameOrTarget?`, `maybeContext?`): `any`

A method decorator that creates and manages an OpenTelemetry span for the decorated method's execution.

When applied, this decorator will automatically start a new span before the method executes and end it
upon completion, recording any errors that occur. It supports both synchronous and asynchronous methods.

## Parameters

### nameOrTarget?

`string` \| `Function`

Optional. The name of the span to create. If not provided, the method's name will be used.
                      Alternatively, if used without parentheses, this will be the target function.

### maybeContext?

`ClassMethodDecoratorContext`\<`unknown`, (`this`, ...`args`) => `any`\>

Optional. The decorator context provided by TypeScript for method decorators.

## Returns

`any`

A method decorator or the decorated method itself.

## Throws

If applied to anything other than a method.

## Example

```typescript
class MyService {
  @traced()
  myMethod() {
    // ...
  }

  @traced('custom-span-name')
  anotherMethod() {
    // ...
  }

  @traced('async-operation')
  async asyncMethod() {
    await someAsyncOperation();
  }
}
```
