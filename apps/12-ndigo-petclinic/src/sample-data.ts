/**
 * The reference application's sample data: the owners, pets, visits, vets,
 * specialties and pet types that `spring-petclinic` ships in
 * `src/main/resources/db/postgres/data.sql`, seeded into the in-memory entity
 * manager.
 *
 * Rows are persisted in the reference file's order and their ids are left to
 * the manager's identity generator, which hands out `1, 2, 3, …` per entity —
 * so every documented URL (`/owners/1`, `/owners/6/pets/7/visits/new`, …)
 * resolves to the same record as upstream, *and* the generator's counter ends
 * up past the seed (a newly created owner becomes `13`, never a collision with
 * George Franklin).
 *
 * Two owners (`Bonnie Davis`, `Nancy McArdle`) are the classic dataset's extra
 * rows — the fixture list this port was specified against names them, and they
 * keep the owner list at three pages of five.
 *
 * @module ndigo-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { EntityManager } from '@ndigo/orm';
import { Owner, Pet, PetType, Specialty, Vet, VetSpecialty, Visit } from './entities';

/** Owner rows: `[firstName, lastName, address, city, telephone]` (reference ids 1–12). */
const OWNERS: ReadonlyArray<readonly [string, string, string, string, string]> = [
    ['George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023'],
    ['Betty', 'Davis', '638 Cardinal Ave.', 'Sun Prairie', '6085551749'],
    ['Eduardo', 'Rodriquez', '2693 Commerce St.', 'McFarland', '6085558763'],
    ['Harold', 'Davis', '563 Friendly St.', 'Windsor', '6085553198'],
    ['Peter', 'McTavish', '2387 S. Fair Way', 'Madison', '6085552765'],
    ['Jean', 'Coleman', '105 N. Lake St.', 'Monona', '6085552654'],
    ['Jeff', 'Black', '1450 Oak Blvd.', 'Monona', '6085555387'],
    ['Maria', 'Escobito', '345 Maple St.', 'Madison', '6085557683'],
    ['David', 'Schroeder', '2749 Blackhawk Trail', 'Madison', '6085559435'],
    ['Carlos', 'Estaban', '2335 Independence La.', 'Waunakee', '6085555487'],
    ['Bonnie', 'Davis', '12 Spring Grove Ln.', 'Madison', '6085552010'],
    ['Nancy', 'McArdle', '77 Pheasant Run', 'Verona', '6085553391'],
];

/** Pet type rows: `[name]` (reference ids 1–6: cat, dog, lizard, snake, bird, hamster). */
const PET_TYPES: ReadonlyArray<string> = ['cat', 'dog', 'lizard', 'snake', 'bird', 'hamster'];

/** Pet rows: `[name, birthDate, typeId, ownerId]` (reference ids 1–15). */
const PETS: ReadonlyArray<readonly [string, string, number, number]> = [
    ['Leo', '2000-09-07', 1, 1],
    ['Basil', '2002-08-06', 6, 2],
    ['Rosy', '2001-04-17', 2, 3],
    ['Jewel', '2000-03-07', 2, 3],
    ['Iggy', '2000-11-30', 3, 4],
    ['George', '2000-01-20', 4, 5],
    ['Samantha', '1995-09-04', 1, 6],
    ['Max', '1995-09-04', 1, 6],
    ['Lucky', '1999-08-06', 5, 7],
    ['Mulligan', '1997-02-24', 2, 8],
    ['Freddy', '2000-03-09', 5, 9],
    ['Lucky', '2000-06-24', 2, 10],
    ['Sly', '2002-06-08', 1, 10],
    ['Rex', '2015-05-01', 2, 11],
    ['Mittens', '2012-11-03', 1, 12],
];

/** Visit rows: `[petId, visitDate, description]` (reference ids 1–4, plus one for Leo). */
const VISITS: ReadonlyArray<readonly [number, string, string]> = [
    [7, '2010-03-04', 'rabies shot'],
    [8, '2011-03-04', 'rabies shot'],
    [8, '2009-06-04', 'neutered'],
    [7, '2008-09-04', 'spayed'],
    [1, '2013-01-01', 'annual checkup'],
];

/** Vet rows: `[firstName, lastName]` (reference ids 1–6). */
const VETS: ReadonlyArray<readonly [string, string]> = [
    ['James', 'Carter'],
    ['Helen', 'Leary'],
    ['Linda', 'Douglas'],
    ['Rafael', 'Ortega'],
    ['Henry', 'Stevens'],
    ['Sharon', 'Jenkins'],
];

/** Specialty rows: `[name]` (reference ids 1–3). */
const SPECIALTIES: ReadonlyArray<string> = ['radiology', 'surgery', 'dentistry'];

/** Vet ↔ specialty links: `[vetId, specialtyId]` — the reference's `vet_specialties`. */
const VET_SPECIALTIES: ReadonlyArray<readonly [number, number]> = [
    [2, 1],
    [3, 2],
    [3, 3],
    [4, 2],
    [5, 1],
];

/**
 * Seeds every entity family into the given manager.
 *
 * Pets and visits are persisted after the rows they point at, so a relation
 * fetch always resolves; ids come from the manager's identity generator, which
 * walks each entity family in the order it is persisted here.
 *
 * @param manager - The entity manager to persist through.
 */
export function seedSampleData(manager: EntityManager): void {
    for (const name of PET_TYPES) {
        manager.persist(Object.assign(new PetType(), { name }));
    }
    for (const name of SPECIALTIES) {
        manager.persist(Object.assign(new Specialty(), { name }));
    }
    for (const [firstName, lastName] of VETS) {
        manager.persist(Object.assign(new Vet(), { firstName, lastName }));
    }
    for (const [vetId, specialtyId] of VET_SPECIALTIES) {
        manager.persist(Object.assign(new VetSpecialty(), { vetId, specialtyId }));
    }
    for (const [firstName, lastName, address, city, telephone] of OWNERS) {
        manager.persist(Object.assign(new Owner(), { firstName, lastName, address, city, telephone }));
    }
    for (const [name, birthDate, typeId, ownerId] of PETS) {
        manager.persist(Object.assign(new Pet(), { name, birthDate, typeId, ownerId }));
    }
    for (const [petId, visitDate, description] of VISITS) {
        manager.persist(Object.assign(new Visit(), { petId, visitDate, description }));
    }
}
