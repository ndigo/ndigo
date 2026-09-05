export interface ValidationBackendAdapter {
    hasConstraint(name: string): boolean;
    validateConstraint(name: string, value: unknown, params?: Record<string, unknown>): boolean;
}
