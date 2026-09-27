[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / requestPart

# Function: requestPart()

## Call Signature

> **requestPart**(`partName?`, `target?`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a multipart JSON/text-part extractor (D-6).

Reads a named `multipart/form-data` part and binds it like `@RequestBody`:
JSON parts parse to an object (raw-text fallback), optionally into a real
target instance, then through the shared conversion + Zod `convert` hook.
File parts stay `fileValue()`/`MultipartFile`.

The part name follows the AD-26 `fileValue` convention — explicit when
given, otherwise the method-argument name. Mirrors Spring's
`@RequestPart(value)` with parameter-name fallback:

- `requestPart()` reads the part named after the argument as a plain object;
- `requestPart(MetaDto)` does the same into an instantiated DTO;
- `requestPart('meta', MetaDto)` overrides the part name.

Resolved by `NodeRequestPartMethodArgumentResolver` (blue-platform-node).

### Parameters

#### partName?

`string`

#### target?

() => `object`

### Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

### Example

```ts
`parameters`({
  meta: requestPart(MetaDto),
  biography: requestPart('bio'),
  file: fileValue()
})
```

## Call Signature

> **requestPart**(`target`): [`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

Factory function: Create a multipart JSON/text-part extractor (D-6).

Reads a named `multipart/form-data` part and binds it like `@RequestBody`:
JSON parts parse to an object (raw-text fallback), optionally into a real
target instance, then through the shared conversion + Zod `convert` hook.
File parts stay `fileValue()`/`MultipartFile`.

The part name follows the AD-26 `fileValue` convention — explicit when
given, otherwise the method-argument name. Mirrors Spring's
`@RequestPart(value)` with parameter-name fallback:

- `requestPart()` reads the part named after the argument as a plain object;
- `requestPart(MetaDto)` does the same into an instantiated DTO;
- `requestPart('meta', MetaDto)` overrides the part name.

Resolved by `NodeRequestPartMethodArgumentResolver` (blue-platform-node).

### Parameters

#### target

() => `object`

### Returns

[`ParameterExtractor`](../type-aliases/ParameterExtractor.md)

### Example

```ts
`parameters`({
  meta: requestPart(MetaDto),
  biography: requestPart('bio'),
  file: fileValue()
})
```
