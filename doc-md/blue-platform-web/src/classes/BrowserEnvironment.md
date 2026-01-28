[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserEnvironment

# Class: BrowserEnvironment

Defined in: packages/blue-platform-web/src/brower-environment.ts:3

## Extends

- [`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md)

## Constructors

### Constructor

> **new BrowserEnvironment**(`propertySources`): `BrowserEnvironment`

Defined in: packages/blue-context/src/environment.ts:109

#### Parameters

##### propertySources

[`JSONObject`](../../../blue-core/src/interfaces/JSONObject.md)[] = `[]`

#### Returns

`BrowserEnvironment`

#### Inherited from

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`constructor`](../../../blue-context/src/classes/StandardEnvironment.md#constructor)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`propertySources`](../../../blue-context/src/classes/StandardEnvironment.md#propertysources)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-context/src/environment.ts:85

##### Returns

`string`

#### Inherited from

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`[toStringTag]`](../../../blue-context/src/classes/StandardEnvironment.md#tostringtag)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`activeProfiles`](../../../blue-context/src/classes/StandardEnvironment.md#activeprofiles)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`defaultProfiles`](../../../blue-context/src/classes/StandardEnvironment.md#defaultprofiles)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`addActiveProfile`](../../../blue-context/src/classes/StandardEnvironment.md#addactiveprofile)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`hasProperty`](../../../blue-context/src/classes/StandardEnvironment.md#hasproperty)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`getProperty`](../../../blue-context/src/classes/StandardEnvironment.md#getproperty)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`getRequiredProperty`](../../../blue-context/src/classes/StandardEnvironment.md#getrequiredproperty)

***

### merge()

> **merge**(`environment`): `void`

Defined in: packages/blue-context/src/environment.ts:131

#### Parameters

##### environment

[`ConfigurableEnvironment`](../../../blue-context/src/interfaces/ConfigurableEnvironment.md)

#### Returns

`void`

#### Inherited from

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`merge`](../../../blue-context/src/classes/StandardEnvironment.md#merge)

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

[`StandardEnvironment`](../../../blue-context/src/classes/StandardEnvironment.md).[`_isActiveProfile`](../../../blue-context/src/classes/StandardEnvironment.md#_isactiveprofile)
