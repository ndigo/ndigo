**@ndigo/orm v0.0.1**

***

# @ndigo/orm v0.0.1

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [AbstractRepository](classes/AbstractRepository.md)
- [InMemoryDataSource](classes/InMemoryDataSource.md)
- [InMemoryDerivedQueryRepository](classes/InMemoryDerivedQueryRepository.md)
- [InMemoryEntityManager](classes/InMemoryEntityManager.md)
- [InMemoryRepository](classes/InMemoryRepository.md)
- [InMemoryTransactionManager](classes/InMemoryTransactionManager.md)
- [InMemoryUnitOfWork](classes/InMemoryUnitOfWork.md)

## Interfaces

- [AsyncRepository](interfaces/AsyncRepository.md)
- [ColumnDefinition](interfaces/ColumnDefinition.md)
- [ColumnOptions](interfaces/ColumnOptions.md)
- [DataSource](interfaces/DataSource.md)
- [DerivedQuery](interfaces/DerivedQuery.md)
- [EntityCloneHook](interfaces/EntityCloneHook.md)
- [EntityManager](interfaces/EntityManager.md)
- [EntityMetadata](interfaces/EntityMetadata.md)
- [LifecycleHookDefinition](interfaces/LifecycleHookDefinition.md)
- [Page](interfaces/Page.md)
- [PageRequest](interfaces/PageRequest.md)
- [RelationDefinition](interfaces/RelationDefinition.md)
- [RelationFetchOptions](interfaces/RelationFetchOptions.md)
- [RelationOptions](interfaces/RelationOptions.md)
- [Repository](interfaces/Repository.md)
- [SortOrder](interfaces/SortOrder.md)
- [TransactionManager](interfaces/TransactionManager.md)
- [UnitOfWork](interfaces/UnitOfWork.md)

## Type Aliases

- [ColumnTypeFamily](type-aliases/ColumnTypeFamily.md)
- [DerivedQueryResult](type-aliases/DerivedQueryResult.md)
- [EntityState](type-aliases/EntityState.md)
- [LifecycleEvent](type-aliases/LifecycleEvent.md)
- [RelationKind](type-aliases/RelationKind.md)
- [SortDirection](type-aliases/SortDirection.md)

## Variables

- [ENTITY\_CLONE](variables/ENTITY_CLONE.md)

## Functions

- [baseSchemaForType](functions/baseSchemaForType.md)
- [column](functions/column.md)
- [columnTypeFamily](functions/columnTypeFamily.md)
- [entity](functions/entity.md)
- [generatedColumn](functions/generatedColumn.md)
- [getEntityMetadata](functions/getEntityMetadata.md)
- [insertSchemaForEntity](functions/insertSchemaForEntity.md)
- [isEntity](functions/isEntity.md)
- [manyToMany](functions/manyToMany.md)
- [manyToOne](functions/manyToOne.md)
- [oneToMany](functions/oneToMany.md)
- [oneToOne](functions/oneToOne.md)
- [pageFromAll](functions/pageFromAll.md)
- [parseDerivedQuery](functions/parseDerivedQuery.md)
- [postLoad](functions/postLoad.md)
- [postRemove](functions/postRemove.md)
- [prePersist](functions/prePersist.md)
- [preUpdate](functions/preUpdate.md)
- [primaryColumn](functions/primaryColumn.md)
- [runLifecycleHooks](functions/runLifecycleHooks.md)
- [schemaForColumn](functions/schemaForColumn.md)
- [schemaForEntity](functions/schemaForEntity.md)
- [sortComparator](functions/sortComparator.md)
- [toAsyncRepository](functions/toAsyncRepository.md)
- [transactional](functions/transactional.md)
- [validateEntity](functions/validateEntity.md)
- [validatePageRequest](functions/validatePageRequest.md)
