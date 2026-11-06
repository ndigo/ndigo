/**
 * Drizzle-backed derived-query repository (ORM completion plan, Wave 4):
 * Derived-query method names evaluated to SQL.
 */
import { getEntityMetadata, parseDerivedQuery } from '@ndigo/orm';
import { DrizzleRepository } from './drizzle-repository';

/**
 * Async repository with derived-query support over
 * {@link drizzle-entity-manager.DrizzleEntityManager | DrizzleEntityManager}. Concrete repositories declare derived
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
 * @template T - The entity type.
 * @template ID - The entity's primary identifier type.
 */
export class DrizzleDerivedQueryRepository<T extends object, ID> extends DrizzleRepository<T, ID> {
    /**
     * Evaluates a derived-query method name against the database.
     *
     * @param methodName - The method name that was called.
     * @param args - The method arguments (query values).
     * @returns Matching entities, ordered and limited as parsed.
     * @throws {Error} When the method name is not a supported derived query.
     */
    async derive(methodName: string, args: unknown[]): Promise<T[]> {
        const entityClass = this.getEntityClass();
        const meta = getEntityMetadata(entityClass);
        const query = parseDerivedQuery(methodName, meta.columns);
        if (!query) {
            throw new Error(`DrizzleDerivedQueryRepository: unsupported derived query method: ${methodName}`);
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
