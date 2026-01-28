[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / AbstractEnvironment

# Abstract Class: AbstractEnvironment

Defined in: packages/blue-context/src/environment.ts:72

## Extended by

- [`MockEnvironment`](MockEnvironment.md)
- [`StandardEnvironment`](StandardEnvironment.md)

## Implements

- [`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

## Constructors

### Constructor

> **new AbstractEnvironment**(`propertySources`): `AbstractEnvironment`

Defined in: packages/blue-context/src/environment.ts:109

#### Parameters

##### propertySources

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[] = `[]`

#### Returns

`AbstractEnvironment`

## Accessors

### propertySources

#### Get Signature

> **get** **propertySources**(): [`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

Defined in: packages/blue-context/src/environment.ts:77

##### Returns

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Defined in: packages/blue-context/src/environment.ts:81

##### Parameters

###### propertySources

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[]

##### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`propertySources`](../interfaces/ConfigurableEnvironment.md#propertysources)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-context/src/environment.ts:85

##### Returns

`string`

***

### activeProfiles

#### Get Signature

> **get** **activeProfiles**(): `string`[]

Defined in: packages/blue-context/src/environment.ts:89

##### Returns

`string`[]

#### Set Signature

> **set** **activeProfiles**(`profiles`): `void`

Defined in: packages/blue-context/src/environment.ts:93

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`activeProfiles`](../interfaces/ConfigurableEnvironment.md#activeprofiles)

***

### defaultProfiles

#### Get Signature

> **get** **defaultProfiles**(): `string`[]

Defined in: packages/blue-context/src/environment.ts:99

##### Returns

`string`[]

#### Set Signature

> **set** **defaultProfiles**(`profiles`): `void`

Defined in: packages/blue-context/src/environment.ts:103

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`defaultProfiles`](../interfaces/ConfigurableEnvironment.md#defaultprofiles)

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/src/environment.ts:115

#### Parameters

##### profile

`string`

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`addActiveProfile`](../interfaces/ConfigurableEnvironment.md#addactiveprofile)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/environment.ts:119

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`hasProperty`](../interfaces/ConfigurableEnvironment.md#hasproperty)

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/environment.ts:123

#### Parameters

##### key

`string`

##### defaultValue?

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getProperty`](../interfaces/ConfigurableEnvironment.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/environment.ts:127

#### Parameters

##### key

`string`

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`getRequiredProperty`](../interfaces/ConfigurableEnvironment.md#getrequiredproperty)

***

### merge()

> **merge**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:131

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

#### Returns

`void`

#### Implementation of

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md).[`merge`](../interfaces/ConfigurableEnvironment.md#merge)

***

### \_isActiveProfile()

> `protected` **\_isActiveProfile**(`profile`): `boolean`

Defined in: packages/blue-context/src/environment.ts:142

#### Parameters

##### profile

`string`

#### Returns

`boolean`
