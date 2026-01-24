/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://date-fns.org/}
 */

export {
    /**
     * Add the specified number of days to the given date.
     *
     * @function module:util.addDays
     * @category Date
     * @param {external:number} amount The amount of days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the days added.
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
     * @function module:util.addBusinessDays
     * @category Date
     * @param {external:number} amount The amount of business days to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the business days added.
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
     * @function module:util.addHours
     * @category Date
     * @param {external:number} amount The amount of hours to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the hours added.
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
     * @function module:util.addISOWeekYears
     * @category Date
     * @param {external:number} amount The amount of ISO week-numbering years to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the ISO week-numbering years added.
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
     * @function module:util.addMilliseconds
     * @category Date
     * @param {external:number} amount The amount of milliseconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the milliseconds added.
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
     * @function module:util.addMinutes
     * @category Date
     * @param {external:number} amount The amount of minutes to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the minutes added.
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
     * @function module:util.addMonths
     * @category Date
     * @param {external:number} amount The amount of months to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the months added.
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
     * @function module:util.addQuarters
     * @category Date
     * @param {external:number} amount The amount of quarters to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the quarters added.
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
     * @function module:util.addSeconds
     * @category Date
     * @param {external:number} amount The amount of seconds to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the seconds added.
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
     * @function module:util.addWeeks
     * @category Date
     * @param {external:number} amount The amount of weeks to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the weeks added.
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
     * @function module:util.addYears
     * @category Date
     * @param {external:number} amount The amount of years to be added. Positive decimals will be rounded using `Math.floor`, decimals less than zero will be rounded using `Math.ceil`.
     * @param {external:Date|external:number} date The date to be changed.
     * @return {external:Date} The new date with the years added.
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
     * Like {@linkcode module:util.differenceInCalendarDays|differenceInCalendarDays}, the function removes the times from the dates before calculating the difference.
     *
     * @function module:util.differenceInBusinessDays
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of business days.
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
     * @function module:util.differenceInCalendarDays
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar days.
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
     * @function module:util.differenceInCalendarISOWeekYears
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar ISO week-numbering years.
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
     * @function module:util.differenceInCalendarISOWeeks
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar ISO weeks.
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
     * @function module:util.differenceInCalendarMonths
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar months.
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
     * @function module:util.differenceInCalendarQuarters
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar quarters.
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
     * @function module:util.differenceInCalendarWeeks
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar weeks.
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
     * @function module:util.differenceInCalendarYears
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar years.
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
     * @function module:util.differenceInDays
     * @category Date
     * @param {external:Date|external:number} start The earlier date.
     * @param {external:Date|external:number} end The later date.
     * @returns {external:number} The number of calendar years.
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

export { differenceInHours } from 'date-fns/fp';

export { differenceInISOWeekYears } from 'date-fns/fp';

export { differenceInMilliseconds } from 'date-fns/fp';

export { differenceInMinutes } from 'date-fns/fp';

export { differenceInMonths } from 'date-fns/fp';

export { differenceInQuarters } from 'date-fns/fp';

export { differenceInSeconds } from 'date-fns/fp';

export { differenceInWeeks } from 'date-fns/fp';

export { differenceInYears } from 'date-fns/fp';

export { eachDayOfInterval } from 'date-fns/fp';

export { eachHourOfInterval } from 'date-fns/fp';

export { eachMonthOfInterval } from 'date-fns/fp';

export { eachQuarterOfInterval } from 'date-fns/fp';

export { eachWeekOfInterval } from 'date-fns/fp';

export { eachWeekendOfInterval } from 'date-fns/fp';

export { eachWeekendOfMonth } from 'date-fns/fp';

export { eachWeekendOfYear } from 'date-fns/fp';

export { eachYearOfInterval } from 'date-fns/fp';

export { endOfDay } from 'date-fns/fp';

export { endOfDecade } from 'date-fns/fp';

export { endOfHour } from 'date-fns/fp';

export { endOfISOWeek } from 'date-fns/fp';

export { endOfISOWeekYear } from 'date-fns/fp';

export { endOfMinute } from 'date-fns/fp';

export { endOfMonth } from 'date-fns/fp';

export { endOfQuarter } from 'date-fns/fp';

export { endOfSecond } from 'date-fns/fp';

export { endOfWeek } from 'date-fns/fp';

export { endOfYear } from 'date-fns/fp';

export {
    formatDistance,
    formatDuration,
    getDate,
    getDay,
    getDayOfYear,
    getDaysInMonth,
    getDaysInYear,
    getDecade,
    getHours,
    getISODay,
    getISOWeek,
    getISOWeekYear,
    getISOWeeksInYear,
    getMilliseconds,
    getMinutes,
    getMonth,
    getOverlappingDaysInIntervals,
    getQuarter,
    getSeconds,
    getTime,
    getUnixTime,
    getWeek,
    getWeekOfMonth,
    getWeekYear,
    getWeeksInMonth,
    getYear,
    isAfter,
    isBefore,
    set,
    setDate,
    setDay,
    setDayOfYear,
    setHours,
    setISODay,
    setISOWeek,
    setISOWeekYear,
    setMilliseconds,
    setMinutes,
    setMonth,
    setQuarter,
    setSeconds,
    setWeek,
    setWeekYear,
    setYear,
    startOfDay,
    startOfDecade,
    startOfHour,
    startOfISOWeek,
    startOfISOWeekYear,
    startOfMinute,
    startOfMonth,
    startOfQuarter,
    startOfSecond,
    startOfWeek,
    startOfWeekYear,
    startOfYear,
} from 'date-fns/fp';

export {
    /**
     * @function module:util.isFuture
     * @category Date
     * @summary Is the given date in the future?
     *
     * @description
     * Is the given date in the future?
     *
     * @param {external:Date|external:number} date
     * @returns {external:boolean} Whether or not the given date is in the future.
     * @example
     * // If today is 6 October 2014, is 31 December 2014 in the future?
     * const result = isFuture( new Date( 2014, 11, 31 ) );
     * //=> true
     */
    isFuture,
    /**
     * @function module:util.isPast
     * @category Date
     * @summary Is the given date in the past?
     *
     * @param {external:Date|external:number} date
     * @returns {external:boolean} Whether or not the given date is in the past.
     * @example
     * // If today is 6 October 2014, is 2 July 2014 in the past?
     * const result = isPast( new Date( 2014, 6, 2 ) );
     * //=> true
     */
    isPast,
} from 'date-fns';

