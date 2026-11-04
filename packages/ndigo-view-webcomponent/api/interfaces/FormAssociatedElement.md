[**@ndigo/view-webcomponent v0.0.1**](../README.md)

***

[@ndigo/view-webcomponent](../README.md) / FormAssociatedElement

# Interface: FormAssociatedElement

The form-participation surface produced by [AsFormAssociated](../functions/AsFormAssociated.md).

Value semantics mirror a native form control: the `value` **content
attribute** is the default (the `form.reset()` target, and it participates
in submission from upgrade time), while `.value` is the live submitted
value. The platform lifecycle callbacks — `formResetCallback` (restore the
default and re-publish it), `formDisabledCallback` (a `<fieldset disabled>`
ancestor toggled), `formStateRestoreCallback` (browser restore/autofill) —
are implemented by the mixin; see [AsFormAssociated](../functions/AsFormAssociated.md) for the full
lifecycle table.

## Properties

### defaultValue

> `readonly` **defaultValue**: `string`

The value `form.reset()` restores: the last `value` **content
attribute**, or `''` when there is none. Assigning `.value` in script
changes the live value only — mirroring native `input.value` versus
`input.defaultValue`.

***

### disabled

> `readonly` **disabled**: `boolean`

`true` while the platform has disabled this control (a `<fieldset
disabled>` ancestor); reflects to the `data-ndigo-disabled` attribute.

***

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

The submitted field name (reflects the `name` attribute; assigning an
empty string removes the attribute).

***

### value

> **value**: `string`

The live submitted value; writes route through
`ElementInternals.setFormValue` when the host supports it.
