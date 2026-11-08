[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / requestPart

# Function: requestPart()

Creates a request-part extractor.

## Param

**partNameOrTarget**

The part name or a DTO constructor.

## Param

**targetOrOptions**

The DTO constructor or options.

## Param

**options**

Extractor options (`required`).

## Call Signature

> **requestPart**(`partName?`, `target?`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Factory function: Create a multipart JSON/text-part extractor (D-6).

Reads a named `multipart/form-data` part and binds it like `@RequestBody`:
JSON parts parse to an object (raw-text fallback), optionally into a real
target instance, then through the shared conversion + Zod `convert` hook.
File parts stay `fileValue()`/`MultipartFile`.

The part name follows the AD-26 `fileValue` convention — explicit when
given, otherwise the method-argument name. Mirrors the reference
`@RequestPart(value)` with parameter-name fallback:

- `requestPart()` reads the part named after the argument as a plain object;
- `requestPart(MetaDto)` does the same into an instantiated DTO;
- `requestPart('meta', MetaDto)` overrides the part name.

Resolved by `NodeRequestPartMethodArgumentResolver` (ndigo-platform-node).

A missing part resolves to the extractor's `defaultValue` (`null`) unless
the part is declared required: requestPart('meta', undefined, { required:
true }) / requestPart(MetaDto, { required: true }) make a missing part
a [MissingParameterError](../../error/classes/MissingParameterError.md) (HTTP 400) instead of a late TypeError
(DOC-5).

### Parameters

#### partName?

`string`

The multipart field name; defaults to the argument name.

#### target?

new () => `object`

Optional target constructor for the bound part.

#### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md)

Extractor options (`required`).

### Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.

### Example

```ts
parameters({
  meta: requestPart(MetaDto),
  biography: requestPart('bio'),
  file: fileValue()
})
```

## Call Signature

> **requestPart**(`target`, `options?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Creates a request-part extractor targeting a DTO.

### Parameters

#### target

new () => `object`

The DTO constructor.

#### options?

[`ParameterExtractorOptions`](../../parameter-types/interfaces/ParameterExtractorOptions.md)

Extractor options (`required`).

### Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

The parameter extractor.
