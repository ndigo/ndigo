/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://date-fns.org/}
 */

export {
    /**
     * Add the specified number of days to the given date.
     *
     * @category Date
     * @param {number} amount The amount of days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the days added.
     * @example
     * // Add 10 days to 1 September 2014:
     * const date = new Date( 2014, 8, 1 );
     * addDays( 10, date );
     * //=> Thu Sep 11 2014 00:00:00
     *
     * const addTenDays = addDays( 10 );
     * addTenDays( date );
     * //=> Thu Sep 11 2014 00:00:00
     *
     */
    addDays,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of business days (Mon - Fri) to the given date, ignoring weekends.
     *
     * @category Date
     * @param {number} amount The amount of business days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the business days added.
     * @example
     * // Add 10 business days to 1 September 2014:
     * const date = new Date( 2014, 8, 1 );
     * addBusinessDays( 10, date );
     * //=> Mon Sep 15 2014 00:00:00 (skipped weekend days)
     *
     * const addTenDays = addBusinessDays( 10 );
     * addTenDays( date );
     * //=> Mon Sep 15 2014 00:00:00 (skipped weekend days)
     *
     */
    addBusinessDays,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of hours to the given date.
     *
     * @category Date
     * @param {number} amount The amount of hours to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the hours added.
     * @example
     * // Add 2 hours to 10 July 2014 23:00:00:
     * const date = new Date( 2014, 6, 10, 23, 0 );
     * addHours( 2, date );
     * //=> Fri Jul 11 2014 01:00:00
     *
     * const addTwoHours = addHours( 2 );
     * addTwoHours( date );
     * //=> Fri Jul 11 2014 01:00:00
     *
     */
    addHours,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of ISO week-numbering years to the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @category Date
     * @param {number} amount The amount of ISO week-numbering years to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the ISO week-numbering years added.
     * @example
     * // Add 5 ISO week-numbering years to 2 July 2010:
     * const date = new Date( 2010, 6, 2 );
     * const result = addISOWeekYears( 5, date )
     * //=> Fri Jun 26 2015 00:00:00
     *
     * const addFiveWeeks = addISOWeekYears( 5 );
     * addFiveWeeks( date );
     * //=> Fri Jun 26 2015 00:00:00
     */
    addISOWeekYears,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of milliseconds to the given date.
     *
     * @category Date
     * @param {number} amount The amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the milliseconds added.
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * const date = new Date( 2014, 6, 10, 12, 45, 30, 0 );
     * const result = addMilliseconds( 750, date )
     * //=> Thu Jul 10 2014 12:45:30.750
     *
     * const add750Milliseconds = addMilliseconds( 750 );
     * add750Milliseconds( date );
     * //=> Thu Jul 10 2014 12:45:30.750
     */
    addMilliseconds,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of minutes to the given date.
     *
     * @category Date
     * @param {number} amount The amount of minutes to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the minutes added.
     * @example
     * // Add 30 minutes to 10 July 2014 12:00:00:
     * const date = new Date( 2014, 6, 10, 12, 0 );
     * const result = addMinutes( 30, date )
     * //=> Thu Jul 10 2014 12:30:00
     *
     * const addThirtyMinutes = addMinutes( 30 );
     * addThirtyMinutes( date );
     * //=> Thu Jul 10 2014 12:30:00
     */
    addMinutes,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of months to the given date.
     *
     * @category Date
     * @param {number} amount The amount of months to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the months added.
     * @example
     * // Add 5 months to 1 September 2014:
     * const date = new Date( 2014, 8, 1, 0 );
     * const result = addMonths( 5, date )
     * //=> Sun Feb 01 2015 00:00:00
     *
     * const addFiveMonths = addMonths( 5 );
     * addFiveMonths( date );
     * //=> Sun Feb 01 2015 00:00:00
     */
    addMonths,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of quarters to the given date.
     *
     * @category Date
     * @param {number} amount The amount of quarters to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the quarters added.
     * @example
     * // Add 1 quarter to 1 September 2014:
     * const date = new Date( 2014, 8, 1 );
     * const result = addQuarters( 1, date )
     * //=> Mon Dec 01 2014 00:00:00
     *
     * const addOneQuarter = addQuarters( 1 );
     * addOneQuarter( date );
     * //=> Mon Dec 01 2014 00:00:00
     */
    addQuarters,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of seconds to the given date.
     *
     * @category Date
     * @param {number} amount The amount of seconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the seconds added.
     * @example
     * // Add 30 seconds to 10 July 2014 12:45:00:
     * const date = new Date( 2014, 6, 10, 12, 45, 0 );
     * const result = addSeconds( 30, date )
     * //=> Thu Jul 10 2014 12:45:30
     *
     * const addThirtySeconds = addSeconds( 30 );
     * addThirtySeconds( date );
     * //=> Thu Jul 10 2014 12:45:30
     */
    addSeconds,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of weeks to the given date.
     *
     * @category Date
     * @param {number} amount The amount of weeks to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the weeks added.
     * @example
     * // Add 4 weeks to 1 September 2014:
     * const date = new Date( 2014, 8, 1 );
     * const result = addWeeks( 4, date )
     * //=> Mon Sep 29 2014 00:00:00
     *
     * const addFourWeeks = addWeeks( 4 );
     * addFourWeeks( date );
     * //=> Mon Sep 29 2014 00:00:00
     */
    addWeeks,
} from 'date-fns/fp';

export {
    /**
     * Add the specified number of years to the given date.
     *
     * @category Date
     * @param {number} amount The amount of years to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {Date|external:number} date The date to be changed.
     * @returns {Date} The new date with the years added.
     * @example
     * // Add 5 years to 1 September 2014:
     * const date = new Date( 2014, 8, 1 );
     * const result = addYears( 5, date )
     * //=> Sun Sep 01 2019 00:00:00
     *
     * const addFiveYears = addYears( 5 );
     * addFiveYears( date );
     * //=> Sun Sep 01 2019 00:00:00
     */
    addYears,
} from 'date-fns/fp';

export {
    /**
     * Get the number of business day periods between the given dates.
     * Business days being days that arent in the weekend.
     * Like {@link differenceInCalendarDays|differenceInCalendarDays}, the function removes the times from the dates before calculating the difference.
     *
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of business days.
     * @example
     * // How many business days are between 10 January 2014 and 20 July 2014?
     * const end   = new Date( 2014, 6, 20 );
     * const start = new Date( 2014, 0, 10 );
     * const result = differenceInBusinessDays( start, end );
     * //=> 136
     * @example
     * // How many business days are between 10 January 2014 and 20 July 2014?
     * const end   = new Date( 2014, 6, 20 );
     * const start = new Date( 2014, 0, 10 );
     * const differenceFromStart = differenceInBusinessDays( start );
     * const result = differenceFromStart( end );
     * //=> 136
     */
    differenceInBusinessDays,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar day periods between the given dates.This means that the times are removed from the dates and then the difference in days is calculated.
     *
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar days.
     * @example
     * // How many calendar days are between 2 July 2011 23:00:00 and 2 July 2012 00:00:00?
     * const end   = new Date( 2011, 6, 2, 23, 0 );
     * const start = new Date( 2012, 6, 2, 0, 0 );
     * const result = differenceInCalendarDays( start, end );
     * //=> 366
     * @example
     * // How many calendar days are between 2 July 2011 23:59:00 and 3 July 2011 00:01:00?
     * const end   = new Date( 2011, 6, 3, 0, 1 );
     * const start = new Date( 2011, 6, 2, 23, 59 );
     * const differenceFromStart = differenceInCalendarDays( start );
     * const result = differenceFromStart( end );
     * //=> 1
     */
    differenceInCalendarDays,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar ISO week-numbering years between the given dates.
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar ISO week-numbering years.
     * @example
     * // How many calendar ISO week-numbering years are 1 January 2010 and 1 January 2012?
     * const end   = new Date( 2012, 0, 1 );
     * const start = new Date( 2010, 0, 1 );
     * const result = differenceInCalendarISOWeekYears( start, end );
     * //=> 2
     * @example
     * // How many calendar ISO week-numbering years are 1 January 2010 and 1 January 2012?
     * const end   = new Date( 2012, 0, 1 );
     * const start = new Date( 2010, 0, 1 );
     * const differenceFromStart = differenceInCalendarISOWeekYears( start );
     * const result = differenceFromStart( end );
     * //=> 2
     */
    differenceInCalendarISOWeekYears,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar ISO weeks between the given dates.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar ISO weeks.
     * @example
     * // How many calendar ISO weeks are between 6 July 2014 and 21 July 2014?
     * const end   = new Date( 2014, 6, 21 );
     * const start = new Date( 2014, 6, 6 );
     * const result = differenceInCalendarISOWeeks( start, end );
     * //=> 3
     * @example
     * // How many calendar ISO weeks are between 6 July 2014 and 21 July 2014?
     * const end   = new Date( 2014, 6, 21 );
     * const start = new Date( 2014, 6, 6 );
     * const differenceFromStart = differenceInCalendarISOWeeks( start );
     * const result = differenceFromStart( end );
     * //=> 3
     */
    differenceInCalendarISOWeeks,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar months between the given dates.
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar months.
     * @example
     * // How many calendar months are between 31 January 2014 and 1 September 2014?
     * const end   = new Date( 2014, 8, 1 );
     * const start = new Date( 2014, 0, 31 );
     * const result = differenceInCalendarMonths( start, end );
     * //=> 3
     * @example
     * // How many calendar months are between 31 January 2014 and 1 September 2014?
     * const end   = new Date( 2014, 8, 1 );
     * const start = new Date( 2014, 0, 31 );
     * const differenceFromStart = differenceInCalendarMonths( start );
     * const result = differenceFromStart( end );
     * //=> 3
     */
    differenceInCalendarMonths,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar quarters between the given dates.
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar quarters.
     * @example
     * // How many calendar quarters are between 31 December 2013 and 2 July 2014?
     * const end   = new Date( 2014, 6, 2 );
     * const start = new Date( 2013, 11, 31 );
     * const result = differenceInCalendarQuarters( start, end );
     * //=> 3
     * @example
     * // How many calendar quarters are between 31 December 2013 and 2 July 2014?
     * const end   = new Date( 2014, 6, 2 );
     * const start = new Date( 2013, 11, 31 );
     * const differenceFromStart = differenceInCalendarQuarters( start );
     * const result = differenceFromStart( end );
     * //=> 3
     */
    differenceInCalendarQuarters,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar quarters between the given dates.
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar weeks.
     * @example
     * // How many calendar quarters are between 31 December 2013 and 2 July 2014?
     * const end   = new Date( 2014, 6, 2 );
     * const start = new Date( 2013, 11, 31 );
     * const result = differenceInCalendarWeeks( start, end );
     * //=> 3
     * @example
     * // How many calendar quarters are between 31 December 2013 and 2 July 2014?
     * const end   = new Date( 2014, 6, 2 );
     * const start = new Date( 2013, 11, 31 );
     * const differenceFromStart = differenceInCalendarWeeks( start );
     * const result = differenceFromStart( end );
     * //=> 3
     */
    differenceInCalendarWeeks,
} from 'date-fns/fp';

