[**@ndigo/management v0.0.1**](../README.md)

***

[@ndigo/management](../README.md) / ConfigurationPropertiesController

# Class: ConfigurationPropertiesController

Serves `/configprops`: the declared keys and conversion types of the
app's `@configurationProperties` classes — **never their values**, so the
endpoint cannot leak a secret by construction (the same value-free
contract `@ndigo/inspect` codifies; AD-76 D-3).

The class list is the explicit `configurationClasses` option (mirroring
`@ndigo/inspect`'s `configurationClasses` input) — the framework keeps no
registry of bound classes to scan.

Payload shape: `{ beans: [{ name, properties: [{ key, type? }] }] }`,
deterministically sorted.

## Since

1.0.0

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new ConfigurationPropertiesController**(`classes?`, `exposure?`): `ConfigurationPropertiesController`

#### Parameters

##### classes?

(new () => `unknown`)[] = `[]`

The `@configurationProperties` classes to enumerate.

##### exposure?

###### exclude?

`string`[]

###### include?

`string`[]

#### Returns

`ConfigurationPropertiesController`

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

### configprops()

> **configprops**(): `ResponseEntity`\<`void`\> \| \{ `beans`: `object`[]; \}

The configuration-properties document.

#### Returns

`ResponseEntity`\<`void`\> \| \{ `beans`: `object`[]; \}

`{ beans: […] }` — never values.

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
