import '@tsmetadata/polyfill';
import { entity, primaryColumn, generated, column, prePersist } from '@blue/orm';

@entity('notes')
export class Note {
    @generated()
    @primaryColumn()
    id!: number;

    @column()
    title!: string;

    @column()
    body!: string;

    @column()
    createdAt!: string;

    @prePersist()
    onPrePersist() {
        if (!this.createdAt) {
            this.createdAt = new Date().toISOString();
        }
    }
}