export {
    /**
     * Get the number of calendar years between the given dates.
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar years.
     * @example
     * // How many calendar years are between 31 December 2013 and 11 February 2015?
     * const end   = new Date( 2015, 1, 11 );
     * const start = new Date( 2013, 11, 31 );
     * const result = differenceInCalendarYears( start, end );
     * //=> 2
     * @example
     * // How many calendar years are between 31 December 2013 and 11 February 2015?
     * const end   = new Date( 2015, 1, 11 );
     * const start = new Date( 2013, 11, 31 );
     * const differenceFromStart = differenceInCalendarYears( start );
     * const result = differenceFromStart( end );
     * //=> 2
     */
    differenceInCalendarYears,
} from 'date-fns/fp';

export {
    /**
     * Get the number of full day periods between two dates. Fractional days are truncated towards zero.
     *
     * One "full day" is the distance between a local time in one day to the same local time on the next or previous day. A full day can sometimes be less than or more than 24 hours if a daylight savings change happens between two dates.
     *
     * To ignore DST and only measure exact 24-hour periods, use this instead:
     * `Math.floor( differenceInHours( start, end ) / 24 ) | 0`.
     * @category Date
     * @param {Date|external:number} start The earlier date.
     * @param {Date|external:number} end The later date.
     * @returns {number} The number of calendar years.
     * @example
     * // How many full days are between 2 July 2011 23:00:00 and 2 July 2012 00:00:00 ?
     * const end   = new Date( 2012, 6, 2, 23, 0 );
     * const start = new Date( 2011, 6, 2, 0, 0 );
     * const result = differenceInDays( start, end );
     * //=> 365
     * @example
     * // How many full days are between 2 July 2011 23:59:00 and 3 July 2011 00:01:00 ?
     * const end   = new Date( 2011, 6, 3, 0, 1 );
     * const start = new Date( 2011, 6, 2, 23, 59 );
     * const differenceFromStart = differenceInDays( start );
     * const result = differenceFromStart( end );
     * //=> 0
     * @example
     * // How many full days are between 1 March 2020 0:00 and 1 June 2020 0:00 ?
     * // Note: because local time is used, the result will always be 92 days, even in time zones where DST starts and the period has only 92*24-1 hours.
     * const end   = new Date( 2020, 5, 1 );
     * const start = new Date( 2020, 2, 1 );
     * const result = differenceInDays( start )( end );
     * //=> 92
     */
    differenceInDays,
} from 'date-fns/fp';

export {
    /**
     * Get the number of hours between the given dates.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of hours.
     * @example
     * // How many hours are between 2 July 2014 06:50:00 and 2 July 2014 19:00:00?
     * const laterDate = new Date( 2014, 6, 2, 19, 0 );
     * const earlierDate = new Date( 2014, 6, 2, 6, 50 );
     * const result = differenceInHours( earlierDate, laterDate );
     * //=> 12
     *
     * const diffFromEarlier = differenceInHours( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 12
     */
    differenceInHours,
} from 'date-fns/fp';

export {
    /**
     * Get the number of ISO week-numbering years between the given dates.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of ISO week-numbering years.
     * @example
     * // How many full ISO week-numbering years are between 1 January 2010 and 1 January 2012?
     * const laterDate = new Date( 2012, 0, 1 );
     * const earlierDate = new Date( 2010, 0, 1 );
     * const result = differenceInISOWeekYears( earlierDate, laterDate );
     * //=> 1
     *
     * const diffFromEarlier = differenceInISOWeekYears( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 1
     */
    differenceInISOWeekYears,
} from 'date-fns/fp';

export {
    /**
     * Get the number of milliseconds between the given dates.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of milliseconds.
     * @example
     * // How many milliseconds are between 2 July 2014 12:30:20.600 and 2 July 2014 12:30:21.700?
     * const laterDate = new Date( 2014, 6, 2, 12, 30, 21, 700 );
     * const earlierDate = new Date( 2014, 6, 2, 12, 30, 20, 600 );
     * const result = differenceInMilliseconds( earlierDate, laterDate );
     * //=> 1100
     *
     * const diffFromEarlier = differenceInMilliseconds( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 1100
     */
    differenceInMilliseconds,
} from 'date-fns/fp';

export {
    /**
     * Get the signed number of full minutes between the given dates. Negative values indicate the earlier date is later than the later date.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of minutes.
     * @example
     * // How many minutes are between 2 July 2014 12:07:59 and 2 July 2014 12:20:00?
     * const laterDate = new Date( 2014, 6, 2, 12, 20, 0 );
     * const earlierDate = new Date( 2014, 6, 2, 12, 7, 59 );
     * const result = differenceInMinutes( earlierDate, laterDate );
     * //=> 12
     *
     * const diffFromEarlier = differenceInMinutes( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 12
     */
    differenceInMinutes,
} from 'date-fns/fp';

export {
    /**
     * Get the number of full months between the given dates using trunc as a default rounding method.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of full months.
     * @example
     * // How many full months are between 31 January 2014 and 1 September 2014?
     * const laterDate = new Date( 2014, 8, 1 );
     * const earlierDate = new Date( 2014, 0, 31 );
     * const result = differenceInMonths( earlierDate, laterDate );
     * //=> 7
     *
     * const diffFromEarlier = differenceInMonths( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 7
     */
    differenceInMonths,
} from 'date-fns/fp';

export {
    /**
     * Get the number of full quarters between the given dates.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of full quarters.
     * @example
     * // How many full quarters are between 31 December 2013 and 2 July 2014?
     * const laterDate = new Date( 2014, 6, 2 );
     * const earlierDate = new Date( 2013, 11, 31 );
     * const result = differenceInQuarters( earlierDate, laterDate );
     * //=> 2
     *
     * const diffFromEarlier = differenceInQuarters( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 2
     */
    differenceInQuarters,
} from 'date-fns/fp';

export {
    /**
     * Get the number of seconds between the given dates.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of seconds.
     * @example
     * // How many seconds are between 2 July 2014 12:30:07.999 and 2 July 2014 12:30:20.000?
     * const laterDate = new Date( 2014, 6, 2, 12, 30, 20, 0 );
     * const earlierDate = new Date( 2014, 6, 2, 12, 30, 7, 999 );
     * const result = differenceInSeconds( earlierDate, laterDate );
     * //=> 12
     *
     * const diffFromEarlier = differenceInSeconds( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 12
     */
    differenceInSeconds,
} from 'date-fns/fp';

export {
    /**
     * Get the number of full weeks between the given dates.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of full weeks.
     * @example
     * // How many full weeks are between 5 July 2014 and 20 July 2014?
     * const laterDate = new Date( 2014, 6, 20 );
     * const earlierDate = new Date( 2014, 6, 5 );
     * const result = differenceInWeeks( earlierDate, laterDate );
     * //=> 2
     *
     * const diffFromEarlier = differenceInWeeks( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 2
     */
    differenceInWeeks,
} from 'date-fns/fp';

export {
    /**
     * Get the number of full years between the given dates.
     *
     * @category Date
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @returns {number} The number of full years.
     * @example
     * // How many full years are between 31 December 2013 and 11 February 2015?
     * const laterDate = new Date( 2015, 1, 11 );
     * const earlierDate = new Date( 2013, 11, 31 );
     * const result = differenceInYears( earlierDate, laterDate );
     * //=> 1
     *
     * const diffFromEarlier = differenceInYears( earlierDate );
     * diffFromEarlier( laterDate );
     * //=> 1
     */
    differenceInYears,
} from 'date-fns/fp';

export {
    /**
     * Return the array of dates within the specified time interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} The array with dates from the interval.
     * @example
     * // Each day between 6 October 2014 and 10 October 2014:
     * const interval = {
     *     start: new Date( 2014, 9, 6 ),
     *     end: new Date( 2014, 9, 10 )
     * };
     * const result = eachDayOfInterval( interval );
     * //=> [
     * //   Mon Oct 06 2014 00:00:00,
     * //   Tue Oct 07 2014 00:00:00,
     * //   Wed Oct 08 2014 00:00:00,
     * //   Thu Oct 09 2014 00:00:00,
     * //   Fri Oct 10 2014 00:00:00
     * // ]
     */
    eachDayOfInterval,
} from 'date-fns/fp';

export {
    /**
     * Return the array of hours within the specified time interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} The array with hourly timestamps within the interval.
     * @example
     * // Each hour between 6 October 2014, 12:00 and 6 October 2014, 15:00:
     * const interval = {
     *     start: new Date( 2014, 9, 6, 12 ),
     *     end: new Date( 2014, 9, 6, 15 )
     * };
     * const result = eachHourOfInterval( interval );
     * //=> [
     * //   Mon Oct 06 2014 12:00:00,
     * //   Mon Oct 06 2014 13:00:00,
     * //   Mon Oct 06 2014 14:00:00,
     * //   Mon Oct 06 2014 15:00:00
     * // ]
     */
    eachHourOfInterval,
} from 'date-fns/fp';

export {
    /**
     * Return the array of months within the specified time interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} The array with monthly dates within the interval.
     * @example
     * // Each month between 6 February 2014 and 10 August 2014:
     * const interval = {
     *     start: new Date( 2014, 1, 6 ),
     *     end: new Date( 2014, 7, 10 )
     * };
     * const result = eachMonthOfInterval( interval );
     * //=> [
     * //   Thu Feb 06 2014 00:00:00,
     * //   Thu Mar 06 2014 00:00:00,
     * //   Sun Apr 06 2014 00:00:00,
     * //   Tue May 06 2014 00:00:00,
     * //   Fri Jun 06 2014 00:00:00,
     * //   Sun Jul 06 2014 00:00:00,
     * //   Wed Aug 06 2014 00:00:00
     * // ]
     */
    eachMonthOfInterval,
} from 'date-fns/fp';

