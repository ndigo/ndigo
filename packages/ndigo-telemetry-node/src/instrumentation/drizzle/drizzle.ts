/**
 * OpenTelemetry instrumentation for `@ndigo/orm-drizzle`.
 */
import { SpanKind } from '@opentelemetry/api';
import {
    DrizzleDataSource,
    DrizzleEntityManager,
    DrizzleRepository,
    DrizzleTransactionManager,
} from '@ndigo/orm-drizzle';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `DrizzleInstrumentation`.
 */
export class DrizzleInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('drizzle');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(
            DrizzleRepository.prototype,
            'save',
            this._patch({ name: 'DrizzleRepository.save', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleRepository.prototype,
            'findById',
            this._patch({ name: 'DrizzleRepository.findById', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleRepository.prototype,
            'findAll',
            this._patch({ name: 'DrizzleRepository.findAll', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleRepository.prototype,
            'loadRelation',
            this._patch({ name: 'DrizzleRepository.loadRelation', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleRepository.prototype,
            'deleteById',
            this._patch({ name: 'DrizzleRepository.deleteById', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleRepository.prototype,
            'count',
            this._patch({ name: 'DrizzleRepository.count', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleRepository.prototype,
            'existsById',
            this._patch({ name: 'DrizzleRepository.existsById', kind: SpanKind.CLIENT })
        );

        this._wrap(
            DrizzleEntityManager.prototype,
            'persist',
            this._patch({ name: 'DrizzleEntityManager.persist', kind: SpanKind.CLIENT })
        );
        /* oxlint-disable typescript/no-explicit-any -- the entity manager methods are generic over the entity type; instrumentation patches them by name and treats the patch as opaque */
        this._wrap(
            DrizzleEntityManager.prototype as any,
            'find' as any,
            this._patch({ name: 'DrizzleEntityManager.find', kind: SpanKind.CLIENT }) as any
        );
        this._wrap(
            DrizzleEntityManager.prototype as any,
            'findAll' as any,
            this._patch({ name: 'DrizzleEntityManager.findAll', kind: SpanKind.CLIENT }) as any
        );
        this._wrap(
            DrizzleEntityManager.prototype as any,
            'findPage' as any,
            this._patch({ name: 'DrizzleEntityManager.findPage', kind: SpanKind.CLIENT }) as any
        );
        this._wrap(
            DrizzleEntityManager.prototype as any,
            'findAllWhere' as any,
            this._patch({ name: 'DrizzleEntityManager.findAllWhere', kind: SpanKind.CLIENT }) as any
        );
        /* oxlint-enable typescript/no-explicit-any */
        this._wrap(
            DrizzleEntityManager.prototype,
            'fetchRelation',
            this._patch({ name: 'DrizzleEntityManager.fetchRelation', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleEntityManager.prototype,
            'fetchRelations',
            this._patch({ name: 'DrizzleEntityManager.fetchRelations', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleEntityManager.prototype,
            'remove',
            this._patch({ name: 'DrizzleEntityManager.remove', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleEntityManager.prototype,
            'count',
            this._patch({ name: 'DrizzleEntityManager.count', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleEntityManager.prototype,
            'existsById',
            this._patch({ name: 'DrizzleEntityManager.existsById', kind: SpanKind.CLIENT })
        );
        this._wrap(
            DrizzleEntityManager.prototype,
            'deleteById',
            this._patch({ name: 'DrizzleEntityManager.deleteById', kind: SpanKind.CLIENT })
        );

        /* oxlint-disable typescript/no-explicit-any -- the transaction manager method is generic over the transaction type; instrumentation patches it by name */
        this._wrap(
            DrizzleTransactionManager.prototype as any,
            'run' as any,
            this._patch({ name: 'DrizzleTransaction.run', kind: SpanKind.CLIENT }) as any
        );
        /* oxlint-enable typescript/no-explicit-any */
        this._wrap(
            DrizzleDataSource.prototype,
            'init',
            this._patch({ name: 'DrizzleDataSource.init', kind: SpanKind.CLIENT })
        );
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(DrizzleRepository.prototype, 'save');
        this._unwrap(DrizzleRepository.prototype, 'findById');
        this._unwrap(DrizzleRepository.prototype, 'findAll');
        this._unwrap(DrizzleRepository.prototype, 'loadRelation');
        this._unwrap(DrizzleRepository.prototype, 'deleteById');
        this._unwrap(DrizzleRepository.prototype, 'count');
        this._unwrap(DrizzleRepository.prototype, 'existsById');

        this._unwrap(DrizzleEntityManager.prototype, 'persist');
        this._unwrap(DrizzleEntityManager.prototype, 'find');
        this._unwrap(DrizzleEntityManager.prototype, 'findAll');
        this._unwrap(DrizzleEntityManager.prototype, 'findPage');
        this._unwrap(DrizzleEntityManager.prototype, 'findAllWhere');
        this._unwrap(DrizzleEntityManager.prototype, 'fetchRelation');
        this._unwrap(DrizzleEntityManager.prototype, 'fetchRelations');
        this._unwrap(DrizzleEntityManager.prototype, 'remove');
        this._unwrap(DrizzleEntityManager.prototype, 'count');
        this._unwrap(DrizzleEntityManager.prototype, 'existsById');
        this._unwrap(DrizzleEntityManager.prototype, 'deleteById');

        this._unwrap(DrizzleTransactionManager.prototype, 'run');
        this._unwrap(DrizzleDataSource.prototype, 'init');
    }
}
