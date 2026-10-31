[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / parseCommandLineArgs

# Function: parseCommandLineArgs()

> **parseCommandLineArgs**(`args`): `JSONObject`

Parses command-line arguments into a property map for the `commandLine`
property source.

Supported forms:
- `--key=value` — explicit equals form
- `--key value` — space-separated form (consumes the next arg as the value)
- `--flag` — bare flag, value `true` (minimist-style; a typed boolean read
  of a present flag must not invert into "disabled")
- `--` — terminator; everything after is treated as positional and ignored

Repeated keys: last one wins. Non-`--` positionals are ignored (Spring's
`CommandLinePropertySource` behavior — they never become properties; Node's
`process.argv` already exposes them natively).

## Parameters

### args

`string`[]

The argument list (typically `process.argv.slice(2)`).

## Returns

`JSONObject`

The parsed property map.

## Example

```ts
parseCommandLineArgs(['--server.port=9000', '--debug', '--name', 'blue', 'positional'])
// { 'server.port': '9000', debug: true, name: 'blue' }
```
