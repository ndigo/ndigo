/**
 * The PetClinic pages for owners, pets and visits.
 *
 * Every handler returns a `ModelAndView` naming an EJS template plus the model
 * the template reads — the controller never builds markup or a view instance
 * (the status-bearing 404 page included: it returns a view *name*).
 *
 * Form posts bind their whole body through `dataBinderValue('body')` (guide 09)
 * and are then parsed with the schema in `forms.ts`; a failure re-renders the
 * form with the submitted values and per-field message keys, and a success
 * redirects to the owner's detail page (post/redirect/get), so a reload can
 * never re-post.
 */
import {
    dataBinderValue,
    getMapping,
    ModelAndView,
    parameters,
    pathVariable,
    postMapping,
    requestMapping,
    validatedQuery,
} from '@ndigo/dispatcher';
import { ClinicService } from './clinic-service';
import {
    collectFieldMessages,
    ownerFormSchema,
    ownerFormValues,
    ownerSearchSchema,
    petFormSchema,
    petFormValues,
    visitFormSchema,
    visitFormValues,
    type OwnerForm,
    type OwnerSearch,
    type PetForm,
    type VisitForm,
} from './forms';
import { toPositiveInt } from './request-values';
import { missingPage, redirectTo } from './responses';

/** The create/update owner page. */
const OWNER_FORM_VIEW = 'owners/form';
/** The add/edit pet page. */
const PET_FORM_VIEW = 'pets/form';
/** The add-visit page. */
const VISIT_FORM_VIEW = 'pets/visit-form';
/** The owner edit form's `action` template. */
const ownerEditAction = (ownerId: number): string => `/owners/${ownerId}/edit`;
/** The add-pet form's `action` template. */
const newPetAction = (ownerId: number): string => `/owners/${ownerId}/pets/new`;
/** The edit-pet form's `action` template. */
const editPetAction = (ownerId: number, petId: number): string => `/owners/${ownerId}/pets/${petId}/edit`;
/** The add-visit form's `action` template. */
const newVisitAction = (ownerId: number, petId: number): string => `/owners/${ownerId}/pets/${petId}/visits/new`;

/** A brand-new owner form, ready to type into. */
const BLANK_OWNER: OwnerForm = { firstName: '', lastName: '', address: '', city: '', telephone: '' };
/** A brand-new pet form. */
const BLANK_PET: PetForm = { name: '', birthDate: '', typeId: '' };
/** A brand-new visit form. */
const BLANK_VISIT: VisitForm = { visitDate: '', description: '' };

/**
 * Owners, pets and visits: the search/list page, the detail page, and the five
 * create/update forms of the reference application.
 */
@requestMapping('/owners')
export class OwnersController {
    readonly #clinic: ClinicService;

    /**
     * @param clinic - The domain service every handler reads and writes through.
     */
    constructor(clinic: ClinicService) {
        this.#clinic = clinic;
    }

    /**
     * `GET /owners?lastName=&page=` — the owner search. The last name is a
     * prefix match (the reference repository's `findByLastNameStartingWith`),
     * an empty search lists everybody, and an unknown name renders the empty
     * result with its own message.
     */
    @getMapping('/')
    @parameters({ search: validatedQuery(ownerSearchSchema) })
    list(search: OwnerSearch) {
        const owners = this.#clinic.searchOwners(search.lastName, search.page);
        return new ModelAndView('owners/list', {
            lastName: search.lastName,
            owners: owners.content,
            page: owners.page,
            totalPages: owners.totalPages,
            totalElements: owners.totalElements,
            hasPrevious: owners.page > 1,
            hasNext: owners.page < owners.totalPages && owners.totalElements > 0,
        });
    }

    /** `GET /owners/new` — the empty create form. */
    @getMapping('/new')
    createForm() {
        return new ModelAndView(OWNER_FORM_VIEW, {
            action: '/owners/new',
            submitKey: 'owner.form.submit.new',
            headingKey: 'owner.form.new',
            values: BLANK_OWNER,
            errors: {},
        });
    }

    /** `POST /owners/new` — validate, persist, redirect; on failure re-render. */
    @postMapping('/new')
    @parameters({ form: dataBinderValue('body') })
    create(form: Record<string, unknown> | null) {
        // The bound body is read as text first: a field the form did not send
        // is an empty input, so the schema's own "required" message fires
        // instead of Zod's "expected string, received undefined".
        const values = ownerFormValues(form ?? {});
        const parsed = ownerFormSchema.safeParse(values);
        if (!parsed.success) {
            return new ModelAndView(OWNER_FORM_VIEW, {
                action: '/owners/new',
                submitKey: 'owner.form.submit.new',
                headingKey: 'owner.form.new',
                values,
                errors: collectFieldMessages(parsed.error),
            });
        }
        const owner = this.#clinic.createOwner(parsed.data);
        return redirectTo(`/owners/${owner.id}`);
    }

