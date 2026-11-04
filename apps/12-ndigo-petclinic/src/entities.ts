/**
 * PetClinic persistence entities — the reference application's owners, pets,
 * visits, vets and specialties mapped through `@ndigo/orm` metadata, so the
 * column declarations double as the persistence schema *and* the write-time
 * validation source (AD-07).
 *
 * Relations are declared with `@oneToMany` / `@manyToOne` and fetched explicitly
 * (`findById(id, { relations: ['pets'] })`): the owning side names the declared
 * `@column` that carries the foreign key, the inverse side names the FK column
 * on the target entity. `Vet` ↔ `Specialty` is a many-to-many relation, which
 * the in-memory manager deliberately does not resolve (join-table fetch is
 * unimplemented), so it is modelled the way the reference database models it —
 * an explicit `VetSpecialty` link row the clinic service joins in one scan.
 *
 * @module ndigo-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { column, entity, generatedColumn, manyToOne, oneToMany, primaryColumn } from '@ndigo/orm';
import { z } from 'zod';

/** Column schema for a required name field (the form's own limit is the same 30). */
const NAME_COLUMN = z.string().min(1).max(30);

/** Column schema for a required free-text field. */
const TEXT_COLUMN = z.string().min(1);

/** Column schema for the reference app's `telephone` (10 digits, no separators). */
const TELEPHONE_COLUMN = z.string().regex(/^\d{10}$/);

/** Column schema for an ISO calendar day (`YYYY-MM-DD`). */
const DAY_COLUMN = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * A pet owner — PetClinic's aggregate root. The `pets` relation is the inverse
 * side of {@link Pet.ownerId}, so one owner load brings its whole pet list.
 */
@entity('petclinic_owners')
export class Owner {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    firstName!: string;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    lastName!: string;

    @column({ type: 'varchar', schema: TEXT_COLUMN })
    address!: string;

    @column({ type: 'varchar', schema: TEXT_COLUMN })
    city!: string;

    @column({ type: 'varchar', schema: TELEPHONE_COLUMN })
    telephone!: string;

    /** The owner's pets (`Pet.ownerId` holds the foreign key). */
    @oneToMany(() => Pet, { inverseJoinColumn: 'ownerId' })
    pets!: Pet[];
}

/** A pet type (`cat`, `dog`, …) — the reference app's `types` lookup table. */
@entity('petclinic_pet_types')
export class PetType {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    name!: string;
}

/** A pet belonging to exactly one {@link Owner}. */
@entity('petclinic_pets')
export class Pet {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    name!: string;

    /** The pet's birth day, stored as an ISO calendar day (`YYYY-MM-DD`). */
    @column({ type: 'varchar', schema: DAY_COLUMN })
    birthDate!: string;

    /** Foreign key into `petclinic_pet_types`. */
    @column({ type: 'int' })
    typeId!: number;

    /** Foreign key into `petclinic_owners`. */
    @column({ type: 'int' })
    ownerId!: number;

    /** The owning relation (`typeId` resolves through the normal column pipeline). */
    @manyToOne(() => PetType, { joinColumn: 'typeId' })
    type!: PetType;

    /** The owning relation's inverse: this pet's visits (`Visit.petId`). */
    @oneToMany(() => Visit, { inverseJoinColumn: 'petId' })
    visits!: Visit[];
}

/** A visit record for one {@link Pet}. */
@entity('petclinic_visits')
export class Visit {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    /** Foreign key into `petclinic_pets`. */
    @column({ type: 'int' })
    petId!: number;

    /** The visit's calendar day (`YYYY-MM-DD`). */
    @column({ type: 'varchar', schema: DAY_COLUMN })
    visitDate!: string;

    @column({ type: 'varchar', schema: TEXT_COLUMN })
    description!: string;

    /** The visited pet. */
    @manyToOne(() => Pet, { joinColumn: 'petId' })
    pet!: Pet;
}

/** A veterinarian. */
@entity('petclinic_vets')
export class Vet {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    firstName!: string;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    lastName!: string;
}

/** A veterinary specialty (`radiology`, `surgery`, `dentistry`). */
@entity('petclinic_specialties')
export class Specialty {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: NAME_COLUMN })
    name!: string;
}

/**
 * One vet ↔ specialty link row — the reference database's `vet_specialties`
 * join table, modelled explicitly because the in-memory manager does not
 * resolve many-to-many relations.
 */
@entity('petclinic_vet_specialties')
export class VetSpecialty {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'int' })
    vetId!: number;

    @column({ type: 'int' })
    specialtyId!: number;
}
