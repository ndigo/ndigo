[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [management-properties](../README.md) / managementSchema

# Variable: managementSchema

> `const` **managementSchema**: `ZodDefault`\<`ZodObject`\<\{ `endpoints`: `ZodDefault`\<`ZodObject`\<\{ `env`: `ZodDefault`\<`ZodObject`\<\{ `showValues`: `ZodDefault`\<`ZodBoolean`\>; \}, `$strip`\>\>; `exposure`: `ZodDefault`\<`ZodObject`\<\{ `exclude`: `ZodDefault`\<`ZodArray`\<...\>\>; `include`: `ZodDefault`\<`ZodArray`\<...\>\>; \}, `$strip`\>\>; \}, `$strip`\>\>; `health`: `ZodDefault`\<`ZodObject`\<\{ `groups`: `ZodDefault`\<`ZodRecord`\<`ZodString`, `ZodObject`\<\{ `include`: `ZodDefault`\<...\>; \}, `$strip`\>\>\>; \}, `$strip`\>\>; \}, `$strip`\>\>

Schema for the `management` config-file section — validation and the
file-model defaults live here (the AD-34 D3 shape that boot's schema
mode would apply; the reader below reuses it without importing
`@ndigo/boot`, per the REU-9 layering).
