[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / equates

# Function: equates()

> **equates**(`value1`, `value2`): `boolean`

Compares arbitrary values using strict primitive equality (`NaN` is unequal; +/-0 are equal).
When both values expose `equals`, delegates to the left value, including for nested values.
When only one exposes `equals`, they are unequal unless they are the same reference.
Other identical references are equal. Distinct objects support only these domains:
- Plain records with Object.prototype or null prototype: matching prototypes and recursive
  comparison of own enumerable string and symbol properties.
- Arrays with Array.prototype: matching lengths, own index presence and recursive values
  (holes differ from undefined), plus own enumerable non-index properties.
- Dates with Date.prototype: equal timestamps (distinct invalid Dates are unequal).
- Maps with Map.prototype: native key identity/SameValueZero and recursive value equality.
- Sets with Set.prototype: native membership/SameValueZero, not structural member equality.
Date/Map/Set extra properties are ignored. Subclasses and all other object kinds, including
RegExp, WeakMap, WeakSet and Promise, are identity-only unless they expose `equals`.
Recursive comparisons match corresponding active ancestors, so matching cycles terminate
and different cycle structures are unequal; non-cyclic sharing does not affect equality.

## Parameters

### value1

`unknown`

The first value to be tested.

### value2

`unknown`

The second value to be tested.

## Returns

`boolean`

`true` if the values are equal, `false` otherwise.
