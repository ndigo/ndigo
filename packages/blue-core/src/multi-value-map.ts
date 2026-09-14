/**
 * Extension of the {@link external:Map|Map} interface that stores multiple values under a single key.
 * * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
export class MultiValueMap<K, V> extends Map<K, V[]> {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'MultiValueMap';
    }

    /**
     * Adds a value to the collection associated with the given key.
     * If the key does not exist, a new array is created for the value.
     * @param key - The key to associate the value with.
     * @param value - The value to add.
     * @returns This MultiValueMap instance.
     */
    add(key: K, value: V): this {
        const values = this.get(key) ?? [];
        values.push(value);
        return super.set(key, values);
    }

    /**
     * Removes a single value from the array stored at a key.
     * If the array becomes empty after removal, deletes the key entirely.
     * @param key - The key whose value should be removed.
     * @param value - The value to remove.
     * @returns True if the value was found and removed, false otherwise.
     */
    remove(key: K, value: V): boolean {
        const values = this.get(key);

        if (values === undefined) {
            return false;
        }

        const index = values.indexOf(value);

        if (index === -1) {
            return false;
        }

        values.splice(index, 1);

        if (values.length === 0) {
            this.delete(key);
        }

        return true;
    }
}
