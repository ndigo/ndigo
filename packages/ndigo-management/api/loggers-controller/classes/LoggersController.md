[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [loggers-controller](../README.md) / LoggersController

# Class: LoggersController

Serves `/loggers`: the level index, per-logger reads, and per-logger
level changes (runtime, process-local — lost on restart, AD-76 D-7).

Payloads follow the actuator loggers endpoint: the index is
`{ levels, loggers: { <name>: { configuredLevel?, effectiveLevel } } }`,
a single logger is `{ configuredLevel?, effectiveLevel }` (404 when the
name was never requested), and a POST body of
`{"configuredLevel": "debug"}` sets a level while `{}` clears it back to
the global settings floor. Unknown level names are rejected 400 by the
body schema's enum.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new LoggersController**(`exposure?`): `LoggersController`

#### Parameters

##### exposure?

The programmatic exposure override (AD-76 D-5);
  wins over the `management.*` source section.

###### exclude?

`string`[]

###### include?

`string`[]

#### Returns

`LoggersController`

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

### getLogger()

> **getLogger**(`name`): `ResponseEntity`\<`void`\> \| \{ `configuredLevel?`: `string`; `effectiveLevel`: `string`; \}

Reads one logger's levels; 404 when the name was never requested.

#### Parameters

##### name

`string`

The logger name.

#### Returns

`ResponseEntity`\<`void`\> \| \{ `configuredLevel?`: `string`; `effectiveLevel`: `string`; \}

The level document, or 404.

***

### index()

> **index**(): `ResponseEntity`\<`void`\> \| \{ `levels`: `string`[]; `loggers`: `Record`\<`string`, \{ `configuredLevel?`: `string`; `effectiveLevel`: `string`; \}\>; \}

The level index: the canonical vocabulary and every requested logger
with its configured (override) and effective level.

#### Returns

`ResponseEntity`\<`void`\> \| \{ `levels`: `string`[]; `loggers`: `Record`\<`string`, \{ `configuredLevel?`: `string`; `effectiveLevel`: `string`; \}\>; \}

The index document.

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

***

### setLogger()

> **setLogger**(`name`, `body`): `ResponseEntity`\<`void`\> \| \{ `configuredLevel?`: `string`; `effectiveLevel`: `string`; \}

Sets or clears a logger's level (AD-76 D-7). A body with
`configuredLevel` sets a per-name override; an empty body clears it.
Invalid level names fail validation with 400.

#### Parameters

##### name

`string`

The logger name.

##### body

The parsed request body.

###### configuredLevel?

`string`

#### Returns

`ResponseEntity`\<`void`\> \| \{ `configuredLevel?`: `string`; `effectiveLevel`: `string`; \}

The resulting level document.
