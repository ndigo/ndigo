/**
 * Drizzle-backed derived-query repository:
 * Derived-query method names evaluated to SQL.
 */
import { IllegalStateError } from '@ndigo/core';
import { getEntityMetadata, parseDerivedQuery } from '@ndigo/orm';
import { DrizzleRepository } from './drizzle-repository';

/**
 * Async repository with derived-query support over
 * {@link "drizzle-entity-manager".DrizzleEntityManager | DrizzleEntityManager}. Concrete repositories declare derived
 * methods and delegate to {@link derive}:
 *
 * ```ts
 * class NoteRepository extends DrizzleDerivedQueryRepository<Note, number> {
 *     findByTitle(title: string): Promise<Note[]> {
 *         return this.derive('findByTitle', [title]);
 *     }
 *     findByPriorityTop3(priority: number): Promise<Note[]> {
 *         return this.derive('findByPriorityTop3', [priority]);
 *     }
 * }
 * ```
 *
 * Supported method names match `parseDerivedQuery`: equality filters joined
 * by `And`, an optional trailing `OrderBy<Property>[Asc|Desc]`, and an
 * optional trailing `First`/`Top<N>` limit (`findByPriorityTop3`). Every
 * matched property is a declared entity column, so the generated SQL is
 * allowlisted and parameterized.
 *
 * @typeParam T - The entity type.
 * @typeParam ID - The entity's primary identifier type.
 *
 * @example
 * ```ts
 * const instance = new DrizzleDerivedQueryRepository();
 * ```
 */
export class DrizzleDerivedQueryRepository<T extends object, ID> extends DrizzleRepository<T, ID> {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "DrizzleDerivedQueryRepository".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object DrizzleDerivedQueryRepository]"
     */
    get [Symbol.toStringTag](): string {
        return 'DrizzleDerivedQueryRepository';
    }

    /**
     * Evaluates a derived-query method name against the database.
     *
     * @param methodName - The method name that was called.
     * @param args - The method arguments (query values).
     * @returns Matching entities, ordered and limited as parsed.
     * @throws When the method name is not a supported derived query.
     */
    async derive(methodName: string, args: unknown[]): Promise<T[]> {
        const entityClass = this.getEntityClass();
        const meta = getEntityMetadata(entityClass);
        const query = parseDerivedQuery(methodName, meta.columns);
        if (!query) {
            throw new IllegalStateError(
                `DrizzleDerivedQueryRepository: unsupported derived query method: ${methodName}`
            );
        }

        const columnNameByField = new Map(meta.columns.map((column) => [column.fieldName, column.columnName]));
        return this.getEntityManager().findAllWhere(
            entityClass,
            query.filters.map(({ property, valueIndex }) => ({
                columnName: columnNameByField.get(property) as string,
                value: args[valueIndex],
            })),
            { orderBy: query.orderBy, limit: query.limit }
        );
    }
}