export {
    /**
     * Return the array of quarters within the specified time interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} The array with quarterly dates within the interval.
     * @example
     * // Each quarter within interval 6 February 2014 - 10 August 2014:
     * const interval = {
     *     start: new Date( 2014, 1, 6 ),
     *     end: new Date( 2014, 7, 10 )
     * };
     * const result = eachQuarterOfInterval( interval );
     * //=> [
     * //   Thu Feb 06 2014 00:00:00,
     * //   Sun May 06 2014 00:00:00,
     * //   Sun Aug 06 2014 00:00:00
     * // ]
     */
    eachQuarterOfInterval,
} from 'date-fns/fp';

export {
    /**
     * Return the array of weeks within the specified time interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} The array with weekly dates within the interval.
     * @example
     * // Each week within interval 6 October 2014 - 23 November 2014:
     * const interval = {
     *     start: new Date( 2014, 9, 6 ),
     *     end: new Date( 2014, 10, 23 )
     * };
     * const result = eachWeekOfInterval( interval );
     * //=> [
     * //   Sun Oct 05 2014 00:00:00,
     * //   Sun Oct 12 2014 00:00:00,
     * //   Sun Oct 19 2014 00:00:00,
     * //   Sun Oct 26 2014 00:00:00,
     * //   Sun Nov 02 2014 00:00:00,
     * //   Sun Nov 09 2014 00:00:00,
     * //   Sun Nov 16 2014 00:00:00,
     * //   Sun Nov 23 2014 00:00:00
     * // ]
     */
    eachWeekOfInterval,
} from 'date-fns/fp';

export {
    /**
     * List all the Saturdays and Sundays in the given date interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} An array containing all the Saturdays and Sundays within the interval.
     * @example
     * // Lists all Saturdays and Sundays in the given date interval:
     * const interval = {
     *     start: new Date( 2018, 8, 17 ),
     *     end: new Date( 2018, 8, 30 )
     * };
     * const result = eachWeekendOfInterval( interval );
     * //=> [
     * //   Sat Sep 22 2018 00:00:00,
     * //   Sun Sep 23 2018 00:00:00,
     * //   Sat Sep 29 2018 00:00:00,
     * //   Sun Sep 30 2018 00:00:00
     * // ]
     */
    eachWeekendOfInterval,
} from 'date-fns/fp';

export {
    /**
     * List all the Saturdays and Sundays in the given month.
     *
     * @category Date
     * @param {Date|external:number} date The given month.
     * @returns {Date[]} An array containing all the Saturdays and Sundays in the month.
     * @example
     * // Lists all Saturdays and Sundays in February 2022:
     * const result = eachWeekendOfMonth( new Date( 2022, 1, 1 ) );
     * //=> [
     * //   Sat Feb 05 2022 00:00:00,
     * //   Sun Feb 06 2022 00:00:00,
     * //   Sat Feb 12 2022 00:00:00,
     * //   Sun Feb 13 2022 00:00:00,
     * //   Sat Feb 19 2022 00:00:00,
     * //   Sun Feb 20 2022 00:00:00,
     * //   Sat Feb 26 2022 00:00:00,
     * //   Sun Feb 27 2022 00:00:00
     * // ]
     */
    eachWeekendOfMonth,
} from 'date-fns/fp';

export {
    /**
     * List all the Saturdays and Sundays in the given year.
     *
     * @category Date
     * @param {Date|external:number} date The given year.
     * @returns {Date[]} An array containing all the Saturdays and Sundays in the year.
     * @example
     * // Lists all Saturdays and Sundays in the year 2022:
     * const result = eachWeekendOfYear( new Date( 2022, 0, 1 ) );
     * //=> [
     * //   Sat Jan 01 2022 00:00:00,
     * //   Sun Jan 02 2022 00:00:00,
     * //   Sat Jan 08 2022 00:00:00,
     * //   Sun Jan 09 2022 00:00:00,
     * //   ...
     * //   Sat Dec 31 2022 00:00:00
     * // ]
     */
    eachWeekendOfYear,
} from 'date-fns/fp';