    /** `GET /owners/:id/edit` — the update form, prefilled from the owner row. */
    @getMapping('/:id/edit')
    @parameters({ id: pathVariable('id') })
    editForm(id: string) {
        const ownerId = toPositiveInt(id);
        const owner = ownerId === undefined ? undefined : this.#clinic.owner(ownerId);
        if (owner === undefined) {
            return missingPage('owner', id);
        }
        return new ModelAndView(OWNER_FORM_VIEW, {
            action: ownerEditAction(owner.id),
            submitKey: 'owner.form.submit.edit',
            headingKey: 'owner.form.edit',
            values: {
                firstName: owner.firstName,
                lastName: owner.lastName,
                address: owner.address,
                city: owner.city,
                telephone: owner.telephone,
            },
            errors: {},
        });
    }

    /** `POST /owners/:id/edit` — validate, persist, redirect; on failure re-render. */
    @postMapping('/:id/edit')
    @parameters({ id: pathVariable('id'), form: dataBinderValue('body') })
    update(id: string, form: Record<string, unknown> | null) {
        const ownerId = toPositiveInt(id);
        if (ownerId === undefined || this.#clinic.owner(ownerId) === undefined) {
            return missingPage('owner', id);
        }
        const values = ownerFormValues(form ?? {});
        const parsed = ownerFormSchema.safeParse(values);
        if (!parsed.success) {
            return new ModelAndView(OWNER_FORM_VIEW, {
                action: ownerEditAction(ownerId),
                submitKey: 'owner.form.submit.edit',
                headingKey: 'owner.form.edit',
                values,
                errors: collectFieldMessages(parsed.error),
            });
        }
        const owner = this.#clinic.updateOwner(ownerId, parsed.data);
        return owner === undefined ? missingPage('owner', id) : redirectTo(`/owners/${owner.id}`);
    }

    /** `GET /owners/:id` — the detail page: owner, pets, visits. */
    @getMapping('/:id')
    @parameters({ id: pathVariable('id') })
    detail(id: string) {
        const ownerId = toPositiveInt(id);
        const detail = ownerId === undefined ? undefined : this.#clinic.ownerDetail(ownerId);
        return detail === undefined ? missingPage('owner', id) : new ModelAndView('owners/detail', { detail });
    }

    /** `GET /owners/:id/pets/new` — the add-pet form (type select + date input). */
    @getMapping('/:id/pets/new')
    @parameters({ id: pathVariable('id') })
    newPetForm(id: string) {
        const ownerId = toPositiveInt(id);
        const owner = ownerId === undefined ? undefined : this.#clinic.owner(ownerId);
        if (owner === undefined) {
            return missingPage('owner', id);
        }
        return new ModelAndView(PET_FORM_VIEW, {
            action: newPetAction(owner.id),
            submitKey: 'pet.form.submit.new',
            headingKey: 'pet.form.new',
            owner,
            petTypes: this.#clinic.petTypes(),
            values: BLANK_PET,
            errors: {},
        });
    }

    /** `POST /owners/:id/pets/new` — validate (including the type lookup), then add. */
    @postMapping('/:id/pets/new')
    @parameters({ id: pathVariable('id'), form: dataBinderValue('body') })
    addPet(id: string, form: Record<string, unknown> | null) {
        const ownerId = toPositiveInt(id);
        const owner = ownerId === undefined ? undefined : this.#clinic.owner(ownerId);
        if (owner === undefined) {
            return missingPage('owner', id);
        }
        const values = petFormValues(form ?? {});
        const parsed = petFormSchema.safeParse(values);
        const petTypes = this.#clinic.petTypes();
        if (!parsed.success) {
            return new ModelAndView(PET_FORM_VIEW, {
                action: newPetAction(owner.id),
                submitKey: 'pet.form.submit.new',
                headingKey: 'pet.form.new',
                owner,
                petTypes,
                values,
                errors: collectFieldMessages(parsed.error),
            });
        }
        const type = petTypes.find((candidate) => candidate.id === Number(parsed.data.typeId));
        if (type === undefined) {
            return new ModelAndView(PET_FORM_VIEW, {
                action: newPetAction(owner.id),
                submitKey: 'pet.form.submit.new',
                headingKey: 'pet.form.new',
                owner,
                petTypes,
                values,
                errors: { typeId: { key: 'error.pet.type.unknown' } },
            });
        }
        this.#clinic.addPet(owner.id, { name: parsed.data.name, birthDate: parsed.data.birthDate, typeId: type.id });
        return redirectTo(`/owners/${owner.id}`);
    }

