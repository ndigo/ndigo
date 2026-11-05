[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-resolver](../README.md) / MAX\_VIEW\_CACHE\_ENTRIES

# Variable: MAX\_VIEW\_CACHE\_ENTRIES

> `const` **MAX\_VIEW\_CACHE\_ENTRIES**: `1024` = `1024`

Upper bound on cached views. View names can be request-derived (default
route names, path extensions), so an unbounded cache is a memory-growth
vector; insertion-ordered FIFO eviction keeps the cache bounded without
changing observable resolution for a fixed name set.
