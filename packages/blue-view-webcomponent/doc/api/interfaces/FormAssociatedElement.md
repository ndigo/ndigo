[**@blue/view-webcomponent v0.0.1**](../README.md)

***

[@blue/view-webcomponent](../README.md) / FormAssociatedElement

# Interface: FormAssociatedElement

The form-participation surface produced by [AsFormAssociated](../functions/AsFormAssociated.md).

## Properties

### form

> `readonly` **form**: `HTMLFormElement` \| `null`

The form that owns this element, or `null` when it is not
form-associated in this host.

***

### internals

> `readonly` **internals**: `ElementInternals` \| `undefined`

The element's `ElementInternals`, or `undefined` on hosts that do not
provide them (see [AsFormAssociated](../functions/AsFormAssociated.md) for the degradation).

***

### name

> **name**: `string`

The submitted field name (reflects the `name` attribute).

***

### value

> **value**: `string`

The submitted value; writes route through
`ElementInternals.setFormValue` when the host supports it.
