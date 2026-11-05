/**
 * Interface for request-ID correlation across service calls.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface RequestIdCorrelation {
    /**
     * Generates a new unique request ID.
     *
     * @returns A unique request ID.
     */
    generateRequestId(): string;
    /**
     * Returns the current correlation ID.
     *
     * @returns The current correlation ID.
     */
    getCorrelationId(): string;
    /**
     * Sets the current correlation ID.
     *
     * @param id - The correlation ID to set.
     */
    setCorrelationId(id: string): void;
}

/**
 * Request-ID correlation implementation using crypto.randomUUID().
 */
export class CryptoRequestIdCorrelation implements RequestIdCorrelation {
    #correlationId: string | null = null;

    /**
     * Generates a new unique request ID using crypto.randomUUID().
     *
     * @returns A unique request ID.
     */
    generateRequestId(): string {
        return crypto.randomUUID();
    }

    /**
     * Returns the current correlation ID.
     *
     * @returns The current correlation ID, or a new one if none is set.
     */
    getCorrelationId(): string {
        if (!this.#correlationId) {
            this.#correlationId = this.generateRequestId();
        }
        return this.#correlationId;
    }

    /**
     * Sets the current correlation ID.
     *
     * @param id - The correlation ID to set.
     */
    setCorrelationId(id: string): void {
        this.#correlationId = id;
    }
}
