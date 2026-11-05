[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/doctor](../README.md) / DoctorCommand

# Class: DoctorCommand

The environment and framework diagnostics command.

## Extends

- `Command`

## Constructors

### Constructor

> **new DoctorCommand**(`argv`, `config`): `DoctorCommand`

#### Parameters

##### argv

`string`[]

##### config

`Config`

#### Returns

`DoctorCommand`

#### Inherited from

`Command.constructor`

## Properties

### description

> `static` **description**: `string`

A full description of how to use the command.

If no summary, the first line of the description will be used as the summary.

#### Overrides

`Command.description`

***

### summary

> `static` **summary**: `string` = `'Prints the framework-environment diagnostics (issue-report starter)'`

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
