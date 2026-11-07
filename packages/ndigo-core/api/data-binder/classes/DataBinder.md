[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [data-binder](../README.md) / DataBinder

# Class: DataBinder

Binds data from property values to a target object, supporting keypath expressions.

## Example

```ts
const target = { user: { name: '' } };
const binder = new DataBinder(target);
const values = new MutablePropertyValues();
values.addPropertyValue('user.name', 'Ada');
binder.bind(values);
target.user.name; // 'Ada'
```

## Constructors

### Constructor

> **new DataBinder**(`target`, `name?`): `DataBinder`

Creates an instance of DataBinder.

#### Parameters

##### target

`unknown`

The object to bind data to.

##### name?

`string` = `'target'`

The name of the data binder (defaults to 'target').

#### Returns

`DataBinder`

## Accessors

### name

#### Get Signature

> **get** **name**(): `string`

The name of the data binder.

##### Returns

`string`

***

### requiredFields

#### Get Signature

> **get** **requiredFields**(): `string`[]

Gets the list of required fields for data binding.

##### Returns

`string`[]

An array of required field names.

#### Set Signature

> **set** **requiredFields**(`fields`): `void`

Sets the list of required fields for data binding.

##### Parameters

###### fields

`string`[]

An array of field names that must be present.

##### Returns

`void`

***

### result

#### Get Signature

> **get** **result**(): `unknown`

The result of the data binding operation.

##### Returns

`unknown`

***

### target

#### Get Signature

> **get** **target**(): `unknown`

The target object to which data is being bound.

##### Returns

`unknown`

## Methods

### bind()

> **bind**(`properties`): `void`

Binds the provided property values to the target object.

#### Parameters

##### properties

[`PropertyValues`](../../property-value/interfaces/PropertyValues.md)

The property values to bind.

#### Returns

`void`

#### Throws

If a required field is missing.

***

### validate()

> **validate**(): `void`

Validates the current state of the data binder.

#### Returns

`void`

#### Throws

If no target object is set.
