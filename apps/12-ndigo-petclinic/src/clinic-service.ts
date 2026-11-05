/**
 * The PetClinic domain service — the operations behind the pages.
 *
 * Controllers depend on this class and nothing else, so the persistence
 * strategy is invisible to them: every read resolves the reference app's
 * relations (an owner's pets, a pet's type and visits, a vet's specialties) and
 * every write persists through {@link ClinicRepository}, which is the only
 * place that knows about `@ndigo/orm`.
 *
 * Reads that can miss return `undefined` rather than throwing: the HTML
 * controllers render the 404 page and the JSON controllers answer with a
 * problem document, each in its own idiom.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Page } from '@ndigo/orm';
import { ClinicRepository, PAGE_SIZE } from './clinic-repository';
import { Owner, Pet, PetType, Specialty, Vet, Visit } from './entities';

/** A pet with its type and visits resolved. */
export interface PetDetail {
    /** The pet row. */
    pet: Pet;
    /** The pet's type row, when the lookup resolves (it always does for seeded rows). */
    type: PetType | undefined;
    /** The pet's visits, newest first. */
    visits: Visit[];
}

/** An owner with its pets (and each pet's type and visits) resolved. */
export interface OwnerDetail {
    /** The owner row. */
    owner: Owner;
    /** The owner's pets, in seed order. */
    pets: PetDetail[];
}

/** A vet with its specialties resolved. */
export interface VetView {
    /** The vet row. */
    vet: Vet;
    /** The vet's specialties, ordered by name. */
    specialties: Specialty[];
}

/** The owner fields a form submits. */
export interface OwnerInput {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    telephone: string;
}

/** The pet fields a form submits (`typeId` already resolved to a known type). */
export interface PetInput {
    name: string;
    birthDate: string;
    typeId: number;
}

/** The visit fields a form submits. */
export interface VisitInput {
    visitDate: string;
    description: string;
}

/** Domain operations over the PetClinic schema. */
export class ClinicService {
    readonly #repository: ClinicRepository;

    /**
     * @param repository - The persistence seam every operation goes through.
     */
    constructor(repository: ClinicRepository) {
        this.#repository = repository;
    }

