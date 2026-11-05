[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/generate](../README.md) / GenerateCommand

# Class: GenerateCommand

The generator front command (`ndigo g` alias).

## Extends

- `Command`

## Constructors

### Constructor

> **new GenerateCommand**(`argv`, `config`): `GenerateCommand`

#### Parameters

##### argv

`string`[]

##### config

`Config`

#### Returns

`GenerateCommand`

#### Inherited from

`Command.constructor`

## Properties

### args

> `static` **args**: `object`

An order-dependent object of arguments for the command

#### dir

> **dir**: `Arg`\<`string`, `Record`\<`string`, `unknown`\>\>

#### kind

> **kind**: `Arg`\<`string`, `Record`\<`string`, `unknown`\>\>

#### Overrides

`Command.args`

***

### description

> `static` **description**: `string`

A full description of how to use the command.

If no summary, the first line of the description will be used as the summary.

#### Overrides

`Command.description`

***

### examples

> `static` **examples**: `string`[]

An array of examples to show at the end of the command's help.

IF only a string is provided, it will try to look for a line that starts
with the cmd.bin as the example command and the rest as the description.
If found, the command will be formatted appropriately.

```
EXAMPLES:
  A description of a particular use case.

    $ <%= config.bin => command flags
```

#### Overrides

`Command.examples`

***

### flags

> `static` **flags**: `object`

A hash of flags for the command

#### author

> **author**: `OptionFlag`\<`string`, `CustomOptions`\>

#### className

> **className**: `OptionFlag`\<`string`, `CustomOptions`\>

#### description

> **description**: `OptionFlag`\<`string`, `CustomOptions`\>

#### file

> **file**: `OptionFlag`\<`string`, `CustomOptions`\>

#### force

> **force**: `BooleanFlag`\<`boolean`\>

#### jobs

> **jobs**: `BooleanFlag`\<`boolean`\>

#### module

> **module**: `OptionFlag`\<`string`, `CustomOptions`\>

#### name

> **name**: `OptionFlag`\<`string`, `CustomOptions`\>

#### package

> **package**: `OptionFlag`\<`string`, `CustomOptions`\>

#### path

> **path**: `OptionFlag`\<`string`, `CustomOptions`\>

#### summary

> **summary**: `OptionFlag`\<`string`, `CustomOptions`\>

#### Overrides

`Command.flags`

***

### summary

> `static` **summary**: `string` = `'Generate framework artifacts through @ndigo/generators'`

The tweet-sized description for your class, used in a parent-commands
sub-command listing and as the header for the command help.

#### Overrides

`Command.summary`

## Methods

### run()

> **run**(): `Promise`\<`void`\>

actual command run code goes here

#### Returns

`Promise`\<`void`\>

#### Overrides

`Command.run`