export {
    /**
     * Return the array of years within the specified time interval.
     *
     * @category Date
     * @param {Object} interval The interval object with start and end dates.
     * @param {Date|external:number} interval.start The start of the interval.
     * @param {Date|external:number} interval.end The end of the interval.
     * @returns {Date[]} The array with yearly dates within the interval.
     * @example
     * // Each year between 6 February 2014 and 10 August 2017:
     * const interval = {
     *     start: new Date( 2014, 1, 6 ),
     *     end: new Date( 2017, 7, 10 )
     * };
     * const result = eachYearOfInterval( interval );
     * //=> [
     * //   Thu Feb 06 2014 00:00:00,
     * //   Fri Feb 06 2015 00:00:00,
     * //   Sat Feb 06 2016 00:00:00,
     * //   Mon Feb 06 2017 00:00:00
     * // ]
     */
    eachYearOfInterval,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a day for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a day.
     * @example
     * // The end of a day for 2 September 2014 11:55:00:
     * const result = endOfDay( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Tue Sep 02 2014 23:59:59.999
     *
     * const endOfDayFn = endOfDay;
     * endOfDayFn( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Tue Sep 02 2014 23:59:59.999
     */
    endOfDay,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a decade for the given date.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a decade.
     * @example
     * // The end of a decade for 12 May 1984 00:00:00:
     * const result = endOfDecade( new Date( 1984, 4, 12, 0, 0, 0 ) );
     * //=> Wed Dec 31 1989 23:59:59.999
     *
     * const endOfDecadeFn = endOfDecade;
     * endOfDecadeFn( new Date( 1984, 4, 12, 0, 0, 0 ) );
     * //=> Wed Dec 31 1989 23:59:59.999
     */
    endOfDecade,
} from 'date-fns/fp';

export {
    /**
     * Return the end of an hour for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of an hour.
     * @example
     * // The end of an hour for 2 September 2014 11:55:00:
     * const result = endOfHour( new Date( 2014, 8, 2, 11, 55 ) );
     * //=> Tue Sep 02 2014 11:59:59.999
     *
     * const endOfHourFn = endOfHour;
     * endOfHourFn( new Date( 2014, 8, 2, 11, 55 ) );
     * //=> Tue Sep 02 2014 11:59:59.999
     */
    endOfHour,
} from 'date-fns/fp';

export {
    /**
     * Return the end of an ISO week for the given date. The result will be in the local timezone.
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of an ISO week.
     * @example
     * // The end of an ISO week for 2 September 2014 11:55:00:
     * const result = endOfISOWeek( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Sun Sep 07 2014 23:59:59.999
     *
     * const endOfISOWeekFn = endOfISOWeek;
     * endOfISOWeekFn( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Sun Sep 07 2014 23:59:59.999
     */
    endOfISOWeek,
} from 'date-fns/fp';

export {
    /**
     * Return the end of an ISO week-numbering year for the given date. The result will be in the local timezone.
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of an ISO week-numbering year.
     * @example
     * // The end of an ISO week-numbering year for 2 July 2005:
     * const result = endOfISOWeekYear( new Date( 2005, 6, 2 ) );
     * //=> Sun Jan 01 2006 23:59:59.999
     *
     * const endOfISOWeekYearFn = endOfISOWeekYear;
     * endOfISOWeekYearFn( new Date( 2005, 6, 2 ) );
     * //=> Sun Jan 01 2006 23:59:59.999
     */
    endOfISOWeekYear,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a minute for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a minute.
     * @example
     * // The end of a minute for 1 December 2014 22:15:45.400:
     * const result = endOfMinute( new Date( 2014, 11, 1, 22, 15, 45, 400 ) );
     * //=> Mon Dec 01 2014 22:15:59.999
     *
     * const endOfMinuteFn = endOfMinute;
     * endOfMinuteFn( new Date( 2014, 11, 1, 22, 15, 45, 400 ) );
     * //=> Mon Dec 01 2014 22:15:59.999
     */
    endOfMinute,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a month for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a month.
     * @example
     * // The end of a month for 2 September 2014 11:55:00:
     * const result = endOfMonth( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Tue Sep 30 2014 23:59:59.999
     *
     * const endOfMonthFn = endOfMonth;
     * endOfMonthFn( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Tue Sep 30 2014 23:59:59.999
     */
    endOfMonth,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a year quarter for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a quarter.
     * @example
     * // The end of a quarter for 2 September 2014 11:55:00:
     * const result = endOfQuarter( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Tue Sep 30 2014 23:59:59.999
     *
     * const endOfQuarterFn = endOfQuarter;
     * endOfQuarterFn( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Tue Sep 30 2014 23:59:59.999
     */
    endOfQuarter,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a second for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a second.
     * @example
     * // The end of a second for 1 December 2014 22:15:45.400:
     * const result = endOfSecond( new Date( 2014, 11, 1, 22, 15, 45, 400 ) );
     * //=> Mon Dec 01 2014 22:15:45.999
     *
     * const endOfSecondFn = endOfSecond;
     * endOfSecondFn( new Date( 2014, 11, 1, 22, 15, 45, 400 ) );
     * //=> Mon Dec 01 2014 22:15:45.000
     */
    endOfSecond,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a week for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a week.
     * @example
     * // The end of a week for 2 September 2014 11:55:00:
     * const result = endOfWeek( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Sat Sep 06 2014 23:59:59.999
     *
     * const endOfWeekFn = endOfWeek;
     * endOfWeekFn( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Sat Sep 06 2014 23:59:59.999
     */
    endOfWeek,
} from 'date-fns/fp';

export {
    /**
     * Return the end of a year for the given date. The result will be in the local timezone.
     *
     * @category Date
     * @param {Date|external:number} date The original date.
     * @returns {Date} The end of a year.
     * @example
     * // The end of a year for 2 September 2014 11:55:00:
     * const result = endOfYear( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Wed Dec 31 2014 23:59:59.999
     *
     * const endOfYearFn = endOfYear;
     * endOfYearFn( new Date( 2014, 8, 2, 11, 55, 0 ) );
     * //=> Wed Dec 31 2014 23:59:59.999
     */
    endOfYear,
} from 'date-fns/fp';

export {
    /**
     * @name formatDistance
     * @category Date
     * @summary Return the distance between the given dates in words.
     *
     * @description
     * Return the distance between the given dates in words.
     *
     * | Distance between dates                                            | Result              |
     * |-------------------------------------------------------------------|---------------------|
     * | 0 ... 30 secs                                                     | less than a minute  |
     * | 30 secs ... 1 min 30 secs                                         | 1 minute            |
     * | 1 min 30 secs ... 44 mins 30 secs                                 | [2..44] minutes     |
     * | 44 mins ... 30 secs ... 89 mins 30 secs                           | about 1 hour        |
     * | 89 mins 30 secs ... 23 hrs 59 mins 30 secs                        | about [2..24] hours |
     * | 23 hrs 59 mins 30 secs ... 41 hrs 59 mins 30 secs                 | 1 day               |
     * | 41 hrs 59 mins 30 secs ... 29 days 23 hrs 59 mins 30 secs         | [2..30] days        |
     * | 29 days 23 hrs 59 mins 30 secs ... 44 days 23 hrs 59 mins 30 secs | about 1 month       |
     * | 44 days 23 hrs 59 mins 30 secs ... 59 days 23 hrs 59 mins 30 secs | about 2 months      |
     * | 59 days 23 hrs 59 mins 30 secs ... 1 yr                           | [2..12] months      |
     * | 1 yr ... 1 yr 3 months                                            | about 1 year        |
     * | 1 yr 3 months ... 1 yr 9 months                                   | over 1 year         |
     * | 1 yr 9 months ... 2 yrs                                           | almost 2 years      |
     * | N yrs ... N yrs 3 months                                          | about N years       |
     * | N yrs 3 months ... N yrs 9 months                                 | over N years        |
     * | N yrs 9 months ... N+1 yrs                                        | almost N+1 years    |
     *
     * With `options.includeSeconds == true`:
     * | Distance between dates | Result               |
     * |------------------------|----------------------|
     * | 0 secs ... 5 secs      | less than 5 seconds  |
     * | 5 secs ... 10 secs     | less than 10 seconds |
     * | 10 secs ... 20 secs    | less than 20 seconds |
     * | 20 secs ... 40 secs    | half a minute        |
     * | 40 secs ... 60 secs    | less than a minute   |
     * | 60 secs ... 90 secs    | 1 minute             |
     *
     * @param {Date|external:number} earlierDate The earlier date.
     * @param {Date|external:number} laterDate The later date.
     * @param {Object} [options] An object with options.
     * @param {boolean} [options.includeSeconds=false] Distances less than a minute are more detailed.
     * @param {boolean} [options.addSuffix=false] Add "X ago"/"in X" in the locale language.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {string} The distance in words.
     * @example
     * // How many hours are between 2 July 2014 06:50:00 and 2 July 2014 19:00:00?
     * const laterDate = new Date( 2014, 6, 2, 19, 0 );
     * const earlierDate = new Date( 2014, 6, 2, 6, 50 );
     * const result = formatDistance( earlierDate, laterDate );
     * //=> "in 12 hours"
     *
     * const formatDistanceCurried = formatDistance( earlierDate );
     * formatDistanceCurried( laterDate );
     * //=> "in 12 hours"
     */
    formatDistance,
} from 'date-fns/fp';

export {
    /**
     * @name formatDuration
     * @category Date
     * @summary Formats a duration in human-readable format.
     *
     * @description
     * Return human-readable duration string i.e. "9 months 2 days".
     *
     * @param {Object} duration The duration to format.
     * @param {string[]} [options.format=['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']] The array of units to format.
     * @param {boolean} [options.zero=false] Should be zeros be included in the output?
     * @param {string} [options.delimiter=', '] The delimiter string to use.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {string} The formatted duration string.
     * @example
     * // Format full duration
     * const result = formatDuration({'years': 2, 'months': 9, 'weeks': 1, 'days': 7, 'hours': 5, 'minutes': 9, 'seconds': 30});
     * //=> "2 years 9 months 1 week 7 days 5 hours 9 minutes 30 seconds"
     *
     * @example
     * // Format partial duration
     * const result = formatDuration({ months: 9, days: 2 });
     * //=> "9 months 2 days"
     *
     * @example
     * // Customize the format
     * const result = formatDuration({'years': 2, 'months': 9, 'weeks': 1, 'days': 7, 'hours': 5, 'minutes': 9, 'seconds': 30}, {format: ['months', 'days']});
     * //=> "9 months 7 days"
     *
     * const formatDurationCurried = formatDuration({'years': 2, 'months': 9, 'weeks': 1, 'days': 7, 'hours': 5, 'minutes': 9, 'seconds': 30});
     * formatDurationCurried({format: ['months', 'days']});
     * //=> "9 months 7 days"
     */
    formatDuration,
} from 'date-fns/fp';

export {
    /**
     * @name getDate
     * @category Date
     * @summary Get the day of the month of the given date.
     *
     * @description
     * Get the day of the month of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The day of month.
     * @example
     * // Which day of the month is 29 February 2012?
     * const result = getDate(new Date(2012, 1, 29));
     * //=> 29
     *
     * const getDayOfMonth = getDate;
     * getDayOfMonth(new Date(2012, 1, 29));
     * //=> 29
     */
    getDate,
} from 'date-fns/fp';

export {
    /**
     * @name getDay
     * @category Date
     * @summary Get the day of the week of the given date.
     *
     * @description
     * Get the day of the week of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The day of week, 0 represents Sunday.
     * @example
     * // Which day of the week is 29 February 2012?
     * const result = getDay(new Date(2012, 1, 29));
     * //=> 3
     *
     * const getDayOfWeek = getDay;
     * getDayOfWeek(new Date(2012, 1, 29));
     * //=> 3
     */
    getDay,
} from 'date-fns/fp';

export {
    /**
     * @name getDayOfYear
     * @category Date
     * @summary Get the day of the year of the given date.
     *
     * @description
     * Get the day of the year of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The day of year.
     * @example
     * // Which day of the year is 2 July 2014?
     * const result = getDayOfYear(new Date(2014, 6, 2));
     * //=> 183
     *
     * const getDayOfYearFn = getDayOfYear;
     * getDayOfYearFn(new Date(2014, 6, 2));
     * //=> 183
     */
    getDayOfYear,
} from 'date-fns/fp';

export {
    /**
     * @name getDaysInMonth
     * @category Date
     * @summary Get the number of days in a month of the given date.
     *
     * @description
     * Get the number of days in a month of the given date, considering the context if provided.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The number of days in a month.
     * @example
     * // How many days are in February 2000?
     * const result = getDaysInMonth(new Date(2000, 1));
     * //=> 29
     *
     * const getDaysInMonthFn = getDaysInMonth;
     * getDaysInMonthFn(new Date(2000, 1));
     * //=> 29
     */
    getDaysInMonth,
} from 'date-fns/fp';

export {
    /**
     * @name getDaysInYear
     * @category Date
     * @summary Get the number of days in a year of the given date.
     *
     * @description
     * Get the number of days in a year of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The number of days in a year.
     * @example
     * // How many days are in 2012?
     * const result = getDaysInYear(new Date(2012, 0, 1));
     * //=> 366
     *
     * const getDaysInYearFn = getDaysInYear;
     * getDaysInYearFn(new Date(2012, 0, 1));
     * //=> 366
     */
    getDaysInYear,
} from 'date-fns/fp';

export {
    /**
     * @name getDecade
     * @category Date
     * @summary Get the decade of the given date.
     *
     * @description
     * Get the decade of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The year of decade.
     * @example
     * // Which decade belongs 27 November 1942?
     * const result = getDecade(new Date(1942, 10, 27));
     * //=> 1940
     *
     * const getDecadeFn = getDecade;
     * getDecadeFn(new Date(1942, 10, 27));
     * //=> 1940
     */
    getDecade,
} from 'date-fns/fp';

export {
    /**
     * @name getHours
     * @category Date
     * @summary Get the hours of the given date.
     *
     * @description
     * Get the hours of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The hours.
     * @example
     * // Get the hours of 29 February 2012 11:45:00:
     * const result = getHours(new Date(2012, 1, 29, 11, 45));
     * //=> 11
     *
     * const getHoursFn = getHours;
     * getHoursFn(new Date(2012, 1, 29, 11, 45));
     * //=> 11
     */
    getHours,
} from 'date-fns/fp';

export {
    /**
     * @name getISODay
     * @category Date
     * @summary Get the day of the ISO week of the given date.
     *
     * @description
     * Get the day of the ISO week of the given date, which is 7 for Sunday, 1 for Monday etc.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The day of ISO week.
     * @example
     * // Which day of the ISO week is 26 February 2012?
     * const result = getISODay(new Date(2012, 1, 26));
     * //=> 7
     *
     * const getISODayFn = getISODay;
     * getISODayFn(new Date(2012, 1, 26));
     * //=> 7
     */
    getISODay,
} from 'date-fns/fp';

export {
    /**
     * @name getISOWeek
     * @category Date
     * @summary Get the ISO week of the given date.
     *
     * @description
     * Get the ISO week of the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The ISO week.
     * @example
     * // Which week of the ISO-week numbering year is 2 January 2005?
     * const result = getISOWeek(new Date(2005, 0, 2));
     * //=> 53
     *
     * const getISOWeekFn = getISOWeek;
     * getISOWeekFn(new Date(2005, 0, 2));
     * //=> 53
     */
    getISOWeek,
} from 'date-fns/fp';

export {
    /**
     * @name getISOWeekYear
     * @category Date
     * @summary Get the ISO week-numbering year of the given date.
     *
     * @description
     * Get the ISO week-numbering year of the given date,
     * which always starts 3 days before the year's first Thursday.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The ISO week-numbering year.
     * @example
     * // Which ISO-week numbering year is 2 January 2005?
     * const result = getISOWeekYear(new Date(2005, 0, 2));
     * //=> 2004
     *
     * const getISOWeekYearFn = getISOWeekYear;
     * getISOWeekYearFn(new Date(2005, 0, 2));
     * //=> 2004
     */
    getISOWeekYear,
} from 'date-fns/fp';

export {
    /**
     * @name getISOWeeksInYear
     * @category Date
     * @summary Get the number of weeks in an ISO week-numbering year of the given date.
     *
     * @description
     * Get the number of weeks in an ISO week-numbering year of the given date.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The number of ISO weeks in a year.
     * @example
     * // How many weeks are in ISO week-numbering year 2015?
     * const result = getISOWeeksInYear(new Date(2015, 1, 11));
     * //=> 53
     *
     * const getISOWeeksInYearFn = getISOWeeksInYear;
     * getISOWeeksInYearFn(new Date(2015, 1, 11));
     * //=> 53
     */
    getISOWeeksInYear,
} from 'date-fns/fp';

export {
    /**
     * @name getMilliseconds
     * @category Date
     * @summary Get the milliseconds of the given date.
     *
     * @description
     * Get the milliseconds of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The milliseconds.
     * @example
     * // Get the milliseconds of 29 February 2012 11:45:05.123:
     * const result = getMilliseconds(new Date(2012, 1, 29, 11, 45, 5, 123));
     * //=> 123
     *
     * const getMillisecondsFn = getMilliseconds;
     * getMillisecondsFn(new Date(2012, 1, 29, 11, 45, 5, 123));
     * //=> 123
     */
    getMilliseconds,
} from 'date-fns/fp';

export {
    /**
     * @name getMinutes
     * @category Date
     * @summary Get the minutes of the given date.
     *
     * @description
     * Get the minutes of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The minutes.
     * @example
     * // Get the minutes of 29 February 2012 11:45:05:
     * const result = getMinutes(new Date(2012, 1, 29, 11, 45, 5));
     * //=> 45
     *
     * const getMinutesFn = getMinutes;
     * getMinutesFn(new Date(2012, 1, 29, 11, 45, 5));
     * //=> 45
     */
    getMinutes,
} from 'date-fns/fp';

export {
    /**
     * @name getMonth
     * @category Date
     * @summary Get the month of the given date.
     *
     * @description
     * Get the month of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The month index (0-11).
     * @example
     * // Which month is 29 February 2012?
     * const result = getMonth(new Date(2012, 1, 29));
     * //=> 1
     *
     * const getMonthFn = getMonth;
     * getMonthFn(new Date(2012, 1, 29));
     * //=> 1
     */
    getMonth,
} from 'date-fns/fp';

export {
    /**
     * @name getOverlappingDaysInIntervals
     * @category Date
     * @summary Get the number of days that overlap in two time intervals.
     *
     * @description
     * Get the number of days that overlap in two time intervals. It uses the time
     * between dates to calculate the number of days, rounding it up to include
     * partial days.
     *
     * Two equal 0-length intervals will result in 0. Two equal 1ms intervals will
     * result in 1.
     *
     * @param {Object} intervalLeft The first interval to compare.
     * @param {Date|external:number} intervalLeft.start The start of the first interval.
     * @param {Date|external:number} intervalLeft.end The end of the first interval.
     * @param {Object} intervalRight The second interval to compare.
     * @param {Date|external:number} intervalRight.start The start of the second interval.
     * @param {Date|external:number} intervalRight.end The end of the second interval.
     * @returns {number} The number of days that overlap in two time intervals.
     * @example
     * // For overlapping time intervals adds 1 for each started overlapping day:
     * const intervalLeft = { start: new Date(2014, 0, 10), end: new Date(2014, 0, 20) };
     * const intervalRight = { start: new Date(2014, 0, 17), end: new Date(2014, 0, 21) };
     * const result = getOverlappingDaysInIntervals( intervalLeft, intervalRight );
     * //=> 3
     *
     * const getOverlappingDaysInIntervalsCurried = getOverlappingDaysInIntervals( intervalLeft );
     * getOverlappingDaysInIntervalsCurried( intervalRight );
     * //=> 3
     */
    getOverlappingDaysInIntervals,
} from 'date-fns/fp';

export {
    /**
     * @name getQuarter
     * @category Date
     * @summary Get the year quarter of the given date.
     *
     * @description
     * Get the year quarter of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The quarter.
     * @example
     * // Which quarter is 2 July 2014?
     * const result = getQuarter(new Date(2014, 6, 2));
     * //=> 3
     *
     * const getQuarterFn = getQuarter;
     * getQuarterFn(new Date(2014, 6, 2));
     * //=> 3
     */
    getQuarter,
} from 'date-fns/fp';

export {
    /**
     * @name getSeconds
     * @category Date
     * @summary Get the seconds of the given date.
     *
     * @description
     * Get the seconds of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The seconds.
     * @example
     * // Get the seconds of 29 February 2012 11:45:05.123:
     * const result = getSeconds(new Date(2012, 1, 29, 11, 45, 5, 123));
     * //=> 5
     *
     * const getSecondsFn = getSeconds;
     * getSecondsFn(new Date(2012, 1, 29, 11, 45, 5, 123));
     * //=> 5
     */
    getSeconds,
} from 'date-fns/fp';

export {
    /**
     * @name getTime
     * @category Date
     * @summary Get the milliseconds timestamp of the given date.
     *
     * @description
     * Get the milliseconds timestamp of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The timestamp.
     * @example
     * // Get the timestamp of 29 February 2012 11:45:05.123:
     * const result = getTime(new Date(2012, 1, 29, 11, 45, 5, 123));
     * //=> 1330515905123
     *
     * const getTimeFn = getTime;
     * getTimeFn(new Date(2012, 1, 29, 11, 45, 5, 123));
     * //=> 1330515905123
     */
    getTime,
} from 'date-fns/fp';

export {
    /**
     * @name getUnixTime
     * @category Date
     * @summary Get the seconds timestamp of the given date.
     *
     * @description
     * Get the seconds timestamp of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The timestamp.
     * @example
     * // Get the timestamp of 29 February 2012 11:45:05 CET:
     * const result = getUnixTime(new Date(2012, 1, 29, 11, 45, 5));
     * //=> 1330512305
     *
     * const getUnixTimeFn = getUnixTime;
     * getUnixTimeFn(new Date(2012, 1, 29, 11, 45, 5));
     * //=> 1330512305
     */
    getUnixTime,
} from 'date-fns/fp';

export {
    /**
     * @name getWeek
     * @category Date
     * @summary Get the local week index of the given date.
     *
     * @description
     * Get the local week index of the given date.
     * The exact calculation depends on the values of
     * `options.weekStartsOn` (which is the index of the first day of the week)
     * and `options.firstWeekContainsDate` (which is the day of January, which is always in
     * the first week of the week-numbering year)
     *
     * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
     *
     * @param {Date|external:number} date The given date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {number} [options.firstWeekContainsDate=1] The day of January, which is always in the first week of the year.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {number} The week.
     * @example
     * // Which week of the local week numbering year is 2 January 2005 with default options?:
     * const result = getWeek(new Date(2005, 0, 2));
     * //=> 2
     *
     * @example
     * // Which week of the local week numbering year is 2 January 2005,
     * // if Monday is the first day of the week,
     * // and the first week of the year always contains 4 January?:
     * const result = getWeek(new Date(2005, 0, 2), { weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> 53
     *
     * const getWeekCurried = getWeek(new Date(2005, 0, 2));
     * getWeekCurried({ weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> 53
     */
    getWeek,
} from 'date-fns/fp';

export {
    /**
     * @name getWeekOfMonth
     * @category Date
     * @summary Get the week of the month of the given date.
     *
     * @description
     * Get the week of the month of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {number} The week of month.
     * @example
     * // Which week of the month is 9 November 2017?:
     * const result = getWeekOfMonth(new Date(2017, 10, 9));
     * //=> 2
     *
     * const getWeekOfMonthFn = getWeekOfMonth;
     * getWeekOfMonthFn(new Date(2017, 10, 9));
     * //=> 2
     */
    getWeekOfMonth,
} from 'date-fns/fp';

export {
    /**
     * @name getWeekYear
     * @category Date
     * @summary Get the local week-numbering year of the given date.
     *
     * @description
     * Get the local week-numbering year of the given date.
     * The exact calculation depends on the values of
     * `options.weekStartsOn` (which is the index of the first day of the week)
     * and `options.firstWeekContainsDate` (which is the day of January, which is always in
     * the first week of the week-numbering year)
     *
     * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
     *
     * @param {Date|external:number} date The given date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {number} [options.firstWeekContainsDate=1] The day of January, which is always in the first week of the year.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {number} The local week-numbering year.
     * @example
     * // Which week numbering year is 26 December 2004 with the default settings?:
     * const result = getWeekYear(new Date(2004, 11, 26));
     * //=> 2005
     *
     * @example
     * // Which week numbering year is 26 December 2004 if week starts on Saturday?:
     * const result = getWeekYear(new Date(2004, 11, 26), { weekStartsOn: 6 });
     * //=> 2004
     *
     * const getWeekYearCurried = getWeekYear(new Date(2004, 11, 26));
     * getWeekYearCurried({ weekStartsOn: 6 });
     * //=> 2004
     */
    getWeekYear,
} from 'date-fns/fp';

export {
    /**
     * @name getWeeksInMonth
     * @category Date
     * @summary Get the number of calendar weeks a month spans.
     *
     * @description
     * Get the number of calendar weeks the month in the given date spans.
     *
     * @param {Date|external:number} date The given date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {number} The number of calendar weeks.
     * @example
     * // How many calendar weeks does February 2015 span?:
     * const result = getWeeksInMonth(new Date(2015, 1, 8));
     * //=> 4
     *
     * @example
     * // If the week starts on Monday,
     * // how many calendar weeks does July 2017 span?:
     * const result = getWeeksInMonth(new Date(2017, 6, 5), { weekStartsOn: 1 });
     * //=> 6
     *
     * const getWeeksInMonthCurried = getWeeksInMonth(new Date(2017, 6, 5));
     * getWeeksInMonthCurried({ weekStartsOn: 1 });
     * //=> 6
     */
    getWeeksInMonth,
} from 'date-fns/fp';

export {
    /**
     * @name getYear
     * @category Date
     * @summary Get the year of the given date.
     *
     * @description
     * Get the year of the given date.
     *
     * @param {Date|external:number} date The given date.
     * @returns {number} The year.
     * @example
     * // Which year is 2 July 2014?:
     * const result = getYear(new Date(2014, 6, 2));
     * //=> 2014
     *
     * const getYearFn = getYear;
     * getYearFn(new Date(2014, 6, 2));
     * //=> 2014
     */
    getYear,
} from 'date-fns/fp';

export {
    /**
     * @name isAfter
     * @category Date
     * @summary Is the first date after the second one?
     *
     * @description
     * Is the first date after the second one?
     *
     * @param {Date|external:number} date The date that should be after the other one to return true.
     * @param {Date|external:number} dateToCompare The date to compare with.
     * @returns {boolean} The first date is after the second date.
     * @example
     * // Is 10 July 1989 after 11 February 1987?
     * const result = isAfter(new Date(1989, 6, 10), new Date(1987, 1, 11));
     * //=> true
     *
     * const isAfterCurried = isAfter(new Date(1989, 6, 10));
     * isAfterCurried(new Date(1987, 1, 11));
     * //=> true
     */
    isAfter,
} from 'date-fns/fp';

export {
    /**
     * @name isBefore
     * @category Date
     * @summary Is the first date before the second one?
     *
     * @description
     * Is the first date before the second one?
     *
     * @param {Date|external:number} date The date that should be before the other one to return true.
     * @param {Date|external:number} dateToCompare The date to compare with.
     * @returns {boolean} The first date is before the second date.
     * @example
     * // Is 10 July 1989 before 11 February 1987?
     * const result = isBefore(new Date(1989, 6, 10), new Date(1987, 1, 11));
     * //=> false
     *
     * const isBeforeCurried = isBefore(new Date(1989, 6, 10));
     * isBeforeCurried(new Date(1987, 1, 11));
     * //=> false
     */
    isBefore,
} from 'date-fns/fp';

export {
    /**
     * @name set
     * @category Date
     * @summary Set date values to a given date.
     *
     * @description
     * Set date values to a given date.
     *
     * Sets time values to date from object `values`.
     * A value is not set if it is undefined or null or doesn't exist in `values`.
     *
     * Note about bundle size: `set` does not internally use `setX` functions from date-fns but instead opts
     * to use native `Date#setX` methods. If you use this function, you may not want to include the
     * other `setX` functions that date-fns provides if you are concerned about the bundle size.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {Object} values The date values to be set.
     * @param {number} [values.year] The year.
     * @param {number} [values.month] The month (0-11).
     * @param {number} [values.date] The day of the month (1-31).
     * @param {number} [values.hours] The hours (0-23).
     * @param {number} [values.minutes] The minutes (0-59).
     * @param {number} [values.seconds] The seconds (0-59).
     * @param {number} [values.milliseconds] The milliseconds (0-999).
     * @param {Object} [options] The options object.
     * @returns {Date} The new date with options set.
     * @example
     * // Transform 1 September 2014 into 20 October 2015 in a single line:
     * const result = set(new Date(2014, 8, 20), { year: 2015, month: 9, date: 20 });
     * //=> Tue Oct 20 2015 00:00:00
     *
     * @example
     * // Set 12 PM to 1 September 2014 01:23:45 to 1 September 2014 12:00:00:
     * const result = set(new Date(2014, 8, 1, 1, 23, 45), { hours: 12 });
     * //=> Mon Sep 01 2014 12:23:45
     *
     * const setCurried = set(new Date(2014, 8, 1, 1, 23, 45));
     * setCurried({ hours: 12 });
     * //=> Mon Sep 01 2014 12:23:45
     */
    set,
} from 'date-fns/fp';

export {
    /**
     * @name setDate
     * @category Date
     * @summary Set the day of the month to the given date.
     *
     * @description
     * Set the day of the month to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} dayOfMonth The day of the month of the new date.
     * @returns {Date} The new date with the day of the month set.
     * @example
     * // Set the 30th day of the month to 1 September 2014:
     * const result = setDate(new Date(2014, 8, 1), 30);
     * //=> Tue Sep 30 2014 00:00:00
     *
     * const setDateCurried = setDate(new Date(2014, 8, 1));
     * setDateCurried(30);
     * //=> Tue Sep 30 2014 00:00:00
     */
    setDate,
} from 'date-fns/fp';

export {
    /**
     * @name setDay
     * @category Date
     * @summary Set the day of the week to the given date.
     *
     * @description
     * Set the day of the week to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} day The day of the week of the new date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {Date} The new date with the day of the week set.
     * @example
     * // Set week day to Sunday, with the default weekStartsOn of Sunday:
     * const result = setDay(new Date(2014, 8, 1), 0);
     * //=> Sun Aug 31 2014 00:00:00
     *
     * @example
     * // Set week day to Sunday, with a weekStartsOn of Monday:
     * const result = setDay(new Date(2014, 8, 1), 0, { weekStartsOn: 1 });
     * //=> Sun Sep 07 2014 00:00:00
     *
     * const setDayCurried = setDay(new Date(2014, 8, 1));
     * setDayCurried(0, { weekStartsOn: 1 });
     * //=> Sun Sep 07 2014 00:00:00
     */
    setDay,
} from 'date-fns/fp';

export {
    /**
     * @name setDayOfYear
     * @category Date
     * @summary Set the day of the year to the given date.
     *
     * @description
     * Set the day of the year to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} dayOfYear The day of the year of the new date.
     * @returns {Date} The new date with the day of the year set.
     * @example
     * // Set the 2nd day of the year to 2 July 2014:
     * const result = setDayOfYear(new Date(2014, 6, 2), 2);
     * //=> Thu Jan 02 2014 00:00:00
     *
     * const setDayOfYearCurried = setDayOfYear(new Date(2014, 6, 2));
     * setDayOfYearCurried(2);
     * //=> Thu Jan 02 2014 00:00:00
     */
    setDayOfYear,
} from 'date-fns/fp';

export {
    /**
     * @name setHours
     * @category Date
     * @summary Set the hours to the given date.
     *
     * @description
     * Set the hours to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} hours The hours of the new date.
     * @returns {Date} The new date with the hours set.
     * @example
     * // Set 4 hours to 1 September 2014 11:30:00:
     * const result = setHours(new Date(2014, 8, 1, 11, 30), 4);
     * //=> Mon Sep 01 2014 04:30:00
     *
     * const setHoursCurried = setHours(new Date(2014, 8, 1, 11, 30));
     * setHoursCurried(4);
     * //=> Mon Sep 01 2014 04:30:00
     */
    setHours,
} from 'date-fns/fp';

export {
    /**
     * @name setISODay
     * @category Date
     * @summary Set the day of the ISO week to the given date.
     *
     * @description
     * Set the day of the ISO week to the given date.
     * ISO week starts with Monday.
     * 7 is the index of Sunday, 1 is the index of Monday, etc.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} day The day of the ISO week of the new date.
     * @returns {Date} The new date with the day of the ISO week set.
     * @example
     * // Set Sunday to 1 September 2014:
     * const result = setISODay(new Date(2014, 8, 1), 7);
     * //=> Sun Sep 07 2014 00:00:00
     *
     * const setISODayCurried = setISODay(new Date(2014, 8, 1));
     * setISODayCurried(7);
     * //=> Sun Sep 07 2014 00:00:00
     */
    setISODay,
} from 'date-fns/fp';

export {
    /**
     * @name setISOWeek
     * @category Date
     * @summary Set the ISO week to the given date.
     *
     * @description
     * Set the ISO week to the given date, saving the weekday number.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} week The ISO week of the new date.
     * @returns {Date} The new date with the ISO week set.
     * @example
     * // Set the 53rd ISO week to 7 August 2004:
     * const result = setISOWeek(new Date(2004, 7, 7), 53);
     * //=> Sat Jan 01 2005 00:00:00
     *
     * const setISOWeekCurried = setISOWeek(new Date(2004, 7, 7));
     * setISOWeekCurried(53);
     * //=> Sat Jan 01 2005 00:00:00
     */
    setISOWeek,
} from 'date-fns/fp';

export {
    /**
     * @name setISOWeekYear
     * @category Date
     * @summary Set the ISO week-numbering year to the given date.
     *
     * @description
     * Set the ISO week-numbering year to the given date,
     * saving the week number and the weekday number.
     * The exact calculation depends on the values of
     * `options.weekStartsOn` (which is the index of the first day of the week)
     * and `options.firstWeekContainsDate` (which is the day of January, which is always in
     * the first week of the week-numbering year)
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} weekYear The ISO week-numbering year of the new date.
     * @returns {Date} The new date with the ISO week-numbering year set.
     * @example
     * // Set ISO week-numbering year 2007 to 29 December 2008:
     * const result = setISOWeekYear(new Date(2008, 11, 29), 2007);
     * //=> Mon Jan 01 2007 00:00:00
     *
     * const setISOWeekYearCurried = setISOWeekYear(new Date(2008, 11, 29));
     * setISOWeekYearCurried(2007);
     * //=> Mon Jan 01 2007 00:00:00
     */
    setISOWeekYear,
} from 'date-fns/fp';

export {
    /**
     * @name setMilliseconds
     * @category Date
     * @summary Set the milliseconds to the given date.
     *
     * @description
     * Set the milliseconds to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} milliseconds The milliseconds of the new date.
     * @returns {Date} The new date with the milliseconds set.
     * @example
     * // Set 300 milliseconds to 1 September 2014 11:30:40.500:
     * const result = setMilliseconds(new Date(2014, 8, 1, 11, 30, 40, 500), 300);
     * //=> Mon Sep 01 2014 11:30:40.300
     *
     * const setMillisecondsCurried = setMilliseconds(new Date(2014, 8, 1, 11, 30, 40, 500));
     * setMillisecondsCurried(300);
     * //=> Mon Sep 01 2014 11:30:40.300
     */
    setMilliseconds,
} from 'date-fns/fp';

export {
    /**
     * @name setMinutes
     * @category Date
     * @summary Set the minutes to the given date.
     *
     * @description
     * Set the minutes to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} minutes The minutes of the new date.
     * @returns {Date} The new date with the minutes set.
     * @example
     * // Set 45 minutes to 1 September 2014 11:30:40:
     * const result = setMinutes(new Date(2014, 8, 1, 11, 30, 40), 45);
     * //=> Mon Sep 01 2014 11:45:40
     *
     * const setMinutesCurried = setMinutes(new Date(2014, 8, 1, 11, 30, 40));
     * setMinutesCurried(45);
     * //=> Mon Sep 01 2014 11:45:40
     */
    setMinutes,
} from 'date-fns/fp';

export {
    /**
     * @name setMonth
     * @category Date
     * @summary Set the month to the given date.
     *
     * @description
     * Set the month to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} month The month index to set (0-11).
     * @returns {Date} The new date with the month set.
     * @example
     * // Set February to 1 September 2014:
     * const result = setMonth(new Date(2014, 8, 1), 1);
     * //=> Sat Feb 01 2014 00:00:00
     *
     * const setMonthCurried = setMonth(new Date(2014, 8, 1));
     * setMonthCurried(1);
     * //=> Sat Feb 01 2014 00:00:00
     */
    setMonth,
} from 'date-fns/fp';

export {
    /**
     * @name setQuarter
     * @category Date
     * @summary Set the year quarter to the given date.
     *
     * @description
     * Set the year quarter to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} quarter The quarter of the new date.
     * @returns {Date} The new date with the quarter set.
     * @example
     * // Set the 2nd quarter to 2 July 2014:
     * const result = setQuarter(new Date(2014, 6, 2), 2);
     * //=> Wed Apr 02 2014 00:00:00
     *
     * const setQuarterCurried = setQuarter(new Date(2014, 6, 2));
     * setQuarterCurried(2);
     * //=> Wed Apr 02 2014 00:00:00
     */
    setQuarter,
} from 'date-fns/fp';

export {
    /**
     * @name setSeconds
     * @category Date
     * @summary Set the seconds to the given date, with context support.
     *
     * @description
     * Set the seconds to the given date, with an optional context for time zone specification.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} seconds The seconds of the new date.
     * @returns {Date} The new date with the seconds set.
     * @example
     * // Set 45 seconds to 1 September 2014 11:30:40:
     * const result = setSeconds(new Date(2014, 8, 1, 11, 30, 40), 45);
     * //=> Mon Sep 01 2014 11:30:45
     *
     * const setSecondsCurried = setSeconds(new Date(2014, 8, 1, 11, 30, 40));
     * setSecondsCurried(45);
     * //=> Mon Sep 01 2014 11:30:45
     */
    setSeconds,
} from 'date-fns/fp';

export {
    /**
     * @name setWeek
     * @category Date
     * @summary Set the local week to the given date.
     *
     * @description
     * Set the local week to the given date, saving the weekday number.
     * The exact calculation depends on the values of
     * `options.weekStartsOn` (which is the index of the first day of the week)
     * and `options.firstWeekContainsDate` (which is the day of January, which is always in
     * the first week of the week-numbering year)
     *
     * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} week The week of the new date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {number} [options.firstWeekContainsDate=1] The day of January, which is always in the first week of the year.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {Date} The new date with the local week set.
     * @example
     * // Set the 1st week to 2 January 2005 with default options:
     * const result = setWeek(new Date(2005, 0, 2), 1);
     * //=> Sun Dec 26 2004 00:00:00
     *
     * @example
     * // Set the 1st week to 2 January 2005,
     * // if Monday is the first day of the week,
     * // and the first week of the year always contains 4 January:
     * const result = setWeek(new Date(2005, 0, 2), 1, { weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> Sun Jan 03 2005 00:00:00
     *
     * const setWeekCurried = setWeek(new Date(2005, 0, 2));
     * setWeekCurried(1, { weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> Sun Jan 03 2005 00:00:00
     */
    setWeek,
} from 'date-fns/fp';

export {
    /**
     * @name setWeekYear
     * @category Date
     * @summary Set the local week-numbering year to the given date.
     *
     * @description
     * Set the local week-numbering year to the given date,
     * saving the week number and the weekday number.
     * The exact calculation depends on the values of
     * `options.weekStartsOn` (which is the index of the first day of the week)
     * and `options.firstWeekContainsDate` (which is the day of January, which is always in
     * the first week of the week-numbering year)
     *
     * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} weekYear The local week-numbering year of the new date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {number} [options.firstWeekContainsDate=1] The day of January, which is always in the first week of the year.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {Date} The new date with the local week-numbering year set.
     * @example
     * // Set the local week-numbering year 2004 to 2 January 2010 with default options:
     * const result = setWeekYear(new Date(2010, 0, 2), 2004);
     * //=> Sat Jan 03 2004 00:00:00
     *
     * @example
     * // Set the local week-numbering year 2004 to 2 January 2010,
     * // if Monday is the first day of week
     * // and 4 January is always in the first week of the year:
     * const result = setWeekYear(new Date(2010, 0, 2), 2004, { weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> Sat Jan 03 2004 00:00:00
     *
     * const setWeekYearCurried = setWeekYear(new Date(2010, 0, 2));
     * setWeekYearCurried(2004, { weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> Sat Jan 03 2004 00:00:00
     */
    setWeekYear,
} from 'date-fns/fp';

export {
    /**
     * @name setYear
     * @category Date
     * @summary Set the year to the given date.
     *
     * @description
     * Set the year to the given date.
     *
     * @param {Date|external:number} date The date to be changed.
     * @param {number} year The year of the new date.
     * @returns {Date} The new date with the year set.
     * @example
     * // Set year 2013 to 1 September 2014:
     * const result = setYear(new Date(2014, 8, 1), 2013);
     * //=> Sun Sep 01 2013 00:00:00
     *
     * const setYearCurried = setYear(new Date(2014, 8, 1));
     * setYearCurried(2013);
     * //=> Sun Sep 01 2013 00:00:00
     */
    setYear,
} from 'date-fns/fp';

export {
    /**
     * @name startOfDay
     * @category Date
     * @summary Return the start of a day for the given date.
     *
     * @description
     * Return the start of a day for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a day.
     * @example
     * // The start of a day for 2 September 2014 11:55:00:
     * const result = startOfDay(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Tue Sep 02 2014 00:00:00
     *
     * const startOfDayFn = startOfDay;
     * startOfDayFn(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Tue Sep 02 2014 00:00:00
     */
    startOfDay,
} from 'date-fns/fp';

export {
    /**
     * @name startOfDecade
     * @category Date
     * @summary Return the start of a decade for the given date.
     *
     * @description
     * Return the start of a decade for the given date.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a decade.
     * @example
     * // The start of a decade for 21 October 2015 00:00:00:
     * const result = startOfDecade(new Date(2015, 9, 21, 0, 0, 0));
     * //=> Jan 01 2010 00:00:00
     *
     * const startOfDecadeFn = startOfDecade;
     * startOfDecadeFn(new Date(2015, 9, 21, 0, 0, 0));
     * //=> Jan 01 2010 00:00:00
     */
    startOfDecade,
} from 'date-fns/fp';

export {
    /**
     * @name startOfHour
     * @category Date
     * @summary Return the start of an hour for the given date.
     *
     * @description
     * Return the start of an hour for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of an hour.
     * @example
     * // The start of an hour for 2 September 2014 11:55:00:
     * const result = startOfHour(new Date(2014, 8, 2, 11, 55));
     * //=> Tue Sep 02 2014 11:00:00
     *
     * const startOfHourFn = startOfHour;
     * startOfHourFn(new Date(2014, 8, 2, 11, 55));
     * //=> Tue Sep 02 2014 11:00:00
     */
    startOfHour,
} from 'date-fns/fp';

export {
    /**
     * @name startOfISOWeek
     * @category Date
     * @summary Return the start of an ISO week for the given date.
     *
     * @description
     * Return the start of an ISO week for the given date.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of an ISO week.
     * @example
     * // The start of an ISO week for 2 September 2014 11:55:00:
     * const result = startOfISOWeek(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Mon Sep 01 2014 00:00:00
     *
     * const startOfISOWeekFn = startOfISOWeek;
     * startOfISOWeekFn(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Mon Sep 01 2014 00:00:00
     */
    startOfISOWeek,
} from 'date-fns/fp';

export {
    /**
     * @name startOfISOWeekYear
     * @category Date
     * @summary Return the start of an ISO week-numbering year for the given date.
     *
     * @description
     * Return the start of an ISO week-numbering year,
     * which always starts 3 days before the year's first Thursday.
     * The result will be in the local timezone.
     *
     * ISO week-numbering year: http://en.wikipedia.org/wiki/ISO_week_date
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of an ISO week-numbering year.
     * @example
     * // The start of an ISO week-numbering year for 2 July 2005:
     * const result = startOfISOWeekYear(new Date(2005, 6, 2));
     * //=> Mon Jan 03 2005 00:00:00
     *
     * const startOfISOWeekYearFn = startOfISOWeekYear;
     * startOfISOWeekYearFn(new Date(2005, 6, 2));
     * //=> Mon Jan 03 2005 00:00:00
     */
    startOfISOWeekYear,
} from 'date-fns/fp';

export {
    /**
     * @name startOfMinute
     * @category Date
     * @summary Return the start of a minute for the given date.
     *
     * @description
     * Return the start of a minute for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a minute.
     * @example
     * // The start of a minute for 1 December 2014 22:15:45.400:
     * const result = startOfMinute(new Date(2014, 11, 1, 22, 15, 45, 400));
     * //=> Mon Dec 01 2014 22:15:00
     *
     * const startOfMinuteFn = startOfMinute;
     * startOfMinuteFn(new Date(2014, 11, 1, 22, 15, 45, 400));
     * //=> Mon Dec 01 2014 22:15:00
     */
    startOfMinute,
} from 'date-fns/fp';

export {
    /**
     * @name startOfMonth
     * @category Date
     * @summary Return the start of a month for the given date.
     *
     * @description
     * Return the start of a month for the given date. The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a month.
     * @example
     * // The start of a month for 2 September 2014 11:55:00:
     * const result = startOfMonth(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Mon Sep 01 2014 00:00:00
     *
     * const startOfMonthFn = startOfMonth;
     * startOfMonthFn(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Mon Sep 01 2014 00:00:00
     */
    startOfMonth,
} from 'date-fns/fp';

export {
    /**
     * @name startOfQuarter
     * @category Date
     * @summary Return the start of a year quarter for the given date.
     *
     * @description
     * Return the start of a year quarter for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a quarter.
     * @example
     * // The start of a quarter for 2 September 2014 11:55:00:
     * const result = startOfQuarter(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Tue Jul 01 2014 00:00:00
     *
     * const startOfQuarterFn = startOfQuarter;
     * startOfQuarterFn(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Tue Jul 01 2014 00:00:00
     */
    startOfQuarter,
} from 'date-fns/fp';

export {
    /**
     * @name startOfSecond
     * @category Date
     * @summary Return the start of a second for the given date.
     *
     * @description
     * Return the start of a second for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a second.
     * @example
     * // The start of a second for 1 December 2014 22:15:45.400:
     * const result = startOfSecond(new Date(2014, 11, 1, 22, 15, 45, 400));
     * //=> Mon Dec 01 2014 22:15:45.000
     *
     * const startOfSecondFn = startOfSecond;
     * startOfSecondFn(new Date(2014, 11, 1, 22, 15, 45, 400));
     * //=> Mon Dec 01 2014 22:15:45.000
     */
    startOfSecond,
} from 'date-fns/fp';

export {
    /**
     * @name startOfWeek
     * @category Date
     * @summary Return the start of a week for the given date.
     *
     * @description
     * Return the start of a week for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {Date} The start of a week.
     * @example
     * // The start of a week for 2 September 2014 11:55:00:
     * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Sun Aug 31 2014 00:00:00
     *
     * @example
     * // If the week starts on Monday, the start of the week for 2 September 2014 11:55:00:
     * const result = startOfWeek(new Date(2014, 8, 2, 11, 55, 0), { weekStartsOn: 1 });
     * //=> Mon Sep 01 2014 00:00:00
     *
     * const startOfWeekCurried = startOfWeek(new Date(2014, 8, 2, 11, 55, 0));
     * startOfWeekCurried({ weekStartsOn: 1 });
     * //=> Mon Sep 01 2014 00:00:00
     */
    startOfWeek,
} from 'date-fns/fp';

export {
    /**
     * @name startOfWeekYear
     * @category Date
     * @summary Return the start of a local week-numbering year for the given date.
     *
     * @description
     * Return the start of a local week-numbering year.
     * The exact calculation depends on the values of
     * `options.weekStartsOn` (which is the index of the first day of the week)
     * and `options.firstWeekContainsDate` (which is the day of January, which is always in
     * the first week of the week-numbering year)
     *
     * Week numbering: https://en.wikipedia.org/wiki/Week#The_ISO_week_date_system
     *
     * @param {Date|external:number} date The original date.
     * @param {Object} [options] An object with options.
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] The index of the first day of the week (0 - Sunday).
     * @param {number} [options.firstWeekContainsDate=1] The day of January, which is always in the first week of the year.
     * @param {Locale} [options.locale=defaultLocale] The locale object.
     * @returns {Date} The start of a week-numbering year.
     * @example
     * // The start of an a week-numbering year for 2 July 2005 with default settings:
     * const result = startOfWeekYear(new Date(2005, 6, 2));
     * //=> Sun Dec 26 2004 00:00:00
     *
     * @example
     * // The start of a week-numbering year for 2 July 2005
     * // if Monday is the first day of week
     * // and 4 January is always in the first week of the year:
     * const result = startOfWeekYear(new Date(2005, 6, 2), { weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> Mon Jan 03 2005 00:00:00
     *
     * const startOfWeekYearCurried = startOfWeekYear(new Date(2005, 6, 2));
     * startOfWeekYearCurried({ weekStartsOn: 1, firstWeekContainsDate: 4 });
     * //=> Mon Jan 03 2005 00:00:00
     */
    startOfWeekYear,
} from 'date-fns/fp';

export {
    /**
     * @name startOfYear
     * @category Date
     * @summary Return the start of a year for the given date.
     *
     * @description
     * Return the start of a year for the given date.
     * The result will be in the local timezone.
     *
     * @param {Date|external:number} date The original date.
     * @returns {Date} The start of a year.
     * @example
     * // The start of a year for 2 September 2014 11:55:00:
     * const result = startOfYear(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Wed Jan 01 2014 00:00:00
     *
     * const startOfYearFn = startOfYear;
     * startOfYearFn(new Date(2014, 8, 2, 11, 55, 0));
     * //=> Wed Jan 01 2014 00:00:00
     */
    startOfYear,
} from 'date-fns/fp';

export {
    /**
     * @category Date
     * @summary Is the given date in the future?
     *
     * @description
     * Is the given date in the future?
     *
     * @param {Date|external:number} date
     * @returns {boolean} Whether or not the given date is in the future.
     * @example
     * // If today is 6 October 2014, is 31 December 2014 in the future?
     * const result = isFuture( new Date( 2014, 11, 31 ) );
     * //=> true
     */
    isFuture,
    /**
     * @category Date
     * @summary Is the given date in the past?
     *
     * @param {Date|external:number} date
     * @returns {boolean} Whether or not the given date is in the past.
     * @example
     * // If today is 6 October 2014, is 2 July 2014 in the past?
     * const result = isPast( new Date( 2014, 6, 2 ) );
     * //=> true
     */
    isPast,
} from 'date-fns';

export {
    /**
     * @category Date
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 8     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 8     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Su            | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | AM, PM                          | a..aaa  | AM, PM                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, ..., 23                     |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 1, 2, ..., 11, 0                  |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 0001, ..., 999               |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | PDT, EST, CEST                    | 6     |
     * |                                 | zzzz    | Pacific Daylight Time             | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 05/29/1453                        | 7     |
     * |                                 | PP      | May 29, 1453                      | 7     |
     * |                                 | PPP     | May 29th, 1453                    | 7     |
     * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
     * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
     * | Notes:
     * | 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     * |    are the same as "stand-alone" units, but are different in some languages.
     * |    "Formatting" units are declined according to the rules of the language
     * |    in the context of a date. "Stand-alone" units are always nominative singular:
     * |
     * |    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     * |
     * |    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     * |
     * | 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     * |    the single quote characters (see below).
     * |    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     * |    the output will be the same as default pattern for this unit, usually
     * |    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     * |    are marked with "2" in the last column of the table.
     * |
     * |    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     * |
     * |    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     * |
     * |    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     * |
     * |    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     * |
     * |    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     * |
     * | 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     * |    The output will be padded with zeros to match the length of the pattern.
     * |
     * |    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     * |
     * | 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     * |    These tokens represent the shortest form of the quarter.
     * |
     * | 5. The main difference between `y` and `u` patterns are B.C. years:
     * |
     * |    | Year | `y` | `u` |
     * |    |------|-----|-----|
     * |    | AC 1 |   1 |   1 |
     * |    | BC 1 |   1 |   0 |
     * |    | BC 2 |   2 |  -1 |
     * |
     * |    Also `yy` always returns the last two digits of a year,
     * |    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     * |
     * |    | Year | `yy` | `uu` |
     * |    |------|------|------|
     * |    | 1    |   01 |   01 |
     * |    | 14   |   14 |   14 |
     * |    | 376  |   76 |  376 |
     * |    | 1453 |   53 | 1453 |
     * |
     * |    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     * |    except local week-numbering years are dependent on `options.weekStartsOn`
     * |    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     * |    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     * |
     * | 6. Specific non-location timezones are created using the Intl browser API. The output is determined by the
     * |    preferred standard of the current locale (en-US by default) which may not always give the expected result.
     * |    For this reason it is recommended to supply a `locale` in the format options when formatting a time zone name.
     * |
     * | 7. These patterns are not in the Unicode Technical Standard #35:
     * |    - `i`: ISO day of week
     * |    - `I`: ISO week of year
     * |    - `R`: ISO week-numbering year
     * |    - `t`: seconds timestamp
     * |    - `T`: milliseconds timestamp
     * |    - `o`: ordinal number modifier
     * |    - `P`: long localized date
     * |    - `p`: long localized time
     * |
     * | 8. These tokens are often confused with others. See: https://git.io/fxCyr
     * @param {Date|external:string|external:number} date - the original date
     * @param {string} format - the string of tokens
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {boolean} [options.awareOfUnicodeTokens=false] - if true, allows usage of Unicode tokens causes confusion:
     * |   - Some of the day of year tokens (`D`, `DD`) that are confused with the day of month tokens (`d`, `dd`).
     * |   - Some of the local week-numbering year tokens (`YY`, `YYYY`) that are confused with the calendar year tokens
     * |   (`yy`, `yyyy`). See: https://git.io/fxCyr
     * @param {string} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
     * @returns {string} the formatted date string
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * const result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * const result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     * @example
     * // Escape string by single quote characters:
     * const result = format(new Date(2014, 6, 2, 15), "h 'o'''clock'")
     * //=> "3 o'clock"
     * @see {@link https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table}
     */
    format,

    /**
     * @category Date
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given value to an instance of Date.
     *
     * If the value is an instance of Date, the function returns its clone.
     *
     * If the value is a number, it is treated as a timestamp.
     *
     * If an value is a string, the function tries to parse it.
     * Function accepts complete ISO 8601 formats as well as partial implementations.
     * ISO 8601: http://en.wikipedia.org/wiki/ISO_8601
     * If the function cannot parse the string or the values are invalid, it returns Invalid Date.
     *
     * If the value is none of the above, the function returns Invalid Date.
     * @param {Date|external:string|external:number} value the value to convert
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - the additional number of digits in the extended year format
     * @param {string} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
     * @returns {Date} the parsed date in the local time zone
     * @example
     * // Convert string '2014-02-11T11:30:30' to date:
     * const result = toDate('2014-02-11T11:30:30')
     * //=> Tue Feb 11 2014 11:30:30
     * @example
     * // Convert string '+02014101' to date,
     * // if the additional number of digits in the extended year format is 1:
     * const result = toDate('+02014101', {additionalDigits: 1})
     * //=> Fri Apr 11 2014 00:00:00
     * @see {@link http://en.wikipedia.org/wiki/ISO_8601}
     */
    toDate,

    /**
     * @function: module:util.utcToZonedTime
     * @category Date
     * @summary Get a date/time representing local time in a given time zone from the UTC date
     *
     * @description
     * Returns a date instance with values representing the local time in the time zone
     * specified of the UTC time from the date provided. In other words, when the new date
     * is formatted it will show the equivalent hours in the target time zone regardless
     * of the current system time zone.
     *
     * @param {Date|exteral:string|external:number} date - the date with the relevant UTC time
     * @param {string} timeZone - the time zone to get local time for, can be an offset or IANA time zone
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Date} the new date with the equivalent time in the time zone
     * @example
     * // In June 10am UTC is 6am in New York (-04:00)
     * const result = utcToZonedTime('2014-06-25T10:00:00.000Z', 'America/New_York')
     * //=> Jun 25 2014 06:00:00
     */
    toZonedTime as utcToZonedTime,
} from 'date-fns-tz/fp';

export {
    /**
     * @category Date
     * @summary Get the UTC date/time from a date representing local time in a given time zone
     *
     * @description
     * Returns a date instance with the UTC time of the provided date of which the values
     * represented the local time in the time zone specified. In other words, if the input
     * date represented local time in time time zone, the timestamp of the output date will
     * give the equivalent UTC of that local time regardless of the current system time zone.
     *
     * @param {Date|external:string|external:number} date - the date with values representing the local time
     * @param {string} timeZone - the time zone of this local time, can be an offset or IANA time zone
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {Date} the new date with the equivalent time in the time zone
     * @example
     * // In June 10am in Los Angeles is 5pm UTC
     * const result = zonedTimeToUTC(new Date(2014, 5, 25, 10, 0, 0), 'America/Los_Angeles')
     * //=> 2014-06-25T17:00:00.000Z
     */
    fromZonedTime as zonedTimeToUTC,
} from 'date-fns-tz/fp';
