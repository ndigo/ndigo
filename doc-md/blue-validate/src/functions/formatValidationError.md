[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / formatValidationError

# Function: formatValidationError()

> **formatValidationError**(`error`, `contentLookup?`, `language?`): `string`[]

Defined in: [packages/blue-validate/src/format.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/format.ts#lines-45)

Formats the violation names from a [ConstraintViolationError](../classes/ConstraintViolationError.md) into
human-readable strings.

When a `contentLookup` is provided each violation name is used as an i18n
key (e.g. `"validate.constraint.NotBlank"`).  If the lookup returns the key
unchanged (no translation found) the constraint name itself is used instead.

## Parameters

### error

[`ConstraintViolationError`](../classes/ConstraintViolationError.md)

The constraint violation error to format.

### contentLookup?

[`ContentLookup`](../interfaces/ContentLookup.md)

Optional content source for i18n message resolution.

### language?

`string` = `'en'`

Language code passed to the content lookup. Defaults to `'en'`.

## Returns

`string`[]

An array of human-readable violation messages, one per violated constraint.

## Examples

```ts
// Without a content source — returns constraint names
const messages = formatValidationError(error);
// ['NotBlank', 'Min']
```

```ts
// With a content source
const messages = formatValidationError(error, contentSource, 'fr');
// ['Ne doit pas être vide', 'Valeur minimale non atteinte']
```
