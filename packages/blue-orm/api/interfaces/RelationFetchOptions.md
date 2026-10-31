[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / RelationFetchOptions

# Interface: RelationFetchOptions

Options controlling relation loading for find operations
(ORM completion plan, Wave 3). Names must match declared relation fields.

## Properties

### relations?

> `optional` **relations?**: `string`[]

Relations to load eagerly and assign onto each returned entity.