export {
    /**
     * @function module:util.format
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
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
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
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are created using the Intl browser API. The output is determined by the
     *    preferred standard of the current locale (en-US by default) which may not always give the expected result.
     *    For this reason it is recommended to supply a `locale` in the format options when formatting a time zone name.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. These tokens are often confused with others. See: https://git.io/fxCyr
     * @param {external:Date|external:string|external:number} date - the original date
     * @param {external:string} format - the string of tokens
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {external:number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {external:boolean} [options.awareOfUnicodeTokens=false] - if true, allows usage of Unicode tokens causes confusion:
     *   - Some of the day of year tokens (`D`, `DD`) that are confused with the day of month tokens (`d`, `dd`).
     *   - Some of the local week-numbering year tokens (`YY`, `YYYY`) that are confused with the calendar year tokens
     *   (`yy`, `yyyy`). See: https://git.io/fxCyr
     * @param {external:string} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
     * @returns {external:string} the formatted date string
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
     * const result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     * @see {@link https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table}
     */
    format,

    /**
     * @function module:util.toDate
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
     * @param {external:Date|external:string|external:number} value the value to convert
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - the additional number of digits in the extended year format
     * @param {external:string} [options.timeZone=''] - used to specify the IANA time zone offset of a date String.
     * @returns {external:Date} the parsed date in the local time zone
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
     * @param {external:Date|exteral:string|external:number} date - the date with the relevant UTC time
     * @param {external:string} timeZone - the time zone to get local time for, can be an offset or IANA time zone
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {external:Date} the new date with the equivalent time in the time zone
     * @example
     * // In June 10am UTC is 6am in New York (-04:00)
     * const result = utcToZonedTime('2014-06-25T10:00:00.000Z', 'America/New_York')
     * //=> Jun 25 2014 06:00:00
     */
    utcToZonedTime,
    /**
     * @function module:util.zonedTimeToUTC
     * @category Date
     * @summary Get the UTC date/time from a date representing local time in a given time zone
     *
     * @description
     * Returns a date instance with the UTC time of the provided date of which the values
     * represented the local time in the time zone specified. In other words, if the input
     * date represented local time in time time zone, the timestamp of the output date will
     * give the equivalent UTC of that local time regardless of the current system time zone.
     *
     * @param {external:Date|external:string|external:number} date - the date with values representing the local time
     * @param {external:string} timeZone - the time zone of this local time, can be an offset or IANA time zone
     * @param {OptionsWithTZ} [options] - the object with options. See [Options]{@link https://date-fns.org/docs/Options}
     * @param {0|1|2} [options.additionalDigits=2] - passed to `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * @returns {external:Date} the new date with the equivalent time in the time zone
     * @example
     * // In June 10am in Los Angeles is 5pm UTC
     * const result = zonedTimeToUTC(new Date(2014, 5, 25, 10, 0, 0), 'America/Los_Angeles')
     * //=> 2014-06-25T17:00:00.000Z
     */
    zonedTimeToUtc as zonedTimeToUTC,
} from 'date-fns-tz/fp';