    /**
     * One page of owners whose last name starts with the search text (an empty
     * search lists everybody), each with its pets, types and visits resolved —
     * the same read model the detail page and the JSON representation use.
     *
     * @param lastName - The last-name prefix; may be empty.
     * @param page - The 1-based page index.
     * @returns The page of owner details plus the match totals.
     */
    searchOwners(lastName: string, page: number): Page<OwnerDetail> {
        const owners = this.#repository.owners;
        const requested = owners.findByLastNameStartingWith(lastName, { page, size: PAGE_SIZE });
        // A page past the last one would render the search's *no matches*
        // message for a search that does match, so it is served as the last
        // page instead; the totals stay the real ones.
        const clamped =
            requested.totalPages > 0 && page > requested.totalPages
                ? owners.findByLastNameStartingWith(lastName, { page: requested.totalPages, size: PAGE_SIZE })
                : requested;
        return { ...clamped, content: clamped.content.map((owner) => this.#ownerDetail(owner)) };
    }

    /**
     * One owner with its pets, each carrying its type and visit list.
     *
     * @param id - The owner id.
     * @returns The detail, or `undefined` when the id is unknown.
     */
    ownerDetail(id: number): OwnerDetail | undefined {
        const owner = this.#repository.findOwnerWithPets(id);
        return owner === undefined ? undefined : this.#ownerDetail(owner);
    }

    /**
     * The plain owner row (the edit form's source).
     *
     * @param id - The owner id.
     * @returns The owner, or `undefined` when the id is unknown.
     */
    owner(id: number): Owner | undefined {
        return this.#repository.owners.findById(id);
    }

    /**
     * One pet of one owner, with its type and visits. A pet that exists under a
     * *different* owner is not found: the reference app's URLs are
     * owner-scoped, so the mismatch is a `404`, not a leak.
     *
     * @param ownerId - The owner whose URL was requested.
     * @param petId - The pet id.
     * @returns The pet detail, or `undefined` when it is not that owner's pet.
     */
    petDetail(ownerId: number, petId: number): PetDetail | undefined {
        const pet = this.#repository.pets.findById(petId);
        if (pet === undefined || pet.ownerId !== ownerId) {
            return undefined;
        }
        return { pet, type: this.#repository.petTypes.findById(pet.typeId), visits: this.#repository.visitsOf(pet.id) };
    }

    /**
     * Persists a new owner.
     *
     * @param input - The validated form fields.
     * @returns The persisted owner (with its generated id).
     */
    createOwner(input: OwnerInput): Owner {
        return this.#repository.owners.save(Object.assign(new Owner(), input));
    }

    /**
     * Applies a validated owner form to an existing owner.
     *
     * @param id - The owner id.
     * @param input - The validated form fields.
     * @returns The updated owner, or `undefined` when the id is unknown.
     */
    updateOwner(id: number, input: OwnerInput): Owner | undefined {
        const owner = this.#repository.owners.findById(id);
        if (owner === undefined) {
            return undefined;
        }
        return this.#repository.owners.save(Object.assign(owner, input));
    }

    /**
     * Adds a pet to an owner.
     *
     * @param ownerId - The owning owner.
     * @param input - The validated pet fields (with a resolved type id).
     * @returns The persisted pet, or `undefined` when the owner is unknown.
     */
    addPet(ownerId: number, input: PetInput): Pet | undefined {
        if (this.#repository.owners.findById(ownerId) === undefined) {
            return undefined;
        }
        return this.#repository.pets.save(Object.assign(new Pet(), { ...input, ownerId }));
    }

    /**
     * Applies a validated pet form to an existing pet of an owner.
     *
     * @param ownerId - The owner whose URL was requested.
     * @param petId - The pet id.
     * @param input - The validated pet fields.
     * @returns The updated pet, or `undefined` when it is not that owner's pet.
     */
    updatePet(ownerId: number, petId: number, input: PetInput): Pet | undefined {
        const pet = this.#repository.pets.findById(petId);
        if (pet === undefined || pet.ownerId !== ownerId) {
            return undefined;
        }
        return this.#repository.pets.save(Object.assign(pet, input));
    }

    /**
     * Records a visit for one of an owner's pets.
     *
     * @param ownerId - The owner whose URL was requested.
     * @param petId - The pet id.
     * @param input - The validated visit fields.
     * @returns The persisted visit, or `undefined` when the pet is not that owner's.
     */
    addVisit(ownerId: number, petId: number, input: VisitInput): Visit | undefined {
        const pet = this.#repository.pets.findById(petId);
        if (pet === undefined || pet.ownerId !== ownerId) {
            return undefined;
        }
        return this.#repository.visits.save(Object.assign(new Visit(), { ...input, petId: pet.id }));
    }

    /**
     * Every pet type, ordered by name — the add-pet form's select options.
     *
     * @returns The pet types.
     */
    petTypes(): PetType[] {
        return this.#repository.petTypes
            .findAll()
            .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    }

    /**
     * One page of vets, each with its specialties.
     *
     * @param page - The 1-based page index.
     * @returns The page of vet views plus the totals.
     */
    vetsPage(page: number): Page<VetView> {
        const vets = this.#repository.vets.findOrderedPage(page);
        return { ...vets, content: vets.content.map((vet) => this.#vetView(vet)) };
    }

    /**
     * The owner and vet counts the welcome page reports.
     *
     * @returns The two counts.
     */
    counts(): { owners: number; vets: number } {
        return { owners: this.#repository.owners.count(), vets: this.#repository.vets.count() };
    }

    #vetView(vet: Vet): VetView {
        return { vet, specialties: this.#repository.specialtiesOf(vet.id) };
    }

    #ownerDetail(owner: Owner): OwnerDetail {
        return { owner, pets: this.#petDetailsOf(owner) };
    }

    #petDetailsOf(owner: Owner): PetDetail[] {
        const pets = owner.pets ?? this.#repository.pets.findAll().filter((pet) => pet.ownerId === owner.id);
        return pets.map((pet) => ({
            pet,
            type: this.#repository.petTypes.findById(pet.typeId),
            visits: this.#repository.visitsOf(pet.id),
        }));
    }
}
