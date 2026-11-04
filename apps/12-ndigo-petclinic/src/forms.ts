/**
 * The PetClinic form contracts.
 *
 * Every HTML form posts `application/x-www-form-urlencoded` name/value pairs
 * and is bound as a whole source (`dataBinderValue('body')`, guide 09). The
 * bound object is deliberately **not** wrapped in `validatedBy`: a schema
 * failure there becomes a `422` problem document (guide 02), which is the right
 * answer for a JSON API and the wrong one for a browser form — the reference
 * app re-renders the form with the user's input intact. So the controller
 * parses with the same schema, and on failure re-renders the form view with the
 * bound values plus the Zod issue's message key per field, which the template
 * resolves through the request's message source (`t(...)`).
 *
 * @module ndigo-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';

/** A per-field validation message: an i18n key for the template's `t(...)`. */
export interface FieldMessage {
    /** Message key resolved by the view's locale helpers. */
    key: string;
}

/** Field name → its (first) validation message. */
export type FieldMessages = Record<string, FieldMessage>;

/** `YYYY-MM-DD`, the shape an `<input type="date">` submits. */
const isoDay = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether the text is a real calendar day: ISO shape *and* a date that survives
 * the round trip (`2023-02-30` parses as March 2nd and is rejected).
 *
 * @param value - The submitted text.
 * @returns `true` for a real `YYYY-MM-DD` day.
 */
export function isCalendarDay(value: string): boolean {
    if (!isoDay.test(value)) {
        return false;
    }
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

/** Today as an ISO day — the birth-date ceiling. */
const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * The create/update owner form: the reference app's `@NotBlank` + `@Size(1..30)`
 * on the names, its required address/city, and its 10-digit telephone rule.
 */
export const ownerFormSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, 'error.owner.firstName.required')
        .max(30, 'error.owner.firstName.size')
        .regex(/^[A-Za-z]+$/, 'error.owner.firstName.alpha'),
    lastName: z
        .string()
        .trim()
        .min(1, 'error.owner.lastName.required')
        .max(30, 'error.owner.lastName.size')
        .regex(/^[A-Za-z]+$/, 'error.owner.lastName.alpha'),
    address: z.string().trim().min(1, 'error.owner.address.required').max(255, 'error.owner.address.size'),
    city: z.string().trim().min(1, 'error.owner.city.required').max(80, 'error.owner.city.size'),
    telephone: z
        .string()
        .trim()
        .min(1, 'error.owner.telephone.required')
        .regex(/^\d{10}$/, 'error.owner.telephone.digits'),
});

/** A parsed (and validated) owner form. */
export type OwnerForm = z.infer<typeof ownerFormSchema>;

/**
 * The add/edit pet form. The type is a select whose option values are the
 * `petclinic_pet_types` ids; whether an id exists is a store question, so the
 * controller adds `error.pet.type.unknown` when the lookup misses.
 */
export const petFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'error.pet.name.required')
        .max(30, 'error.pet.name.size')
        .regex(/^[A-Za-z]+$/, 'error.pet.name.alpha'),
    birthDate: z
        .string()
        .trim()
        .min(1, 'error.pet.birthDate.required')
        .refine(isCalendarDay, { error: 'error.pet.birthDate.invalid' })
        .refine((value) => value <= today(), { error: 'error.pet.birthDate.future' }),
    typeId: z.string().trim().min(1, 'error.pet.type.required'),
});

/** A parsed (and validated) pet form. */
export type PetForm = z.infer<typeof petFormSchema>;

/** The add-visit form: a calendar day plus the visit's description. */
export const visitFormSchema = z.object({
    visitDate: z
        .string()
        .trim()
        .min(1, 'error.visit.date.required')
        .refine(isCalendarDay, { error: 'error.visit.date.invalid' }),
    description: z.string().trim().min(1, 'error.visit.description.required').max(255, 'error.visit.description.size'),
});

/** A parsed (and validated) visit form. */
export type VisitForm = z.infer<typeof visitFormSchema>;

/**
 * The owner search query (`GET /owners?lastName=&page=`). Both fields default
 * rather than fail: a browser that omits them, or sends `?page=lots`, gets page
 * one of the unfiltered list — never a `422`.
 */
export const ownerSearchSchema = z.object({
    lastName: z.string().default(''),
    page: z.coerce.number().int().min(1).catch(1).default(1),
});

/** A parsed owner search query. */
export type OwnerSearch = z.infer<typeof ownerSearchSchema>;

/** The vet list query (`GET /vets?page=`), defaulted the same way. */
export const vetSearchSchema = z.object({
    page: z.coerce.number().int().min(1).catch(1).default(1),
});

/** A parsed vet list query. */
export type VetSearch = z.infer<typeof vetSearchSchema>;

/**
 * Maps a Zod failure to the first message per top-level field.
 *
 * @param error - The failed parse's error.
 * @returns Field name → message key (fields without an issue are absent).
 */
export function collectFieldMessages(error: z.ZodError): FieldMessages {
    const messages: FieldMessages = {};
    for (const issue of error.issues) {
        const field = issue.path.length > 0 ? String(issue.path[0]) : 'form';
        messages[field] ??= { key: issue.message };
    }
    return messages;
}

/**
 * Reads one bound form field as the text to round-trip back into the form
 * (HTML inputs submit strings, and the binder preserves whatever arrived).
 *
 * @param source - The whole-source bound body.
 * @param field - The field name.
 * @returns The field's text, or `''` when absent.
 */
export function formText(source: Record<string, unknown>, field: string): string {
    const value = source[field];
    return value === undefined || value === null ? '' : String(value);
}

/**
 * The owner form's values, read from a bound body so a failed submit re-renders
 * exactly what the user typed.
 *
 * @param source - The whole-source bound body.
 * @returns The five owner fields as text.
 */
export function ownerFormValues(source: Record<string, unknown>): OwnerForm {
    return {
        firstName: formText(source, 'firstName'),
        lastName: formText(source, 'lastName'),
        address: formText(source, 'address'),
        city: formText(source, 'city'),
        telephone: formText(source, 'telephone'),
    };
}

/**
 * The pet form's values, read from a bound body.
 *
 * @param source - The whole-source bound body.
 * @returns The three pet fields as text (the select's value stays text).
 */
export function petFormValues(source: Record<string, unknown>): PetForm {
    return {
        name: formText(source, 'name'),
        birthDate: formText(source, 'birthDate'),
        typeId: formText(source, 'typeId'),
    };
}

/**
 * The visit form's values, read from a bound body.
 *
 * @param source - The whole-source bound body.
 * @returns The two visit fields as text.
 */
export function visitFormValues(source: Record<string, unknown>): VisitForm {
    return {
        visitDate: formText(source, 'visitDate'),
        description: formText(source, 'description'),
    };
}
