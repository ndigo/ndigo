[**@ndigo/management v0.0.1**](../README.md)

***

[@ndigo/management](../README.md) / EnvironmentController

# Class: EnvironmentController

Serves `/env`: the active profiles and every property source in
precedence order with its flattened dotted keys, values and origins.

Payload follows the actuator env endpoint:
`{ activeProfiles, propertySources: [{ name, properties }] }`. Values are
`"<redacted>"` unless `management.endpoints.env.showValues: true`, and
even then only the raw stored text is emitted — decrypted plaintext
never reaches the wire (AD-76 D-3). `?toMatch=` filters to sources whose
name contains the term plus properties whose key starts with it.

## Since

1.0.0

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new EnvironmentController**(`exposure?`): `EnvironmentController`

#### Parameters

##### exposure?

The programmatic exposure override (AD-76 D-5);
  wins over the `management.*` source section.

###### exclude?

`string`[]

###### include?

`string`[]

#### Returns

`EnvironmentController`

#### Overrides

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

## Methods

### env()

> **env**(`toMatch?`): `ResponseEntity`\<`void`\> \| \{ `activeProfiles`: `string`[]; `propertySources`: `object`[]; \}

The environment document.

#### Parameters

##### toMatch?

`string`

Optional filter term.

#### Returns

`ResponseEntity`\<`void`\> \| \{ `activeProfiles`: `string`[]; `propertySources`: `object`[]; \}

The environment document.

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`
