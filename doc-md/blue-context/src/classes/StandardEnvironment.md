[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / StandardEnvironment

# Class: StandardEnvironment

Defined in: packages/blue-context/src/environment.ts:201

## Extends

- [`AbstractEnvironment`](AbstractEnvironment.md)

## Extended by

- [`BrowserEnvironment`](../../../blue-platform-web/src/classes/BrowserEnvironment.md)

## Constructors

### Constructor

> **new StandardEnvironment**(`propertySources`): `StandardEnvironment`

Defined in: packages/blue-context/src/environment.ts:109

#### Parameters

##### propertySources

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[] = `[]`

#### Returns

`StandardEnvironment`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`constructor`](AbstractEnvironment.md#constructor)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`propertySources`](AbstractEnvironment.md#propertysources)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-context/src/environment.ts:85

##### Returns

`string`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`[toStringTag]`](AbstractEnvironment.md#tostringtag)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`activeProfiles`](AbstractEnvironment.md#activeprofiles)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`defaultProfiles`](AbstractEnvironment.md#defaultprofiles)

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: packages/blue-context/src/environment.ts:115

#### Parameters

##### profile

`string`

#### Returns

`void`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`addActiveProfile`](AbstractEnvironment.md#addactiveprofile)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: packages/blue-context/src/environment.ts:119

#### Parameters

##### key

`string`

#### Returns

`boolean`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`hasProperty`](AbstractEnvironment.md#hasproperty)

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

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getProperty`](AbstractEnvironment.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-context/src/environment.ts:127

#### Parameters

##### key

`string`

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRequiredProperty`](AbstractEnvironment.md#getrequiredproperty)

***

### merge()

> **merge**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:131

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

#### Returns

`void`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`merge`](AbstractEnvironment.md#merge)

***

### \_isActiveProfile()

> `protected` **\_isActiveProfile**(`profile`): `boolean`

Defined in: packages/blue-context/src/environment.ts:142

#### Parameters

##### profile

`string`

#### Returns

`boolean`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`_isActiveProfile`](AbstractEnvironment.md#_isactiveprofile)
