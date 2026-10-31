[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / FormattingService

# Interface: FormattingService

A registry-style factory producing configured formatters.

Each method returns a formatter with the service defaults applied; the
defaults can be overridden per formatter. Underlying `Intl` instances are
cached per option set, so repeated construction is cheap.

## Methods

### date()

> **date**(`options?`): [`DateTimeFormatter`](../classes/DateTimeFormatter.md)

Creates a [DateTimeFormatter](../classes/DateTimeFormatter.md) with the service defaults.

#### Parameters

##### options?

[`DateTimeFormatOptions`](../type-aliases/DateTimeFormatOptions.md)

#### Returns

[`DateTimeFormatter`](../classes/DateTimeFormatter.md)

***

### list()

> **list**(`options?`): [`ListFormatter`](../classes/ListFormatter.md)

Creates a [ListFormatter](../classes/ListFormatter.md) with the service defaults.

#### Parameters

##### options?

[`ListFormatOptions`](../type-aliases/ListFormatOptions.md)

#### Returns

[`ListFormatter`](../classes/ListFormatter.md)

***

### number()

> **number**(`options?`): [`NumberFormatter`](../classes/NumberFormatter.md)

Creates a [NumberFormatter](../classes/NumberFormatter.md) with the service defaults.

#### Parameters

##### options?

[`NumberFormatOptions`](../type-aliases/NumberFormatOptions.md)

#### Returns

[`NumberFormatter`](../classes/NumberFormatter.md)

***

### relativeTime()

> **relativeTime**(`options?`): [`RelativeTimeFormatter`](../classes/RelativeTimeFormatter.md)

Creates a [RelativeTimeFormatter](../classes/RelativeTimeFormatter.md) with the service defaults.

#### Parameters

##### options?

[`RelativeTimeFormatOptions`](../type-aliases/RelativeTimeFormatOptions.md)

#### Returns

[`RelativeTimeFormatter`](../classes/RelativeTimeFormatter.md)
