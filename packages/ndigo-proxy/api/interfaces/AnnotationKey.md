[**@ndigo/proxy v0.0.1**](../README.md)

***

[@ndigo/proxy](../README.md) / AnnotationKey

# Interface: AnnotationKey()\<T\>

Stable handle for a method annotation: a namespace key plus a callable that
produces the decorator. Pass the key to [annotationOf](../functions/annotationOf.md) or
`MethodDescriptor.annotation`; call it with a value to decorate:

```ts
const audited = methodAnnotation<{ action: string }>('audited');

class OrderService {
    @audited({ action: 'order.submit' })
    submit(): void {}
}
```

## Type Parameters

### T

`T`

> **AnnotationKey**(`value`): \<`M`\>(`target`, `context`) => `M`

The metadata-only method decorator factory.

## Parameters

### value

`T`

## Returns

\<`M`\>(`target`, `context`) => `M`

## Properties

### key

> `readonly` **key**: `string`

Namespace-stable key (`"proxy:<name>"`). Reads never re-derive it from
the decorator, so renaming the variable keeps lookups working.

***

### name

> `readonly` **name**: `string`

The user-supplied annotation name (the `<name>` segment of the key).
