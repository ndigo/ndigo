[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / PatternsRouteCondition

# Class: PatternsRouteCondition

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:421

## Param

the route patterns to use; if 0, the condition will match to every route.

## Param

## Param

whether to match irrespective of a trailing slash

## Param

a list of file extensions to consider for path matching

## Extends

- [`AbstractRouteCondition`](AbstractRouteCondition.md)\<`PatternsRouteCondition`\>

## Constructors

### Constructor

> **new PatternsRouteCondition**(...`patterns`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:455

Create a condition from one or more patterns.

#### Parameters

##### patterns

...`string`[]

Route patterns to use.

#### Returns

`PatternsRouteCondition`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`constructor`](AbstractRouteCondition.md#constructor)

### Constructor

> **new PatternsRouteCondition**(`patterns`, `routeCondition?`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:462

Create a condition from a prebuilt pattern set.

#### Parameters

##### patterns

`Set`\<`string`\>

The pattern set to use.

##### routeCondition?

`PatternsRouteCondition`

A template condition to copy matcher settings from.

#### Returns

`PatternsRouteCondition`

#### Overrides

`AbstractRouteCondition<PatternsRouteCondition>.constructor`

### Constructor

> **new PatternsRouteCondition**(`patterns`, `pathMatcher`, `useTrailingSlashMatch`, `fileExtensions`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:471

Create a condition with explicit matcher settings.

#### Parameters

##### patterns

`string`[]

Route patterns to use.

##### pathMatcher

`PathMatcher`

The matcher to use.

##### useTrailingSlashMatch

`boolean`

Whether to allow trailing slash matches.

##### fileExtensions

`string`[]

File extensions to treat as suffix patterns.

#### Returns

`PatternsRouteCondition`

#### Overrides

`AbstractRouteCondition<PatternsRouteCondition>.constructor`

## Properties

### pathMatcher

> `readonly` **pathMatcher**: `PathMatcher`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:425

Matcher used to compare and merge route patterns.

***

### fileExtensions

> **fileExtensions**: `string`[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:430

File extensions that are treated as matchable suffixes.

***

### patterns

> **patterns**: `Set`\<`string`\>

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:435

Route patterns to match against.

***

### useTrailingSlashMatch

> **useTrailingSlashMatch**: `boolean`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:440

Whether a trailing slash may be treated as equivalent.

## Accessors

### isEmpty

#### Get Signature

> **get** **isEmpty**(): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:168

Whether this condition contains no content.

##### Returns

`boolean`

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`isEmpty`](AbstractRouteCondition.md#isempty)

***

### content

#### Get Signature

> **get** **content**(): `string`[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:442

##### Returns

`string`[]

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`content`](AbstractRouteCondition.md#content)

***

### infix

#### Get Signature

> **get** **infix**(): `string`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:446

##### Returns

`string`

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`infix`](AbstractRouteCondition.md#infix)

## Methods

### equals()

> **equals**(`value`): `boolean`

Defined in: packages/blue-dispatcher/src/route-condition.ts:181

Compare this condition to another value.

#### Parameters

##### value

`any`

The value to compare.

#### Returns

`boolean`

`true` when both conditions are equivalent.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`equals`](AbstractRouteCondition.md#equals)

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: packages/blue-dispatcher/src/route-condition.ts:196

Serialize the condition to JSON.

#### Returns

`JSONValue`

The string form of the condition.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toJSON`](AbstractRouteCondition.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-dispatcher/src/route-condition.ts:205

Convert the condition to its textual form.

#### Returns

`string`

The condition string.

#### Inherited from

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`toString`](AbstractRouteCondition.md#tostring)

***

### merge()

> **merge**(`value`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:584

Merge route patterns from both conditions.

#### Parameters

##### value

`PatternsRouteCondition`

The condition to merge with.

#### Returns

`PatternsRouteCondition`

A new condition containing the merged patterns.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`merge`](AbstractRouteCondition.md#merge)

***

### getMatchingCondition()

> **getMatchingCondition**(`route`): `PatternsRouteCondition`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:616

Return a condition containing only the patterns that match the route.

#### Parameters

##### route

`Route`

The current route.

#### Returns

`PatternsRouteCondition`

A matching condition, or `null`.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`getMatchingCondition`](AbstractRouteCondition.md#getmatchingcondition)

***

### getMatchingPatterns()

> **getMatchingPatterns**(`path`): `string`[]

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:630

Return the patterns that match a path.

#### Parameters

##### path

`string`

The path to test.

#### Returns

`string`[]

The matching patterns, sorted when necessary.

***

### compareTo()

> **compareTo**(`value`, `route`): `number`

Defined in: packages/blue-dispatcher/src/route-mapping-info.ts:652

Compare route patterns using the configured path matcher.

#### Parameters

##### value

`PatternsRouteCondition`

The condition to compare.

##### route

`Route`

The route used to obtain a pattern comparator.

#### Returns

`number`

A comparison result.

#### Overrides

[`AbstractRouteCondition`](AbstractRouteCondition.md).[`compareTo`](AbstractRouteCondition.md#compareto)
