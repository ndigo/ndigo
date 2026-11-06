/**
 * JSON projections for the `/api` representations.
 *
 * The shapes follow `spring-petclinic-rest`'s resource documents — an owner
 * carries its pets, a pet carries its type and visits, a vet carries its
 * specialties — so the JSON contract is the reference app's, not an invention
 * of this port. Entities never reach the wire directly: the projection is the
 * single place that decides what is published, and `visits`/`type` are always
 * emitted (never `undefined`, which JSON cannot carry).
 */
import { Visit } from './entities';
import type { OwnerDetail, PetDetail, VetView } from './clinic-service';

/** One visit record. */
export interface VisitDTO {
    id: number;
    date: string;
    description: string;
}

/** A pet type reference. */
export interface PetTypeDTO {
    id: number;
    name: string;
}

/** A pet with its type and visits. */
export interface PetDTO {
    id: number;
    name: string;
    birthDate: string;
    type: PetTypeDTO | null;
    visits: VisitDTO[];
}

/** An owner with its pets. */
export interface OwnerDTO {
    id: number;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    telephone: string;
    pets: PetDTO[];
}

/** A vet with its specialties. */
export interface VetDTO {
    id: number;
    firstName: string;
    lastName: string;
    specialties: PetTypeDTO[];
}

/**
 * Projects one visit. The reference REST resource names the day `date`; the
 * entity calls it `visitDate` (the SQL column name), so the rename lives here.
 *
 * @param visit - The visit row.
 * @returns The visit document.
 */
export function toVisitDto(visit: Visit): VisitDTO {
    return { id: visit.id, date: visit.visitDate, description: visit.description };
}

/**
 * Projects one pet with its resolved type and visits.
 *
 * @param detail - The pet read model (type and visits already resolved).
 * @returns The pet document.
 */
export function toPetDto(detail: PetDetail): PetDTO {
    const { pet, type, visits } = detail;
    return {
        id: pet.id,
        name: pet.name,
        birthDate: pet.birthDate,
        type: type === undefined ? null : { id: type.id, name: type.name },
        visits: visits.map((visit) => toVisitDto(visit)),
    };
}

/**
 * Projects one owner with its pets.
 *
 * @param detail - The owner read model (pets already resolved).
 * @returns The owner document.
 */
export function toOwnerDto(detail: OwnerDetail): OwnerDTO {
    const { owner, pets } = detail;
    return {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        address: owner.address,
        city: owner.city,
        telephone: owner.telephone,
        pets: pets.map((pet) => toPetDto(pet)),
    };
}

/**
 * Projects one vet with its specialties.
 *
 * @param view - The vet read model (specialties already resolved).
 * @returns The vet document.
 */
export function toVetDto(view: VetView): VetDTO {
    return {
        id: view.vet.id,
        firstName: view.vet.firstName,
        lastName: view.vet.lastName,
        specialties: view.specialties.map((specialty) => ({ id: specialty.id, name: specialty.name })),
    };
}
