[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / assign

# Variable: assign

> **assign**: \{\<`T`, `U`\>(`target`, `source`): `T` & `U`; \<`T`, `U`, `V`\>(`target`, `source1`, `source2`): `T` & `U` & `V`; \<`T`, `U`, `V`, `W`\>(`target`, `source1`, `source2`, `source3`): `T` & `U` & `V` & `W`; (`target`, ...`sources`): `any`; \}

Defined in: packages/blue-http/src/http.ts:270

## Call Signature

> \<`T`, `U`\>(`target`, `source`): `T` & `U`

Copy the values of all of the enumerable own properties from one or more source objects to a
target object. Returns the target object.

### Type Parameters

#### T

`T` *extends* `object`

#### U

`U`

### Parameters

#### target

`T`

The target object to copy to.

#### source

`U`

The source object from which to copy properties.

### Returns

`T` & `U`

## Call Signature

> \<`T`, `U`, `V`\>(`target`, `source1`, `source2`): `T` & `U` & `V`

Copy the values of all of the enumerable own properties from one or more source objects to a
target object. Returns the target object.

### Type Parameters

#### T

`T` *extends* `object`

#### U

`U`

#### V

`V`

### Parameters

#### target

`T`

The target object to copy to.

#### source1

`U`

The first source object from which to copy properties.

#### source2

`V`

The second source object from which to copy properties.

### Returns

`T` & `U` & `V`

## Call Signature

> \<`T`, `U`, `V`, `W`\>(`target`, `source1`, `source2`, `source3`): `T` & `U` & `V` & `W`

Copy the values of all of the enumerable own properties from one or more source objects to a
target object. Returns the target object.

### Type Parameters

#### T

`T` *extends* `object`

#### U

`U`

#### V

`V`

#### W

`W`

### Parameters

#### target

`T`

The target object to copy to.

#### source1

`U`

The first source object from which to copy properties.

#### source2

`V`

The second source object from which to copy properties.

#### source3

`W`

The third source object from which to copy properties.

### Returns

`T` & `U` & `V` & `W`

## Call Signature

> (`target`, ...`sources`): `any`

Copy the values of all of the enumerable own properties from one or more source objects to a
target object. Returns the target object.

### Parameters

#### target

`object`

The target object to copy to.

#### sources

...`any`[]

One or more source objects from which to copy properties

### Returns

`any`
