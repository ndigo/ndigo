[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / counted

# Function: counted()

> **counted**(`nameOrTarget?`, `attributesOrContext?`, `maybeContext?`): `any`

Defined in: [packages/blue-telemetry/src/metrics/decorators.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-telemetry/src/metrics/decorators.ts#lines-120)

A method decorator that increments a counter each time the decorated method is called.

This decorator integrates with OpenTelemetry metrics to track method invocation counts.
It supports various ways of specifying the counter name and associated attributes.

## Parameters

### nameOrTarget?

`string` \| `Function` \| [`CountedOptions`](../interfaces/CountedOptions.md)

Overload 1: The name of the counter. Overload 2: An object of `CountedOptions`. Overload 3: The target function when used without parentheses.

### attributesOrContext?

`ClassMethodDecoratorContext`\<`unknown`, (`this`, ...`args`) => `any`\> \| `Attributes`

Overload 1: Optional attributes for the counter. Overload 3: The decorator context.

### maybeContext?

`ClassMethodDecoratorContext`\<`unknown`, (`this`, ...`args`) => `any`\>

Overload 3: The decorator context.

## Returns

`any`

A method decorator or the decorated method itself.

## Throws

If applied to anything other than a method.

## Example

```typescript
class MyService {
  `counted`()
  myMethod() {
    // Increments 'myMethod.count'
  }

  `counted`('custom.event.count')
  anotherMethod() {
    // Increments 'custom.event.count'
  }

  `counted`({ name: 'api.calls', attributes: { endpoint: '/users' } })
  apiCall() {
    // Increments 'api.calls' with 'endpoint: /users'
  }

  `counted`('feature.usage', { feature: 'dashboard' })
  dashboardView() {
    // Increments 'feature.usage' with 'feature: dashboard'
  }
}
```
