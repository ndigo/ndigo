[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / setErrorMessageFormatter

# Function: setErrorMessageFormatter()

> **setErrorMessageFormatter**(`formatter`): `void`

Defined in: [packages/blue-validate/src/decorators.ts:157](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-157)

Replaces the default error message formatter.

Use this to provide i18n translations or custom formatting:

```ts
import { setErrorMessageFormatter } from '@blue/validate';

setErrorMessageFormatter((constraint, field, value, msg) => {
  return msg ?? `Field "${field}" with value "${value}" failed "${constraint}"`;
});
```

## Parameters

### formatter

(`constraintName`, `propertyName`, `value`, `message?`) => `string`

The new formatter function.

## Returns

`void`
