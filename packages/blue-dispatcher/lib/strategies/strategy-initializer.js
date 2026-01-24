/**
 * @author Jeff Rose
 */
import { IllegalStateError } from '@blue/core';
import { toPascal } from '@blue/util';
const { isArray } = Array;
export const AsStrategyInitializer = (superclass) => class extends superclass {
    initialized;
    strategies;
    addStrategy(name) {
        if (this.initialized) {
            throw new IllegalStateError('Cannot add strategy after initialization');
        }
        if (!this.strategies) {
            this.strategies = [];
        }
        name && this.strategies.push(name);
    }
    getDefaultStrategy(context, key, strategy) {
        context.setValue(key, strategy);
        return context.getValue(key);
    }
    initStrategies(context) {
        if (!this.initialized) {
            this.initialized = true;
            const length = this.strategies.length;
            let index = 0, initializer, strategy;
            for (; index < length; index++) {
                strategy = this.strategies[index];
                initializer = `init${toPascal(strategy)}`;
                if (typeof this[initializer] !== 'function') {
                    throw new TypeError(`Strategy ${strategy} initializer ${initializer} is not implemented`);
                }
                this[initializer](context);
            }
            console.log('StrategyInitializer::Initialized');
        }
    }
    initCollectionStrategy(context, collectionStrategyKey, strategyKey, name, defaultStrategy) {
        if (context.hasValue(collectionStrategyKey)) {
            const collection = context.getValue(collectionStrategyKey);
            if (isArray(collection)) {
                this[name] = collection;
            }
            else {
                this[name] = [];
                collection.forEach((value) => this[name].push(value));
            }
        }
        else if (context.hasValue(strategyKey)) {
            this[name] = [context.getValue(strategyKey)];
        }
        // Fall back to default strategy
        if (!this[name]) {
            this[name] = this.getDefaultStrategy(context, collectionStrategyKey, defaultStrategy);
        }
    }
    initStrategy(context, strategyKey, name, defaultStrategy) {
        if (context.hasValue(strategyKey)) {
            this[name] = context.getValue(strategyKey);
        }
        // Fall back to default strategy
        if (!this[name]) {
            this[name] = this.getDefaultStrategy(context, strategyKey, defaultStrategy);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3ktaW5pdGlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9zdHJhdGVneS1pbml0aWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBNkIsaUJBQWlCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDMUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQWlCdEMsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQztBQUUxQixNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxDQUEwQixVQUFhLEVBQTBDLEVBQUUsQ0FDcEgsS0FBTSxTQUFRLFVBQVU7SUFDcEIsV0FBVyxDQUFVO0lBQ3JCLFVBQVUsQ0FBVztJQUVyQixXQUFXLENBQUMsSUFBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixNQUFNLElBQUksaUJBQWlCLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUM1RSxDQUFDO1FBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN6QixDQUFDO1FBRUQsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxrQkFBa0IsQ0FBVSxPQUEyQixFQUFFLEdBQVcsRUFBRSxRQUFXO1FBQzdFLE9BQU8sQ0FBQyxRQUFRLENBQUksR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBSSxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsY0FBYyxDQUFDLE9BQTJCO1FBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJ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