/**
 * The PetClinic persistence seam.
 *
 * Every controller talks to {@link ClinicService}, and the service talks to
 * {@link ClinicRepository} — never to the entity manager directly. The
 * repository is the swap point: it holds one `@ndigo/orm` `AbstractRepository`
 * per entity (CRUD, `findPage`, relation loading) plus the reference app's
 * queries (last-name prefix search, vet paging), so moving to a SQL/Drizzle
 * `EntityManager` means constructing this class with a different manager and
 * nothing else changes.
 */
import {
    AbstractRepository,
    InMemoryDataSource,
    InMemoryEntityManager,
    pageFromAll,
    type EntityManager,
    type Page,
    type PageRequest,
    type SortOrder,
} from '@ndigo/orm';
import { Owner, Pet, PetType, Specialty, Vet, VetSpecialty, Visit } from './entities';
import { seedSampleData } from './sample-data';

/** The reference app's page size for both the owner search and the vet list. */
export const PAGE_SIZE = 5;

/**
 * Sortable owner fields. `pageFromAll` takes a `Set` (its own contract for
 * SQL-safe property allowlists), so the constant matches that shape.
 */
const OWNER_SORTABLE = new Set(['id', 'firstName', 'lastName', 'address', 'city', 'telephone']);

/** Sortable vet fields, in the shape `pageFromAll` expects. */
const VET_SORTABLE = new Set(['id', 'firstName', 'lastName']);

/** Last name, then first name — the reference search's display order. */
const BY_NAME: SortOrder[] = [
    { property: 'lastName', direction: 'asc' },
    { property: 'firstName', direction: 'asc' },
];

/** Owner lookup, prefix search and paging (`ownerRepository` in the reference). */
export class OwnerRepository extends AbstractRepository<Owner, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(Owner, manager);
    }

    /**
     * The reference app's owner search: last name **starting with** the given
     * text, case-insensitively, ordered by name and sliced into one page. An
     * empty search text matches every owner (every last name starts with the
     * empty string), which is how the unfiltered list is served.
     *
     * @param lastName - The last-name prefix to match; may be empty.
     * @param request - The 1-based page and size.
     * @returns One page of owners plus the total match count.
     */
    findByLastNameStartingWith(lastName: string, request: PageRequest): Page<Owner> {
        const prefix = lastName.trim().toLowerCase();
        // The list page shows each owner's pets, so the page query loads the
        // relation once — one pet scan for the whole page, not one per row.
        const all = this.findAll({ relations: ['pets'] });
        const matched = prefix === '' ? all : all.filter((owner) => owner.lastName.toLowerCase().startsWith(prefix));
        return pageFromAll(matched, { ...request, sort: request.sort ?? BY_NAME }, OWNER_SORTABLE);
    }
}

/** Pet lookup with its type and visits resolved by the caller's relation list. */
export class PetRepository extends AbstractRepository<Pet, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(Pet, manager);
    }
}

/** Visit lookup and persistence. */
export class VisitRepository extends AbstractRepository<Visit, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(Visit, manager);
    }
}

/** Vet lookup and paging. */
export class VetRepository extends AbstractRepository<Vet, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(Vet, manager);
    }

    /**
     * One page of vets, ordered by name.
     *
     * @param page - The 1-based page index.
     * @returns The page of vets plus totals.
     */
    findOrderedPage(page: number): Page<Vet> {
        return pageFromAll(this.findAll(), { page, size: PAGE_SIZE, sort: BY_NAME }, VET_SORTABLE);
    }
}

/** Specialty lookup. */
export class SpecialtyRepository extends AbstractRepository<Specialty, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(Specialty, manager);
    }
}

/** Vet ↔ specialty link rows (the reference's `vet_specialties` table). */
export class VetSpecialtyRepository extends AbstractRepository<VetSpecialty, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(VetSpecialty, manager);
    }
}

/** Pet-type lookup (the reference's `types` table). */
export class PetTypeRepository extends AbstractRepository<PetType, number> {
    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        super(PetType, manager);
    }
}

/**
 * The aggregates of PetClinic's schema over one entity manager.
 *
 * The fields are the per-entity repositories; the methods are the cross-entity
 * reads the pages need (an owner with its pets, a pet's visits, a vet's
 * specialties).
 */
export class ClinicRepository {
    /** Owner access. */
    readonly owners: OwnerRepository;
    /** Pet access. */
    readonly pets: PetRepository;
    /** Visit access. */
    readonly visits: VisitRepository;
    /** Vet access. */
    readonly vets: VetRepository;
    /** Specialty access. */
    readonly specialties: SpecialtyRepository;
    /** Vet ↔ specialty link access. */
    readonly vetSpecialties: VetSpecialtyRepository;
    /** Pet type access. */
    readonly petTypes: PetTypeRepository;

    /**
     * @param manager - The entity manager to persist through.
     */
    constructor(manager: EntityManager) {
        this.owners = new OwnerRepository(manager);
        this.pets = new PetRepository(manager);
        this.visits = new VisitRepository(manager);
        this.vets = new VetRepository(manager);
        this.specialties = new SpecialtyRepository(manager);
        this.vetSpecialties = new VetSpecialtyRepository(manager);
        this.petTypes = new PetTypeRepository(manager);
    }

    /**
     * One owner with its pets attached (`petclinic_pets.owner_id`).
     *
     * @param id - The owner id.
     * @returns The owner, or `undefined` when the id is unknown.
     */
    findOwnerWithPets(id: number): Owner | undefined {
        return this.owners.findById(id, { relations: ['pets'] });
    }

    /**
     * Every visit of one pet, newest first (the owner detail page's order).
     *
     * @param petId - The pet id.
     * @returns The pet's visits, newest first.
     */
    visitsOf(petId: number): Visit[] {
        return this.visits
            .findAll()
            .filter((visit) => visit.petId === petId)
            .sort((left, right) =>
                left.visitDate === right.visitDate ? right.id - left.id : left.visitDate < right.visitDate ? 1 : -1
            );
    }

    /**
     * The specialties of one vet, ordered by name — the many-to-many join
     * resolved in two scans (links, then the specialty names).
     *
     * @param vetId - The vet id.
     * @returns The vet's specialties.
     */
    specialtiesOf(vetId: number): Specialty[] {
        const byId = new Map(this.specialties.findAll().map((specialty) => [specialty.id, specialty]));
        return this.vetSpecialties
            .findAll()
            .filter((link) => link.vetId === vetId)
            .map((link) => byId.get(link.specialtyId))
            .filter((specialty): specialty is Specialty => specialty !== undefined)
            .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0));
    }
}

/**
 * Builds the default repository: an in-memory manager seeded with the
 * reference app's sample data, so the app boots with zero infrastructure and
 * every documented URL points at a real record.
 *
 * @returns A ready, seeded repository.
 */
export function createSeededRepository(): ClinicRepository {
    const dataSource = new InMemoryDataSource();
    dataSource.init();
    const manager = new InMemoryEntityManager(dataSource);
    seedSampleData(manager);
    return new ClinicRepository(manager);
}
