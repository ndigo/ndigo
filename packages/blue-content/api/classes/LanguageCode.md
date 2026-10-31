[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / LanguageCode

# Class: LanguageCode

Represents a validated, canonicalized BCP 47 language tag.

The instance stores only the canonical tag; construction validates and
canonicalizes input, so misspelled or malformed codes (`en_US`, `en US`,
markup-injectable values) fail fast instead of silently missing content.

```ts
new LanguageCode('EN-us').code; // 'en-US'
LanguageCode.for('en_us');      // null
String(LanguageCodes.EN_US);    // 'en-US'
```

## Implements

- `Serializable`
- `Equatable`\<`LanguageCode`\>
- `StringComparable`\<`LanguageCode`\>

## Constructors

### Constructor

> **new LanguageCode**(`code`): `LanguageCode`

Creates a validated language code for the given tag.

#### Parameters

##### code

`string`

The language tag to canonicalize.

#### Returns

`LanguageCode`

#### Throws

When the value is not a usable BCP 47 tag.

## Properties

### code

> `readonly` **code**: `string`

The canonical language tag used for lookups and comparisons.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### compareTo()

> **compareTo**(`other`): `number`

Orders canonical tags lexicographically, not by language preference or specificity.

#### Parameters

##### other

`LanguageCode`

#### Returns

`number`

A negative number, zero, or a positive number for less, equal, or greater.

#### Implementation of

`StringComparable.compareTo`

***

### compareToIgnoreCase()

> **compareToIgnoreCase**(`other`): `number`

Orders canonical tags lexicographically with case ignored.

#### Parameters

##### other

`LanguageCode`

#### Returns

`number`

A negative number, zero, or a positive number for less, equal, or greater.

#### Implementation of

`StringComparable.compareToIgnoreCase`

***

### equals()

> **equals**(`other`): `boolean`

Compares complete canonical tags, including region, script, and extensions.
Equality is by value, not instance identity or shared base language.

#### Parameters

##### other

`LanguageCode`

#### Returns

`boolean`

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

A JSON representation of the language code

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

A string representation of the language code

#### Implementation of

`Serializable.toString`

***

### for()

> `static` **for**(`value`): `LanguageCode` \| `null`

Parses a language tag without throwing.

#### Parameters

##### value

`unknown`

The candidate language tag.

#### Returns

`LanguageCode` \| `null`

A LanguageCode, or `null` when the value is unusable.
