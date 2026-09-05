[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / DataBinder

# Class: DataBinder

Defined in: [packages/blue-core/src/data-binder.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-21)

Binds data from property values to a target object, supporting keypath expressions.

## Constructors

### Constructor

> **new DataBinder**(`target`, `name?`): `DataBinder`

Defined in: [packages/blue-core/src/data-binder.ts:80](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-80)

Creates an instance of DataBinder.

#### Parameters

##### target

`any`

The object to bind data to.

##### name?

`string` = `'target'`

The name of the data binder (defaults to 'target').

#### Returns

`DataBinder`

## Accessors

### requiredFields

#### Get Signature

> **get** **requiredFields**(): `string`[]

Defined in: [packages/blue-core/src/data-binder.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-31)

Gets the list of required fields for data binding.

##### Returns

`string`[]

An array of required field names.

#### Set Signature

> **set** **requiredFields**(`fields`): `void`

Defined in: [packages/blue-core/src/data-binder.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-42)

Sets the list of required fields for data binding.

##### Parameters

###### fields

`string`[]

An array of field names that must be present.

##### Returns

`void`

***

### name

#### Get Signature

> **get** **name**(): `string`

Defined in: [packages/blue-core/src/data-binder.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-57)

The name of the data binder.

##### Returns

`string`

***

### result

#### Get Signature

> **get** **result**(): `any`

Defined in: [packages/blue-core/src/data-binder.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-64)

The result of the data binding operation.

##### Returns

`any`

***

### target

#### Get Signature

> **get** **target**(): `any`

Defined in: [packages/blue-core/src/data-binder.ts:71](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-71)

The target object to which data is being bound.

##### Returns

`any`

## Methods

### bind()

> **bind**(`properties`): `void`

Defined in: [packages/blue-core/src/data-binder.ts:91](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-91)

Binds the provided property values to the target object.

#### Parameters

##### properties

[`PropertyValues`](../interfaces/PropertyValues.md)

The property values to bind.

#### Returns

`void`

#### Throws

If a required field is missing.

***

### validate()

> **validate**(): `void`

Defined in: [packages/blue-core/src/data-binder.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-101)

Validates the current state of the data binder.

#### Returns

`void`

#### Throws

If no target object is set.

***

### \_applyPropertyValues()

> `protected` **\_applyPropertyValues**(`properties`): `void`

Defined in: [packages/blue-core/src/data-binder.ts:112](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-112)

Applies the given property values to the target object.

#### Parameters

##### properties

[`MutablePropertyValues`](MutablePropertyValues.md)

The mutable property values to apply.

#### Returns

`void`

***

### \_checkRequiredFields()

> `protected` **\_checkRequiredFields**(`properties`): `void`

Defined in: [packages/blue-core/src/data-binder.ts:137](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/data-binder.ts#lines-137)

Checks if all required fields are present in the provided property values.

#### Parameters

##### properties

[`MutablePropertyValues`](MutablePropertyValues.md)

The mutable property values to check.

#### Returns

`void`

#### Throws

If a required field is missing.