    /** `GET /owners/:id/pets/:petId/edit` — the update-pet form, prefilled. */
    @getMapping('/:id/pets/:petId/edit')
    @parameters({ id: pathVariable('id'), petId: pathVariable('petId') })
    editPetForm(id: string, petId: string) {
        const ownerId = toPositiveInt(id);
        const petKey = toPositiveInt(petId);
        const detail =
            ownerId === undefined || petKey === undefined ? undefined : this.#clinic.petDetail(ownerId, petKey);
        if (detail === undefined || ownerId === undefined) {
            return missingPage('pet', petId);
        }
        return new ModelAndView(PET_FORM_VIEW, {
            action: editPetAction(ownerId, detail.pet.id),
            submitKey: 'pet.form.submit.edit',
            headingKey: 'pet.form.edit',
            owner: this.#clinic.owner(ownerId),
            petTypes: this.#clinic.petTypes(),
            values: { name: detail.pet.name, birthDate: detail.pet.birthDate, typeId: String(detail.pet.typeId) },
            errors: {},
        });
    }

    /** `POST /owners/:id/pets/:petId/edit` — validate, persist, redirect to the owner. */
    @postMapping('/:id/pets/:petId/edit')
    @parameters({ id: pathVariable('id'), petId: pathVariable('petId'), form: dataBinderValue('body') })
    updatePet(id: string, petId: string, form: Record<string, unknown> | null) {
        const ownerId = toPositiveInt(id);
        const petKey = toPositiveInt(petId);
        const detail =
            ownerId === undefined || petKey === undefined ? undefined : this.#clinic.petDetail(ownerId, petKey);
        if (detail === undefined || ownerId === undefined) {
            return missingPage('pet', petId);
        }
        const values = petFormValues(form ?? {});
        const parsed = petFormSchema.safeParse(values);
        const petTypes = this.#clinic.petTypes();
        if (!parsed.success) {
            return new ModelAndView(PET_FORM_VIEW, {
                action: editPetAction(ownerId, detail.pet.id),
                submitKey: 'pet.form.submit.edit',
                headingKey: 'pet.form.edit',
                owner: this.#clinic.owner(ownerId),
                petTypes,
                values,
                errors: collectFieldMessages(parsed.error),
            });
        }
        const type = petTypes.find((candidate) => candidate.id === Number(parsed.data.typeId));
        if (type === undefined) {
            return new ModelAndView(PET_FORM_VIEW, {
                action: editPetAction(ownerId, detail.pet.id),
                submitKey: 'pet.form.submit.edit',
                headingKey: 'pet.form.edit',
                owner: this.#clinic.owner(ownerId),
                petTypes,
                values,
                errors: { typeId: { key: 'error.pet.type.unknown' } },
            });
        }
        this.#clinic.updatePet(ownerId, detail.pet.id, {
            name: parsed.data.name,
            birthDate: parsed.data.birthDate,
            typeId: type.id,
        });
        return redirectTo(`/owners/${ownerId}`);
    }

    /** `GET /owners/:id/pets/:petId/visits/new` — the add-visit form. */
    @getMapping('/:id/pets/:petId/visits/new')
    @parameters({ id: pathVariable('id'), petId: pathVariable('petId') })
    newVisitForm(id: string, petId: string) {
        const ownerId = toPositiveInt(id);
        const petKey = toPositiveInt(petId);
        const detail =
            ownerId === undefined || petKey === undefined ? undefined : this.#clinic.petDetail(ownerId, petKey);
        if (detail === undefined || ownerId === undefined) {
            return missingPage('pet', petId);
        }
        return new ModelAndView(VISIT_FORM_VIEW, {
            action: newVisitAction(ownerId, detail.pet.id),
            owner: this.#clinic.owner(ownerId),
            detail,
            values: BLANK_VISIT,
            errors: {},
        });
    }

    /** `POST /owners/:id/pets/:petId/visits/new` — validate, record, redirect. */
    @postMapping('/:id/pets/:petId/visits/new')
    @parameters({ id: pathVariable('id'), petId: pathVariable('petId'), form: dataBinderValue('body') })
    addVisit(id: string, petId: string, form: Record<string, unknown> | null) {
        const ownerId = toPositiveInt(id);
        const petKey = toPositiveInt(petId);
        const detail =
            ownerId === undefined || petKey === undefined ? undefined : this.#clinic.petDetail(ownerId, petKey);
        if (detail === undefined || ownerId === undefined) {
            return missingPage('pet', petId);
        }
        const values = visitFormValues(form ?? {});
        const parsed = visitFormSchema.safeParse(values);
        if (!parsed.success) {
            return new ModelAndView(VISIT_FORM_VIEW, {
                action: newVisitAction(ownerId, detail.pet.id),
                owner: this.#clinic.owner(ownerId),
                detail,
                values,
                errors: collectFieldMessages(parsed.error),
            });
        }
        this.#clinic.addVisit(ownerId, detail.pet.id, parsed.data);
        return redirectTo(`/owners/${ownerId}`);
    }
}
