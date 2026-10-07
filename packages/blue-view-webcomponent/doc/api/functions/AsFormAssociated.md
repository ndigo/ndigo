[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / AsFormAssociated

# Function: AsFormAssociated()

> **AsFormAssociated**\<`T`\>(`superclass`): `Constructable`\<[`FormAssociatedElement`](../interfaces/FormAssociatedElement.md)\> & `T`

Marks a custom element as form-associated (FACE) and bridges its value into
native form submission through `ElementInternals`.

BlueJS contract: a form-associated element submits **standard** form data
(`name=value`, encoded by the browser exactly like a native control), so the
server path is unchanged — `@bodyMapping`/`dataBinderValue` and Zod
validation read the same `application/x-www-form-urlencoded` / multipart
payload, and a wrapped native `<input>` is not needed. There is **no
per-component wrapper**: expose `name`/`value`, write `value`, and the
browser does the rest (the element also appears in `form.elements`).

The mixin sets the `formAssociated` static flag (required by the platform),
acquires `ElementInternals` in the constructor when the host supports it,
and exposes `internals`/`form` plus `name`/`value` accessors; assigning
`value` calls `ElementInternals.setFormValue`.

## Type Parameters

### T

`T` *extends* `Constructable`\<`HTMLElement`\>

## Parameters

### superclass

`T`

The base class to extend (typically `HTMLElement` or
  `AbstractWebComponent`).

## Returns

`Constructable`\<[`FormAssociatedElement`](../interfaces/FormAssociatedElement.md)\> & `T`

A form-associated subclass carrying the [FormAssociatedElement](../interfaces/FormAssociatedElement.md) surface.

## Example

```ts
class RatingInput extends AsFormAssociated(AbstractWebComponent) {
    set model(model: { score: number }) {
        this.value = String(model.score);
    }
    render(): void { … }
}
customElements.define('rating-input', RatingInput); // <form><rating-input name="rating">
```

## Since

1.0.0
