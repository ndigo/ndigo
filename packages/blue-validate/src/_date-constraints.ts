import { DEFAULT_DATE_FORMAT } from './formats';
import { serializable } from '@blue/core';
import { is } from '@blue/util/types';
import { isDefined, type constraint, type RangeParams } from './_numeric-constraints';

export type Params<T = any> = {
    value?: T;
};

export type DateParams = Params & {
    format?: string;
};

export type Temporal = string | Date;

const dateRule = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

const daysInMonth = (year: number, month: number): number => {
    // month is 1-12
    return new Date(year, month, 0).getDate();
};

const normalizeToDate = (value: Temporal, format: string = DEFAULT_DATE_FORMAT): Date | null => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (!is(String)(value)) {
        return null;
    }

    const text = String(value).trim();

    // Only strict-parse the default date format for now.
    if (format !== DEFAULT_DATE_FORMAT) {
        return null;
    }

    const match = dateRule.exec(text);
    if (!match) {
        return null;
    }

    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    if (month < 1 || month > 12) {
        return null;
    }

    const maxDay = daysInMonth(year, month);
    if (day < 1 || day > maxDay) {
        return null;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date: Date): Date => {
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const isDate18YearsOld: constraint = (value, params: DateParams = { format: DEFAULT_DATE_FORMAT }) => {
    const format = params.format || DEFAULT_DATE_FORMAT;
    const date = normalizeToDate(value as any, format);
    if (!date) {
        return false;
    }

    const today = startOfDay(new Date());
    const dob = startOfDay(date);

    let age = today.getFullYear() - dob.getFullYear();
    const monthDelta = today.getMonth() - dob.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }

    return age >= 18;
};

const isDateRange: constraint = (value, params: DateParams & RangeParams = {}) => {
    const format = params.format || DEFAULT_DATE_FORMAT;
    const date = normalizeToDate(value as any, format);
    if (!date) {
        return false;
    }

    const target = startOfDay(date).getTime();

    if (isDefined(params.value)) {
        const expected = normalizeToDate(params.value as any, format);
        return !!expected && target === startOfDay(expected).getTime();
    }

    if (isDefined(params.min)) {
        const minDate = normalizeToDate(params.min as any, format);
        if (!minDate) {
            return false;
        }
        if (target < startOfDay(minDate).getTime()) {
            return false;
        }
    }

    if (isDefined(params.max)) {
        const maxDate = normalizeToDate(params.max as any, format);
        if (!maxDate) {
            return false;
        }
        if (target > startOfDay(maxDate).getTime()) {
            return false;
        }
    }

    return true;
};

const isFuture = (value: serializable, format: string = DEFAULT_DATE_FORMAT): boolean => {
    const date = normalizeToDate(value as any, format);
    if (!date) {
        return false;
    }

    const target = startOfDay(date).getTime();
    const today = startOfDay(new Date()).getTime();
    return target > today;
};

const isPast = (value: serializable, format: string = DEFAULT_DATE_FORMAT): boolean => {
    const date = normalizeToDate(value as any, format);
    if (!date) {
        return false;
    }

    const target = startOfDay(date).getTime();
    const today = startOfDay(new Date()).getTime();
    return target < today;
};

const isValidDate = (value: Temporal, format = DEFAULT_DATE_FORMAT): boolean => {
    return !!normalizeToDate(value, format);
};

export {
    dateRule,
    daysInMonth,
    normalizeToDate,
    startOfDay,
    isDate18YearsOld,
    isDateRange,
    isFuture,
    isPast,
    isValidDate,
};
