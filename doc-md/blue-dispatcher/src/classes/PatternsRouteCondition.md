[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / PatternsRouteCondition

# Class: PatternsRouteCondition

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:182


the route patterns to use; if 0, the condition will match to every route.



whether to match irrespective of a trailing slash


a list of file extensions to consider for path matching

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`PatternsRouteCondition`\>

## Constructors

### Constructor

> **new PatternsRouteCondition**(...`patterns`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:196

#### Parameters

##### patterns

...`string`[]

#### Returns

`PatternsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

### Constructor

> **new PatternsRouteCondition**(`patterns`, `routeCondition?`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:197

#### Parameters

##### patterns

`Set`\<`string`\>

##### routeCondition?

`PatternsRouteCondition`

#### Returns

`PatternsRouteCondition`

#### Overrides

`AbstractRouteCondition<PatternsRouteCondition>.constructor`

### Constructor

> **new PatternsRouteCondition**(`patterns`, `pathMatcher`, `useTrailingSlashMatch`, `fileExtensions`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:198

#### Parameters

##### patterns

`string`[]

##### pathMatcher

[`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

##### useTrailingSlashMatch

`boolean`

##### fileExtensions

`string`[]

#### Returns

`PatternsRouteCondition`

#### Overrides

`AbstractRouteCondition<PatternsRouteCondition>.constructor`

## Properties

### pathMatcher

> `readonly` **pathMatcher**: [`PathMatcher`](../../../blue-core/src/interfaces/PathMatcher.md)

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:183

***

### fileExtensions

> **fileExtensions**: `string`[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:184

***

### patterns

> **patterns**: `Set`\<`string`\>

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:185

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:186

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:133

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### content

#### Get Signature

> **get** **content**(): `string`[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:188

##### Returns

`string`[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:192

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:140

#### Parameters

##### value

`any`

#### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-dispatcher/src/route-condition.ts:150

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:154

Returns a string representation of an object.

#### Returns

`string`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)

***

### merge()

> **merge**(`value`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:305

#### Parameters

##### value

`PatternsRouteCondition`

#### Returns

`PatternsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:331

#### Parameters

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`PatternsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### getMatchingPatterns()

> **getMatchingPatterns**(`path`): `string`[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:339

#### Parameters

##### path

`string`

#### Returns

`string`[]

***

### compareTo()

> **compareTo**(`value`, `route`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:354

#### Parameters

##### value

`PatternsRouteCondition`

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

#### Returns

`number`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
