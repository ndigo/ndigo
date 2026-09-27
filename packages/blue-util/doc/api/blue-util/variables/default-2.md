[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README-2.md) / default

# Variable: default

> **default**: `object`

## Type Declaration

## Other

#### decodeHtml

> **decodeHtml**: (`value`) => `string`

##### Parameters

###### value

`string`

##### Returns

`string`

#### encodeHtml

> **encodeHtml**: (`value`) => `string`

##### Parameters

###### value

`string`

##### Returns

`string`

#### encodeURIComponent

> **encodeURIComponent**: (`value`) => `string`

##### Parameters

###### value

`string`

##### Returns

`string`

#### interpolate

> **interpolate**: (`template`, `replacements`, `syntax`) => `string`

##### Parameters

###### template

`string`

###### replacements

`string` \| `unknown`[] \| \{\[`key`: `string`\]: `unknown`; \}

###### syntax?

`RegExp` = `stache`

##### Returns

`string`

#### replaceDiacritics

> **replaceDiacritics**: (`text`) => `string`

##### Parameters

###### text

`string`

##### Returns

`string`

#### toCamel

> **toCamel**: (`value`) => `string`

##### Parameters

###### value

`string`

##### Returns

`string`

#### toPascal

> **toPascal**: (`value`) => `string`

##### Parameters

###### value

`string`

##### Returns

`string`

#### trailingSplit

> **trailingSplit**: \{(`separator`, `text`): `string`[]; (`separator`): (`text`) => `string`[]; \}

##### Call Signature

> (`separator`, `text`): `string`[]

###### Parameters

###### separator

`string`

###### text

`string`

###### Returns

`string`[]

##### Call Signature

> (`separator`): (`text`) => `string`[]

###### Parameters

###### separator

`string`

###### Returns

(`text`) => `string`[]

## String

#### decodeURIComponent

> **decodeURIComponent**: (`value`) => `string`

Enhanced decodeURIComponent
- Decodes + to a space.
- Converts the BOM to a replacement character �.
- Does not throw with invalid encoded input.
- Decodes as much of the string as possible.

##### Parameters

###### value

`string`

The encoded string

##### Returns

`string`

The decoded string

#### removeNonPrintable

> **removeNonPrintable**: (`value`) => `string`

Remove non-printable characters

##### Parameters

###### value

`string`

The string to be transformed.

##### Returns

`string`

The `value` with the non-printable characters removed.

##### Example

```ts
removeNonPrintable( "äÄçÇéÉêlorem-ipsumöÖÐþúÚ" );
//=> "lorem-ipsum"
```

#### removeNonWord

> **removeNonWord**: (`value`) => `string`

Remove non-word characters.

##### Parameters

###### value

`string`

The string to be transformed.

##### Returns

`string`

The `value` with the non-word characters removed.

##### Example

```ts
removeNonWord( "lorem ~!@#$%^&*()_+`-={}[]|\\:\";'/?><., ipsum" );
//=> "lorem _- ipsum"
```

#### slugify

> **slugify**: (`delimiter`, `value`) => `string`

Converts a string into a slug.

##### Parameters

###### delimiter

`string`

The character with which spaces will be replaced.

###### value

`string`

The value to be slugified.

##### Returns

`string`

The slugified string.

##### Example

```ts
slugify( '-', 'Lorem Ipsum Dolor' );
//=> "lorem-ipsum-dolor"
slugify( '~', 'Lorem Ipsum Dolor' );
//=> "lorem~ipsum~dolor"
```

#### toProper

> **toProper**: (`value`) => `string`

Returns the proper case version of a string.

##### Parameters

###### value

`string`

##### Returns

`string`

##### Example

```ts
toProper( 'lorem-ipsum-dolor' );
//=> "Lorem Ipsum Dolor"
```

#### toRegExp

> **toRegExp**: (`value`) => `RegExp`

Returns a regular expression for the given `pattern`.

##### Parameters

###### value

`string`

The pattern string (with optional /pattern/flags format)

##### Returns

`RegExp`

##### Throws

If the pattern is malformed
`security` WARNING: This function accepts arbitrary regex patterns.
  Do not use with untrusted user input without validation.
  Patterns with nested quantifiers (e.g., /(a+)+/) can cause ReDoS.

#### toSentence

> **toSentence**: (`value`) => `string`

Returns the sentence case version of a string.

##### Parameters

###### value

`string`

##### Returns

`string`

##### Example

```ts
toSentence( 'lorem-ipsum-dolor' );
//=> "Lorem ipsum dolor"
```

#### toString

> **toString**: (`value`) => `string`

Returns the string representation of the given value. `eval`'ing the output
should result in a value equivalent to the input value. Many of the built-in
`toString` methods do not satisfy this requirement.

If the given value is an `[object Object]` with a `toString` method other
than `Object.prototype.toString`, this method is invoked with no arguments
to produce the return value. This means user-defined constructor functions
can provide a suitable `toString` method. For example:

    function Point( x, y ){
      this.x = x;
      this.y = y;
    }

    Point.prototype.toString = function(){
      return 'new Point(' + this.x + ', ' + this.y + ')';
    };

    toString( new Point( 1, 2 ) ); //=> 'new Point(1, 2)'

##### Parameters

###### value

`unknown`

##### Returns

`string`

##### Example

```ts
toString( null );
//=> ""
toString( undefined );
//=> ""
toString( 42 );
//=> '42'
toString( 'abc' );
//=> "abc"
toString( [ 1, 2, 3 ] );
//=> '[ 1, 2, 3 ]'
toString( { toString: () => 'foo' } );
//=> "foo"
toString( { foo: 1, bar: 2, baz: 3 } );
//=> '{ "bar": 2, "baz": 3, "foo": 1 }'
toString( new Date('2001-02-03T04:05:06Z' ) );
//=> 'new Date( "2001-02-03T04:05:06.000Z" )'
```
