[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / StandardEnvironment

# Class: StandardEnvironment

Defined in: [packages/blue-context/src/environment.ts:271](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-271)

Default environment implementation used by application contexts.

## Extends

- [`AbstractEnvironment`](AbstractEnvironment.md)

## Constructors

### Constructor

> **new StandardEnvironment**(`propertySources?`): `StandardEnvironment`

Defined in: [packages/blue-context/src/environment.ts:154](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-154)

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

#### Returns

`StandardEnvironment`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`constructor`](AbstractEnvironment.md#constructor)

## Accessors

### propertySources

#### Get Signature

> **get** **propertySources**(): `JSONObject`[]

Defined in: [packages/blue-context/src/environment.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-120)

The ordered property sources used for resolution.

##### Returns

`JSONObject`[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Defined in: [packages/blue-context/src/environment.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-124)

The ordered property sources used for resolution.

##### Parameters

###### propertySources

`JSONObject`[]

##### Returns

`void`

The ordered property sources used for resolution.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`propertySources`](AbstractEnvironment.md#propertysources)

***

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-context/src/environment.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-128)

##### Returns

`string`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`[toStringTag]`](AbstractEnvironment.md#tostringtag)

***

### activeProfiles

#### Get Signature

> **get** **activeProfiles**(): `string`[]

Defined in: [packages/blue-context/src/environment.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-132)

The explicitly active profiles.

##### Returns

`string`[]

#### Set Signature

> **set** **activeProfiles**(`profiles`): `void`

Defined in: [packages/blue-context/src/environment.ts:136](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-136)

The explicitly active profiles.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

The explicitly active profiles.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`activeProfiles`](AbstractEnvironment.md#activeprofiles)

***

### defaultProfiles

#### Get Signature

> **get** **defaultProfiles**(): `string`[]

Defined in: [packages/blue-context/src/environment.ts:143](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-143)

The default profiles used when no active profile is configured.

##### Returns

`string`[]

#### Set Signature

> **set** **defaultProfiles**(`profiles`): `void`

Defined in: [packages/blue-context/src/environment.ts:147](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-147)

The default profiles used when no active profile is configured.

##### Parameters

###### profiles

`string`[]

##### Returns

`void`

The default profiles used when no active profile is configured.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`defaultProfiles`](AbstractEnvironment.md#defaultprofiles)

## Methods

### addActiveProfile()

> **addActiveProfile**(`profile`): `void`

Defined in: [packages/blue-context/src/environment.ts:160](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-160)

Adds a profile to the active set.

#### Parameters

##### profile

`string`

The profile name.

#### Returns

`void`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`addActiveProfile`](AbstractEnvironment.md#addactiveprofile)

***

### addDefaultProfile()

> **addDefaultProfile**(`profile`): `void`

Defined in: [packages/blue-context/src/environment.ts:164](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-164)

Adds a profile to the default set.

#### Parameters

##### profile

`string`

The profile name.

#### Returns

`void`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`addDefaultProfile`](AbstractEnvironment.md#adddefaultprofile)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Defined in: [packages/blue-context/src/environment.ts:168](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-168)

Returns whether a property key can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`hasProperty`](AbstractEnvironment.md#hasproperty)

***

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Defined in: [packages/blue-context/src/environment.ts:172](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-172)

Resolves a property value, falling back to a default when missing.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when no property is found.

#### Returns

`JSONValue` \| `undefined`

The resolved property value or the default value.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getProperty`](AbstractEnvironment.md#getproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Defined in: [packages/blue-context/src/environment.ts:176](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-176)

Returns the resolved property value or throws when missing.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue`

The resolved property value.

#### Throws

When the property cannot be resolved.

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`getRequiredProperty`](AbstractEnvironment.md#getrequiredproperty)

***

### merge()

> **merge**(`environment`): `void`

Defined in: [packages/blue-context/src/environment.ts:180](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-180)

Merges another environment into this one.

#### Parameters

##### environment

[`ConfigurableEnvironment`](../interfaces/ConfigurableEnvironment.md)

The environment to merge.

#### Returns

`void`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`merge`](AbstractEnvironment.md#merge)

***

### \_isActiveProfile()

> `protected` **\_isActiveProfile**(`profile`): `boolean`

Defined in: [packages/blue-context/src/environment.ts:193](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/environment.ts#lines-193)

#### Parameters

##### profile

`string`

#### Returns

`boolean`

#### Inherited from

[`AbstractEnvironment`](AbstractEnvironment.md).[`_isActiveProfile`](AbstractEnvironment.md#_isactiveprofile)
