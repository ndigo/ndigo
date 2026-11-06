/**
 * jsdom ships `ElementInternals` with only the ARIA half — the
 * form-participation API (`setFormValue`, `setValidity`, `validity`, `states`)
 * is missing (every real browser has it). The adopted library's
 * form-associated controls call those APIs while upgrading, so DOM-level
 * specs install no-op shims; the live-browser check covers the real
 * submission path (AD-71).
 */
export function installFormAssociatedShims(): void {
    if (typeof ElementInternals === 'undefined') {
        return;
    }
    const define = (name: string, value: unknown): void => {
        if (!(name in ElementInternals.prototype)) {
            Object.defineProperty(ElementInternals.prototype, name, { configurable: true, writable: true, value });
        }
    };
    define('setFormValue', () => {});
    define('setValidity', () => {});
    define('checkValidity', () => true);
    define('reportValidity', () => true);
    define('willValidate', false);
    define('validationMessage', '');
    // Constraint-validation flags: the library reads `valid` for its custom
    // states and the rest as booleans in messages.
    define('validity', {
        badInput: false,
        customError: false,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        tooShort: false,
        typeMismatch: false,
        valid: true,
        valueMissing: false,
    });
    define('form', null);
    define('states', new Set<string>());
}
