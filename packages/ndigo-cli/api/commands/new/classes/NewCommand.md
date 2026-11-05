[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/new](../README.md) / NewCommand

# Class: NewCommand

The scaffold command (`ndigo new`).

## Extends

- `Command`

## Constructors

### Constructor

> **new NewCommand**(`argv`, `config`): `NewCommand`

#### Parameters

##### argv

`string`[]

##### config

`Config`

#### Returns

`NewCommand`

#### Inherited from

`Command.constructor`

## Properties

### args

> `static` **args**: `object`

An order-dependent object of arguments for the command

#### name

> **name**: `Arg`\<`string`, `Record`\<`string`, `unknown`\>\>

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

#### description

> **description**: `OptionFlag`\<`string` \| `undefined`, `CustomOptions`\>

#### dryRun

> **dryRun**: `BooleanFlag`\<`boolean`\>

#### kind

> **kind**: `OptionFlag`\<`string` \| `undefined`, `CustomOptions`\>

#### number

> **number**: `OptionFlag`\<`number` \| `undefined`, `CustomOptions`\>

#### port

> **port**: `OptionFlag`\<`number` \| `undefined`, `CustomOptions`\>

#### Overrides

`Command.flags`

***

### summary

> `static` **summary**: `string` = `'Scaffold an example application under apps/ (ndigo new <name>)'`

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
