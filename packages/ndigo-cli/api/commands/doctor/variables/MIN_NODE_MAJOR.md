[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [commands/doctor](../README.md) / MIN\_NODE\_MAJOR

# Variable: MIN\_NODE\_MAJOR

> `const` **MIN\_NODE\_MAJOR**: `24` = `24`

The framework Node baseline (matches `@oclif/core` v5, the root
`engines` floor, and CI): versions below it are reported as a doctor
failure. Exported for the parity spec — `doctor` answering "healthy" on
a runtime `engine-strict` refuses to install on is the one thing this
check cannot be allowed to do.
