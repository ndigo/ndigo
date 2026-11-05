[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [context-tokens](../README.md) / JOB\_DRIVER

# Variable: JOB\_DRIVER

> `const` **JOB\_DRIVER**: [`ContextToken`](#)\<[`JobDriver`](../../job-driver/interfaces/JobDriver.md)\>

Token for the active [JobDriver](../../job-driver/interfaces/JobDriver.md) bean. `NodeAutoConfiguration`
registers the in-process default; apps register a durable driver to
replace it.
