//! moment.js

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks () {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback (callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return (Object.getOwnPropertyNames(obj).length === 0);
        } else {
            var k;
            for (k in obj) {
                if (obj.hasOwnProperty(k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }

    function isDate(input) {
        return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty           : false,
            unusedTokens    : [],
            unusedInput     : [],
            overflow        : -2,
            charsLeftOver   : 0,
            nullInput       : false,
            invalidMonth    : null,
            invalidFormat   : false,
            userInvalidated : false,
            iso             : false,
            parsedDateParts : [],
            meridiem        : null,
            rfc2822         : false,
            weekdayMismatch : false
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this);
            var len = t.length >>> 0;

            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m);
            var parsedParts = some.call(flags.parsedDateParts, function (i) {
                return i != null;
            });
            var isNowValid = !isNaN(m._d.getTime()) &&
                flags.overflow < 0 &&
                !flags.empty &&
                !flags.invalidMonth &&
                !flags.invalidWeekday &&
                !flags.weekdayMismatch &&
                !flags.nullInput &&
                !flags.invalidFormat &&
                !flags.userInvalidated &&
                (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid = isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            }
            else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid (flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        }
        else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    var updateInProgress = false;

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment (obj) {
        return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }

    function absFloor (number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function warn(msg) {
        if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !==  'undefined') && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [];
                var arg;
                for (var i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (var key in arguments[0]) {
                            arg += key + ': ' + arguments[0][key] + ', ';
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }

    function set (config) {
        var prop, i;
        for (i in config) {
            prop = config[i];
            if (isFunction(prop)) {
                this[i] = prop;
            } else {
                this['_' + i] = prop;
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig), prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i, res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        nextWeek : 'dddd [at] LT',
        lastDay : '[Yesterday at] LT',
        lastWeek : '[Last] dddd [at] LT',
        sameElse : 'L'
    };

    function calendar (key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    var defaultLongDateFormat = {
        LTS  : 'h:mm:ss A',
        LT   : 'h:mm A',
        L    : 'MM/DD/YYYY',
        LL   : 'MMMM D, YYYY',
        LLL  : 'MMMM D, YYYY h:mm A',
        LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };

    function longDateFormat (key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
            return val.slice(1);
        });

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate () {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal (number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future : 'in %s',
        past   : '%s ago',
        s  : 'a few seconds',
        ss : '%d seconds',
        m  : 'a minute',
        mm : '%d minutes',
        h  : 'an hour',
        hh : '%d hours',
        d  : 'a day',
        dd : '%d days',
        M  : 'a month',
        MM : '%d months',
        y  : 'a year',
        yy : '%d years'
    };

    function relativeTime (number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return (isFunction(output)) ?
            output(number, withoutSuffix, string, isFuture) :
            output.replace(/%d/i, number);
    }

    function pastFuture (diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias (unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [];
        for (var u in unitsObj) {
            units.push({unit: u, priority: priorities[u]});
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

    var formatFunctions = {};

    var formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(func.apply(this, arguments), token);
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '', i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999

    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf

    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

    // any word (or two) characters or numbers including two/three word month in arabic.
    // includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;

    var regexes = {};

    function addRegexToken (token, regex, strictRegex) {
        regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
            return (isStrict && strictRegex) ? strictRegex : regex;
        };
    }

    function getParseRegexForToken (token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        }));
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken (token, callback) {
        var i, func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken (token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? '' + y : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear () {
        return isLeapYear(this.year());
    }

    function makeGetSet (unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get (mom, unit) {
        return mom.isValid() ?
            mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }

    function set$1 (mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
            }
            else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet (units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }


    function stringSet (units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units);
            for (var i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
        if (!m) {
            return isArray(this._months) ? this._months :
                this._months['standalone'];
        }
        return isArray(this._months) ? this._months[m.month()] :
            this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }

    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
        if (!m) {
            return isArray(this._monthsShort) ? this._monthsShort :
                this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
            this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i, ii, mom, llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse (monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
            }
            if (!strict && !this._monthsParse[i]) {
                regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                return i;
            } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth (mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth (value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth () {
        return daysInMonth(this.year(), this.month());
    }

    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict ?
                this._monthsShortStrictRegex : this._monthsShortRegex;
        }
    }

    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict ?
                this._monthsStrictRegex : this._monthsRegex;
        }
    }

    function computeMonthsParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

    function createDate (y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate (y) {
        var date;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            var args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear, resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek, resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek (mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow : 0, // Sunday is the first day of the week.
        doy : 6  // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek () {
        return this._week.dow;
    }

    function localeFirstDayOfYear () {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek (input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek (input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays (ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
        var weekdays = isArray(this._weekdays) ? this._weekdays :
            this._weekdays[(m && m !== true && this._weekdays.isFormat.test(format)) ? 'format' : 'standalone'];
        return (m === true) ? shiftWeekdays(weekdays, this._week.dow)
            : (m) ? weekdays[m.day()] : weekdays;
    }

    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }

    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
        return (m === true) ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse (weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\\.?') + '$', 'i');
                this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$', 'i');
                this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$', 'i');
            }
            if (!this._weekdaysParse[i]) {
                regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek (input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict ?
                this._weekdaysStrictRegex : this._weekdaysRegex;
        }
    }

    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict ?
                this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
        }
    }

    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict ?
                this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
        }
    }


    function computeWeekdaysParse () {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
            i, mom, minp, shortp, longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = this.weekdaysMin(mom, '');
            shortp = this.weekdaysShort(mom, '');
            longp = this.weekdays(mom, '');
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 7; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
        this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2);
    });

    function meridiem (token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem (isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4;
        var pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM (input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return ((input + '').toLowerCase().charAt(0) === 'p');
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }


    // MOMENTS

    // Setting the hour should keep the time, because the user explicitly
    // specified which hour they want. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    var getSetHour = makeGetSet('Hours', true);

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse
    };

    // internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null;
        // TODO: Find a better way to register and load all the locales in Node
        if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
            try {
                oldLocale = globalLocale._abbr;
                var aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {}
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale (key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            }
            else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            }
            else {
                if ((typeof console !==  'undefined') && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn('Locale ' + key +  ' not found. Did you forget to load it?');
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale (name, config) {
        if (config !== null) {
            var locale, parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);


            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale, tmpLocale, parentConfig = baseConfig;
            // MERGE
            tmpLocale = loadLocale(name);
            if (tmpLocale != null) {
                parentConfig = tmpLocale._config;
            }
            config = mergeConfigs(parentConfig, config);
            locale = new Locale(config);
            locale.parentLocale = locales[name];
            locales[name] = locale;

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow (m) {
        var overflow;
        var a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
                a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
        var i, date, input = [], currentDate, expectedWeekday, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
        expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            var curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

    var isoDates = [
        ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
        ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
        ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
        ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
        ['YYYY-DDD', /\d{4}-\d{3}/],
        ['YYYY-MM', /\d{4}-\d\d/, false],
        ['YYYYYYMMDD', /[+-]\d{10}/],
        ['YYYYMMDD', /\d{8}/],
        // YYYYMM is NOT allowed by the standard
        ['GGGG[W]WWE', /\d{4}W\d{3}/],
        ['GGGG[W]WW', /\d{4}W\d{2}/, false],
        ['YYYYDDD', /\d{7}/]
    ];

    // iso time formats and regexes
    var isoTimes = [
        ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
        ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
        ['HH:mm:ss', /\d\d:\d\d:\d\d/],
        ['HH:mm', /\d\d:\d\d/],
        ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
        ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
        ['HHmmss', /\d\d\d\d\d\d/],
        ['HHmm', /\d\d\d\d/],
        ['HH', /\d\d/]
    ];

    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

    // date from iso format
    function configFromISO(config) {
        var i, l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime, dateFormat, timeFormat, tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

    function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10)
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    var obsOffsets = {
        UT: 0,
        GMT: 0,
        EDT: -4 * 60,
        EST: -5 * 60,
        CDT: -5 * 60,
        CST: -6 * 60,
        MDT: -6 * 60,
        MST: -7 * 60,
        PDT: -7 * 60,
        PST: -8 * 60
    };

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10);
            var m = hm % 100, h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i));
        if (match) {
            var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);

        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        // Final attempt, use Input Fallback
        hooks.createFromInputFallback(config);
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
        'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
        'discouraged and will be removed in an upcoming major release. Please refer to ' +
        'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            // console.log('token', token, 'parsedInput', parsedInput,
            //         'regex', getParseRegexForToken(token, config));
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                }
                else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

        configFromArray(config);
        checkOverflow(config);
    }


    function meridiemFixWrap (locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i);
        config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
            return obj && parseInt(obj, 10);
        });

        configFromArray(config);
    }

    function createFromConfig (config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig (config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        }  else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC (input, format, locale, strict, isUTC) {
        var c = {};

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal (input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
        'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other < this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    var prototypeMax = deprecate(
        'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
        function () {
            var other = createLocal.apply(null, arguments);
            if (this.isValid() && other.isValid()) {
                return other > this ? this : other;
            } else {
                return createInvalid();
            }
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +(new Date());
    };

    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

    function isDurationValid(m) {
        for (var key in m) {
            if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                return false;
            }
        }

        var unitHasDecimal = false;
        for (var i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration (duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration (obj) {
        return obj instanceof Duration;
    }

    function absRound (number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // FORMATTING

    function offset (token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset();
            var sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher);

        if (matches === null) {
            return null;
        }

        var chunk   = matches[matches.length - 1] || [];
        var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        var minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ?
          0 :
          parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset (m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone (input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC (keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal (keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset () {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            }
            else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset (input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime () {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted () {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {};

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted = this.isValid() &&
                compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal () {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset () {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc () {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

    // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
    // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
    // and further modified to allow for strings containing both week and day
    var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms : input._milliseconds,
                d  : input._days,
                M  : input._months
            };
        } else if (isNumber(input)) {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y  : 0,
                d  : toInt(match[DATE])                         * sign,
                h  : toInt(match[HOUR])                         * sign,
                m  : toInt(match[MINUTE])                       * sign,
                s  : toInt(match[SECOND])                       * sign,
                ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
            };
        } else if (!!(match = isoRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y : parseIso(match[2], sign),
                M : parseIso(match[3], sign),
                w : parseIso(match[4], sign),
                d : parseIso(match[5], sign),
                h : parseIso(match[6], sign),
                m : parseIso(match[7], sign),
                s : parseIso(match[8], sign)
            };
        } else if (duration == null) {// checks for null or undefined
            duration = {};
        } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso (inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return {milliseconds: 0, months: 0};
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract (mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }

    function calendar$1 (time, formats) {
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse';

        var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

        return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }

    function clone () {
        return new Moment(this);
    }

    function isAfter (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween (from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (inclusivity[0] === '(' ? this.isAfter(localFrom, units) : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')' ? this.isBefore(localTo, units) : !this.isAfter(localTo, units));
    }

    function isSame (input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
        }
    }

    function isSameOrAfter (input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore (input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff (input, units, asFloat) {
        var that,
            zoneDelta,
            output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year': output = monthDiff(this, that) / 12; break;
            case 'month': output = monthDiff(this, that); break;
            case 'quarter': output = monthDiff(this, that) / 3; break;
            case 'second': output = (this - that) / 1e3; break; // 1000
            case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
            case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
            case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
            case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default: output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff (a, b) {
        // difference in months
        var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2, adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString () {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true;
        var m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000).toISOString().replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment';
        var zone = '';
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        var prefix = '[' + func + '("]';
        var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
        var datetime = '-MM-DD[T]HH:mm:ss.SSS';
        var suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format (inputString) {
        if (!inputString) {
            inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow (withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to (time, withoutSuffix) {
        if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                 createLocal(time).isValid())) {
            return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow (withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale (key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData () {
        return this._locale;
    }

    var MS_PER_SECOND = 1000;
    var MS_PER_MINUTE = 60 * MS_PER_SECOND;
    var MS_PER_HOUR = 60 * MS_PER_MINUTE;
    var MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return (dividend % divisor + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3, 1);
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday());
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR);
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf (units) {
        var time;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        var startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time = startOfDate(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time = startOfDate(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
                break;
            case 'isoWeek':
                time = startOfDate(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time += MS_PER_HOUR - mod$1(time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE), MS_PER_HOUR) - 1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf () {
        return this._d.valueOf() - ((this._offset || 0) * 60000);
    }

    function unix () {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate () {
        return new Date(this.valueOf());
    }

    function toArray () {
        var m = this;
        return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }

    function toObject () {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds()
        };
    }

    function toJSON () {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2 () {
        return isValid(this);
    }

    function parsingFlags () {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt () {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict
        };
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken (token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


    // PARSING

    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
    }

    function getSetISOWeekYear (input) {
        return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }

    function getISOWeeksInYear () {
        return weeksInYear(this.year(), 1, 4);
    }

    function getWeeksInYear () {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter (input) {
        return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict ?
          (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
          locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear (input) {
        var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
        return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });


    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);

    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }
    // MOMENTS

    var getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr () {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName () {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

    function createUnix (input) {
        return createLocal(input * 1000);
    }

    function createInZone () {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat (string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;

    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1 (format, index, field, setter) {
        var locale = getLocale();
        var utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl (format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i;
        var out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0;

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        var i;
        var out = [];
        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths (format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort (format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin (localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    // Side effect imports

    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

    var mathAbs = Math.abs;

    function abs () {
        var data           = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days         = mathAbs(this._days);
        this._months       = mathAbs(this._months);

        data.milliseconds  = mathAbs(data.milliseconds);
        data.seconds       = mathAbs(data.seconds);
        data.minutes       = mathAbs(data.minutes);
        data.hours         = mathAbs(data.hours);
        data.months        = mathAbs(data.months);
        data.years         = mathAbs(data.years);

        return this;
    }

    function addSubtract$1 (duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days         += direction * other._days;
        duration._months       += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil (number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble () {
        var milliseconds = this._milliseconds;
        var days         = this._days;
        var months       = this._months;
        var data         = this._data;
        var seconds, minutes, hours, years, monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds           = absFloor(milliseconds / 1000);
        data.seconds      = seconds % 60;

        minutes           = absFloor(seconds / 60);
        data.minutes      = minutes % 60;

        hours             = absFloor(minutes / 60);
        data.hours        = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days   = days;
        data.months = months;
        data.years  = years;

        return this;
    }

    function daysToMonths (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return days * 4800 / 146097;
    }

    function monthsToDays (months) {
        // the reverse of daysToMonths
        return months * 146097 / 4800;
    }

    function as (units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days;
        var months;
        var milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':   return months;
                case 'quarter': return months / 3;
                case 'year':    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week'   : return days / 7     + milliseconds / 6048e5;
                case 'day'    : return days         + milliseconds / 864e5;
                case 'hour'   : return days * 24    + milliseconds / 36e5;
                case 'minute' : return days * 1440  + milliseconds / 6e4;
                case 'second' : return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                default: throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1 () {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs (alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asQuarters     = makeAs('Q');
    var asYears        = makeAs('y');

    function clone$1 () {
        return createDuration(this);
    }

    function get$2 (units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');

    function weeks () {
        return absFloor(this.days() / 7);
    }

    var round = Math.round;
    var thresholds = {
        ss: 44,         // a few seconds to seconds
        s : 45,         // seconds to minute
        m : 45,         // minutes to hour
        h : 22,         // hours to day
        d : 26,         // days to month
        M : 11          // months to year
    };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
        var duration = createDuration(posNegDuration).abs();
        var seconds  = round(duration.as('s'));
        var minutes  = round(duration.as('m'));
        var hours    = round(duration.as('h'));
        var days     = round(duration.as('d'));
        var months   = round(duration.as('M'));
        var years    = round(duration.as('y'));

        var a = seconds <= thresholds.ss && ['s', seconds]  ||
                seconds < thresholds.s   && ['ss', seconds] ||
                minutes <= 1             && ['m']           ||
                minutes < thresholds.m   && ['mm', minutes] ||
                hours   <= 1             && ['h']           ||
                hours   < thresholds.h   && ['hh', hours]   ||
                days    <= 1             && ['d']           ||
                days    < thresholds.d   && ['dd', days]    ||
                months  <= 1             && ['M']           ||
                months  < thresholds.M   && ['MM', months]  ||
                years   <= 1             && ['y']           || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof(roundingFunction) === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize (withSuffix) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var locale = this.localeData();
        var output = relativeTime$1(this, !withSuffix, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return ((x > 0) - (x < 0)) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000;
        var days         = abs$1(this._days);
        var months       = abs$1(this._months);
        var minutes, hours, years;

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes           = absFloor(seconds / 60);
        hours             = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years  = absFloor(months / 12);
        months %= 12;


        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        var Y = years;
        var M = months;
        var D = days;
        var h = hours;
        var m = minutes;
        var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
        var total = this.asSeconds();

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        var totalSign = total < 0 ? '-' : '';
        var ymSign = sign(this._months) !== sign(total) ? '-' : '';
        var daysSign = sign(this._days) !== sign(total) ? '-' : '';
        var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return totalSign + 'P' +
            (Y ? ymSign + Y + 'Y' : '') +
            (M ? ymSign + M + 'M' : '') +
            (D ? daysSign + D + 'D' : '') +
            ((h || m || s) ? 'T' : '') +
            (h ? hmsSign + h + 'H' : '') +
            (m ? hmsSign + m + 'M' : '') +
            (s ? hmsSign + s + 'S' : '');
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asQuarters     = asQuarters;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.clone          = clone$1;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

    // Side effect imports

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    // Side effect imports


    hooks.version = '2.24.0';

    setHookCallback(createLocal);

    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding  = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD',                             // <input type="date" />
        TIME: 'HH:mm',                                  // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW',                             // <input type="week" />
        MONTH: 'YYYY-MM'                                // <input type="month" />
    };

    return hooks;

})));


/*!
FullCalendar Core Package v4.2.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):(e=e||self,t(e.FullCalendar={}))}(this,function(e){"use strict";function t(e,t,n){var r=document.createElement(e);if(t)for(var i in t)"style"===i?g(r,t[i]):pi[i]?r[i]=t[i]:r.setAttribute(i,t[i]);return"string"==typeof n?r.innerHTML=n:null!=n&&a(r,n),r}function n(e){e=e.trim();var t=document.createElement(o(e));return t.innerHTML=e,t.firstChild}function r(e){return Array.prototype.slice.call(i(e))}function i(e){e=e.trim();var t=document.createElement(o(e));return t.innerHTML=e,t.childNodes}function o(e){return hi[e.substr(0,3)]||"div"}function a(e,t){for(var n=l(t),r=0;r<n.length;r++)e.appendChild(n[r])}function s(e,t){for(var n=l(t),r=e.firstChild||null,i=0;i<n.length;i++)e.insertBefore(n[i],r)}function u(e,t){for(var n=l(t),r=e.nextSibling||null,i=0;i<n.length;i++)e.parentNode.insertBefore(n[i],r)}function l(e){return"string"==typeof e?r(e):e instanceof Node?[e]:Array.prototype.slice.call(e)}function c(e){e.parentNode&&e.parentNode.removeChild(e)}function d(e,t){return gi.call(e,t)}function f(e,t){return vi.call(e,t)}function p(e,t){for(var n=e instanceof HTMLElement?[e]:e,r=[],i=0;i<n.length;i++)for(var o=n[i].querySelectorAll(t),a=0;a<o.length;a++)r.push(o[a]);return r}function h(e,t){for(var n=e instanceof HTMLElement?[e]:e,r=[],i=0;i<n.length;i++)for(var o=n[i].children,a=0;a<o.length;a++){var s=o[a];t&&!f(s,t)||r.push(s)}return r}function v(e,t,n){n?e.classList.add(t):e.classList.remove(t)}function g(e,t){for(var n in t)y(e,n,t[n])}function y(e,t,n){null==n?e.style[t]="":"number"==typeof n&&yi.test(t)?e.style[t]=n+"px":e.style[t]=n}function m(e,t){return e.left>=t.left&&e.left<t.right&&e.top>=t.top&&e.top<t.bottom}function E(e,t){var n={left:Math.max(e.left,t.left),right:Math.min(e.right,t.right),top:Math.max(e.top,t.top),bottom:Math.min(e.bottom,t.bottom)};return n.left<n.right&&n.top<n.bottom&&n}function S(e,t,n){return{left:e.left+t,right:e.right+t,top:e.top+n,bottom:e.bottom+n}}function b(e,t){return{left:Math.min(Math.max(e.left,t.left),t.right),top:Math.min(Math.max(e.top,t.top),t.bottom)}}function T(e){return{left:(e.left+e.right)/2,top:(e.top+e.bottom)/2}}function D(e,t){return{left:e.left-t.left,top:e.top-t.top}}function w(){return null===mi&&(mi=R()),mi}function R(){var e=t("div",{style:{position:"absolute",top:-1e3,left:0,border:0,padding:0,overflow:"scroll",direction:"rtl"}},"<div></div>");document.body.appendChild(e);var n=e.firstChild,r=n.getBoundingClientRect().left>e.getBoundingClientRect().left;return c(e),r}function I(e){return e=Math.max(0,e),e=Math.round(e)}function C(e,t){void 0===t&&(t=!1);var n=window.getComputedStyle(e),r=parseInt(n.borderLeftWidth,10)||0,i=parseInt(n.borderRightWidth,10)||0,o=parseInt(n.borderTopWidth,10)||0,a=parseInt(n.borderBottomWidth,10)||0,s=I(e.offsetWidth-e.clientWidth-r-i),u=I(e.offsetHeight-e.clientHeight-o-a),l={borderLeft:r,borderRight:i,borderTop:o,borderBottom:a,scrollbarBottom:u,scrollbarLeft:0,scrollbarRight:0};return w()&&"rtl"===n.direction?l.scrollbarLeft=s:l.scrollbarRight=s,t&&(l.paddingLeft=parseInt(n.paddingLeft,10)||0,l.paddingRight=parseInt(n.paddingRight,10)||0,l.paddingTop=parseInt(n.paddingTop,10)||0,l.paddingBottom=parseInt(n.paddingBottom,10)||0),l}function M(e,t){void 0===t&&(t=!1);var n=k(e),r=C(e,t),i={left:n.left+r.borderLeft+r.scrollbarLeft,right:n.right-r.borderRight-r.scrollbarRight,top:n.top+r.borderTop,bottom:n.bottom-r.borderBottom-r.scrollbarBottom};return t&&(i.left+=r.paddingLeft,i.right-=r.paddingRight,i.top+=r.paddingTop,i.bottom-=r.paddingBottom),i}function k(e){var t=e.getBoundingClientRect();return{left:t.left+window.pageXOffset,top:t.top+window.pageYOffset,right:t.right+window.pageXOffset,bottom:t.bottom+window.pageYOffset}}function O(){return{left:window.pageXOffset,right:window.pageXOffset+document.documentElement.clientWidth,top:window.pageYOffset,bottom:window.pageYOffset+document.documentElement.clientHeight}}function _(e){var t=window.getComputedStyle(e);return e.getBoundingClientRect().height+parseInt(t.marginTop,10)+parseInt(t.marginBottom,10)}function P(e){for(var t=[];e instanceof HTMLElement;){var n=window.getComputedStyle(e);if("fixed"===n.position)break;/(auto|scroll)/.test(n.overflow+n.overflowY+n.overflowX)&&t.push(e),e=e.parentNode}return t}function x(e){return P(e).map(function(e){return M(e)}).concat(O()).reduce(function(e,t){return E(e,t)||t})}function H(e){e.preventDefault()}function N(e,t,n,r){function i(e){var t=d(e.target,n);t&&r.call(t,e,t)}return e.addEventListener(t,i),function(){e.removeEventListener(t,i)}}function z(e,t,n,r){var i;return N(e,"mouseover",t,function(e,t){if(t!==i){i=t,n(e,t);var o=function(e){i=null,r(e,t),t.removeEventListener("mouseleave",o)};t.addEventListener("mouseleave",o)}})}function U(e,t){var n=function(r){t(r),Ei.forEach(function(t){e.removeEventListener(t,n)})};Ei.forEach(function(t){e.addEventListener(t,n)})}function L(e,t){var n=ie(e);return n[2]+=7*t,oe(n)}function V(e,t){var n=ie(e);return n[2]+=t,oe(n)}function B(e,t){var n=ie(e);return n[6]+=t,oe(n)}function A(e,t){return F(e,t)/7}function F(e,t){return(t.valueOf()-e.valueOf())/864e5}function W(e,t){return(t.valueOf()-e.valueOf())/36e5}function Z(e,t){return(t.valueOf()-e.valueOf())/6e4}function j(e,t){return(t.valueOf()-e.valueOf())/1e3}function Y(e,t){var n=X(e),r=X(t);return{years:0,months:0,days:Math.round(F(n,r)),milliseconds:t.valueOf()-r.valueOf()-(e.valueOf()-n.valueOf())}}function q(e,t){var n=G(e,t);return null!==n&&n%7==0?n/7:null}function G(e,t){return se(e)===se(t)?Math.round(F(e,t)):null}function X(e){return oe([e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate()])}function J(e){return oe([e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours()])}function K(e){return oe([e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes()])}function Q(e){return oe([e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds()])}function $(e,t,n){var r=e.getUTCFullYear(),i=ee(e,r,t,n);if(i<1)return ee(e,r-1,t,n);var o=ee(e,r+1,t,n);return o>=1?Math.min(i,o):i}function ee(e,t,n,r){var i=oe([t,0,1+te(t,n,r)]),o=X(e),a=Math.round(F(i,o));return Math.floor(a/7)+1}function te(e,t,n){var r=7+t-n;return-(7+oe([e,0,r]).getUTCDay()-t)%7+r-1}function ne(e){return[e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()]}function re(e){return new Date(e[0],e[1]||0,null==e[2]?1:e[2],e[3]||0,e[4]||0,e[5]||0)}function ie(e){return[e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds(),e.getUTCMilliseconds()]}function oe(e){return 1===e.length&&(e=e.concat([0])),new Date(Date.UTC.apply(Date,e))}function ae(e){return!isNaN(e.valueOf())}function se(e){return 1e3*e.getUTCHours()*60*60+1e3*e.getUTCMinutes()*60+1e3*e.getUTCSeconds()+e.getUTCMilliseconds()}function ue(e,t){var n;return"string"==typeof e?le(e):"object"==typeof e&&e?ce(e):"number"==typeof e?ce((n={},n[t||"milliseconds"]=e,n)):null}function le(e){var t=Ti.exec(e);if(t){var n=t[1]?-1:1;return{years:0,months:0,days:n*(t[2]?parseInt(t[2],10):0),milliseconds:n*(60*(t[3]?parseInt(t[3],10):0)*60*1e3+60*(t[4]?parseInt(t[4],10):0)*1e3+1e3*(t[5]?parseInt(t[5],10):0)+(t[6]?parseInt(t[6],10):0))}}return null}function ce(e){return{years:e.years||e.year||0,months:e.months||e.month||0,days:(e.days||e.day||0)+7*de(e),milliseconds:60*(e.hours||e.hour||0)*60*1e3+60*(e.minutes||e.minute||0)*1e3+1e3*(e.seconds||e.second||0)+(e.milliseconds||e.millisecond||e.ms||0)}}function de(e){return e.weeks||e.week||0}function fe(e,t){return e.years===t.years&&e.months===t.months&&e.days===t.days&&e.milliseconds===t.milliseconds}function pe(e){return 0===e.years&&0===e.months&&1===e.days&&0===e.milliseconds}function he(e,t){return{years:e.years+t.years,months:e.months+t.months,days:e.days+t.days,milliseconds:e.milliseconds+t.milliseconds}}function ve(e,t){return{years:e.years-t.years,months:e.months-t.months,days:e.days-t.days,milliseconds:e.milliseconds-t.milliseconds}}function ge(e,t){return{years:e.years*t,months:e.months*t,days:e.days*t,milliseconds:e.milliseconds*t}}function ye(e){return Ee(e)/365}function me(e){return Ee(e)/30}function Ee(e){return Te(e)/864e5}function Se(e){return Te(e)/6e4}function be(e){return Te(e)/1e3}function Te(e){return 31536e6*e.years+2592e6*e.months+864e5*e.days+e.milliseconds}function De(e,t){for(var n=null,r=0;r<bi.length;r++){var i=bi[r];if(t[i]){var o=e[i]/t[i];if(!Ze(o)||null!==n&&n!==o)return null;n=o}else if(e[i])return null}return n}function we(e,t){var n=e.milliseconds;if(n){if(n%1e3!=0)return{unit:"millisecond",value:n};if(n%6e4!=0)return{unit:"second",value:n/1e3};if(n%36e5!=0)return{unit:"minute",value:n/6e4};if(n)return{unit:"hour",value:n/36e5}}return e.days?t||e.days%7!=0?{unit:"day",value:e.days}:{unit:"week",value:e.days/7}:e.months?{unit:"month",value:e.months}:e.years?{unit:"year",value:e.years}:{unit:"millisecond",value:0}}function Re(e,t){t.left&&g(e,{borderLeftWidth:1,marginLeft:t.left-1}),t.right&&g(e,{borderRightWidth:1,marginRight:t.right-1})}function Ie(e){g(e,{marginLeft:"",marginRight:"",borderLeftWidth:"",borderRightWidth:""})}function Ce(){document.body.classList.add("fc-not-allowed")}function Me(){document.body.classList.remove("fc-not-allowed")}function ke(e,t,n){var r=Math.floor(t/e.length),i=Math.floor(t-r*(e.length-1)),o=[],a=[],s=[],u=0;Oe(e),e.forEach(function(t,n){var l=n===e.length-1?i:r,c=_(t);c<l?(o.push(t),a.push(c),s.push(t.offsetHeight)):u+=c}),n&&(t-=u,r=Math.floor(t/o.length),i=Math.floor(t-r*(o.length-1))),o.forEach(function(e,t){var n=t===o.length-1?i:r,u=a[t],l=s[t],c=n-(u-l);u<n&&(e.style.height=c+"px")})}function Oe(e){e.forEach(function(e){e.style.height=""})}function _e(e){var t=0;return e.forEach(function(e){var n=e.firstChild;if(n instanceof HTMLElement){var r=n.offsetWidth;r>t&&(t=r)}}),t++,e.forEach(function(e){e.style.width=t+"px"}),t}function Pe(e,t){var n={position:"relative",left:-1};g(e,n),g(t,n);var r=e.offsetHeight-t.offsetHeight,i={position:"",left:""};return g(e,i),g(t,i),r}function xe(e){e.classList.add("fc-unselectable"),e.addEventListener("selectstart",H)}function He(e){e.classList.remove("fc-unselectable"),e.removeEventListener("selectstart",H)}function Ne(e){e.addEventListener("contextmenu",H)}function ze(e){e.removeEventListener("contextmenu",H)}function Ue(e){var t,n,r=[],i=[];for("string"==typeof e?i=e.split(/\s*,\s*/):"function"==typeof e?i=[e]:Array.isArray(e)&&(i=e),t=0;t<i.length;t++)n=i[t],"string"==typeof n?r.push("-"===n.charAt(0)?{field:n.substring(1),order:-1}:{field:n,order:1}):"function"==typeof n&&r.push({func:n});return r}function Le(e,t,n){var r,i;for(r=0;r<n.length;r++)if(i=Ve(e,t,n[r]))return i;return 0}function Ve(e,t,n){return n.func?n.func(e,t):Be(e[n.field],t[n.field])*(n.order||1)}function Be(e,t){return e||t?null==t?-1:null==e?1:"string"==typeof e||"string"==typeof t?String(e).localeCompare(String(t)):e-t:0}function Ae(e){return e.charAt(0).toUpperCase()+e.slice(1)}function Fe(e,t){var n=String(e);return"000".substr(0,t-n.length)+n}function We(e,t){return e-t}function Ze(e){return e%1==0}function je(e,t,n){if("function"==typeof e&&(e=[e]),e){var r=void 0,i=void 0;for(r=0;r<e.length;r++)i=e[r].apply(t,n)||i;return i}}function Ye(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];for(var n=0;n<e.length;n++)if(void 0!==e[n])return e[n]}function qe(e,t){var n,r,i,o,a,s=function(){var u=(new Date).valueOf()-o;u<t?n=setTimeout(s,t-u):(n=null,a=e.apply(i,r),i=r=null)};return function(){return i=this,r=arguments,o=(new Date).valueOf(),n||(n=setTimeout(s,t)),a}}function Ge(e,t,n,r){void 0===n&&(n={});var i={};for(var o in t){var a=t[o];void 0!==e[o]?a===Function?i[o]="function"==typeof e[o]?e[o]:null:i[o]=a?a(e[o]):e[o]:void 0!==n[o]?i[o]=n[o]:a===String?i[o]="":a&&a!==Number&&a!==Boolean&&a!==Function?i[o]=a(null):i[o]=null}if(r)for(var o in e)void 0===t[o]&&(r[o]=e[o]);return i}function Xe(e){var t=Math.floor(F(e.start,e.end))||1,n=X(e.start);return{start:n,end:V(n,t)}}function Je(e,t){void 0===t&&(t=ue(0));var n=null,r=null;if(e.end){r=X(e.end);var i=e.end.valueOf()-r.valueOf();i&&i>=Te(t)&&(r=V(r,1))}return e.start&&(n=X(e.start),r&&r<=n&&(r=V(n,1))),{start:n,end:r}}function Ke(e){var t=Je(e);return F(t.start,t.end)>1}function Qe(e,t,n,r){return"year"===r?ue(n.diffWholeYears(e,t),"year"):"month"===r?ue(n.diffWholeMonths(e,t),"month"):Y(e,t)}function $e(e,t){function n(){this.constructor=e}Di(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}function et(e,t,n,r,i){for(var o=0;o<r.length;o++){var a={},s=r[o].parse(e,a,n);if(s){var u=a.allDay;return delete a.allDay,null==u&&null==(u=t)&&null==(u=s.allDayGuess)&&(u=!1),wi(i,a),{allDay:u,duration:s.duration,typeData:s.typeData,typeId:o}}}return null}function tt(e,t,n,r,i){var o=i[e.recurringDef.typeId],a=o.expand(e.recurringDef.typeData,{start:r.subtract(n.start,t),end:n.end},r);return e.allDay&&(a=a.map(X)),a}function nt(e,t){var n,r,i,o,a,s,u={};if(t)for(n=0;n<t.length;n++){for(r=t[n],i=[],o=e.length-1;o>=0;o--)if("object"==typeof(a=e[o][r])&&a)i.unshift(a);else if(void 0!==a){u[r]=a;break}i.length&&(u[r]=nt(i))}for(n=e.length-1;n>=0;n--){s=e[n];for(r in s)r in u||(u[r]=s[r])}return u}function rt(e,t){var n={};for(var r in e)t(e[r],r)&&(n[r]=e[r]);return n}function it(e,t){var n={};for(var r in e)n[r]=t(e[r],r);return n}function ot(e){for(var t={},n=0,r=e;n<r.length;n++){t[r[n]]=!0}return t}function at(e){var t=[];for(var n in e)t.push(e[n]);return t}function st(e,t){for(var n in e)if(Ri.call(e,n)&&!(n in t))return!1;for(var n in t)if(Ri.call(t,n)&&e[n]!==t[n])return!1;return!0}function ut(e,t,n,r){for(var i=vt(),o=0,a=e;o<a.length;o++){var s=a[o],u=On(s,t,n,r);u&&lt(u,i)}return i}function lt(e,t){return void 0===t&&(t=vt()),t.defs[e.def.defId]=e.def,e.instance&&(t.instances[e.instance.instanceId]=e.instance),t}function ct(e,t,n){var r=n.dateEnv,i=e.defs,o=e.instances;o=rt(o,function(e){return!i[e.defId].recurringDef});for(var a in i){var s=i[a];if(s.recurringDef){var u=s.recurringDef.duration;u||(u=s.allDay?n.defaultAllDayEventDuration:n.defaultTimedEventDuration);for(var l=tt(s,u,t,n.dateEnv,n.pluginSystem.hooks.recurringTypes),c=0,d=l;c<d.length;c++){var f=d[c],p=Pn(a,{start:f,end:r.add(f,u)});o[p.instanceId]=p}}}return{defs:i,instances:o}}function dt(e,t){var n=e.instances[t];if(n){var r=e.defs[n.defId],i=yt(e,function(e){return ft(r,e)});return i.defs[r.defId]=r,i.instances[n.instanceId]=n,i}return vt()}function ft(e,t){return Boolean(e.groupId&&e.groupId===t.groupId)}function pt(e,t,n){var r=n.opt("eventDataTransform"),i=t?t.eventDataTransform:null;return i&&(e=ht(e,i)),r&&(e=ht(e,r)),e}function ht(e,t){var n;if(t){n=[];for(var r=0,i=e;r<i.length;r++){var o=i[r],a=t(o);a?n.push(a):null==a&&n.push(o)}}else n=e;return n}function vt(){return{defs:{},instances:{}}}function gt(e,t){return{defs:wi({},e.defs,t.defs),instances:wi({},e.instances,t.instances)}}function yt(e,t){var n=rt(e.defs,t),r=rt(e.instances,function(e){return n[e.defId]});return{defs:n,instances:r}}function mt(e,t){var n=null,r=null;return e.start&&(n=t.createMarker(e.start)),e.end&&(r=t.createMarker(e.end)),n||r?n&&r&&r<n?null:{start:n,end:r}:null}function Et(e,t){var n,r,i=[],o=t.start;for(e.sort(St),n=0;n<e.length;n++)r=e[n],r.start>o&&i.push({start:o,end:r.start}),r.end>o&&(o=r.end);return o<t.end&&i.push({start:o,end:t.end}),i}function St(e,t){return e.start.valueOf()-t.start.valueOf()}function bt(e,t){var n=e.start,r=e.end,i=null;return null!==t.start&&(n=null===n?t.start:new Date(Math.max(n.valueOf(),t.start.valueOf()))),null!=t.end&&(r=null===r?t.end:new Date(Math.min(r.valueOf(),t.end.valueOf()))),(null===n||null===r||n<r)&&(i={start:n,end:r}),i}function Tt(e,t){return(null===e.start?null:e.start.valueOf())===(null===t.start?null:t.start.valueOf())&&(null===e.end?null:e.end.valueOf())===(null===t.end?null:t.end.valueOf())}function Dt(e,t){return(null===e.end||null===t.start||e.end>t.start)&&(null===e.start||null===t.end||e.start<t.end)}function wt(e,t){return(null===e.start||null!==t.start&&t.start>=e.start)&&(null===e.end||null!==t.end&&t.end<=e.end)}function Rt(e,t){return(null===e.start||t>=e.start)&&(null===e.end||t<e.end)}function It(e,t){return null!=t.start&&e<t.start?t.start:null!=t.end&&e>=t.end?new Date(t.end.valueOf()-1):e}function Ct(e,t){for(var n=0,r=0;r<e.length;)e[r]===t?(e.splice(r,1),n++):r++;return n}function Mt(e,t){var n,r=e.length;if(r!==t.length)return!1;for(n=0;n<r;n++)if(e[n]!==t[n])return!1;return!0}function kt(e){var t,n;return function(){return t&&Mt(t,arguments)||(t=arguments,n=e.apply(this,arguments)),n}}function Ot(e,t){var n=null;return function(){var r=e.apply(this,arguments);return(null===n||n!==r&&!t(n,r))&&(n=r),n}}function _t(e,t,n){var r=Object.keys(e).length;return 1===r&&"short"===e.timeZoneName?function(e){return Wt(e.timeZoneOffset)}:0===r&&t.week?function(e){return zt(n.computeWeekNumber(e.marker),n.weekLabel,n.locale,t.week)}:Pt(e,t,n)}function Pt(e,t,n){e=wi({},e),t=wi({},t),xt(e,t),e.timeZone="UTC";var r,i=new Intl.DateTimeFormat(n.locale.codes,e);if(t.omitZeroMinute){var o=wi({},e);delete o.minute,r=new Intl.DateTimeFormat(n.locale.codes,o)}return function(o){var a,s=o.marker;return a=r&&!s.getUTCMinutes()?r:i,Ht(a.format(s),o,e,t,n)}}function xt(e,t){e.timeZoneName&&(e.hour||(e.hour="2-digit"),e.minute||(e.minute="2-digit")),"long"===e.timeZoneName&&(e.timeZoneName="short"),t.omitZeroMinute&&(e.second||e.millisecond)&&delete t.omitZeroMinute}function Ht(e,t,n,r,i){return e=e.replace(_i,""),"short"===n.timeZoneName&&(e=Nt(e,"UTC"===i.timeZone||null==t.timeZoneOffset?"UTC":Wt(t.timeZoneOffset))),r.omitCommas&&(e=e.replace(ki,"").trim()),r.omitZeroMinute&&(e=e.replace(":00","")),!1===r.meridiem?e=e.replace(Mi,"").trim():"narrow"===r.meridiem?e=e.replace(Mi,function(e,t){return t.toLocaleLowerCase()}):"short"===r.meridiem?e=e.replace(Mi,function(e,t){return t.toLocaleLowerCase()+"m"}):"lowercase"===r.meridiem&&(e=e.replace(Mi,function(e){return e.toLocaleLowerCase()})),e=e.replace(Oi," "),e=e.trim()}function Nt(e,t){var n=!1;return e=e.replace(Pi,function(){return n=!0,t}),n||(e+=" "+t),e}function zt(e,t,n,r){var i=[];return"narrow"===r?i.push(t):"short"===r&&i.push(t," "),i.push(n.simpleNumberFormat.format(e)),n.options.isRtl&&i.reverse(),i.join("")}function Ut(e,t,n){return n.getMarkerYear(e)!==n.getMarkerYear(t)?5:n.getMarkerMonth(e)!==n.getMarkerMonth(t)?4:n.getMarkerDay(e)!==n.getMarkerDay(t)?2:se(e)!==se(t)?1:0}function Lt(e,t){var n={};for(var r in e)r in Ci&&!(Ci[r]<=t)||(n[r]=e[r]);return n}function Vt(e,t,n,r){for(var i=0;i<e.length;){var o=e.indexOf(t,i);if(-1===o)break;var a=e.substr(0,o);i=o+t.length;for(var s=e.substr(i),u=0;u<n.length;){var l=n.indexOf(r,u);if(-1===l)break;var c=n.substr(0,l);u=l+r.length;var d=n.substr(u);if(a===c&&s===d)return{before:a,after:s}}}return null}function Bt(e,t){return"object"==typeof e&&e?("string"==typeof t&&(e=wi({separator:t},e)),new xi(e)):"string"==typeof e?new Hi(e,t):"function"==typeof e?new Ni(e):void 0}function At(e,t,n){void 0===n&&(n=!1);var r=e.toISOString();return r=r.replace(".000",""),n&&(r=r.replace("T00:00:00Z","")),r.length>10&&(null==t?r=r.replace("Z",""):0!==t&&(r=r.replace("Z",Wt(t,!0)))),r}function Ft(e){return Fe(e.getUTCHours(),2)+":"+Fe(e.getUTCMinutes(),2)+":"+Fe(e.getUTCSeconds(),2)}function Wt(e,t){void 0===t&&(t=!1);var n=e<0?"-":"+",r=Math.abs(e),i=Math.floor(r/60),o=Math.round(r%60);return t?n+Fe(i,2)+":"+Fe(o,2):"GMT"+n+i+(o?":"+Fe(o,2):"")}function Zt(e,t,n,r){var i=jt(e,n.calendarSystem);return{date:i,start:i,end:t?jt(t,n.calendarSystem):null,timeZone:n.timeZone,localeCodes:n.locale.codes,separator:r}}function jt(e,t){var n=t.markerToArray(e.marker);return{marker:e.marker,timeZoneOffset:e.timeZoneOffset,array:n,year:n[0],month:n[1],day:n[2],hour:n[3],minute:n[4],second:n[5],millisecond:n[6]}}function Yt(e,t,n,r){var i={},o={},a={},s=[],u=[],l=Kt(e.defs,t);for(var c in e.defs){var d=e.defs[c];"inverse-background"===d.rendering&&(d.groupId?(i[d.groupId]=[],a[d.groupId]||(a[d.groupId]=d)):o[c]=[])}for(var f in e.instances){var p=e.instances[f],d=e.defs[p.defId],h=l[d.defId],v=p.range,g=!d.allDay&&r?Je(v,r):v,y=bt(g,n);y&&("inverse-background"===d.rendering?d.groupId?i[d.groupId].push(y):o[p.defId].push(y):("background"===d.rendering?s:u).push({def:d,ui:h,instance:p,range:y,isStart:g.start&&g.start.valueOf()===y.start.valueOf(),isEnd:g.end&&g.end.valueOf()===y.end.valueOf()}))}for(var m in i)for(var E=i[m],S=Et(E,n),b=0,T=S;b<T.length;b++){var D=T[b],d=a[m],h=l[d.defId];s.push({def:d,ui:h,instance:null,range:D,isStart:!1,isEnd:!1})}for(var c in o)for(var E=o[c],S=Et(E,n),w=0,R=S;w<R.length;w++){var D=R[w];s.push({def:e.defs[c],ui:l[c],instance:null,range:D,isStart:!1,isEnd:!1})}return{bg:s,fg:u}}function qt(e){return"background"===e.rendering||"inverse-background"===e.rendering}function Gt(e,t,n){e.hasPublicHandlers("eventRender")&&(t=t.filter(function(t){var r=e.publiclyTrigger("eventRender",[{event:new Ui(e.calendar,t.eventRange.def,t.eventRange.instance),isMirror:n,isStart:t.isStart,isEnd:t.isEnd,el:t.el,view:e}]);return!1!==r&&(r&&!0!==r&&(t.el=r),!0)}));for(var r=0,i=t;r<i.length;r++){var o=i[r];Xt(o.el,o)}return t}function Xt(e,t){e.fcSeg=t}function Jt(e){return e.fcSeg||null}function Kt(e,t){return it(e,function(e){return Qt(e,t)})}function Qt(e,t){var n=[];return t[""]&&n.push(t[""]),t[e.defId]&&n.push(t[e.defId]),n.push(e.ui),Mn(n)}function $t(e,t,n,r){var i=Kt(e.defs,t),o=vt();for(var a in e.defs){var s=e.defs[a];o.defs[a]=en(s,i[a],n,r.pluginSystem.hooks.eventDefMutationAppliers,r)}for(var u in e.instances){var l=e.instances[u],s=o.defs[l.defId];o.instances[u]=nn(l,s,i[l.defId],n,r)}return o}function en(e,t,n,r,i){var o=n.standardProps||{};null==o.hasEnd&&t.durationEditable&&tn(t.startEditable?n.startDelta:null,n.endDelta||null)&&(o.hasEnd=!0);var a=wi({},e,o,{ui:wi({},e.ui,o.ui)});n.extendedProps&&(a.extendedProps=wi({},a.extendedProps,n.extendedProps));for(var s=0,u=r;s<u.length;s++){(0,u[s])(a,n,i)}return!a.hasEnd&&i.opt("forceEventDuration")&&(a.hasEnd=!0),a}function tn(e,t){return e&&!Te(e)&&(e=null),t&&!Te(t)&&(t=null),!(!e&&!t)&&(Boolean(e)!==Boolean(t)||!fe(e,t))}function nn(e,t,n,r,i){var o=i.dateEnv,a=r.standardProps&&!0===r.standardProps.allDay,s=r.standardProps&&!1===r.standardProps.hasEnd,u=wi({},e);return a&&(u.range=Xe(u.range)),r.startDelta&&n.startEditable&&(u.range={start:o.add(u.range.start,r.startDelta),end:u.range.end}),s?u.range={start:u.range.start,end:i.getDefaultEventEnd(t.allDay,u.range.start)}:!r.endDelta||!n.durationEditable&&tn(n.startEditable?r.startDelta:null,r.endDelta)||(u.range={start:u.range.start,end:o.add(u.range.end,r.endDelta)}),t.allDay&&(u.range={start:X(u.range.start),end:X(u.range.end)}),u.range.end<u.range.start&&(u.range.end=i.getDefaultEventEnd(t.allDay,u.range.start)),u}function rn(e,t,n,r,i){switch(t.type){case"RECEIVE_EVENTS":return on(e,n[t.sourceId],t.fetchId,t.fetchRange,t.rawEvents,i);case"ADD_EVENTS":return an(e,t.eventStore,r?r.activeRange:null,i);case"MERGE_EVENTS":return gt(e,t.eventStore);case"PREV":case"NEXT":case"SET_DATE":case"SET_VIEW_TYPE":return r?ct(e,r.activeRange,i):e;case"CHANGE_TIMEZONE":return sn(e,t.oldDateEnv,i.dateEnv);case"MUTATE_EVENTS":return un(e,t.instanceId,t.mutation,t.fromApi,i);case"REMOVE_EVENT_INSTANCES":return cn(e,t.instances);case"REMOVE_EVENT_DEF":return yt(e,function(e){return e.defId!==t.defId});case"REMOVE_EVENT_SOURCE":return ln(e,t.sourceId);case"REMOVE_ALL_EVENT_SOURCES":return yt(e,function(e){return!e.sourceId});case"REMOVE_ALL_EVENTS":return vt();case"RESET_EVENTS":return{defs:e.defs,instances:e.instances};default:return e}}function on(e,t,n,r,i,o){if(t&&n===t.latestFetchId){var a=ut(pt(i,t,o),t.sourceId,o);return r&&(a=ct(a,r,o)),gt(ln(e,t.sourceId),a)}return e}function an(e,t,n,r){return n&&(t=ct(t,n,r)),gt(e,t)}function sn(e,t,n){var r=e.defs,i=it(e.instances,function(e){var i=r[e.defId];return i.allDay||i.recurringDef?e:wi({},e,{range:{start:n.createMarker(t.toDate(e.range.start,e.forcedStartTzo)),end:n.createMarker(t.toDate(e.range.end,e.forcedEndTzo))},forcedStartTzo:n.canComputeOffset?null:e.forcedStartTzo,forcedEndTzo:n.canComputeOffset?null:e.forcedEndTzo})});return{defs:r,instances:i}}function un(e,t,n,r,i){var o=dt(e,t);return o=$t(o,r?{"":{startEditable:!0,durationEditable:!0,constraints:[],overlap:null,allows:[],backgroundColor:"",borderColor:"",textColor:"",classNames:[]}}:i.eventUiBases,n,i),gt(e,o)}function ln(e,t){return yt(e,function(e){return e.sourceId!==t})}function cn(e,t){return{defs:e.defs,instances:rt(e.instances,function(e){return!t[e.instanceId]})}}function dn(e,t){return pn({eventDrag:e},t)}function fn(e,t){return pn({dateSelection:e},t)}function pn(e,t){var n=t.view,r=wi({businessHours:n?n.props.businessHours:vt(),dateSelection:"",eventStore:t.state.eventStore,eventUiBases:t.eventUiBases,eventSelection:"",eventDrag:null,eventResize:null},e);return(t.pluginSystem.hooks.isPropsValid||hn)(r,t)}function hn(e,t,n,r){return void 0===n&&(n={}),!(e.eventDrag&&!vn(e,t,n,r))&&!(e.dateSelection&&!gn(e,t,n,r))}function vn(e,t,n,r){var i=e.eventDrag,o=i.mutatedEvents,a=o.defs,s=o.instances,u=Kt(a,i.isEvent?e.eventUiBases:{"":t.selectionConfig});r&&(u=it(u,r));var l=cn(e.eventStore,i.affectedEvents.instances),c=l.defs,d=l.instances,f=Kt(c,e.eventUiBases);for(var p in s){var h=s[p],v=h.range,g=u[h.defId],y=a[h.defId];if(!yn(g.constraints,v,l,e.businessHours,t))return!1;var m=t.opt("eventOverlap");"function"!=typeof m&&(m=null);for(var E in d){var S=d[E];if(Dt(v,S.range)){if(!1===f[S.defId].overlap&&i.isEvent)return!1;if(!1===g.overlap)return!1;if(m&&!m(new Ui(t,c[S.defId],S),new Ui(t,y,h)))return!1}}for(var b=0,T=g.allows;b<T.length;b++){var D=T[b],w=wi({},n,{range:h.range,allDay:y.allDay}),R=e.eventStore.defs[y.defId],I=e.eventStore.instances[p],C=void 0;if(C=R?new Ui(t,R,I):new Ui(t,y),!D(t.buildDateSpanApi(w),C))return!1}}return!0}function gn(e,t,n,r){var i=e.eventStore,o=i.defs,a=i.instances,s=e.dateSelection,u=s.range,l=t.selectionConfig;if(r&&(l=r(l)),!yn(l.constraints,u,i,e.businessHours,t))return!1;var c=t.opt("selectOverlap");"function"!=typeof c&&(c=null);for(var d in a){var f=a[d];if(Dt(u,f.range)){if(!1===l.overlap)return!1;if(c&&!c(new Ui(t,o[f.defId],f)))return!1}}for(var p=0,h=l.allows;p<h.length;p++){var v=h[p],g=wi({},n,s);if(!v(t.buildDateSpanApi(g),null))return!1}return!0}function yn(e,t,n,r,i){for(var o=0,a=e;o<a.length;o++){if(!Sn(mn(a[o],t,n,r,i),t))return!1}return!0}function mn(e,t,n,r,i){return"businessHours"===e?En(ct(r,t,i)):"string"==typeof e?En(yt(n,function(t){return t.groupId===e})):"object"==typeof e&&e?En(ct(e,t,i)):[]}function En(e){var t=e.instances,n=[];for(var r in t)n.push(t[r].range);return n}function Sn(e,t){for(var n=0,r=e;n<r.length;n++){if(wt(r[n],t))return!0}return!1}function bn(e,t){return Array.isArray(e)?ut(e,"",t,!0):"object"==typeof e&&e?ut([e],"",t,!0):null!=e?String(e):null}function Tn(e){return(e+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/'/g,"&#039;").replace(/"/g,"&quot;").replace(/\n/g,"<br />")}function Dn(e){var t=[];for(var n in e){var r=e[n];null!=r&&""!==r&&t.push(n+":"+r)}return t.join(";")}function wn(e){var t=[];for(var n in e){var r=e[n];null!=r&&t.push(n+'="'+Tn(r)+'"')}return t.join(" ")}function Rn(e){return Array.isArray(e)?e:"string"==typeof e?e.split(/\s+/):[]}function In(e,t,n){var r=Ge(e,Li,{},n),i=bn(r.constraint,t);return{startEditable:null!=r.startEditable?r.startEditable:r.editable,durationEditable:null!=r.durationEditable?r.durationEditable:r.editable,constraints:null!=i?[i]:[],overlap:r.overlap,allows:null!=r.allow?[r.allow]:[],backgroundColor:r.backgroundColor||r.color,borderColor:r.borderColor||r.color,textColor:r.textColor,classNames:r.classNames.concat(r.className)}}function Cn(e,t,n,r){var i={},o={};for(var a in Li){var s=e+Ae(a);i[a]=t[s],o[s]=!0}if("event"===e&&(i.editable=t.editable),r)for(var a in t)o[a]||(r[a]=t[a]);return In(i,n)}function Mn(e){return e.reduce(kn,Vi)}function kn(e,t){return{startEditable:null!=t.startEditable?t.startEditable:e.startEditable,durationEditable:null!=t.durationEditable?t.durationEditable:e.durationEditable,constraints:e.constraints.concat(t.constraints),overlap:"boolean"==typeof t.overlap?t.overlap:e.overlap,allows:e.allows.concat(t.allows),backgroundColor:t.backgroundColor||e.backgroundColor,borderColor:t.borderColor||e.borderColor,textColor:t.textColor||e.textColor,classNames:e.classNames.concat(t.classNames)}}function On(e,t,n,r){var i=zn(t,n),o={},a=et(e,i,n.dateEnv,n.pluginSystem.hooks.recurringTypes,o);if(a){var s=_n(o,t,a.allDay,Boolean(a.duration),n);return s.recurringDef={typeId:a.typeId,typeData:a.typeData,duration:a.duration},{def:s,instance:null}}var u={},l=xn(e,i,n,u,r);if(l){var s=_n(u,t,l.allDay,l.hasEnd,n);return{def:s,instance:Pn(s.defId,l.range,l.forcedStartTzo,l.forcedEndTzo)}}return null}function _n(e,t,n,r,i){var o={},a=Nn(e,i,o);a.defId=String(Fi++),a.sourceId=t,a.allDay=n,a.hasEnd=r;for(var s=0,u=i.pluginSystem.hooks.eventDefParsers;s<u.length;s++){var l=u[s],c={};l(a,o,c),o=c}return a.extendedProps=wi(o,a.extendedProps||{}),Object.freeze(a.ui.classNames),Object.freeze(a.extendedProps),a}function Pn(e,t,n,r){return{instanceId:String(Fi++),defId:e,range:t,forcedStartTzo:null==n?null:n,forcedEndTzo:null==r?null:r}}function xn(e,t,n,r,i){var o,a,s=Hn(e,r),u=s.allDay,l=null,c=!1,d=null;if(o=n.dateEnv.createMarkerMeta(s.start))l=o.marker;else if(!i)return null;return null!=s.end&&(a=n.dateEnv.createMarkerMeta(s.end)),null==u&&(u=null!=t?t:(!o||o.isTimeUnspecified)&&(!a||a.isTimeUnspecified)),u&&l&&(l=X(l)),a&&(d=a.marker,u&&(d=X(d)),l&&d<=l&&(d=null)),d?c=!0:i||(c=n.opt("forceEventDuration")||!1,d=n.dateEnv.add(l,u?n.defaultAllDayEventDuration:n.defaultTimedEventDuration)),{allDay:u,hasEnd:c,range:{start:l,end:d},forcedStartTzo:o?o.forcedTzo:null,forcedEndTzo:a?a.forcedTzo:null}}function Hn(e,t){var n=Ge(e,Ai,{},t);return n.start=null!==n.start?n.start:n.date,delete n.date,n}function Nn(e,t,n){var r={},i=Ge(e,Bi,{},r),o=In(r,t,n);return i.publicId=i.id,delete i.id,i.ui=o,i}function zn(e,t){var n=null;if(e){n=t.state.eventSources[e].allDayDefault}return null==n&&(n=t.opt("allDayDefault")),n}function Un(e,t){return ut(Ln(e),"",t)}function Ln(e){var t;return t=!0===e?[{}]:Array.isArray(e)?e.filter(function(e){return e.daysOfWeek}):"object"==typeof e&&e?[e]:[],t=t.map(function(e){return wi({},Wi,e)})}function Vn(e,t,n){function r(){if(a){for(var e=0,n=s;e<n.length;e++){n[e].unrender()}t&&t.apply(o,a),a=null}}function i(){a&&Mt(a,arguments)||(r(),o=this,a=arguments,e.apply(this,arguments))}void 0===n&&(n=[]);var o,a,s=[];i.dependents=s,i.unrender=r;for(var u=0,l=n;u<l.length;u++){l[u].dependents.push(i)}return i}function Bn(e,t,n){var r=[];e&&r.push(e),t&&r.push(t);var i={"":Mn(r)};return n&&wi(i,n),i}function An(e,t,n,r){var i,o,a,s,u=e.dateEnv;return t instanceof Date?i=t:(i=t.date,o=t.type,a=t.forceOff),s={date:u.formatIso(i,{omitTime:!0}),type:o||"day"},"string"==typeof n&&(r=n,n=null),n=n?" "+wn(n):"",r=r||"",!a&&e.opt("navLinks")?"<a"+n+' data-goto="'+Tn(JSON.stringify(s))+'">'+r+"</a>":"<span"+n+">"+r+"</span>"}function Fn(e){return e.opt("allDayHtml")||Tn(e.opt("allDayText"))}function Wn(e,t,n,r){var i,o,a=n.calendar,s=n.view,u=n.theme,l=n.dateEnv,c=[];return Rt(t.activeRange,e)?(c.push("fc-"+Si[e.getUTCDay()]),s.opt("monthMode")&&l.getMonth(e)!==l.getMonth(t.currentRange.start)&&c.push("fc-other-month"),i=X(a.getNow()),o=V(i,1),e<i?c.push("fc-past"):e>=o?c.push("fc-future"):(c.push("fc-today"),!0!==r&&c.push(u.getClass("today")))):c.push("fc-disabled-day"),c}function Zn(e,t,n){var r=!1,i=function(){r||(r=!0,t.apply(this,arguments))},o=function(){r||(r=!0,n&&n.apply(this,arguments))},a=e(i,o);a&&"function"==typeof a.then&&a.then(i,o)}function jn(e,t,n){
    (e[t]||(e[t]=[])).push(n)}function Yn(e,t,n){n?e[t]&&(e[t]=e[t].filter(function(e){return e!==n})):delete e[t]}function qn(e,t,n){var r={},i=!1;for(var o in t)o in e&&(e[o]===t[o]||n[o]&&n[o](e[o],t[o]))?r[o]=e[o]:(r[o]=t[o],i=!0);for(var o in e)if(!(o in t)){i=!0;break}return{anyChanges:i,comboProps:r}}function Gn(e){return{id:String(ro++),deps:e.deps||[],reducers:e.reducers||[],eventDefParsers:e.eventDefParsers||[],eventDragMutationMassagers:e.eventDragMutationMassagers||[],eventDefMutationAppliers:e.eventDefMutationAppliers||[],dateSelectionTransformers:e.dateSelectionTransformers||[],datePointTransforms:e.datePointTransforms||[],dateSpanTransforms:e.dateSpanTransforms||[],views:e.views||{},viewPropsTransformers:e.viewPropsTransformers||[],isPropsValid:e.isPropsValid||null,externalDefTransforms:e.externalDefTransforms||[],eventResizeJoinTransforms:e.eventResizeJoinTransforms||[],viewContainerModifiers:e.viewContainerModifiers||[],eventDropTransformers:e.eventDropTransformers||[],componentInteractions:e.componentInteractions||[],calendarInteractions:e.calendarInteractions||[],themeClasses:e.themeClasses||{},eventSourceDefs:e.eventSourceDefs||[],cmdFormatter:e.cmdFormatter,recurringTypes:e.recurringTypes||[],namedTimeZonedImpl:e.namedTimeZonedImpl,defaultView:e.defaultView||"",elementDraggingImpl:e.elementDraggingImpl,optionChangeHandlers:e.optionChangeHandlers||{}}}function Xn(e,t){return{reducers:e.reducers.concat(t.reducers),eventDefParsers:e.eventDefParsers.concat(t.eventDefParsers),eventDragMutationMassagers:e.eventDragMutationMassagers.concat(t.eventDragMutationMassagers),eventDefMutationAppliers:e.eventDefMutationAppliers.concat(t.eventDefMutationAppliers),dateSelectionTransformers:e.dateSelectionTransformers.concat(t.dateSelectionTransformers),datePointTransforms:e.datePointTransforms.concat(t.datePointTransforms),dateSpanTransforms:e.dateSpanTransforms.concat(t.dateSpanTransforms),views:wi({},e.views,t.views),viewPropsTransformers:e.viewPropsTransformers.concat(t.viewPropsTransformers),isPropsValid:t.isPropsValid||e.isPropsValid,externalDefTransforms:e.externalDefTransforms.concat(t.externalDefTransforms),eventResizeJoinTransforms:e.eventResizeJoinTransforms.concat(t.eventResizeJoinTransforms),viewContainerModifiers:e.viewContainerModifiers.concat(t.viewContainerModifiers),eventDropTransformers:e.eventDropTransformers.concat(t.eventDropTransformers),calendarInteractions:e.calendarInteractions.concat(t.calendarInteractions),componentInteractions:e.componentInteractions.concat(t.componentInteractions),themeClasses:wi({},e.themeClasses,t.themeClasses),eventSourceDefs:e.eventSourceDefs.concat(t.eventSourceDefs),cmdFormatter:t.cmdFormatter||e.cmdFormatter,recurringTypes:e.recurringTypes.concat(t.recurringTypes),namedTimeZonedImpl:t.namedTimeZonedImpl||e.namedTimeZonedImpl,defaultView:e.defaultView||t.defaultView,elementDraggingImpl:e.elementDraggingImpl||t.elementDraggingImpl,optionChangeHandlers:wi({},e.optionChangeHandlers,t.optionChangeHandlers)}}function Jn(e,t,n,r,i){e=e.toUpperCase();var o=null;"GET"===e?t=Kn(t,n):o=Qn(n);var a=new XMLHttpRequest;a.open(e,t,!0),"GET"!==e&&a.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),a.onload=function(){if(a.status>=200&&a.status<400)try{var e=JSON.parse(a.responseText);r(e,a)}catch(e){i("Failure parsing JSON",a)}else i("Request failed",a)},a.onerror=function(){i("Request failed",a)},a.send(o)}function Kn(e,t){return e+(-1===e.indexOf("?")?"?":"&")+Qn(t)}function Qn(e){var t=[];for(var n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return t.join("&")}function $n(e,t,n){var r,i,o,a,s=n.dateEnv,u={};return r=e.startParam,null==r&&(r=n.opt("startParam")),i=e.endParam,null==i&&(i=n.opt("endParam")),o=e.timeZoneParam,null==o&&(o=n.opt("timeZoneParam")),a="function"==typeof e.extraParams?e.extraParams():e.extraParams||{},wi(u,a),u[r]=s.formatIso(t.start),u[i]=s.formatIso(t.end),"local"!==s.timeZone&&(u[o]=s.timeZone),u}function er(e,t,n,r){for(var i=e?ot(e):null,o=X(n.start),a=n.end,s=[];o<a;){var u=void 0;i&&!i[o.getUTCDay()]||(u=t?r.add(o,t):o,s.push(u)),o=V(o,1)}return s}function tr(e,t,n){for(var r=at(t.state.eventSources),i=[],o=0,a=e;o<a.length;o++){for(var s=a[o],u=!1,l=0;l<r.length;l++)if(n(r[l]._raw,s)){r.splice(l,1),u=!0;break}u||i.push(s)}for(var c=0,d=r;c<d.length;c++){var f=d[c];t.dispatch({type:"REMOVE_EVENT_SOURCE",sourceId:f.sourceId})}for(var p=0,h=i;p<h.length;p++){var v=h[p];t.addEventSource(v)}}function nr(e,t){t.addPluginInputs(e)}function rr(e){return nt(e,mo)}function ir(e){for(var t=[],n=0,r=e;n<r.length;n++){var i=r[n];if("string"==typeof i){var o="FullCalendar"+Ae(i);window[o]?t.push(window[o].default):console.warn("Plugin file not loaded for "+i)}else t.push(i)}return Eo.concat(t)}function or(e){for(var t=e.length>0?e[0].code:"en",n=window.FullCalendarLocalesAll||[],r=window.FullCalendarLocales||{},i=n.concat(at(r),e),o={en:So},a=0,s=i;a<s.length;a++){var u=s[a];o[u.code]=u}return{map:o,defaultCode:t}}function ar(e,t){return"object"!=typeof e||Array.isArray(e)?sr(e,t):lr(e.code,[e.code],e)}function sr(e,t){var n=[].concat(e||[]);return lr(e,n,ur(n,t)||So)}function ur(e,t){for(var n=0;n<e.length;n++)for(var r=e[n].toLocaleLowerCase().split("-"),i=r.length;i>0;i--){var o=r.slice(0,i).join("-");if(t[o])return t[o]}return null}function lr(e,t,n){var r=nt([So,n],["buttonText"]);delete r.code;var i=r.week;return delete r.week,{codeArg:e,codes:t,week:i,simpleNumberFormat:new Intl.NumberFormat(e),options:r}}function cr(e){return new To[e]}function dr(e){var t=wo.exec(e);if(t){var n=new Date(Date.UTC(Number(t[1]),t[3]?Number(t[3])-1:0,Number(t[5]||1),Number(t[7]||0),Number(t[8]||0),Number(t[10]||0),t[12]?1e3*Number("0."+t[12]):0));if(ae(n)){var r=null;return t[13]&&(r=("-"===t[15]?-1:1)*(60*Number(t[16]||0)+Number(t[18]||0))),{marker:n,isTimeUnspecified:!t[6],timeZoneOffset:r}}}return null}function fr(e,t){return!t.pluginSystem.hooks.eventSourceDefs[e.sourceDefId].ignoreRange}function pr(e,t){for(var n=t.pluginSystem.hooks.eventSourceDefs,r=n.length-1;r>=0;r--){var i=n[r],o=i.parseMeta(e);if(o){var a=hr("object"==typeof e?e:{},o,r,t);return a._raw=e,a}}return null}function hr(e,t,n,r){var i={},o=Ge(e,Io,{},i),a={},s=In(i,r,a);return o.isFetching=!1,o.latestFetchId="",o.fetchRange=null,o.publicId=String(e.id||""),o.sourceId=String(Co++),o.sourceDefId=n,o.meta=t,o.ui=s,o.extendedProps=a,o}function vr(e,t,n,r){switch(t.type){case"ADD_EVENT_SOURCES":return gr(e,t.sources,n?n.activeRange:null,r);case"REMOVE_EVENT_SOURCE":return yr(e,t.sourceId);case"PREV":case"NEXT":case"SET_DATE":case"SET_VIEW_TYPE":return n?mr(e,n.activeRange,r):e;case"FETCH_EVENT_SOURCES":case"CHANGE_TIMEZONE":return Sr(e,t.sourceIds?ot(t.sourceIds):Dr(e,r),n?n.activeRange:null,r);case"RECEIVE_EVENTS":case"RECEIVE_EVENT_ERROR":return Tr(e,t.sourceId,t.fetchId,t.fetchRange);case"REMOVE_ALL_EVENT_SOURCES":return{};default:return e}}function gr(e,t,n,r){for(var i={},o=0,a=t;o<a.length;o++){var s=a[o];i[s.sourceId]=s}return n&&(i=mr(i,n,r)),wi({},e,i)}function yr(e,t){return rt(e,function(e){return e.sourceId!==t})}function mr(e,t,n){return Sr(e,rt(e,function(e){return Er(e,t,n)}),t,n)}function Er(e,t,n){return fr(e,n)?!n.opt("lazyFetching")||!e.fetchRange||t.start<e.fetchRange.start||t.end>e.fetchRange.end:!e.latestFetchId}function Sr(e,t,n,r){var i={};for(var o in e){var a=e[o];t[o]?i[o]=br(a,n,r):i[o]=a}return i}function br(e,t,n){var r=n.pluginSystem.hooks.eventSourceDefs[e.sourceDefId],i=String(Mo++);return r.fetch({eventSource:e,calendar:n,range:t},function(r){var o,a,s=r.rawEvents,u=n.opt("eventSourceSuccess");e.success&&(a=e.success(s,r.xhr)),u&&(o=u(s,r.xhr)),s=a||o||s,n.dispatch({type:"RECEIVE_EVENTS",sourceId:e.sourceId,fetchId:i,fetchRange:t,rawEvents:s})},function(r){var o=n.opt("eventSourceFailure");console.warn(r.message,r),e.failure&&e.failure(r),o&&o(r),n.dispatch({type:"RECEIVE_EVENT_ERROR",sourceId:e.sourceId,fetchId:i,fetchRange:t,error:r})}),wi({},e,{isFetching:!0,latestFetchId:i})}function Tr(e,t,n,r){var i,o=e[t];return o&&n===o.latestFetchId?wi({},e,(i={},i[t]=wi({},o,{isFetching:!1,fetchRange:r}),i)):e}function Dr(e,t){return rt(e,function(e){return fr(e,t)})}function wr(e,t){return Tt(e.activeRange,t.activeRange)&&Tt(e.validRange,t.validRange)&&fe(e.minTime,t.minTime)&&fe(e.maxTime,t.maxTime)}function Rr(e,t,n){for(var r=Ir(e.viewType,t),i=Cr(e.dateProfile,t,e.currentDate,r,n),o=vr(e.eventSources,t,i,n),a=wi({},e,{viewType:r,dateProfile:i,currentDate:Mr(e.currentDate,t,i),eventSources:o,eventStore:rn(e.eventStore,t,o,i,n),dateSelection:kr(e.dateSelection,t,n),eventSelection:Or(e.eventSelection,t),eventDrag:_r(e.eventDrag,t,o,n),eventResize:Pr(e.eventResize,t,o,n),eventSourceLoadingLevel:xr(o),loadingLevel:xr(o)}),s=0,u=n.pluginSystem.hooks.reducers;s<u.length;s++){a=(0,u[s])(a,t,n)}return a}function Ir(e,t){switch(t.type){case"SET_VIEW_TYPE":return t.viewType;default:return e}}function Cr(e,t,n,r,i){var o;switch(t.type){case"PREV":o=i.dateProfileGenerators[r].buildPrev(e,n);break;case"NEXT":o=i.dateProfileGenerators[r].buildNext(e,n);break;case"SET_DATE":e.activeRange&&Rt(e.currentRange,t.dateMarker)||(o=i.dateProfileGenerators[r].build(t.dateMarker,void 0,!0));break;case"SET_VIEW_TYPE":var a=i.dateProfileGenerators[r];if(!a)throw new Error(r?'The FullCalendar view "'+r+'" does not exist. Make sure your plugins are loaded correctly.':"No available FullCalendar view plugins.");o=a.build(t.dateMarker||n,void 0,!0)}return!o||!o.isValid||e&&wr(e,o)?e:o}function Mr(e,t,n){switch(t.type){case"PREV":case"NEXT":return Rt(n.currentRange,e)?e:n.currentRange.start;case"SET_DATE":case"SET_VIEW_TYPE":var r=t.dateMarker||e;return n.activeRange&&!Rt(n.activeRange,r)?n.currentRange.start:r;default:return e}}function kr(e,t,n){switch(t.type){case"SELECT_DATES":return t.selection;case"UNSELECT_DATES":return null;default:return e}}function Or(e,t){switch(t.type){case"SELECT_EVENT":return t.eventInstanceId;case"UNSELECT_EVENT":return"";default:return e}}function _r(e,t,n,r){switch(t.type){case"SET_EVENT_DRAG":var i=t.state;return{affectedEvents:i.affectedEvents,mutatedEvents:i.mutatedEvents,isEvent:i.isEvent,origSeg:i.origSeg};case"UNSET_EVENT_DRAG":return null;default:return e}}function Pr(e,t,n,r){switch(t.type){case"SET_EVENT_RESIZE":var i=t.state;return{affectedEvents:i.affectedEvents,mutatedEvents:i.mutatedEvents,isEvent:i.isEvent,origSeg:i.origSeg};case"UNSET_EVENT_RESIZE":return null;default:return e}}function xr(e){var t=0;for(var n in e)e[n].isFetching&&t++;return t}function Hr(e,t,n){var r=Nr(e,t),i=r.range;if(!i.start)return null;if(!i.end){if(null==n)return null;i.end=t.add(i.start,n)}return r}function Nr(e,t){var n={},r=Ge(e,Oo,{},n),i=r.start?t.createMarkerMeta(r.start):null,o=r.end?t.createMarkerMeta(r.end):null,a=r.allDay;return null==a&&(a=i&&i.isTimeUnspecified&&(!o||o.isTimeUnspecified)),n.range={start:i?i.marker:null,end:o?o.marker:null},n.allDay=a,n}function zr(e,t){return Tt(e.range,t.range)&&e.allDay===t.allDay&&Ur(e,t)}function Ur(e,t){for(var n in t)if("range"!==n&&"allDay"!==n&&e[n]!==t[n])return!1;for(var n in e)if(!(n in t))return!1;return!0}function Lr(e,t){return{start:t.toDate(e.range.start),end:t.toDate(e.range.end),startStr:t.formatIso(e.range.start,{omitTime:e.allDay}),endStr:t.formatIso(e.range.end,{omitTime:e.allDay}),allDay:e.allDay}}function Vr(e,t){return{date:t.toDate(e.range.start),dateStr:t.formatIso(e.range.start,{omitTime:e.allDay}),allDay:e.allDay}}function Br(e,t,n){var r=_n({editable:!1},"",e.allDay,!0,n);return{def:r,ui:Qt(r,t),instance:Pn(r.defId,e.range),range:e.range,isStart:!0,isEnd:!0}}function Ar(e,t){var n,r={};for(n in e)Fr(n,r,e,t);for(n in t)Fr(n,r,e,t);return r}function Fr(e,t,n,r){if(t[e])return t[e];var i=Wr(e,t,n,r);return i&&(t[e]=i),i}function Wr(e,t,n,r){var i=n[e],o=r[e],a=function(e){return i&&null!==i[e]?i[e]:o&&null!==o[e]?o[e]:null},s=a("class"),u=a("superType");!u&&s&&(u=Zr(s,r)||Zr(s,n));var l=u?Fr(u,t,n,r):null;return!s&&l&&(s=l.class),s?{type:e,class:s,defaults:wi({},l?l.defaults:{},i?i.options:{}),overrides:wi({},l?l.overrides:{},o?o.options:{})}:null}function Zr(e,t){var n=Object.getPrototypeOf(e.prototype);for(var r in t){var i=t[r];if(i.class&&i.class.prototype===n)return r}return""}function jr(e){return it(e,Yr)}function Yr(e){"function"==typeof e&&(e={class:e});var t={},n=Ge(e,_o,{},t);return{superType:n.type,class:n.class,options:t}}function qr(e,t){var n=jr(e),r=jr(t.overrides.views);return it(Ar(n,r),function(e){return Gr(e,r,t)})}function Gr(e,t,n){var r=e.overrides.duration||e.defaults.duration||n.dynamicOverrides.duration||n.overrides.duration,i=null,o="",a="",s={};if(r&&(i=ue(r))){var u=we(i,!de(r));o=u.unit,1===u.value&&(a=o,s=t[o]?t[o].options:{})}var l=function(t){var n=t.buttonText||{},r=e.defaults.buttonTextKey;return null!=r&&null!=n[r]?n[r]:null!=n[e.type]?n[e.type]:null!=n[a]?n[a]:void 0};return{type:e.type,class:e.class,duration:i,durationUnit:o,singleUnit:a,options:wi({},go,e.defaults,n.dirDefaults,n.localeDefaults,n.overrides,s,e.overrides,n.dynamicOverrides),buttonTextOverride:l(n.dynamicOverrides)||l(n.overrides)||e.overrides.buttonText,buttonTextDefault:l(n.localeDefaults)||l(n.dirDefaults)||e.defaults.buttonText||l(go)||e.type}}function Xr(e,t){var n;return n=/^(year|month)$/.test(e.currentRangeUnit)?e.currentRange:e.activeRange,this.dateEnv.formatRange(n.start,n.end,Bt(t.titleFormat||Jr(e),t.titleRangeSeparator),{isEndExclusive:e.isRangeAllDay})}function Jr(e){var t=e.currentRangeUnit;if("year"===t)return{year:"numeric"};if("month"===t)return{year:"numeric",month:"long"};var n=G(e.currentRange.start,e.currentRange.end);return null!==n&&n>1?{year:"numeric",month:"short",day:"numeric"}:{year:"numeric",month:"long",day:"numeric"}}function Kr(e){return e.map(function(e){return new e})}function Qr(e,t){return{component:e,el:t.el,useEventCenter:null==t.useEventCenter||t.useEventCenter}}function $r(e){var t;return t={},t[e.component.uid]=e,t}function ei(e,t,n,r,i,o,a){return new Ro({calendarSystem:"gregory",timeZone:t,namedTimeZoneImpl:n,locale:e,weekNumberCalculation:i,firstDay:r,weekLabel:o,cmdFormatter:a})}function ti(e){return new(this.pluginSystem.hooks.themeClasses[e.themeSystem]||Lo)(e)}function ni(e){var t=this.tryRerender.bind(this);return null!=e&&(t=qe(t,e)),t}function ri(e){return it(e,function(e){return e.ui})}function ii(e,t,n){var r={"":t};for(var i in e){var o=e[i];o.sourceId&&n[o.sourceId]&&(r[i]=n[o.sourceId])}return r}function oi(e){var t=e.eventRange.def,n=e.eventRange.instance.range,r=n.start?n.start.valueOf():0,i=n.end?n.end.valueOf():0;return wi({},t.extendedProps,t,{id:t.publicId,start:r,end:i,duration:i-r,allDay:Number(t.allDay),_seg:e})}function ai(e,t){void 0===t&&(t={});var n=ui(t),r=Bt(t),i=n.createMarkerMeta(e);return i?n.format(i.marker,r,{forcedTzo:i.forcedTzo}):""}function si(e,t,n){var r=ui("object"==typeof n&&n?n:{}),i=Bt(n,go.defaultRangeSeparator),o=r.createMarkerMeta(e),a=r.createMarkerMeta(t);return o&&a?r.formatRange(o.marker,a.marker,i,{forcedStartTzo:o.forcedTzo,forcedEndTzo:a.forcedTzo,isEndExclusive:n.isEndExclusive}):""}function ui(e){var t=ar(e.locale||"en",or([]).map);return e=wi({timeZone:go.timeZone,calendarSystem:"gregory"},e,{locale:t}),new Ro(e)}function li(e){var t={},n=Ge(e,jo,Yo,t);return n.leftoverProps=t,n}function ci(e,t){return!e||t>10?{weekday:"short"}:t>1?{weekday:"short",month:"numeric",day:"numeric",omitCommas:!0}:{weekday:"long"}}function di(e,t,n,r,i,o,a,s){var u,l=o.view,c=o.dateEnv,d=o.theme,f=o.options,p=Rt(t.activeRange,e),h=["fc-day-header",d.getClass("widgetHeader")];return u="function"==typeof f.columnHeaderHtml?f.columnHeaderHtml(c.toDate(e)):Tn("function"==typeof f.columnHeaderText?f.columnHeaderText(c.toDate(e)):c.format(e,i)),n?h=h.concat(Wn(e,t,o,!0)):h.push("fc-"+Si[e.getUTCDay()]),'<th class="'+h.join(" ")+'"'+(p&&n?' data-date="'+c.formatIso(e,{omitTime:!0})+'"':"")+(a>1?' colspan="'+a+'"':"")+(s?" "+s:"")+">"+(p?An(l,{date:e,forceOff:!n||1===r},u):u)+"</th>"}function fi(e,t){var n=e.activeRange;return t?n:{start:B(n.start,e.minTime.milliseconds),end:B(n.end,e.maxTime.milliseconds-864e5)}}var pi={className:!0,colSpan:!0,rowSpan:!0},hi={"<tr":"tbody","<td":"tr"},vi=Element.prototype.matches||Element.prototype.matchesSelector||Element.prototype.msMatchesSelector,gi=Element.prototype.closest||function(e){var t=this;if(!document.documentElement.contains(t))return null;do{if(f(t,e))return t;t=t.parentElement||t.parentNode}while(null!==t&&1===t.nodeType);return null},yi=/(top|left|right|bottom|width|height)$/i,mi=null,Ei=["webkitTransitionEnd","otransitionend","oTransitionEnd","msTransitionEnd","transitionend"],Si=["sun","mon","tue","wed","thu","fri","sat"],bi=["years","months","days","milliseconds"],Ti=/^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/,Di=function(e,t){return(Di=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},wi=function(){return wi=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++){t=arguments[n];for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])}return e},wi.apply(this,arguments)},Ri=Object.prototype.hasOwnProperty,Ii={week:3,separator:0,omitZeroMinute:0,meridiem:0,omitCommas:0},Ci={timeZoneName:7,era:6,year:5,month:4,day:2,weekday:2,hour:1,minute:1,second:1},Mi=/\s*([ap])\.?m\.?/i,ki=/,/g,Oi=/\s+/g,_i=/\u200e/g,Pi=/UTC|GMT/,xi=function(){function e(e){var t={},n={},r=0;for(var i in e)i in Ii?(n[i]=e[i],r=Math.max(Ii[i],r)):(t[i]=e[i],i in Ci&&(r=Math.max(Ci[i],r)));this.standardDateProps=t,this.extendedSettings=n,this.severity=r,this.buildFormattingFunc=kt(_t)}return e.prototype.format=function(e,t){return this.buildFormattingFunc(this.standardDateProps,this.extendedSettings,t)(e)},e.prototype.formatRange=function(e,t,n){var r=this,i=r.standardDateProps,o=r.extendedSettings,a=Ut(e.marker,t.marker,n.calendarSystem);if(!a)return this.format(e,n);var s=a;!(s>1)||"numeric"!==i.year&&"2-digit"!==i.year||"numeric"!==i.month&&"2-digit"!==i.month||"numeric"!==i.day&&"2-digit"!==i.day||(s=1);var u=this.format(e,n),l=this.format(t,n);if(u===l)return u;var c=Lt(i,s),d=_t(c,o,n),f=d(e),p=d(t),h=Vt(u,f,l,p),v=o.separator||"";return h?h.before+f+v+p+h.after:u+v+l},e.prototype.getLargestUnit=function(){switch(this.severity){case 7:case 6:case 5:return"year";case 4:return"month";case 3:return"week";default:return"day"}},e}(),Hi=function(){function e(e,t){this.cmdStr=e,this.separator=t}return e.prototype.format=function(e,t){return t.cmdFormatter(this.cmdStr,Zt(e,null,t,this.separator))},e.prototype.formatRange=function(e,t,n){return n.cmdFormatter(this.cmdStr,Zt(e,t,n,this.separator))},e}(),Ni=function(){function e(e){this.func=e}return e.prototype.format=function(e,t){return this.func(Zt(e,null,t))},e.prototype.formatRange=function(e,t,n){return this.func(Zt(e,t,n))},e}(),zi=function(){function e(e,t){this.calendar=e,this.internalEventSource=t}return e.prototype.remove=function(){this.calendar.dispatch({type:"REMOVE_EVENT_SOURCE",sourceId:this.internalEventSource.sourceId})},e.prototype.refetch=function(){this.calendar.dispatch({type:"FETCH_EVENT_SOURCES",sourceIds:[this.internalEventSource.sourceId]})},Object.defineProperty(e.prototype,"id",{get:function(){return this.internalEventSource.publicId},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"url",{get:function(){return this.internalEventSource.meta.url},enumerable:!0,configurable:!0}),e}(),Ui=function(){function e(e,t,n){this._calendar=e,this._def=t,this._instance=n||null}return e.prototype.setProp=function(e,t){var n,r;if(e in Ai);else if(e in Bi)"function"==typeof Bi[e]&&(t=Bi[e](t)),this.mutate({standardProps:(n={},n[e]=t,n)});else if(e in Li){var i=void 0;"function"==typeof Li[e]&&(t=Li[e](t)),"color"===e?i={backgroundColor:t,borderColor:t}:"editable"===e?i={startEditable:t,durationEditable:t}:(r={},r[e]=t,i=r),this.mutate({standardProps:{ui:i}})}},e.prototype.setExtendedProp=function(e,t){var n;this.mutate({extendedProps:(n={},n[e]=t,n)})},e.prototype.setStart=function(e,t){void 0===t&&(t={});var n=this._calendar.dateEnv,r=n.createMarker(e);if(r&&this._instance){var i=this._instance.range,o=Qe(i.start,r,n,t.granularity),a=null;if(t.maintainDuration){a=ve(Qe(i.start,i.end,n,t.granularity),Qe(r,i.end,n,t.granularity))}this.mutate({startDelta:o,endDelta:a})}},e.prototype.setEnd=function(e,t){void 0===t&&(t={});var n,r=this._calendar.dateEnv;if((null==e||(n=r.createMarker(e)))&&this._instance)if(n){var i=Qe(this._instance.range.end,n,r,t.granularity);this.mutate({endDelta:i})}else this.mutate({standardProps:{hasEnd:!1}})},e.prototype.setDates=function(e,t,n){void 0===n&&(n={});var r,i=this._calendar.dateEnv,o={allDay:n.allDay},a=i.createMarker(e);if(a&&(null==t||(r=i.createMarker(t)))&&this._instance){var s=this._instance.range;!0===n.allDay&&(s=Xe(s));var u=Qe(s.start,a,i,n.granularity);if(r){var l=Qe(s.end,r,i,n.granularity);this.mutate({startDelta:u,endDelta:l,standardProps:o})}else o.hasEnd=!1,this.mutate({startDelta:u,standardProps:o})}},e.prototype.moveStart=function(e){var t=ue(e);t&&this.mutate({startDelta:t})},e.prototype.moveEnd=function(e){var t=ue(e);t&&this.mutate({endDelta:t})},e.prototype.moveDates=function(e){var t=ue(e);t&&this.mutate({startDelta:t,endDelta:t})},e.prototype.setAllDay=function(e,t){void 0===t&&(t={});var n={allDay:e},r=t.maintainDuration;null==r&&(r=this._calendar.opt("allDayMaintainDuration")),this._def.allDay!==e&&(n.hasEnd=r),this.mutate({standardProps:n})},e.prototype.formatRange=function(e){var t=this._calendar.dateEnv,n=this._instance,r=Bt(e,this._calendar.opt("defaultRangeSeparator"));return this._def.hasEnd?t.formatRange(n.range.start,n.range.end,r,{forcedStartTzo:n.forcedStartTzo,forcedEndTzo:n.forcedEndTzo}):t.format(n.range.start,r,{forcedTzo:n.forcedStartTzo})},e.prototype.mutate=function(e){var t=this._def,n=this._instance;if(n){this._calendar.dispatch({type:"MUTATE_EVENTS",instanceId:n.instanceId,mutation:e,fromApi:!0});var r=this._calendar.state.eventStore;this._def=r.defs[t.defId],this._instance=r.instances[n.instanceId]}},e.prototype.remove=function(){this._calendar.dispatch({type:"REMOVE_EVENT_DEF",defId:this._def.defId})},Object.defineProperty(e.prototype,"source",{get:function(){var e=this._def.sourceId;return e?new zi(this._calendar,this._calendar.state.eventSources[e]):null},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"start",{get:function(){return this._instance?this._calendar.dateEnv.toDate(this._instance.range.start):null},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"end",{get:function(){return this._instance&&this._def.hasEnd?this._calendar.dateEnv.toDate(this._instance.range.end):null},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"id",{get:function(){return this._def.publicId},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"groupId",{get:function(){return this._def.groupId},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"allDay",{get:function(){return this._def.allDay},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"title",{get:function(){return this._def.title},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"url",{get:function(){return this._def.url},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"rendering",{get:function(){return this._def.rendering},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"startEditable",{get:function(){return this._def.ui.startEditable},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"durationEditable",{get:function(){return this._def.ui.durationEditable},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"constraint",{get:function(){return this._def.ui.constraints[0]||null},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"overlap",{get:function(){return this._def.ui.overlap},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"allow",{get:function(){return this._def.ui.allows[0]||null},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"backgroundColor",{get:function(){return this._def.ui.backgroundColor},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"borderColor",{get:function(){return this._def.ui.borderColor},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"textColor",{get:function(){return this._def.ui.textColor},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"classNames",{get:function(){return this._def.ui.classNames},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"extendedProps",{get:function(){return this._def.extendedProps},enumerable:!0,configurable:!0}),e}(),Li={editable:Boolean,startEditable:Boolean,durationEditable:Boolean,constraint:null,overlap:null,allow:null,className:Rn,classNames:Rn,color:String,backgroundColor:String,borderColor:String,textColor:String},Vi={startEditable:null,durationEditable:null,constraints:[],overlap:null,allows:[],backgroundColor:"",borderColor:"",textColor:"",classNames:[]},Bi={id:String,groupId:String,title:String,url:String,rendering:String,extendedProps:null},Ai={start:null,date:null,end:null,allDay:null},Fi=0,Wi={startTime:"09:00",endTime:"17:00",daysOfWeek:[1,2,3,4,5],rendering:"inverse-background",classNames:"fc-nonbusiness",groupId:"_businessHours"},Zi=vt(),ji=function(){function e(){this.getKeysForEventDefs=kt(this._getKeysForEventDefs),this.splitDateSelection=kt(this._splitDateSpan),this.splitEventStore=kt(this._splitEventStore),this.splitIndividualUi=kt(this._splitIndividualUi),this.splitEventDrag=kt(this._splitInteraction),this.splitEventResize=kt(this._splitInteraction),this.eventUiBuilders={}}return e.prototype.splitProps=function(e){var t=this,n=this.getKeyInfo(e),r=this.getKeysForEventDefs(e.eventStore),i=this.splitDateSelection(e.dateSelection),o=this.splitIndividualUi(e.eventUiBases,r),a=this.splitEventStore(e.eventStore,r),s=this.splitEventDrag(e.eventDrag),u=this.splitEventResize(e.eventResize),l={};this.eventUiBuilders=it(n,function(e,n){return t.eventUiBuilders[n]||kt(Bn)});for(var c in n){var d=n[c],f=a[c]||Zi,p=this.eventUiBuilders[c];l[c]={businessHours:d.businessHours||e.businessHours,dateSelection:i[c]||null,eventStore:f,eventUiBases:p(e.eventUiBases[""],d.ui,o[c]),eventSelection:f.instances[e.eventSelection]?e.eventSelection:"",eventDrag:s[c]||null,eventResize:u[c]||null}}return l},e.prototype._splitDateSpan=function(e){var t={};if(e)for(var n=this.getKeysForDateSpan(e),r=0,i=n;r<i.length;r++){var o=i[r];t[o]=e}return t},e.prototype._getKeysForEventDefs=function(e){var t=this;return it(e.defs,function(e){return t.getKeysForEventDef(e)})},e.prototype._splitEventStore=function(e,t){var n=e.defs,r=e.instances,i={};for(var o in n)for(var a=0,s=t[o];a<s.length;a++){var u=s[a];i[u]||(i[u]=vt()),i[u].defs[o]=n[o]}for(var l in r)for(var c=r[l],d=0,f=t[c.defId];d<f.length;d++){var u=f[d];i[u]&&(i[u].instances[l]=c)}return i},e.prototype._splitIndividualUi=function(e,t){var n={};for(var r in e)if(r)for(var i=0,o=t[r];i<o.length;i++){var a=o[i];n[a]||(n[a]={}),n[a][r]=e[r]}return n},e.prototype._splitInteraction=function(e){var t={};if(e){var n=this._splitEventStore(e.affectedEvents,this._getKeysForEventDefs(e.affectedEvents)),r=this._getKeysForEventDefs(e.mutatedEvents),i=this._splitEventStore(e.mutatedEvents,r),o=function(r){t[r]||(t[r]={affectedEvents:n[r]||Zi,mutatedEvents:i[r]||Zi,isEvent:e.isEvent,origSeg:e.origSeg})};for(var a in n)o(a);for(var a in i)o(a)}return t},e}(),Yi=function(){function e(){}return e.mixInto=function(e){this.mixIntoObj(e.prototype)},e.mixIntoObj=function(e){var t=this;Object.getOwnPropertyNames(this.prototype).forEach(function(n){e[n]||(e[n]=t.prototype[n])})},e.mixOver=function(e){var t=this;Object.getOwnPropertyNames(this.prototype).forEach(function(n){e.prototype[n]=t.prototype[n]})},e}(),qi=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return $e(t,e),t.prototype.on=function(e,t){return jn(this._handlers||(this._handlers={}),e,t),this},t.prototype.one=function(e,t){return jn(this._oneHandlers||(this._oneHandlers={}),e,t),this},t.prototype.off=function(e,t){return this._handlers&&Yn(this._handlers,e,t),this._oneHandlers&&Yn(this._oneHandlers,e,t),this},t.prototype.trigger=function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];return this.triggerWith(e,this,t),this},t.prototype.triggerWith=function(e,t,n){return this._handlers&&je(this._handlers[e],t,n),this._oneHandlers&&(je(this._oneHandlers[e],t,n),delete this._oneHandlers[e]),this},t.prototype.hasHandlers=function(e){return this._handlers&&this._handlers[e]&&this._handlers[e].length||this._oneHandlers&&this._oneHandlers[e]&&this._oneHandlers[e].length},t}(Yi),Gi=function(){function e(e,t,n,r){this.originEl=e,this.els=t,this.isHorizontal=n,this.isVertical=r}return e.prototype.build=function(){var e=this.originEl,t=this.originClientRect=e.getBoundingClientRect();this.isHorizontal&&this.buildElHorizontals(t.left),this.isVertical&&this.buildElVerticals(t.top)},e.prototype.buildElHorizontals=function(e){for(var t=[],n=[],r=0,i=this.els;r<i.length;r++){var o=i[r],a=o.getBoundingClientRect();t.push(a.left-e),n.push(a.right-e)}this.lefts=t,this.rights=n},e.prototype.buildElVerticals=function(e){for(var t=[],n=[],r=0,i=this.els;r<i.length;r++){var o=i[r],a=o.getBoundingClientRect();t.push(a.top-e),n.push(a.bottom-e)}this.tops=t,this.bottoms=n},e.prototype.leftToIndex=function(e){var t,n=this.lefts,r=this.rights,i=n.length;for(t=0;t<i;t++)if(e>=n[t]&&e<r[t])return t},e.prototype.topToIndex=function(e){var t,n=this.tops,r=this.bottoms,i=n.length;for(t=0;t<i;t++)if(e>=n[t]&&e<r[t])return t},e.prototype.getWidth=function(e){return this.rights[e]-this.lefts[e]},e.prototype.getHeight=function(e){return this.bottoms[e]-this.tops[e]},e}(),Xi=function(){function e(){}return e.prototype.getMaxScrollTop=function(){return this.getScrollHeight()-this.getClientHeight()},e.prototype.getMaxScrollLeft=function(){return this.getScrollWidth()-this.getClientWidth()},e.prototype.canScrollVertically=function(){return this.getMaxScrollTop()>0},e.prototype.canScrollHorizontally=function(){return this.getMaxScrollLeft()>0},e.prototype.canScrollUp=function(){return this.getScrollTop()>0},e.prototype.canScrollDown=function(){return this.getScrollTop()<this.getMaxScrollTop()},e.prototype.canScrollLeft=function(){return this.getScrollLeft()>0},e.prototype.canScrollRight=function(){return this.getScrollLeft()<this.getMaxScrollLeft()},e}(),Ji=function(e){function t(t){var n=e.call(this)||this;return n.el=t,n}return $e(t,e),t.prototype.getScrollTop=function(){return this.el.scrollTop},t.prototype.getScrollLeft=function(){return this.el.scrollLeft},t.prototype.setScrollTop=function(e){this.el.scrollTop=e},t.prototype.setScrollLeft=function(e){this.el.scrollLeft=e},t.prototype.getScrollWidth=function(){return this.el.scrollWidth},t.prototype.getScrollHeight=function(){return this.el.scrollHeight},t.prototype.getClientHeight=function(){return this.el.clientHeight},t.prototype.getClientWidth=function(){return this.el.clientWidth},t}(Xi),Ki=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return $e(t,e),t.prototype.getScrollTop=function(){return window.pageYOffset},t.prototype.getScrollLeft=function(){return window.pageXOffset},t.prototype.setScrollTop=function(e){window.scroll(window.pageXOffset,e)},t.prototype.setScrollLeft=function(e){window.scroll(e,window.pageYOffset)},t.prototype.getScrollWidth=function(){return document.documentElement.scrollWidth},t.prototype.getScrollHeight=function(){return document.documentElement.scrollHeight},t.prototype.getClientHeight=function(){return document.documentElement.clientHeight},t.prototype.getClientWidth=function(){return document.documentElement.clientWidth},t}(Xi),Qi=function(e){
    function n(n,r){var i=e.call(this,t("div",{className:"fc-scroller"}))||this;return i.overflowX=n,i.overflowY=r,i.applyOverflow(),i}return $e(n,e),n.prototype.clear=function(){this.setHeight("auto"),this.applyOverflow()},n.prototype.destroy=function(){c(this.el)},n.prototype.applyOverflow=function(){g(this.el,{overflowX:this.overflowX,overflowY:this.overflowY})},n.prototype.lockOverflow=function(e){var t=this.overflowX,n=this.overflowY;e=e||this.getScrollbarWidths(),"auto"===t&&(t=e.bottom||this.canScrollHorizontally()?"scroll":"hidden"),"auto"===n&&(n=e.left||e.right||this.canScrollVertically()?"scroll":"hidden"),g(this.el,{overflowX:t,overflowY:n})},n.prototype.setHeight=function(e){y(this.el,"height",e)},n.prototype.getScrollbarWidths=function(){var e=C(this.el);return{left:e.scrollbarLeft,right:e.scrollbarRight,bottom:e.scrollbarBottom}},n}(Ji),$i=function(){function e(e){this.calendarOptions=e,this.processIconOverride()}return e.prototype.processIconOverride=function(){this.iconOverrideOption&&this.setIconOverride(this.calendarOptions[this.iconOverrideOption])},e.prototype.setIconOverride=function(e){var t,n;if("object"==typeof e&&e){t=wi({},this.iconClasses);for(n in e)t[n]=this.applyIconOverridePrefix(e[n]);this.iconClasses=t}else!1===e&&(this.iconClasses={})},e.prototype.applyIconOverridePrefix=function(e){var t=this.iconOverridePrefix;return t&&0!==e.indexOf(t)&&(e=t+e),e},e.prototype.getClass=function(e){return this.classes[e]||""},e.prototype.getIconClass=function(e){var t=this.iconClasses[e];return t?this.baseIconClass+" "+t:""},e.prototype.getCustomButtonIconClass=function(e){var t;return this.iconOverrideCustomButtonOption&&(t=e[this.iconOverrideCustomButtonOption])?this.baseIconClass+" "+this.applyIconOverridePrefix(t):""},e}();$i.prototype.classes={},$i.prototype.iconClasses={},$i.prototype.baseIconClass="",$i.prototype.iconOverridePrefix="";var eo=0,to=function(){function e(e,t){t&&(e.view=this),this.uid=String(eo++),this.context=e,this.dateEnv=e.dateEnv,this.theme=e.theme,this.view=e.view,this.calendar=e.calendar,this.isRtl="rtl"===this.opt("dir")}return e.addEqualityFuncs=function(e){this.prototype.equalityFuncs=wi({},this.prototype.equalityFuncs,e)},e.prototype.opt=function(e){return this.context.options[e]},e.prototype.receiveProps=function(e){var t=qn(this.props||{},e,this.equalityFuncs),n=t.anyChanges,r=t.comboProps;this.props=r,n&&this.render(r)},e.prototype.render=function(e){},e.prototype.destroy=function(){},e}();to.prototype.equalityFuncs={};var no=function(e){function t(t,n,r){var i=e.call(this,t,r)||this;return i.el=n,i}return $e(t,e),t.prototype.destroy=function(){e.prototype.destroy.call(this),c(this.el)},t.prototype.buildPositionCaches=function(){},t.prototype.queryHit=function(e,t,n,r){return null},t.prototype.isInteractionValid=function(e){var t=this.calendar,n=this.props.dateProfile,r=e.mutatedEvents.instances;if(n)for(var i in r)if(!wt(n.validRange,r[i].range))return!1;return dn(e,t)},t.prototype.isDateSelectionValid=function(e){var t=this.props.dateProfile;return!(t&&!wt(t.validRange,e.range))&&fn(e,this.calendar)},t.prototype.publiclyTrigger=function(e,t){return this.calendar.publiclyTrigger(e,t)},t.prototype.publiclyTriggerAfterSizing=function(e,t){return this.calendar.publiclyTriggerAfterSizing(e,t)},t.prototype.hasPublicHandlers=function(e){return this.calendar.hasPublicHandlers(e)},t.prototype.triggerRenderedSegs=function(e,t){var n=this.calendar;if(this.hasPublicHandlers("eventPositioned"))for(var r=0,i=e;r<i.length;r++){var o=i[r];this.publiclyTriggerAfterSizing("eventPositioned",[{event:new Ui(n,o.eventRange.def,o.eventRange.instance),isMirror:t,isStart:o.isStart,isEnd:o.isEnd,el:o.el,view:this}])}n.state.loadingLevel||(n.afterSizingTriggers._eventsPositioned=[null])},t.prototype.triggerWillRemoveSegs=function(e,t){for(var n=this.calendar,r=0,i=e;r<i.length;r++){var o=i[r];n.trigger("eventElRemove",o.el)}if(this.hasPublicHandlers("eventDestroy"))for(var a=0,s=e;a<s.length;a++){var o=s[a];this.publiclyTrigger("eventDestroy",[{event:new Ui(n,o.eventRange.def,o.eventRange.instance),isMirror:t,el:o.el,view:this}])}},t.prototype.isValidSegDownEl=function(e){return!this.props.eventDrag&&!this.props.eventResize&&!d(e,".fc-mirror")&&(this.isPopover()||!this.isInPopover(e))},t.prototype.isValidDateDownEl=function(e){var t=d(e,this.fgSegSelector);return(!t||t.classList.contains("fc-mirror"))&&!d(e,".fc-more")&&!d(e,"a[data-goto]")&&!this.isInPopover(e)},t.prototype.isPopover=function(){return this.el.classList.contains("fc-popover")},t.prototype.isInPopover=function(e){return Boolean(d(e,".fc-popover"))},t}(to);no.prototype.fgSegSelector=".fc-event-container > *",no.prototype.bgSegSelector=".fc-bgevent:not(.fc-nonbusiness)";var ro=0,io=function(){function e(){this.hooks={reducers:[],eventDefParsers:[],eventDragMutationMassagers:[],eventDefMutationAppliers:[],dateSelectionTransformers:[],datePointTransforms:[],dateSpanTransforms:[],views:{},viewPropsTransformers:[],isPropsValid:null,externalDefTransforms:[],eventResizeJoinTransforms:[],viewContainerModifiers:[],eventDropTransformers:[],componentInteractions:[],calendarInteractions:[],themeClasses:{},eventSourceDefs:[],cmdFormatter:null,recurringTypes:[],namedTimeZonedImpl:null,defaultView:"",elementDraggingImpl:null,optionChangeHandlers:{}},this.addedHash={}}return e.prototype.add=function(e){if(!this.addedHash[e.id]){this.addedHash[e.id]=!0;for(var t=0,n=e.deps;t<n.length;t++){var r=n[t];this.add(r)}this.hooks=Xn(this.hooks,e)}},e}(),oo={ignoreRange:!0,parseMeta:function(e){return Array.isArray(e)?e:Array.isArray(e.events)?e.events:null},fetch:function(e,t){t({rawEvents:e.eventSource.meta})}},ao=Gn({eventSourceDefs:[oo]}),so={parseMeta:function(e){return"function"==typeof e?e:"function"==typeof e.events?e.events:null},fetch:function(e,t,n){var r=e.calendar.dateEnv;Zn(e.eventSource.meta.bind(null,{start:r.toDate(e.range.start),end:r.toDate(e.range.end),startStr:r.formatIso(e.range.start),endStr:r.formatIso(e.range.end),timeZone:r.timeZone}),function(e){t({rawEvents:e})},n)}},uo=Gn({eventSourceDefs:[so]}),lo={parseMeta:function(e){if("string"==typeof e)e={url:e};else if(!e||"object"!=typeof e||!e.url)return null;return{url:e.url,method:(e.method||"GET").toUpperCase(),extraParams:e.extraParams,startParam:e.startParam,endParam:e.endParam,timeZoneParam:e.timeZoneParam}},fetch:function(e,t,n){var r=e.eventSource.meta,i=$n(r,e.range,e.calendar);Jn(r.method,r.url,i,function(e,n){t({rawEvents:e,xhr:n})},function(e,t){n({message:e,xhr:t})})}},co=Gn({eventSourceDefs:[lo]}),fo={parse:function(e,t,n){var r=n.createMarker.bind(n),i={daysOfWeek:null,startTime:ue,endTime:ue,startRecur:r,endRecur:r},o=Ge(e,i,{},t),a=!1;for(var s in o)if(null!=o[s]){a=!0;break}if(a){var u=null;return"duration"in t&&(u=ue(t.duration),delete t.duration),!u&&o.startTime&&o.endTime&&(u=ve(o.endTime,o.startTime)),{allDayGuess:Boolean(!o.startTime&&!o.endTime),duration:u,typeData:o}}return null},expand:function(e,t,n){var r=bt(t,{start:e.startRecur,end:e.endRecur});return r?er(e.daysOfWeek,e.startTime,r,n):[]}},po=Gn({recurringTypes:[fo]}),ho=Gn({optionChangeHandlers:{events:function(e,t,n){tr([e],t,n)},eventSources:tr,plugins:nr}}),vo={},go={defaultRangeSeparator:" - ",titleRangeSeparator:" – ",defaultTimedEventDuration:"01:00:00",defaultAllDayEventDuration:{day:1},forceEventDuration:!1,nextDayThreshold:"00:00:00",columnHeader:!0,defaultView:"",aspectRatio:1.35,header:{left:"title",center:"",right:"today prev,next"},weekends:!0,weekNumbers:!1,weekNumberCalculation:"local",editable:!1,scrollTime:"06:00:00",minTime:"00:00:00",maxTime:"24:00:00",showNonCurrentDates:!0,lazyFetching:!0,startParam:"start",endParam:"end",timeZoneParam:"timeZone",timeZone:"local",locales:[],locale:"",timeGridEventMinHeight:0,themeSystem:"standard",dragRevertDuration:500,dragScroll:!0,allDayMaintainDuration:!1,unselectAuto:!0,dropAccept:"*",eventOrder:"start,-duration,allDay,title",eventLimit:!1,eventLimitClick:"popover",dayPopoverFormat:{month:"long",day:"numeric",year:"numeric"},handleWindowResize:!0,windowResizeDelay:100,longPressDelay:1e3,eventDragMinDistance:5},yo={header:{left:"next,prev today",center:"",right:"title"},buttonIcons:{prev:"fc-icon-chevron-right",next:"fc-icon-chevron-left",prevYear:"fc-icon-chevrons-right",nextYear:"fc-icon-chevrons-left"}},mo=["header","footer","buttonText","buttonIcons"],Eo=[ao,uo,co,po,ho],So={code:"en",week:{dow:0,doy:4},dir:"ltr",buttonText:{prev:"prev",next:"next",prevYear:"prev year",nextYear:"next year",year:"year",today:"today",month:"month",week:"week",day:"day",list:"list"},weekLabel:"W",allDayText:"all-day",eventLimitText:"more",noEventsMessage:"No events to display"},bo=function(){function e(e){this.overrides=wi({},e),this.dynamicOverrides={},this.compute()}return e.prototype.mutate=function(e,t,n){var r=n?this.dynamicOverrides:this.overrides;wi(r,e);for(var i=0,o=t;i<o.length;i++){delete r[o[i]]}this.compute()},e.prototype.compute=function(){var e=Ye(this.dynamicOverrides.locales,this.overrides.locales,go.locales),t=Ye(this.dynamicOverrides.locale,this.overrides.locale,go.locale),n=or(e),r=ar(t||n.defaultCode,n.map).options,i=Ye(this.dynamicOverrides.dir,this.overrides.dir,r.dir),o="rtl"===i?yo:{};this.dirDefaults=o,this.localeDefaults=r,this.computed=rr([go,o,r,this.overrides,this.dynamicOverrides])},e}(),To={},Do=function(){function e(){}return e.prototype.getMarkerYear=function(e){return e.getUTCFullYear()},e.prototype.getMarkerMonth=function(e){return e.getUTCMonth()},e.prototype.getMarkerDay=function(e){return e.getUTCDate()},e.prototype.arrayToMarker=function(e){return oe(e)},e.prototype.markerToArray=function(e){return ie(e)},e}();!function(e,t){To[e]=t}("gregory",Do);var wo=/^\s*(\d{4})(-(\d{2})(-(\d{2})([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/,Ro=function(){function e(e){var t=this.timeZone=e.timeZone,n="local"!==t&&"UTC"!==t;e.namedTimeZoneImpl&&n&&(this.namedTimeZoneImpl=new e.namedTimeZoneImpl(t)),this.canComputeOffset=Boolean(!n||this.namedTimeZoneImpl),this.calendarSystem=cr(e.calendarSystem),this.locale=e.locale,this.weekDow=e.locale.week.dow,this.weekDoy=e.locale.week.doy,"ISO"===e.weekNumberCalculation?(this.weekDow=1,this.weekDoy=4):"number"==typeof e.firstDay&&(this.weekDow=e.firstDay),"function"==typeof e.weekNumberCalculation&&(this.weekNumberFunc=e.weekNumberCalculation),this.weekLabel=null!=e.weekLabel?e.weekLabel:e.locale.options.weekLabel,this.cmdFormatter=e.cmdFormatter}return e.prototype.createMarker=function(e){var t=this.createMarkerMeta(e);return null===t?null:t.marker},e.prototype.createNowMarker=function(){return this.canComputeOffset?this.timestampToMarker((new Date).valueOf()):oe(ne(new Date))},e.prototype.createMarkerMeta=function(e){if("string"==typeof e)return this.parse(e);var t=null;return"number"==typeof e?t=this.timestampToMarker(e):e instanceof Date?(e=e.valueOf(),isNaN(e)||(t=this.timestampToMarker(e))):Array.isArray(e)&&(t=oe(e)),null!==t&&ae(t)?{marker:t,isTimeUnspecified:!1,forcedTzo:null}:null},e.prototype.parse=function(e){var t=dr(e);if(null===t)return null;var n=t.marker,r=null;return null!==t.timeZoneOffset&&(this.canComputeOffset?n=this.timestampToMarker(n.valueOf()-60*t.timeZoneOffset*1e3):r=t.timeZoneOffset),{marker:n,isTimeUnspecified:t.isTimeUnspecified,forcedTzo:r}},e.prototype.getYear=function(e){return this.calendarSystem.getMarkerYear(e)},e.prototype.getMonth=function(e){return this.calendarSystem.getMarkerMonth(e)},e.prototype.add=function(e,t){var n=this.calendarSystem.markerToArray(e);return n[0]+=t.years,n[1]+=t.months,n[2]+=t.days,n[6]+=t.milliseconds,this.calendarSystem.arrayToMarker(n)},e.prototype.subtract=function(e,t){var n=this.calendarSystem.markerToArray(e);return n[0]-=t.years,n[1]-=t.months,n[2]-=t.days,n[6]-=t.milliseconds,this.calendarSystem.arrayToMarker(n)},e.prototype.addYears=function(e,t){var n=this.calendarSystem.markerToArray(e);return n[0]+=t,this.calendarSystem.arrayToMarker(n)},e.prototype.addMonths=function(e,t){var n=this.calendarSystem.markerToArray(e);return n[1]+=t,this.calendarSystem.arrayToMarker(n)},e.prototype.diffWholeYears=function(e,t){var n=this.calendarSystem;return se(e)===se(t)&&n.getMarkerDay(e)===n.getMarkerDay(t)&&n.getMarkerMonth(e)===n.getMarkerMonth(t)?n.getMarkerYear(t)-n.getMarkerYear(e):null},e.prototype.diffWholeMonths=function(e,t){var n=this.calendarSystem;return se(e)===se(t)&&n.getMarkerDay(e)===n.getMarkerDay(t)?n.getMarkerMonth(t)-n.getMarkerMonth(e)+12*(n.getMarkerYear(t)-n.getMarkerYear(e)):null},e.prototype.greatestWholeUnit=function(e,t){var n=this.diffWholeYears(e,t);return null!==n?{unit:"year",value:n}:null!==(n=this.diffWholeMonths(e,t))?{unit:"month",value:n}:null!==(n=q(e,t))?{unit:"week",value:n}:null!==(n=G(e,t))?{unit:"day",value:n}:(n=W(e,t),Ze(n)?{unit:"hour",value:n}:(n=Z(e,t),Ze(n)?{unit:"minute",value:n}:(n=j(e,t),Ze(n)?{unit:"second",value:n}:{unit:"millisecond",value:t.valueOf()-e.valueOf()})))},e.prototype.countDurationsBetween=function(e,t,n){var r;return n.years&&null!==(r=this.diffWholeYears(e,t))?r/ye(n):n.months&&null!==(r=this.diffWholeMonths(e,t))?r/me(n):n.days&&null!==(r=G(e,t))?r/Ee(n):(t.valueOf()-e.valueOf())/Te(n)},e.prototype.startOf=function(e,t){return"year"===t?this.startOfYear(e):"month"===t?this.startOfMonth(e):"week"===t?this.startOfWeek(e):"day"===t?X(e):"hour"===t?J(e):"minute"===t?K(e):"second"===t?Q(e):void 0},e.prototype.startOfYear=function(e){return this.calendarSystem.arrayToMarker([this.calendarSystem.getMarkerYear(e)])},e.prototype.startOfMonth=function(e){return this.calendarSystem.arrayToMarker([this.calendarSystem.getMarkerYear(e),this.calendarSystem.getMarkerMonth(e)])},e.prototype.startOfWeek=function(e){return this.calendarSystem.arrayToMarker([this.calendarSystem.getMarkerYear(e),this.calendarSystem.getMarkerMonth(e),e.getUTCDate()-(e.getUTCDay()-this.weekDow+7)%7])},e.prototype.computeWeekNumber=function(e){return this.weekNumberFunc?this.weekNumberFunc(this.toDate(e)):$(e,this.weekDow,this.weekDoy)},e.prototype.format=function(e,t,n){return void 0===n&&(n={}),t.format({marker:e,timeZoneOffset:null!=n.forcedTzo?n.forcedTzo:this.offsetForMarker(e)},this)},e.prototype.formatRange=function(e,t,n,r){return void 0===r&&(r={}),r.isEndExclusive&&(t=B(t,-1)),n.formatRange({marker:e,timeZoneOffset:null!=r.forcedStartTzo?r.forcedStartTzo:this.offsetForMarker(e)},{marker:t,timeZoneOffset:null!=r.forcedEndTzo?r.forcedEndTzo:this.offsetForMarker(t)},this)},e.prototype.formatIso=function(e,t){void 0===t&&(t={});var n=null;return t.omitTimeZoneOffset||(n=null!=t.forcedTzo?t.forcedTzo:this.offsetForMarker(e)),At(e,n,t.omitTime)},e.prototype.timestampToMarker=function(e){return"local"===this.timeZone?oe(ne(new Date(e))):"UTC"!==this.timeZone&&this.namedTimeZoneImpl?oe(this.namedTimeZoneImpl.timestampToArray(e)):new Date(e)},e.prototype.offsetForMarker=function(e){return"local"===this.timeZone?-re(ie(e)).getTimezoneOffset():"UTC"===this.timeZone?0:this.namedTimeZoneImpl?this.namedTimeZoneImpl.offsetForArray(ie(e)):null},e.prototype.toDate=function(e,t){return"local"===this.timeZone?re(ie(e)):"UTC"===this.timeZone?new Date(e.valueOf()):this.namedTimeZoneImpl?new Date(e.valueOf()-1e3*this.namedTimeZoneImpl.offsetForArray(ie(e))*60):new Date(e.valueOf()-(t||0))},e}(),Io={id:String,allDayDefault:Boolean,eventDataTransform:Function,success:Function,failure:Function},Co=0,Mo=0,ko=function(){function e(e,t){this.viewSpec=e,this.options=e.options,this.dateEnv=t.dateEnv,this.calendar=t,this.initHiddenDays()}return e.prototype.buildPrev=function(e,t){var n=this.dateEnv,r=n.subtract(n.startOf(t,e.currentRangeUnit),e.dateIncrement);return this.build(r,-1)},e.prototype.buildNext=function(e,t){var n=this.dateEnv,r=n.add(n.startOf(t,e.currentRangeUnit),e.dateIncrement);return this.build(r,1)},e.prototype.build=function(e,t,n){void 0===n&&(n=!1);var r,i,o,a,s,u,l=null,c=null;return r=this.buildValidRange(),r=this.trimHiddenDays(r),n&&(e=It(e,r)),i=this.buildCurrentRangeInfo(e,t),o=/^(year|month|week|day)$/.test(i.unit),a=this.buildRenderRange(this.trimHiddenDays(i.range),i.unit,o),a=this.trimHiddenDays(a),s=a,this.options.showNonCurrentDates||(s=bt(s,i.range)),l=ue(this.options.minTime),c=ue(this.options.maxTime),s=this.adjustActiveRange(s,l,c),s=bt(s,r),u=Dt(i.range,r),{validRange:r,currentRange:i.range,currentRangeUnit:i.unit,isRangeAllDay:o,activeRange:s,renderRange:a,minTime:l,maxTime:c,isValid:u,dateIncrement:this.buildDateIncrement(i.duration)}},e.prototype.buildValidRange=function(){return this.getRangeOption("validRange",this.calendar.getNow())||{start:null,end:null}},e.prototype.buildCurrentRangeInfo=function(e,t){var n,r=this,i=r.viewSpec,o=r.dateEnv,a=null,s=null,u=null;return i.duration?(a=i.duration,s=i.durationUnit,u=this.buildRangeFromDuration(e,t,a,s)):(n=this.options.dayCount)?(s="day",u=this.buildRangeFromDayCount(e,t,n)):(u=this.buildCustomVisibleRange(e))?s=o.greatestWholeUnit(u.start,u.end).unit:(a=this.getFallbackDuration(),s=we(a).unit,u=this.buildRangeFromDuration(e,t,a,s)),{duration:a,unit:s,range:u}},e.prototype.getFallbackDuration=function(){return ue({day:1})},e.prototype.adjustActiveRange=function(e,t,n){var r=this.dateEnv,i=e.start,o=e.end;return this.viewSpec.class.prototype.usesMinMaxTime&&(Ee(t)<0&&(i=X(i),i=r.add(i,t)),Ee(n)>1&&(o=X(o),o=V(o,-1),o=r.add(o,n))),{start:i,end:o}},e.prototype.buildRangeFromDuration=function(e,t,n,r){function i(){s=c.startOf(e,d),u=c.add(s,n),l={start:s,end:u}}var o,a,s,u,l,c=this.dateEnv,d=this.options.dateAlignment;return d||(o=this.options.dateIncrement,o?(a=ue(o),d=Te(a)<Te(n)?we(a,!de(o)).unit:r):d=r),Ee(n)<=1&&this.isHiddenDay(s)&&(s=this.skipHiddenDays(s,t),s=X(s)),i(),this.trimHiddenDays(l)||(e=this.skipHiddenDays(e,t),i()),l},e.prototype.buildRangeFromDayCount=function(e,t,n){var r,i=this.dateEnv,o=this.options.dateAlignment,a=0,s=e;o&&(s=i.startOf(s,o)),s=X(s),s=this.skipHiddenDays(s,t),r=s;do{r=V(r,1),this.isHiddenDay(r)||a++}while(a<n);return{start:s,end:r}},e.prototype.buildCustomVisibleRange=function(e){var t=this.dateEnv,n=this.getRangeOption("visibleRange",t.toDate(e));return!n||null!=n.start&&null!=n.end?n:null},e.prototype.buildRenderRange=function(e,t,n){return e},e.prototype.buildDateIncrement=function(e){var t,n=this.options.dateIncrement;return n?ue(n):(t=this.options.dateAlignment)?ue(1,t):e||ue({days:1})},e.prototype.getRangeOption=function(e){for(var t=[],n=1;n<arguments.length;n++)t[n-1]=arguments[n];var r=this.options[e];return"function"==typeof r&&(r=r.apply(null,t)),r&&(r=mt(r,this.dateEnv)),r&&(r=Je(r)),r},e.prototype.initHiddenDays=function(){var e,t=this.options.hiddenDays||[],n=[],r=0;for(!1===this.options.weekends&&t.push(0,6),e=0;e<7;e++)(n[e]=-1!==t.indexOf(e))||r++;if(!r)throw new Error("invalid hiddenDays");this.isHiddenDayHash=n},e.prototype.trimHiddenDays=function(e){var t=e.start,n=e.end;return t&&(t=this.skipHiddenDays(t)),n&&(n=this.skipHiddenDays(n,-1,!0)),null==t||null==n||t<n?{start:t,end:n}:null},e.prototype.isHiddenDay=function(e){return e instanceof Date&&(e=e.getUTCDay()),this.isHiddenDayHash[e]},e.prototype.skipHiddenDays=function(e,t,n){for(void 0===t&&(t=1),void 0===n&&(n=!1);this.isHiddenDayHash[(e.getUTCDay()+(n?t:0)+7)%7];)e=V(e,t);return e},e}(),Oo={start:null,end:null,allDay:Boolean},_o={type:String,class:null},Po=function(e){function r(n,r){var i=e.call(this,n)||this;return i._renderLayout=Vn(i.renderLayout,i.unrenderLayout),i._updateTitle=Vn(i.updateTitle,null,[i._renderLayout]),i._updateActiveButton=Vn(i.updateActiveButton,null,[i._renderLayout]),i._updateToday=Vn(i.updateToday,null,[i._renderLayout]),i._updatePrev=Vn(i.updatePrev,null,[i._renderLayout]),i._updateNext=Vn(i.updateNext,null,[i._renderLayout]),i.el=t("div",{className:"fc-toolbar "+r}),i}return $e(r,e),r.prototype.destroy=function(){e.prototype.destroy.call(this),this._renderLayout.unrender(),c(this.el)},r.prototype.render=function(e){this._renderLayout(e.layout),this._updateTitle(e.title),this._updateActiveButton(e.activeButton),this._updateToday(e.isTodayEnabled),this._updatePrev(e.isPrevEnabled),this._updateNext(e.isNextEnabled)},r.prototype.renderLayout=function(e){var t=this.el;this.viewsWithButtons=[],a(t,this.renderSection("left",e.left)),a(t,this.renderSection("center",e.center)),a(t,this.renderSection("right",e.right))},r.prototype.unrenderLayout=function(){this.el.innerHTML=""},r.prototype.renderSection=function(e,r){var i=this,o=this,s=o.theme,u=o.calendar,l=u.optionsManager,c=u.viewSpecs,d=t("div",{className:"fc-"+e}),f=l.computed.customButtons||{},p=l.overrides.buttonText||{},h=l.computed.buttonText||{};return r&&r.split(" ").forEach(function(e,t){var r,o=[],l=!0;if(e.split(",").forEach(function(e,t){var r,a,d,v,g,y,m,E,S;"title"===e?(o.push(n("<h2>&nbsp;</h2>")),l=!1):((r=f[e])?(d=function(e){r.click&&r.click.call(E,e)},(v=s.getCustomButtonIconClass(r))||(v=s.getIconClass(e))||(g=r.text)):(a=c[e])?(i.viewsWithButtons.push(e),d=function(){u.changeView(e)},(g=a.buttonTextOverride)||(v=s.getIconClass(e))||(g=a.buttonTextDefault)):u[e]&&(d=function(){u[e]()},(g=p[e])||(v=s.getIconClass(e))||(g=h[e])),d&&(m=["fc-"+e+"-button",s.getClass("button")],g?(y=Tn(g),S=""):v&&(y="<span class='"+v+"'></span>",S=' aria-label="'+e+'"'),E=n('<button type="button" class="'+m.join(" ")+'"'+S+">"+y+"</button>"),E.addEventListener("click",d),o.push(E)))}),o.length>1){r=document.createElement("div");var v=s.getClass("buttonGroup");l&&v&&r.classList.add(v),a(r,o),d.appendChild(r)}else a(d,o)}),d},r.prototype.updateToday=function(e){this.toggleButtonEnabled("today",e)},r.prototype.updatePrev=function(e){this.toggleButtonEnabled("prev",e)},r.prototype.updateNext=function(e){this.toggleButtonEnabled("next",e)},r.prototype.updateTitle=function(e){p(this.el,"h2").forEach(function(t){t.innerText=e})},r.prototype.updateActiveButton=function(e){var t=this.theme.getClass("buttonActive");p(this.el,"button").forEach(function(n){e&&n.classList.contains("fc-"+e+"-button")?n.classList.add(t):n.classList.remove(t)})},r.prototype.toggleButtonEnabled=function(e,t){p(this.el,".fc-"+e+"-button").forEach(function(e){e.disabled=!t})},r}(to),xo=function(e){function n(n,r){var i=e.call(this,n)||this;i._renderToolbars=Vn(i.renderToolbars),i.buildViewPropTransformers=kt(Kr),i.el=r,s(r,i.contentEl=t("div",{className:"fc-view-container"}));for(var o=i.calendar,a=0,u=o.pluginSystem.hooks.viewContainerModifiers;a<u.length;a++){(0,u[a])(i.contentEl,o)}return i.toggleElClassNames(!0),i.computeTitle=kt(Xr),i.parseBusinessHours=kt(function(e){return Un(e,i.calendar)}),i}return $e(n,e),n.prototype.destroy=function(){this.header&&this.header.destroy(),this.footer&&this.footer.destroy(),this.view&&this.view.destroy(),c(this.contentEl),this.toggleElClassNames(!1),e.prototype.destroy.call(this)},n.prototype.toggleElClassNames=function(e){var t=this.el.classList,n="fc-"+this.opt("dir"),r=this.theme.getClass("widget");e?(t.add("fc"),t.add(n),t.add(r)):(t.remove("fc"),t.remove(n),t.remove(r))},n.prototype.render=function(e){this.freezeHeight();var t=this.computeTitle(e.dateProfile,e.viewSpec.options);this._renderToolbars(e.viewSpec,e.dateProfile,e.currentDate,e.dateProfileGenerator,t),this.renderView(e,t),this.updateSize(),this.thawHeight()},n.prototype.renderToolbars=function(e,t,n,r,i){var o=this.opt("header"),u=this.opt("footer"),l=this.calendar.getNow(),c=r.build(l),d=r.buildPrev(t,n),f=r.buildNext(t,n),p={title:i,activeButton:e.type,isTodayEnabled:c.isValid&&!Rt(t.currentRange,l),isPrevEnabled:d.isValid,isNextEnabled:f.isValid};o?(this.header||(this.header=new Po(this.context,"fc-header-toolbar"),s(this.el,this.header.el)),this.header.receiveProps(wi({layout:o},p))):this.header&&(this.header.destroy(),this.header=null),u?(this.footer||(this.footer=new Po(this.context,"fc-footer-toolbar"),a(this.el,this.footer.el)),this.footer.receiveProps(wi({layout:u},p))):this.footer&&(this.footer.destroy(),this.footer=null)},n.prototype.renderView=function(e,t){var n=this.view,r=e.viewSpec,i=e.dateProfileGenerator;n&&n.viewSpec===r?n.addScroll(n.queryScroll()):(n&&n.destroy(),n=this.view=new r.class({calendar:this.calendar,view:null,dateEnv:this.dateEnv,theme:this.theme,options:r.options},r,i,this.contentEl)),n.title=t;for(var o={dateProfile:e.dateProfile,businessHours:this.parseBusinessHours(r.options.businessHours),eventStore:e.eventStore,eventUiBases:e.eventUiBases,dateSelection:e.dateSelection,eventSelection:e.eventSelection,eventDrag:e.eventDrag,eventResize:e.eventResize},a=this.buildViewPropTransformers(this.calendar.pluginSystem.hooks.viewPropsTransformers),s=0,u=a;s<u.length;s++){var l=u[s];wi(o,l.transform(o,r,e,n))}n.receiveProps(o)},n.prototype.updateSize=function(e){void 0===e&&(e=!1);var t=this.view;e&&t.addScroll(t.queryScroll()),(e||null==this.isHeightAuto)&&this.computeHeightVars(),t.updateSize(e,this.viewHeight,this.isHeightAuto),t.updateNowIndicator(),t.popScroll(e)},n.prototype.computeHeightVars=function(){var e=this.calendar,t=e.opt("height"),n=e.opt("contentHeight");this.isHeightAuto="auto"===t||"auto"===n,this.viewHeight="number"==typeof n?n:"function"==typeof n?n():"number"==typeof t?t-this.queryToolbarsHeight():"function"==typeof t?t()-this.queryToolbarsHeight():"parent"===t?this.el.parentNode.offsetHeight-this.queryToolbarsHeight():Math.round(this.contentEl.offsetWidth/Math.max(e.opt("aspectRatio"),.5))},n.prototype.queryToolbarsHeight=function(){var e=0;return this.header&&(e+=_(this.header.el)),this.footer&&(e+=_(this.footer.el)),e},n.prototype.freezeHeight=function(){g(this.el,{height:this.el.offsetHeight,overflow:"hidden"})},n.prototype.thawHeight=function(){g(this.el,{height:"",overflow:""})},n}(to),Ho=function(){function e(e){this.component=e.component}return e.prototype.destroy=function(){},e}(),No={},zo=function(e){function t(t){var n=e.call(this,t)||this;n.handleSegClick=function(e,t){var r=n.component,i=Jt(t);if(i&&r.isValidSegDownEl(e.target)){var o=d(e.target,".fc-has-url"),a=o?o.querySelector("a[href]").href:"";r.publiclyTrigger("eventClick",[{el:t,event:new Ui(r.calendar,i.eventRange.def,i.eventRange.instance),jsEvent:e,view:r.view}]),a&&!e.defaultPrevented&&(window.location.href=a)}};var r=t.component;return n.destroy=N(r.el,"click",r.fgSegSelector+","+r.bgSegSelector,n.handleSegClick),n}return $e(t,e),t}(Ho),Uo=function(e){function t(t){var n=e.call(this,t)||this;n.handleEventElRemove=function(e){e===n.currentSegEl&&n.handleSegLeave(null,n.currentSegEl)},n.handleSegEnter=function(e,t){Jt(t)&&(t.classList.add("fc-allow-mouse-resize"),n.currentSegEl=t,n.triggerEvent("eventMouseEnter",e,t))},n.handleSegLeave=function(e,t){n.currentSegEl&&(t.classList.remove("fc-allow-mouse-resize"),n.currentSegEl=null,n.triggerEvent("eventMouseLeave",e,t))};var r=t.component;return n.removeHoverListeners=z(r.el,r.fgSegSelector+","+r.bgSegSelector,n.handleSegEnter,n.handleSegLeave),r.calendar.on("eventElRemove",n.handleEventElRemove),n}return $e(t,e),t.prototype.destroy=function(){this.removeHoverListeners(),this.component.calendar.off("eventElRemove",this.handleEventElRemove)},t.prototype.triggerEvent=function(e,t,n){var r=this.component,i=Jt(n);t&&!r.isValidSegDownEl(t.target)||r.publiclyTrigger(e,[{el:n,event:new Ui(this.component.calendar,i.eventRange.def,i.eventRange.instance),jsEvent:t,view:r.view}])},t}(Ho),Lo=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return $e(t,e),t}($i);Lo.prototype.classes={widget:"fc-unthemed",widgetHeader:"fc-widget-header",widgetContent:"fc-widget-content",buttonGroup:"fc-button-group",button:"fc-button fc-button-primary",buttonActive:"fc-button-active",popoverHeader:"fc-widget-header",popoverContent:"fc-widget-content",headerRow:"fc-widget-header",dayRow:"fc-widget-content",listView:"fc-widget-content"},Lo.prototype.baseIconClass="fc-icon",Lo.prototype.iconClasses={close:"fc-icon-x",prev:"fc-icon-chevron-left",next:"fc-icon-chevron-right",prevYear:"fc-icon-chevrons-left",nextYear:"fc-icon-chevrons-right"},Lo.prototype.iconOverrideOption="buttonIcons",Lo.prototype.iconOverrideCustomButtonOption="icon",Lo.prototype.iconOverridePrefix="fc-icon-";var Vo=function(){function e(e,t){var n=this;this.parseRawLocales=kt(or),this.buildLocale=kt(ar),this.buildDateEnv=kt(ei),this.buildTheme=kt(ti),this.buildEventUiSingleBase=kt(this._buildEventUiSingleBase),this.buildSelectionConfig=kt(this._buildSelectionConfig),this.buildEventUiBySource=Ot(ri,st),this.buildEventUiBases=kt(ii),this.interactionsStore={},this.actionQueue=[],this.isReducing=!1,this.needsRerender=!1,this.needsFullRerender=!1,this.isRendering=!1,this.renderingPauseDepth=0,this.buildDelayedRerender=kt(ni),this.afterSizingTriggers={},this.isViewUpdated=!1,this.isDatesUpdated=!1,this.isEventsUpdated=!1,this.el=e,this.optionsManager=new bo(t||{}),this.pluginSystem=new io,this.addPluginInputs(this.optionsManager.computed.plugins||[]),this.handleOptions(this.optionsManager.computed),this.publiclyTrigger("_init"),this.hydrate(),this.calendarInteractions=this.pluginSystem.hooks.calendarInteractions.map(function(e){return new e(n)})}return e.prototype.addPluginInputs=function(e){for(var t=ir(e),n=0,r=t;n<r.length;n++){var i=r[n];this.pluginSystem.add(i)}},Object.defineProperty(e.prototype,"view",{get:function(){return this.component?this.component.view:null},enumerable:!0,configurable:!0}),e.prototype.render=function(){this.component?this.requestRerender(!0):(this.renderableEventStore=vt(),this.bindHandlers(),this.executeRender())},e.prototype.destroy=function(){if(this.component){this.unbindHandlers(),this.component.destroy(),this.component=null;for(var e=0,t=this.calendarInteractions;e<t.length;e++){t[e].destroy()}this.publiclyTrigger("_destroyed")}},e.prototype.bindHandlers=function(){var e=this;this.removeNavLinkListener=N(this.el,"click","a[data-goto]",function(t,n){var r=n.getAttribute("data-goto");r=r?JSON.parse(r):{};var i=e.dateEnv,o=i.createMarker(r.date),a=r.type,s=e.viewOpt("navLink"+Ae(a)+"Click");"function"==typeof s?s(i.toDate(o),t):("string"==typeof s&&(a=s),e.zoomTo(o,a))}),this.opt("handleWindowResize")&&window.addEventListener("resize",this.windowResizeProxy=qe(this.windowResize.bind(this),this.opt("windowResizeDelay")))},e.prototype.unbindHandlers=function(){this.removeNavLinkListener(),this.windowResizeProxy&&(window.removeEventListener("resize",this.windowResizeProxy),this.windowResizeProxy=null)},e.prototype.hydrate=function(){var e=this;this.state=this.buildInitialState();var t=this.opt("eventSources")||[],n=this.opt("events"),r=[];n&&t.unshift(n);for(var i=0,o=t;i<o.length;i++){var a=o[i],s=pr(a,this);s&&r.push(s)}this.batchRendering(function(){e.dispatch({type:"INIT"}),e.dispatch({type:"ADD_EVENT_SOURCES",sources:r}),e.dispatch({type:"SET_VIEW_TYPE",viewType:e.opt("defaultView")||e.pluginSystem.hooks.defaultView})})},e.prototype.buildInitialState=function(){return{viewType:null,loadingLevel:0,eventSourceLoadingLevel:0,currentDate:this.getInitialDate(),dateProfile:null,eventSources:{},eventStore:vt(),dateSelection:null,eventSelection:"",eventDrag:null,eventResize:null}},e.prototype.dispatch=function(e){if(this.actionQueue.push(e),!this.isReducing){this.isReducing=!0;for(var t=this.state;this.actionQueue.length;)this.state=this.reduce(this.state,this.actionQueue.shift(),this);var n=this.state;this.isReducing=!1,!t.loadingLevel&&n.loadingLevel?this.publiclyTrigger("loading",[!0]):t.loadingLevel&&!n.loadingLevel&&this.publiclyTrigger("loading",[!1]);var r=this.component&&this.component.view;(t.eventStore!==n.eventStore||this.needsFullRerender)&&t.eventStore&&(this.isEventsUpdated=!0),(t.dateProfile!==n.dateProfile||this.needsFullRerender)&&(t.dateProfile&&r&&this.publiclyTrigger("datesDestroy",[{view:r,el:r.el}]),this.isDatesUpdated=!0),(t.viewType!==n.viewType||this.needsFullRerender)&&(t.viewType&&r&&this.publiclyTrigger("viewSkeletonDestroy",[{view:r,el:r.el}]),this.isViewUpdated=!0),this.requestRerender()}},e.prototype.reduce=function(e,t,n){
    return Rr(e,t,n)},e.prototype.requestRerender=function(e){void 0===e&&(e=!1),this.needsRerender=!0,this.needsFullRerender=this.needsFullRerender||e,this.delayedRerender()},e.prototype.tryRerender=function(){this.component&&this.needsRerender&&!this.renderingPauseDepth&&!this.isRendering&&this.executeRender()},e.prototype.batchRendering=function(e){this.renderingPauseDepth++,e(),this.renderingPauseDepth--,this.needsRerender&&this.requestRerender()},e.prototype.executeRender=function(){var e=this.needsFullRerender;this.needsRerender=!1,this.needsFullRerender=!1,this.isRendering=!0,this.renderComponent(e),this.isRendering=!1,this.needsRerender&&this.delayedRerender()},e.prototype.renderComponent=function(e){var t=this,n=t.state,r=t.component,i=n.viewType,o=this.viewSpecs[i],a=e&&r?r.view.queryScroll():null;if(!o)throw new Error('View type "'+i+'" is not valid');var s=this.renderableEventStore=n.eventSourceLoadingLevel&&!this.opt("progressiveEventRendering")?this.renderableEventStore:n.eventStore,u=this.buildEventUiSingleBase(o.options),l=this.buildEventUiBySource(n.eventSources),c=this.eventUiBases=this.buildEventUiBases(s.defs,u,l);!e&&r||(r&&(r.freezeHeight(),r.destroy()),r=this.component=new xo({calendar:this,view:null,dateEnv:this.dateEnv,theme:this.theme,options:this.optionsManager.computed},this.el)),r.receiveProps(wi({},n,{viewSpec:o,dateProfile:n.dateProfile,dateProfileGenerator:this.dateProfileGenerators[i],eventStore:s,eventUiBases:c,dateSelection:n.dateSelection,eventSelection:n.eventSelection,eventDrag:n.eventDrag,eventResize:n.eventResize})),a&&r.view.applyScroll(a,!1),this.isViewUpdated&&(this.isViewUpdated=!1,this.publiclyTrigger("viewSkeletonRender",[{view:r.view,el:r.view.el}])),this.isDatesUpdated&&(this.isDatesUpdated=!1,this.publiclyTrigger("datesRender",[{view:r.view,el:r.view.el}])),this.isEventsUpdated&&(this.isEventsUpdated=!1),this.releaseAfterSizingTriggers()},e.prototype.setOption=function(e,t){var n;this.mutateOptions((n={},n[e]=t,n),[],!0)},e.prototype.getOption=function(e){return this.optionsManager.computed[e]},e.prototype.opt=function(e){return this.optionsManager.computed[e]},e.prototype.viewOpt=function(e){return this.viewOpts()[e]},e.prototype.viewOpts=function(){return this.viewSpecs[this.state.viewType].options},e.prototype.mutateOptions=function(e,t,n,r){var i=this,o=this.pluginSystem.hooks.optionChangeHandlers,a={},s={},u=this.dateEnv,l=!1,c=!1,d=Boolean(t.length);for(var f in e)o[f]?s[f]=e[f]:a[f]=e[f];for(var p in a)/^(height|contentHeight|aspectRatio)$/.test(p)?c=!0:/^(defaultDate|defaultView)$/.test(p)||(d=!0,"timeZone"===p&&(l=!0));this.optionsManager.mutate(a,t,n),d&&(this.handleOptions(this.optionsManager.computed),this.needsFullRerender=!0),this.batchRendering(function(){if(d?(l&&i.dispatch({type:"CHANGE_TIMEZONE",oldDateEnv:u}),i.dispatch({type:"SET_VIEW_TYPE",viewType:i.state.viewType})):c&&i.updateSize(),r)for(var e in s)o[e](s[e],i,r)})},e.prototype.handleOptions=function(e){var t=this,n=this.pluginSystem.hooks;this.defaultAllDayEventDuration=ue(e.defaultAllDayEventDuration),this.defaultTimedEventDuration=ue(e.defaultTimedEventDuration),this.delayedRerender=this.buildDelayedRerender(e.rerenderDelay),this.theme=this.buildTheme(e);var r=this.parseRawLocales(e.locales);this.availableRawLocales=r.map;var i=this.buildLocale(e.locale||r.defaultCode,r.map);this.dateEnv=this.buildDateEnv(i,e.timeZone,n.namedTimeZonedImpl,e.firstDay,e.weekNumberCalculation,e.weekLabel,n.cmdFormatter),this.selectionConfig=this.buildSelectionConfig(e),this.viewSpecs=qr(n.views,this.optionsManager),this.dateProfileGenerators=it(this.viewSpecs,function(e){return new e.class.prototype.dateProfileGeneratorClass(e,t)})},e.prototype.getAvailableLocaleCodes=function(){return Object.keys(this.availableRawLocales)},e.prototype._buildSelectionConfig=function(e){return Cn("select",e,this)},e.prototype._buildEventUiSingleBase=function(e){return e.editable&&(e=wi({},e,{eventEditable:!0})),Cn("event",e,this)},e.prototype.hasPublicHandlers=function(e){return this.hasHandlers(e)||this.opt(e)},e.prototype.publiclyTrigger=function(e,t){var n=this.opt(e);if(this.triggerWith(e,this,t),n)return n.apply(this,t)},e.prototype.publiclyTriggerAfterSizing=function(e,t){var n=this.afterSizingTriggers;(n[e]||(n[e]=[])).push(t)},e.prototype.releaseAfterSizingTriggers=function(){var e=this.afterSizingTriggers;for(var t in e)for(var n=0,r=e[t];n<r.length;n++){var i=r[n];this.publiclyTrigger(t,i)}this.afterSizingTriggers={}},e.prototype.isValidViewType=function(e){return Boolean(this.viewSpecs[e])},e.prototype.changeView=function(e,t){var n=null;t&&(t.start&&t.end?(this.optionsManager.mutate({visibleRange:t},[]),this.handleOptions(this.optionsManager.computed)):n=this.dateEnv.createMarker(t)),this.unselect(),this.dispatch({type:"SET_VIEW_TYPE",viewType:e,dateMarker:n})},e.prototype.zoomTo=function(e,t){var n;t=t||"day",n=this.viewSpecs[t]||this.getUnitViewSpec(t),this.unselect(),n?this.dispatch({type:"SET_VIEW_TYPE",viewType:n.type,dateMarker:e}):this.dispatch({type:"SET_DATE",dateMarker:e})},e.prototype.getUnitViewSpec=function(e){var t,n,r=this.component,i=[];r.header&&i.push.apply(i,r.header.viewsWithButtons),r.footer&&i.push.apply(i,r.footer.viewsWithButtons);for(var o in this.viewSpecs)i.push(o);for(t=0;t<i.length;t++)if((n=this.viewSpecs[i[t]])&&n.singleUnit===e)return n},e.prototype.getInitialDate=function(){var e=this.opt("defaultDate");return null!=e?this.dateEnv.createMarker(e):this.getNow()},e.prototype.prev=function(){this.unselect(),this.dispatch({type:"PREV"})},e.prototype.next=function(){this.unselect(),this.dispatch({type:"NEXT"})},e.prototype.prevYear=function(){this.unselect(),this.dispatch({type:"SET_DATE",dateMarker:this.dateEnv.addYears(this.state.currentDate,-1)})},e.prototype.nextYear=function(){this.unselect(),this.dispatch({type:"SET_DATE",dateMarker:this.dateEnv.addYears(this.state.currentDate,1)})},e.prototype.today=function(){this.unselect(),this.dispatch({type:"SET_DATE",dateMarker:this.getNow()})},e.prototype.gotoDate=function(e){this.unselect(),this.dispatch({type:"SET_DATE",dateMarker:this.dateEnv.createMarker(e)})},e.prototype.incrementDate=function(e){var t=ue(e);t&&(this.unselect(),this.dispatch({type:"SET_DATE",dateMarker:this.dateEnv.add(this.state.currentDate,t)}))},e.prototype.getDate=function(){return this.dateEnv.toDate(this.state.currentDate)},e.prototype.formatDate=function(e,t){var n=this.dateEnv;return n.format(n.createMarker(e),Bt(t))},e.prototype.formatRange=function(e,t,n){var r=this.dateEnv;return r.formatRange(r.createMarker(e),r.createMarker(t),Bt(n,this.opt("defaultRangeSeparator")),n)},e.prototype.formatIso=function(e,t){var n=this.dateEnv;return n.formatIso(n.createMarker(e),{omitTime:t})},e.prototype.windowResize=function(e){!this.isHandlingWindowResize&&this.component&&e.target===window&&(this.isHandlingWindowResize=!0,this.updateSize(),this.publiclyTrigger("windowResize",[this.view]),this.isHandlingWindowResize=!1)},e.prototype.updateSize=function(){this.component&&this.component.updateSize(!0)},e.prototype.registerInteractiveComponent=function(e,t){var n=Qr(e,t),r=[zo,Uo],i=r.concat(this.pluginSystem.hooks.componentInteractions),o=i.map(function(e){return new e(n)});this.interactionsStore[e.uid]=o,No[e.uid]=n},e.prototype.unregisterInteractiveComponent=function(e){for(var t=0,n=this.interactionsStore[e.uid];t<n.length;t++){n[t].destroy()}delete this.interactionsStore[e.uid],delete No[e.uid]},e.prototype.select=function(e,t){var n;n=null==t?null!=e.start?e:{start:e,end:null}:{start:e,end:t};var r=Hr(n,this.dateEnv,ue({days:1}));r&&(this.dispatch({type:"SELECT_DATES",selection:r}),this.triggerDateSelect(r))},e.prototype.unselect=function(e){this.state.dateSelection&&(this.dispatch({type:"UNSELECT_DATES"}),this.triggerDateUnselect(e))},e.prototype.triggerDateSelect=function(e,t){var n=wi({},this.buildDateSpanApi(e),{jsEvent:t?t.origEvent:null,view:this.view});this.publiclyTrigger("select",[n])},e.prototype.triggerDateUnselect=function(e){this.publiclyTrigger("unselect",[{jsEvent:e?e.origEvent:null,view:this.view}])},e.prototype.triggerDateClick=function(e,t,n,r){var i=wi({},this.buildDatePointApi(e),{dayEl:t,jsEvent:r,view:n});this.publiclyTrigger("dateClick",[i])},e.prototype.buildDatePointApi=function(e){for(var t={},n=0,r=this.pluginSystem.hooks.datePointTransforms;n<r.length;n++){var i=r[n];wi(t,i(e,this))}return wi(t,Vr(e,this.dateEnv)),t},e.prototype.buildDateSpanApi=function(e){for(var t={},n=0,r=this.pluginSystem.hooks.dateSpanTransforms;n<r.length;n++){var i=r[n];wi(t,i(e,this))}return wi(t,Lr(e,this.dateEnv)),t},e.prototype.getNow=function(){var e=this.opt("now");return"function"==typeof e&&(e=e()),null==e?this.dateEnv.createNowMarker():this.dateEnv.createMarker(e)},e.prototype.getDefaultEventEnd=function(e,t){var n=t;return e?(n=X(n),n=this.dateEnv.add(n,this.defaultAllDayEventDuration)):n=this.dateEnv.add(n,this.defaultTimedEventDuration),n},e.prototype.addEvent=function(e,t){if(e instanceof Ui){var n=e._def,r=e._instance;return this.state.eventStore.defs[n.defId]||this.dispatch({type:"ADD_EVENTS",eventStore:lt({def:n,instance:r})}),e}var i;if(t instanceof zi)i=t.internalEventSource.sourceId;else if(null!=t){var o=this.getEventSourceById(t);if(!o)return console.warn('Could not find an event source with ID "'+t+'"'),null;i=o.internalEventSource.sourceId}var a=On(e,i,this);return a?(this.dispatch({type:"ADD_EVENTS",eventStore:lt(a)}),new Ui(this,a.def,a.def.recurringDef?null:a.instance)):null},e.prototype.getEventById=function(e){var t=this.state.eventStore,n=t.defs,r=t.instances;e=String(e);for(var i in n){var o=n[i];if(o.publicId===e){if(o.recurringDef)return new Ui(this,o,null);for(var a in r){var s=r[a];if(s.defId===o.defId)return new Ui(this,o,s)}}}return null},e.prototype.getEvents=function(){var e=this.state.eventStore,t=e.defs,n=e.instances,r=[];for(var i in n){var o=n[i],a=t[o.defId];r.push(new Ui(this,a,o))}return r},e.prototype.removeAllEvents=function(){this.dispatch({type:"REMOVE_ALL_EVENTS"})},e.prototype.rerenderEvents=function(){this.dispatch({type:"RESET_EVENTS"})},e.prototype.getEventSources=function(){var e=this.state.eventSources,t=[];for(var n in e)t.push(new zi(this,e[n]));return t},e.prototype.getEventSourceById=function(e){var t=this.state.eventSources;e=String(e);for(var n in t)if(t[n].publicId===e)return new zi(this,t[n]);return null},e.prototype.addEventSource=function(e){if(e instanceof zi)return this.state.eventSources[e.internalEventSource.sourceId]||this.dispatch({type:"ADD_EVENT_SOURCES",sources:[e.internalEventSource]}),e;var t=pr(e,this);return t?(this.dispatch({type:"ADD_EVENT_SOURCES",sources:[t]}),new zi(this,t)):null},e.prototype.removeAllEventSources=function(){this.dispatch({type:"REMOVE_ALL_EVENT_SOURCES"})},e.prototype.refetchEvents=function(){this.dispatch({type:"FETCH_EVENT_SOURCES"})},e.prototype.scrollToTime=function(e){var t=ue(e);t&&this.component.view.scrollToTime(t)},e}();qi.mixInto(Vo);var Bo=function(e){function n(n,r,i,o){var a=e.call(this,n,t("div",{className:"fc-view fc-"+r.type+"-view"}),!0)||this;return a.renderDatesMem=Vn(a.renderDatesWrap,a.unrenderDatesWrap),a.renderBusinessHoursMem=Vn(a.renderBusinessHours,a.unrenderBusinessHours,[a.renderDatesMem]),a.renderDateSelectionMem=Vn(a.renderDateSelectionWrap,a.unrenderDateSelectionWrap,[a.renderDatesMem]),a.renderEventsMem=Vn(a.renderEvents,a.unrenderEvents,[a.renderDatesMem]),a.renderEventSelectionMem=Vn(a.renderEventSelectionWrap,a.unrenderEventSelectionWrap,[a.renderEventsMem]),a.renderEventDragMem=Vn(a.renderEventDragWrap,a.unrenderEventDragWrap,[a.renderDatesMem]),a.renderEventResizeMem=Vn(a.renderEventResizeWrap,a.unrenderEventResizeWrap,[a.renderDatesMem]),a.viewSpec=r,a.dateProfileGenerator=i,a.type=r.type,a.eventOrderSpecs=Ue(a.opt("eventOrder")),a.nextDayThreshold=ue(a.opt("nextDayThreshold")),o.appendChild(a.el),a.initialize(),a}return $e(n,e),n.prototype.initialize=function(){},Object.defineProperty(n.prototype,"activeStart",{get:function(){return this.dateEnv.toDate(this.props.dateProfile.activeRange.start)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"activeEnd",{get:function(){return this.dateEnv.toDate(this.props.dateProfile.activeRange.end)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"currentStart",{get:function(){return this.dateEnv.toDate(this.props.dateProfile.currentRange.start)},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"currentEnd",{get:function(){return this.dateEnv.toDate(this.props.dateProfile.currentRange.end)},enumerable:!0,configurable:!0}),n.prototype.render=function(e){this.renderDatesMem(e.dateProfile),this.renderBusinessHoursMem(e.businessHours),this.renderDateSelectionMem(e.dateSelection),this.renderEventsMem(e.eventStore),this.renderEventSelectionMem(e.eventSelection),this.renderEventDragMem(e.eventDrag),this.renderEventResizeMem(e.eventResize)},n.prototype.destroy=function(){e.prototype.destroy.call(this),this.renderDatesMem.unrender()},n.prototype.updateSize=function(e,t,n){var r=this.calendar;(e||r.isViewUpdated||r.isDatesUpdated||r.isEventsUpdated)&&this.updateBaseSize(e,t,n)},n.prototype.updateBaseSize=function(e,t,n){},n.prototype.renderDatesWrap=function(e){this.renderDates(e),this.addScroll({timeMs:ue(this.opt("scrollTime")).milliseconds}),this.startNowIndicator(e)},n.prototype.unrenderDatesWrap=function(){this.stopNowIndicator(),this.unrenderDates()},n.prototype.renderDates=function(e){},n.prototype.unrenderDates=function(){},n.prototype.renderBusinessHours=function(e){},n.prototype.unrenderBusinessHours=function(){},n.prototype.renderDateSelectionWrap=function(e){e&&this.renderDateSelection(e)},n.prototype.unrenderDateSelectionWrap=function(e){e&&this.unrenderDateSelection(e)},n.prototype.renderDateSelection=function(e){},n.prototype.unrenderDateSelection=function(e){},n.prototype.renderEvents=function(e){},n.prototype.unrenderEvents=function(){},n.prototype.sliceEvents=function(e,t){var n=this.props;return Yt(e,n.eventUiBases,n.dateProfile.activeRange,t?this.nextDayThreshold:null).fg},n.prototype.renderEventSelectionWrap=function(e){e&&this.renderEventSelection(e)},n.prototype.unrenderEventSelectionWrap=function(e){e&&this.unrenderEventSelection(e)},n.prototype.renderEventSelection=function(e){},n.prototype.unrenderEventSelection=function(e){},n.prototype.renderEventDragWrap=function(e){e&&this.renderEventDrag(e)},n.prototype.unrenderEventDragWrap=function(e){e&&this.unrenderEventDrag(e)},n.prototype.renderEventDrag=function(e){},n.prototype.unrenderEventDrag=function(e){},n.prototype.renderEventResizeWrap=function(e){e&&this.renderEventResize(e)},n.prototype.unrenderEventResizeWrap=function(e){e&&this.unrenderEventResize(e)},n.prototype.renderEventResize=function(e){},n.prototype.unrenderEventResize=function(e){},n.prototype.startNowIndicator=function(e){var t,n,r,i=this,o=this.dateEnv;this.opt("nowIndicator")&&(t=this.getNowIndicatorUnit(e))&&(n=this.updateNowIndicator.bind(this),this.initialNowDate=this.calendar.getNow(),this.initialNowQueriedMs=(new Date).valueOf(),r=o.add(o.startOf(this.initialNowDate,t),ue(1,t)).valueOf()-this.initialNowDate.valueOf(),this.nowIndicatorTimeoutID=setTimeout(function(){i.nowIndicatorTimeoutID=null,n(),r="second"===t?1e3:6e4,i.nowIndicatorIntervalID=setInterval(n,r)},r))},n.prototype.updateNowIndicator=function(){this.props.dateProfile&&this.initialNowDate&&(this.unrenderNowIndicator(),this.renderNowIndicator(B(this.initialNowDate,(new Date).valueOf()-this.initialNowQueriedMs)),this.isNowIndicatorRendered=!0)},n.prototype.stopNowIndicator=function(){this.isNowIndicatorRendered&&(this.nowIndicatorTimeoutID&&(clearTimeout(this.nowIndicatorTimeoutID),this.nowIndicatorTimeoutID=null),this.nowIndicatorIntervalID&&(clearInterval(this.nowIndicatorIntervalID),this.nowIndicatorIntervalID=null),this.unrenderNowIndicator(),this.isNowIndicatorRendered=!1)},n.prototype.getNowIndicatorUnit=function(e){},n.prototype.renderNowIndicator=function(e){},n.prototype.unrenderNowIndicator=function(){},n.prototype.addScroll=function(e){var t=this.queuedScroll||(this.queuedScroll={});wi(t,e)},n.prototype.popScroll=function(e){this.applyQueuedScroll(e),this.queuedScroll=null},n.prototype.applyQueuedScroll=function(e){this.applyScroll(this.queuedScroll||{},e)},n.prototype.queryScroll=function(){var e={};return this.props.dateProfile&&wi(e,this.queryDateScroll()),e},n.prototype.applyScroll=function(e,t){var n=e.timeMs;null!=n&&(delete e.timeMs,this.props.dateProfile&&wi(e,this.computeDateScroll(n))),this.props.dateProfile&&this.applyDateScroll(e)},n.prototype.computeDateScroll=function(e){return{}},n.prototype.queryDateScroll=function(){return{}},n.prototype.applyDateScroll=function(e){},n.prototype.scrollToTime=function(e){this.applyScroll({timeMs:e.milliseconds},!1)},n}(no);qi.mixInto(Bo),Bo.prototype.usesMinMaxTime=!1,Bo.prototype.dateProfileGeneratorClass=ko;var Ao=function(){function e(e){this.segs=[],this.isSizeDirty=!1,this.context=e}return e.prototype.renderSegs=function(e,t){this.rangeUpdated(),e=this.renderSegEls(e,t),this.segs=e,this.attachSegs(e,t),this.isSizeDirty=!0,this.context.view.triggerRenderedSegs(this.segs,Boolean(t))},e.prototype.unrender=function(e,t){this.context.view.triggerWillRemoveSegs(this.segs,Boolean(t)),this.detachSegs(this.segs),this.segs=[]},e.prototype.rangeUpdated=function(){var e,t,n=this.context.options;this.eventTimeFormat=Bt(n.eventTimeFormat||this.computeEventTimeFormat(),n.defaultRangeSeparator),e=n.displayEventTime,null==e&&(e=this.computeDisplayEventTime()),t=n.displayEventEnd,null==t&&(t=this.computeDisplayEventEnd()),this.displayEventTime=e,this.displayEventEnd=t},e.prototype.renderSegEls=function(e,t){var n,i="";if(e.length){for(n=0;n<e.length;n++)i+=this.renderSegHtml(e[n],t);r(i).forEach(function(t,n){var r=e[n];t&&(r.el=t)}),e=Gt(this.context.view,e,Boolean(t))}return e},e.prototype.getSegClasses=function(e,t,n,r){var i=["fc-event",e.isStart?"fc-start":"fc-not-start",e.isEnd?"fc-end":"fc-not-end"].concat(e.eventRange.ui.classNames);return t&&i.push("fc-draggable"),n&&i.push("fc-resizable"),r&&(i.push("fc-mirror"),r.isDragging&&i.push("fc-dragging"),r.isResizing&&i.push("fc-resizing")),i},e.prototype.getTimeText=function(e,t,n){var r=e.def,i=e.instance;return this._getTimeText(i.range.start,r.hasEnd?i.range.end:null,r.allDay,t,n,i.forcedStartTzo,i.forcedEndTzo)},e.prototype._getTimeText=function(e,t,n,r,i,o,a){var s=this.context.dateEnv;return null==r&&(r=this.eventTimeFormat),null==i&&(i=this.displayEventEnd),this.displayEventTime&&!n?i&&t?s.formatRange(e,t,r,{forcedStartTzo:o,forcedEndTzo:a}):s.format(e,r,{forcedTzo:o}):""},e.prototype.computeEventTimeFormat=function(){return{hour:"numeric",minute:"2-digit",omitZeroMinute:!0}},e.prototype.computeDisplayEventTime=function(){return!0},e.prototype.computeDisplayEventEnd=function(){return!0},e.prototype.getSkinCss=function(e){return{"background-color":e.backgroundColor,"border-color":e.borderColor,color:e.textColor}},e.prototype.sortEventSegs=function(e){var t=this.context.view.eventOrderSpecs,n=e.map(oi);return n.sort(function(e,n){return Le(e,n,t)}),n.map(function(e){return e._seg})},e.prototype.computeSizes=function(e){(e||this.isSizeDirty)&&this.computeSegSizes(this.segs)},e.prototype.assignSizes=function(e){(e||this.isSizeDirty)&&(this.assignSegSizes(this.segs),this.isSizeDirty=!1)},e.prototype.computeSegSizes=function(e){},e.prototype.assignSegSizes=function(e){},e.prototype.hideByHash=function(e){if(e)for(var t=0,n=this.segs;t<n.length;t++){var r=n[t];e[r.eventRange.instance.instanceId]&&(r.el.style.visibility="hidden")}},e.prototype.showByHash=function(e){if(e)for(var t=0,n=this.segs;t<n.length;t++){var r=n[t];e[r.eventRange.instance.instanceId]&&(r.el.style.visibility="")}},e.prototype.selectByInstanceId=function(e){if(e)for(var t=0,n=this.segs;t<n.length;t++){var r=n[t],i=r.eventRange.instance;i&&i.instanceId===e&&r.el&&r.el.classList.add("fc-selected")}},e.prototype.unselectByInstanceId=function(e){if(e)for(var t=0,n=this.segs;t<n.length;t++){var r=n[t];r.el&&r.el.classList.remove("fc-selected")}},e}(),Fo=function(){function e(e){this.fillSegTag="div",this.dirtySizeFlags={},this.context=e,this.containerElsByType={},this.segsByType={}}return e.prototype.getSegsByType=function(e){return this.segsByType[e]||[]},e.prototype.renderSegs=function(e,t){var n,r=this.renderSegEls(e,t),i=this.attachSegs(e,r);i&&(n=this.containerElsByType[e]||(this.containerElsByType[e]=[])).push.apply(n,i),this.segsByType[e]=r,"bgEvent"===e&&this.context.view.triggerRenderedSegs(r,!1),this.dirtySizeFlags[e]=!0},e.prototype.unrender=function(e){var t=this.segsByType[e];t&&("bgEvent"===e&&this.context.view.triggerWillRemoveSegs(t,!1),this.detachSegs(e,t))},e.prototype.renderSegEls=function(e,t){var n,i=this,o="";if(t.length){for(n=0;n<t.length;n++)o+=this.renderSegHtml(e,t[n]);r(o).forEach(function(e,n){var r=t[n];e&&(r.el=e)}),"bgEvent"===e&&(t=Gt(this.context.view,t,!1)),t=t.filter(function(e){return f(e.el,i.fillSegTag)})}return t},e.prototype.renderSegHtml=function(e,t){var n=null,r=[];return"highlight"!==e&&"businessHours"!==e&&(n={"background-color":t.eventRange.ui.backgroundColor}),"highlight"!==e&&(r=r.concat(t.eventRange.ui.classNames)),"businessHours"===e?r.push("fc-bgevent"):r.push("fc-"+e.toLowerCase()),"<"+this.fillSegTag+(r.length?' class="'+r.join(" ")+'"':"")+(n?' style="'+Dn(n)+'"':"")+"></"+this.fillSegTag+">"},e.prototype.detachSegs=function(e,t){var n=this.containerElsByType[e];n&&(n.forEach(c),delete this.containerElsByType[e])},e.prototype.computeSizes=function(e){for(var t in this.segsByType)(e||this.dirtySizeFlags[t])&&this.computeSegSizes(this.segsByType[t])},e.prototype.assignSizes=function(e){for(var t in this.segsByType)(e||this.dirtySizeFlags[t])&&this.assignSegSizes(this.segsByType[t]);this.dirtySizeFlags={}},e.prototype.computeSegSizes=function(e){},e.prototype.assignSegSizes=function(e){},e}(),Wo=function(){function e(e){this.timeZoneName=e}return e}(),Zo=function(){function e(e){this.emitter=new qi}return e.prototype.destroy=function(){},e.prototype.setMirrorIsVisible=function(e){},e.prototype.setMirrorNeedsRevert=function(e){},e.prototype.setAutoScrollEnabled=function(e){},e}(),jo={startTime:ue,duration:ue,create:Boolean,sourceId:String},Yo={create:!0},qo=function(e){function t(t,r){var i=e.call(this,t)||this;return r.innerHTML="",r.appendChild(i.el=n('<div class="fc-row '+i.theme.getClass("headerRow")+'"><table class="'+i.theme.getClass("tableGrid")+'"><thead></thead></table></div>')),i.thead=i.el.querySelector("thead"),i}return $e(t,e),t.prototype.destroy=function(){c(this.el)},t.prototype.render=function(e){var t=e.dates,n=e.datesRepDistinctDays,r=[];e.renderIntroHtml&&r.push(e.renderIntroHtml());for(var i=Bt(this.opt("columnHeaderFormat")||ci(n,t.length)),o=0,a=t;o<a.length;o++){var s=a[o];r.push(di(s,e.dateProfile,n,t.length,i,this.context))}this.isRtl&&r.reverse(),this.thead.innerHTML="<tr>"+r.join("")+"</tr>"},t}(to),Go=function(){function e(e,t){for(var n=e.start,r=e.end,i=[],o=[],a=-1;n<r;)t.isHiddenDay(n)?i.push(a+.5):(a++,i.push(a),o.push(n)),n=V(n,1);this.dates=o,this.indices=i,this.cnt=o.length}return e.prototype.sliceRange=function(e){var t=this.getDateDayIndex(e.start),n=this.getDateDayIndex(V(e.end,-1)),r=Math.max(0,t),i=Math.min(this.cnt-1,n);return r=Math.ceil(r),i=Math.floor(i),r<=i?{firstIndex:r,lastIndex:i,isStart:t===r,isEnd:n===i}:null},e.prototype.getDateDayIndex=function(e){var t=this.indices,n=Math.floor(F(this.dates[0],e));return n<0?t[0]-1:n>=t.length?t[t.length-1]+1:t[n]},e}(),Xo=function(){function e(e,t){var n,r,i,o=e.dates;if(t){for(r=o[0].getUTCDay(),n=1;n<o.length&&o[n].getUTCDay()!==r;n++);i=Math.ceil(o.length/n)}else i=1,n=o.length;this.rowCnt=i,this.colCnt=n,this.daySeries=e,this.cells=this.buildCells(),this.headerDates=this.buildHeaderDates()}return e.prototype.buildCells=function(){for(var e=[],t=0;t<this.rowCnt;t++){for(var n=[],r=0;r<this.colCnt;r++)n.push(this.buildCell(t,r));e.push(n)}return e},e.prototype.buildCell=function(e,t){return{date:this.daySeries.dates[e*this.colCnt+t]}},e.prototype.buildHeaderDates=function(){for(var e=[],t=0;t<this.colCnt;t++)e.push(this.cells[0][t].date);return e},e.prototype.sliceRange=function(e){var t=this.colCnt,n=this.daySeries.sliceRange(e),r=[];if(n)for(var i=n.firstIndex,o=n.lastIndex,a=i;a<=o;){var s=Math.floor(a/t),u=Math.min((s+1)*t,o+1);r.push({row:s,firstCol:a%t,lastCol:(u-1)%t,isStart:n.isStart&&a===i,isEnd:n.isEnd&&u-1===o}),a=u}return r},e}(),Jo=function(){function e(){this.sliceBusinessHours=kt(this._sliceBusinessHours),this.sliceDateSelection=kt(this._sliceDateSpan),this.sliceEventStore=kt(this._sliceEventStore),this.sliceEventDrag=kt(this._sliceInteraction),this.sliceEventResize=kt(this._sliceInteraction)}return e.prototype.sliceProps=function(e,t,n,r){for(var i=[],o=4;o<arguments.length;o++)i[o-4]=arguments[o];var a=e.eventUiBases,s=this.sliceEventStore.apply(this,[e.eventStore,a,t,n,r].concat(i));return{dateSelectionSegs:this.sliceDateSelection.apply(this,[e.dateSelection,a,r].concat(i)),businessHourSegs:this.sliceBusinessHours.apply(this,[e.businessHours,t,n,r].concat(i)),fgEventSegs:s.fg,bgEventSegs:s.bg,eventDrag:this.sliceEventDrag.apply(this,[e.eventDrag,a,t,n,r].concat(i)),eventResize:this.sliceEventResize.apply(this,[e.eventResize,a,t,n,r].concat(i)),eventSelection:e.eventSelection}},e.prototype.sliceNowDate=function(e,t){for(var n=[],r=2;r<arguments.length;r++)n[r-2]=arguments[r];return this._sliceDateSpan.apply(this,[{range:{start:e,end:B(e,1)},allDay:!1},{},t].concat(n))},e.prototype._sliceBusinessHours=function(e,t,n,r){for(var i=[],o=4;o<arguments.length;o++)i[o-4]=arguments[o];return e?this._sliceEventStore.apply(this,[ct(e,fi(t,Boolean(n)),r.calendar),{},t,n,r].concat(i)).bg:[]},e.prototype._sliceEventStore=function(e,t,n,r,i){for(var o=[],a=5;a<arguments.length;a++)o[a-5]=arguments[a];if(e){var s=Yt(e,t,fi(n,Boolean(r)),r);return{bg:this.sliceEventRanges(s.bg,i,o),fg:this.sliceEventRanges(s.fg,i,o)}}return{bg:[],fg:[]}},e.prototype._sliceInteraction=function(e,t,n,r,i){for(var o=[],a=5;a<arguments.length;a++)o[a-5]=arguments[a];if(!e)return null;var s=Yt(e.mutatedEvents,t,fi(n,Boolean(r)),r);return{segs:this.sliceEventRanges(s.fg,i,o),affectedInstances:e.affectedEvents.instances,isEvent:e.isEvent,sourceSeg:e.origSeg}},e.prototype._sliceDateSpan=function(e,t,n){for(var r=[],i=3;i<arguments.length;i++)r[i-3]=arguments[i];if(!e)return[];for(var o=Br(e,t,n.calendar),a=this.sliceRange.apply(this,[e.range].concat(r)),s=0,u=a;s<u.length;s++){var l=u[s];l.component=n,l.eventRange=o}return a},e.prototype.sliceEventRanges=function(e,t,n){for(var r=[],i=0,o=e;i<o.length;i++){var a=o[i];r.push.apply(r,this.sliceEventRange(a,t,n))}return r},e.prototype.sliceEventRange=function(e,t,n){for(var r=this.sliceRange.apply(this,[e.range].concat(n)),i=0,o=r;i<o.length;i++){var a=o[i];a.component=t,a.eventRange=e,a.isStart=e.isStart&&a.isStart,a.isEnd=e.isEnd&&a.isEnd}return r},e}();e.Calendar=Vo,e.Component=to,e.DateComponent=no,e.DateEnv=Ro,e.DateProfileGenerator=ko,e.DayHeader=qo,e.DaySeries=Go,e.DayTable=Xo,e.ElementDragging=Zo,e.ElementScrollController=Ji,e.EmitterMixin=qi,e.EventApi=Ui,e.FgEventRenderer=Ao,e.FillRenderer=Fo,e.Interaction=Ho,e.Mixin=Yi,e.NamedTimeZoneImpl=Wo,e.PositionCache=Gi,e.ScrollComponent=Qi,e.ScrollController=Xi,e.Slicer=Jo,e.Splitter=ji,e.Theme=$i,e.View=Bo,e.WindowScrollController=Ki,e.addDays=V,e.addDurations=he,e.addMs=B,e.addWeeks=L,e.allowContextMenu=ze,e.allowSelection=He,e.appendToElement=a,e.applyAll=je,e.applyMutationToEventStore=$t,e.applyStyle=g,e.applyStyleProp=y,e.asRoughMinutes=Se,e.asRoughMs=Te,e.asRoughSeconds=be,e.buildGotoAnchorHtml=An,e.buildSegCompareObj=oi,e.capitaliseFirstLetter=Ae,e.combineEventUis=Mn,e.compareByFieldSpec=Ve,e.compareByFieldSpecs=Le,e.compareNumbers=We,e.compensateScroll=Re,e.computeClippingRect=x,e.computeEdges=C,e.computeFallbackHeaderFormat=ci,e.computeHeightAndMargins=_,e.computeInnerRect=M,e.computeRect=k,e.computeVisibleDayRange=Je,e.config=vo,e.constrainPoint=b,e.createDuration=ue,e.createElement=t,e.createEmptyEventStore=vt,e.createEventInstance=Pn,e.createFormatter=Bt,e.createPlugin=Gn,e.cssToStr=Dn,e.debounce=qe,e.diffDates=Qe,e.diffDayAndTime=Y,e.diffDays=F,e.diffPoints=D,e.diffWeeks=A,e.diffWholeDays=G,e.diffWholeWeeks=q,e.disableCursor=Ce,e.distributeHeight=ke,e.elementClosest=d,e.elementMatches=f,e.enableCursor=Me,e.eventTupleToStore=lt,e.filterEventStoreDefs=yt,e.filterHash=rt,e.findChildren=h,e.findElements=p,e.flexibleCompare=Be,e.forceClassName=v,e.formatDate=ai,e.formatIsoTimeString=Ft,e.formatRange=si,e.getAllDayHtml=Fn,e.getClippingParents=P,e.getDayClasses=Wn,e.getElSeg=Jt,e.getRectCenter=T,e.getRelevantEvents=dt,e.globalDefaults=go,e.greatestDurationDenominator=we,e.hasBgRendering=qt,e.htmlEscape=Tn,e.htmlToElement=n,e.insertAfterElement=u,e.interactionSettingsStore=No,e.interactionSettingsToStore=$r,e.intersectRanges=bt,e.intersectRects=E,e.isArraysEqual=Mt,e.isDateSpansEqual=zr,e.isInt=Ze,e.isInteractionValid=dn,e.isMultiDayRange=Ke,e.isPropsEqual=st,e.isPropsValid=hn,e.isSingleDay=pe,e.isValidDate=ae,e.listenBySelector=N,e.mapHash=it,e.matchCellWidths=_e,e.memoize=kt,e.memoizeOutput=Ot,e.memoizeRendering=Vn,e.mergeEventStores=gt,e.multiplyDuration=ge,e.padStart=Fe,e.parseBusinessHours=Un,e.parseDragMeta=li,e.parseEventDef=_n,e.parseFieldSpecs=Ue,e.parseMarker=dr,e.pointInsideRect=m,e.prependToElement=s,e.preventContextMenu=Ne,e.preventDefault=H,e.preventSelection=xe,e.processScopedUiProps=Cn,e.rangeContainsMarker=Rt,e.rangeContainsRange=wt,e.rangesEqual=Tt,e.rangesIntersect=Dt,e.refineProps=Ge,e.removeElement=c,e.removeExact=Ct,e.renderDateCell=di,e.requestJson=Jn,e.sliceEventStore=Yt,e.startOfDay=X,e.subtractInnerElHeight=Pe,e.translateRect=S,e.uncompensateScroll=Ie,e.undistributeHeight=Oe,e.unpromisify=Zn,e.version="4.2.0",e.whenTransitionDone=U,e.wholeDivideDurations=De,Object.defineProperty(e,"__esModule",{value:!0})});

    /*!
FullCalendar Day Grid Plugin v4.2.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","@fullcalendar/core"],t):(e=e||self,t(e.FullCalendarDayGrid={},e.FullCalendar))}(this,function(e,t){"use strict";function r(e,t){function r(){this.constructor=e}l(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)}function n(e,t){var r,n;for(r=0;r<t.length;r++)if(n=t[r],n.firstCol<=e.lastCol&&n.lastCol>=e.firstCol)return!0;return!1}function i(e,t){return e.leftCol-t.leftCol}function o(e,r,n,i){var o=n.dateEnv,s=n.theme,l=t.rangeContainsMarker(r.activeRange,e),a=t.getDayClasses(e,r,n);return a.unshift("fc-day",s.getClass("widgetContent")),'<td class="'+a.join(" ")+'"'+(l?' data-date="'+o.formatIso(e,{omitTime:!0})+'"':"")+(i?" "+i:"")+"></td>"}function s(e,r){var n=new t.DaySeries(e.renderRange,r);return new t.DayTable(n,/year|month|week/.test(e.currentRangeUnit))}/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var l=function(e,t){return(l=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])})(e,t)},a=function(){return a=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++){t=arguments[r];for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(e[i]=t[i])}return e},a.apply(this,arguments)},d=function(e){function n(){return null!==e&&e.apply(this,arguments)||this}return r(n,e),n.prototype.buildRenderRange=function(r,n,i){var o,s=this.dateEnv,l=e.prototype.buildRenderRange.call(this,r,n,i),a=l.start,d=l.end;if(/^(year|month)$/.test(n)&&(a=s.startOfWeek(a),o=s.startOfWeek(d),o.valueOf()!==d.valueOf()&&(d=t.addWeeks(o,1))),this.options.monthMode&&this.options.fixedWeekCount){var c=Math.ceil(t.diffWeeks(a,d));d=t.addWeeks(d,6-c)}return{start:a,end:d}},n}(t.DateProfileGenerator),c=function(){function e(e){var t=this;this.isHidden=!0,this.margin=10,this.documentMousedown=function(e){t.el&&!t.el.contains(e.target)&&t.hide()},this.options=e}return e.prototype.show=function(){this.isHidden&&(this.el||this.render(),this.el.style.display="",this.position(),this.isHidden=!1,this.trigger("show"))},e.prototype.hide=function(){this.isHidden||(this.el.style.display="none",this.isHidden=!0,this.trigger("hide"))},e.prototype.render=function(){var e=this,r=this.options,n=this.el=t.createElement("div",{className:"fc-popover "+(r.className||""),style:{top:"0",left:"0"}});"function"==typeof r.content&&r.content(n),r.parentEl.appendChild(n),t.listenBySelector(n,"click",".fc-close",function(t){e.hide()}),r.autoHide&&document.addEventListener("mousedown",this.documentMousedown)},e.prototype.destroy=function(){this.hide(),this.el&&(t.removeElement(this.el),this.el=null),document.removeEventListener("mousedown",this.documentMousedown)},e.prototype.position=function(){var e,r,n=this.options,i=this.el,o=i.getBoundingClientRect(),s=t.computeRect(i.offsetParent),l=t.computeClippingRect(n.parentEl);e=n.top||0,r=void 0!==n.left?n.left:void 0!==n.right?n.right-o.width:0,e=Math.min(e,l.bottom-o.height-this.margin),e=Math.max(e,l.top+this.margin),r=Math.min(r,l.right-o.width-this.margin),r=Math.max(r,l.left+this.margin),t.applyStyle(i,{top:e-s.top,left:r-s.left})},e.prototype.trigger=function(e){this.options[e]&&this.options[e].apply(this,Array.prototype.slice.call(arguments,1))},e}(),h=function(e){function n(){return null!==e&&e.apply(this,arguments)||this}return r(n,e),n.prototype.renderSegHtml=function(e,r){var n,i,o=this.context.options,s=e.eventRange,l=s.def,a=s.ui,d=l.allDay,c=a.startEditable,h=d&&e.isStart&&a.durationEditable&&o.eventResizableFromStart,p=d&&e.isEnd&&a.durationEditable,u=this.getSegClasses(e,c,h||p,r),f=t.cssToStr(this.getSkinCss(a)),g="";return u.unshift("fc-day-grid-event","fc-h-event"),e.isStart&&(n=this.getTimeText(s))&&(g='<span class="fc-time">'+t.htmlEscape(n)+"</span>"),i='<span class="fc-title">'+(t.htmlEscape(l.title||"")||"&nbsp;")+"</span>",'<a class="'+u.join(" ")+'"'+(l.url?' href="'+t.htmlEscape(l.url)+'"':"")+(f?' style="'+f+'"':"")+'><div class="fc-content">'+("rtl"===o.dir?i+" "+g:g+" "+i)+"</div>"+(h?'<div class="fc-resizer fc-start-resizer"></div>':"")+(p?'<div class="fc-resizer fc-end-resizer"></div>':"")+"</a>"},n.prototype.computeEventTimeFormat=function(){return{hour:"numeric",minute:"2-digit",omitZeroMinute:!0,meridiem:"narrow"}},n.prototype.computeDisplayEventEnd=function(){return!1},n}(t.FgEventRenderer),p=function(e){function o(t){var r=e.call(this,t.context)||this;return r.dayGrid=t,r}return r(o,e),o.prototype.attachSegs=function(e,t){var r=this.rowStructs=this.renderSegRows(e);this.dayGrid.rowEls.forEach(function(e,t){e.querySelector(".fc-content-skeleton > table").appendChild(r[t].tbodyEl)}),t||this.dayGrid.removeSegPopover()},o.prototype.detachSegs=function(){for(var e,r=this.rowStructs||[];e=r.pop();)t.removeElement(e.tbodyEl);this.rowStructs=null},o.prototype.renderSegRows=function(e){var t,r,n=[];for(t=this.groupSegRows(e),r=0;r<t.length;r++)n.push(this.renderSegRow(r,t[r]));return n},o.prototype.renderSegRow=function(e,r){function n(e){for(;s<e;)c=(b[i-1]||[])[s],c?c.rowSpan=(c.rowSpan||1)+1:(c=document.createElement("td"),l.appendChild(c)),v[i][s]=c,b[i][s]=c,s++}var i,o,s,l,a,d,c,h=this.dayGrid,p=h.colCnt,u=h.isRtl,f=this.buildSegLevels(r),g=Math.max(1,f.length),m=document.createElement("tbody"),y=[],v=[],b=[];for(i=0;i<g;i++){if(o=f[i],s=0,l=document.createElement("tr"),y.push([]),v.push([]),b.push([]),o)for(a=0;a<o.length;a++){d=o[a];var w=u?p-1-d.lastCol:d.firstCol,S=u?p-1-d.firstCol:d.lastCol;for(n(w),c=t.createElement("td",{className:"fc-event-container"},d.el),w!==S?c.colSpan=S-w+1:b[i][s]=c;s<=S;)v[i][s]=c,y[i][s]=d,s++;l.appendChild(c)}n(p);var C=h.renderProps.renderIntroHtml();C&&(h.isRtl?t.appendToElement(l,C):t.prependToElement(l,C)),m.appendChild(l)}return{row:e,tbodyEl:m,cellMatrix:v,segMatrix:y,segLevels:f,segs:r}},o.prototype.buildSegLevels=function(e){var t,r,o,s=this.dayGrid,l=s.isRtl,a=s.colCnt,d=[];for(e=this.sortEventSegs(e),t=0;t<e.length;t++){for(r=e[t],o=0;o<d.length&&n(r,d[o]);o++);r.level=o,r.leftCol=l?a-1-r.lastCol:r.firstCol,r.rightCol=l?a-1-r.firstCol:r.lastCol,(d[o]||(d[o]=[])).push(r)}for(o=0;o<d.length;o++)d[o].sort(i);return d},o.prototype.groupSegRows=function(e){var t,r=[];for(t=0;t<this.dayGrid.rowCnt;t++)r.push([]);for(t=0;t<e.length;t++)r[e[t].row].push(e[t]);return r},o.prototype.computeDisplayEventEnd=function(){return 1===this.dayGrid.colCnt},o}(h),u=function(e){function n(){return null!==e&&e.apply(this,arguments)||this}return r(n,e),n.prototype.attachSegs=function(e,r){var n=r.sourceSeg,i=this.rowStructs=this.renderSegRows(e);this.dayGrid.rowEls.forEach(function(e,r){var o,s,l=t.htmlToElement('<div class="fc-mirror-skeleton"><table></table></div>');n&&n.row===r?o=n.el:(o=e.querySelector(".fc-content-skeleton tbody"))||(o=e.querySelector(".fc-content-skeleton table")),s=o.getBoundingClientRect().top-e.getBoundingClientRect().top,l.style.top=s+"px",l.querySelector("table").appendChild(i[r].tbodyEl),e.appendChild(l)})},n}(p),f=function(e){function n(t){var r=e.call(this,t.context)||this;return r.fillSegTag="td",r.dayGrid=t,r}return r(n,e),n.prototype.renderSegs=function(t,r){"bgEvent"===t&&(r=r.filter(function(e){return e.eventRange.def.allDay})),e.prototype.renderSegs.call(this,t,r)},n.prototype.attachSegs=function(e,t){var r,n,i,o=[];for(r=0;r<t.length;r++)n=t[r],i=this.renderFillRow(e,n),this.dayGrid.rowEls[n.row].appendChild(i),o.push(i);return o},n.prototype.renderFillRow=function(e,r){var n,i,o,s=this.dayGrid,l=s.colCnt,a=s.isRtl,d=a?l-1-r.lastCol:r.firstCol,c=a?l-1-r.firstCol:r.lastCol,h=d,p=c+1;n="businessHours"===e?"bgevent":e.toLowerCase(),i=t.htmlToElement('<div class="fc-'+n+'-skeleton"><table><tr></tr></table></div>'),o=i.getElementsByTagName("tr")[0],h>0&&t.appendToElement(o,new Array(h+1).join("<td></td>")),r.el.colSpan=p-h,o.appendChild(r.el),p<l&&t.appendToElement(o,new Array(l-p+1).join("<td></td>"));var u=s.renderProps.renderIntroHtml();return u&&(s.isRtl?t.appendToElement(o,u):t.prependToElement(o,u)),i},n}(t.FillRenderer),g=function(e){function n(r,n){var i=e.call(this,r,n)||this,o=i.eventRenderer=new m(i),s=i.renderFrame=t.memoizeRendering(i._renderFrame);return i.renderFgEvents=t.memoizeRendering(o.renderSegs.bind(o),o.unrender.bind(o),[s]),i.renderEventSelection=t.memoizeRendering(o.selectByInstanceId.bind(o),o.unselectByInstanceId.bind(o),[i.renderFgEvents]),i.renderEventDrag=t.memoizeRendering(o.hideByHash.bind(o),o.showByHash.bind(o),[s]),i.renderEventResize=t.memoizeRendering(o.hideByHash.bind(o),o.showByHash.bind(o),[s]),r.calendar.registerInteractiveComponent(i,{el:i.el,useEventCenter:!1}),i}return r(n,e),n.prototype.render=function(e){this.renderFrame(e.date),this.renderFgEvents(e.fgSegs),this.renderEventSelection(e.eventSelection),this.renderEventDrag(e.eventDragInstances),this.renderEventResize(e.eventResizeInstances)},n.prototype.destroy=function(){e.prototype.destroy.call(this),this.renderFrame.unrender(),this.calendar.unregisterInteractiveComponent(this)},n.prototype._renderFrame=function(e){var r=this,n=r.theme,i=r.dateEnv,o=i.format(e,t.createFormatter(this.opt("dayPopoverFormat")));this.el.innerHTML='<div class="fc-header '+n.getClass("popoverHeader")+'"><span class="fc-title">'+t.htmlEscape(o)+'</span><span class="fc-close '+n.getIconClass("close")+'"></span></div><div class="fc-body '+n.getClass("popoverContent")+'"><div class="fc-event-container"></div></div>',this.segContainerEl=this.el.querySelector(".fc-event-container")},n.prototype.queryHit=function(e,r,n,i){var o=this.props.date;if(e<n&&r<i)return{component:this,dateSpan:{allDay:!0,range:{start:o,end:t.addDays(o,1)}},dayEl:this.el,rect:{left:0,top:0,right:n,bottom:i},layer:1}},n}(t.DateComponent),m=function(e){function n(t){var r=e.call(this,t.context)||this;return r.dayTile=t,r}return r(n,e),n.prototype.attachSegs=function(e){for(var t=0,r=e;t<r.length;t++){var n=r[t];this.dayTile.segContainerEl.appendChild(n.el)}},n.prototype.detachSegs=function(e){for(var r=0,n=e;r<n.length;r++){var i=n[r];t.removeElement(i.el)}},n}(h),y=function(){function e(e){this.context=e}return e.prototype.renderHtml=function(e){var t=[];e.renderIntroHtml&&t.push(e.renderIntroHtml());for(var r=0,n=e.cells;r<n.length;r++){var i=n[r];t.push(o(i.date,e.dateProfile,this.context,i.htmlAttrs))}return e.cells.length||t.push('<td class="fc-day '+this.context.theme.getClass("widgetContent")+'"></td>'),"rtl"===this.context.options.dir&&t.reverse(),"<tr>"+t.join("")+"</tr>"},e}(),v=t.createFormatter({day:"numeric"}),b=t.createFormatter({week:"numeric"}),w=function(e){function n(r,n,i){var o=e.call(this,r,n)||this;o.bottomCoordPadding=0,o.isCellSizesDirty=!1;var s=o.eventRenderer=new p(o),l=o.fillRenderer=new f(o);o.mirrorRenderer=new u(o);var a=o.renderCells=t.memoizeRendering(o._renderCells,o._unrenderCells);return o.renderBusinessHours=t.memoizeRendering(l.renderSegs.bind(l,"businessHours"),l.unrender.bind(l,"businessHours"),[a]),o.renderDateSelection=t.memoizeRendering(l.renderSegs.bind(l,"highlight"),l.unrender.bind(l,"highlight"),[a]),o.renderBgEvents=t.memoizeRendering(l.renderSegs.bind(l,"bgEvent"),l.unrender.bind(l,"bgEvent"),[a]),o.renderFgEvents=t.memoizeRendering(s.renderSegs.bind(s),s.unrender.bind(s),[a]),o.renderEventSelection=t.memoizeRendering(s.selectByInstanceId.bind(s),s.unselectByInstanceId.bind(s),[o.renderFgEvents]),o.renderEventDrag=t.memoizeRendering(o._renderEventDrag,o._unrenderEventDrag,[a]),o.renderEventResize=t.memoizeRendering(o._renderEventResize,o._unrenderEventResize,[a]),o.renderProps=i,o}return r(n,e),n.prototype.render=function(e){var t=e.cells;this.rowCnt=t.length,this.colCnt=t[0].length,this.renderCells(t,e.isRigid),this.renderBusinessHours(e.businessHourSegs),this.renderDateSelection(e.dateSelectionSegs),this.renderBgEvents(e.bgEventSegs),this.renderFgEvents(e.fgEventSegs),this.renderEventSelection(e.eventSelection),this.renderEventDrag(e.eventDrag),this.renderEventResize(e.eventResize),this.segPopoverTile&&this.updateSegPopoverTile()},n.prototype.destroy=function(){e.prototype.destroy.call(this),this.renderCells.unrender()},n.prototype.getCellRange=function(e,r){var n=this.props.cells[e][r].date;return{start:n,end:t.addDays(n,1)}},n.prototype.updateSegPopoverTile=function(e,t){var r=this.props;this.segPopoverTile.receiveProps({date:e||this.segPopoverTile.props.date,fgSegs:t||this.segPopoverTile.props.fgSegs,eventSelection:r.eventSelection,eventDragInstances:r.eventDrag?r.eventDrag.affectedInstances:null,eventResizeInstances:r.eventResize?r.eventResize.affectedInstances:null})},n.prototype._renderCells=function(e,r){var n,i,o=this,s=o.view,l=o.dateEnv,a=this,d=a.rowCnt,c=a.colCnt,h="";for(n=0;n<d;n++)h+=this.renderDayRowHtml(n,r);for(this.el.innerHTML=h,this.rowEls=t.findElements(this.el,".fc-row"),this.cellEls=t.findElements(this.el,".fc-day, .fc-disabled-day"),this.isRtl&&this.cellEls.reverse(),this.rowPositions=new t.PositionCache(this.el,this.rowEls,!1,!0),this.colPositions=new t.PositionCache(this.el,this.cellEls.slice(0,c),!0,!1),n=0;n<d;n++)for(i=0;i<c;i++)this.publiclyTrigger("dayRender",[{date:l.toDate(e[n][i].date),el:this.getCellEl(n,i),view:s}]);this.isCellSizesDirty=!0},n.prototype._unrenderCells=function(){this.removeSegPopover()},n.prototype.renderDayRowHtml=function(e,t){var r=this.theme,n=["fc-row","fc-week",r.getClass("dayRow")];t&&n.push("fc-rigid");var i=new y(this.context);return'<div class="'+n.join(" ")+'"><div class="fc-bg"><table class="'+r.getClass("tableGrid")+'">'+i.renderHtml({cells:this.props.cells[e],dateProfile:this.props.dateProfile,renderIntroHtml:this.renderProps.renderBgIntroHtml})+'</table></div><div class="fc-content-skeleton"><table>'+(this.getIsNumbersVisible()?"<thead>"+this.renderNumberTrHtml(e)+"</thead>":"")+"</table></div></div>"},n.prototype.getIsNumbersVisible=function(){return this.getIsDayNumbersVisible()||this.renderProps.cellWeekNumbersVisible||this.renderProps.colWeekNumbersVisible},n.prototype.getIsDayNumbersVisible=function(){return this.rowCnt>1},n.prototype.renderNumberTrHtml=function(e){var t=this.renderProps.renderNumberIntroHtml(e,this);return"<tr>"+(this.isRtl?"":t)+this.renderNumberCellsHtml(e)+(this.isRtl?t:"")+"</tr>"},n.prototype.renderNumberCellsHtml=function(e){var t,r,n=[];for(t=0;t<this.colCnt;t++)r=this.props.cells[e][t].date,n.push(this.renderNumberCellHtml(r));return this.isRtl&&n.reverse(),n.join("")},n.prototype.renderNumberCellHtml=function(e){var r,n,i=this,o=i.view,s=i.dateEnv,l="",a=t.rangeContainsMarker(this.props.dateProfile.activeRange,e),d=this.getIsDayNumbersVisible()&&a;return d||this.renderProps.cellWeekNumbersVisible?(r=t.getDayClasses(e,this.props.dateProfile,this.context),r.unshift("fc-day-top"),this.renderProps.cellWeekNumbersVisible&&(n=s.weekDow),l+='<td class="'+r.join(" ")+'"'+(a?' data-date="'+s.formatIso(e,{omitTime:!0})+'"':"")+">",this.renderProps.cellWeekNumbersVisible&&e.getUTCDay()===n&&(l+=t.buildGotoAnchorHtml(o,{date:e,type:"week"},{class:"fc-week-number"},s.format(e,b))),d&&(l+=t.buildGotoAnchorHtml(o,e,{class:"fc-day-number"},s.format(e,v))),l+="</td>"):"<td></td>"},n.prototype.updateSize=function(e){var t=this,r=t.fillRenderer,n=t.eventRenderer,i=t.mirrorRenderer;(e||this.isCellSizesDirty||this.view.calendar.isEventsUpdated)&&(this.buildPositionCaches(),this.isCellSizesDirty=!1),r.computeSizes(e),n.computeSizes(e),i.computeSizes(e),r.assignSizes(e),n.assignSizes(e),i.assignSizes(e)},n.prototype.buildPositionCaches=function(){this.buildColPositions(),this.buildRowPositions()},n.prototype.buildColPositions=function(){this.colPositions.build()},n.prototype.buildRowPositions=function(){this.rowPositions.build(),this.rowPositions.bottoms[this.rowCnt-1]+=this.bottomCoordPadding},n.prototype.positionToHit=function(e,t){var r=this,n=r.colPositions,i=r.rowPositions,o=n.leftToIndex(e),s=i.topToIndex(t);if(null!=s&&null!=o)return{row:s,col:o,dateSpan:{range:this.getCellRange(s,o),allDay:!0},dayEl:this.getCellEl(s,o),relativeRect:{left:n.lefts[o],right:n.rights[o],top:i.tops[s],bottom:i.bottoms[s]}}},n.prototype.getCellEl=function(e,t){return this.cellEls[e*this.colCnt+t]},n.prototype._renderEventDrag=function(e){e&&(this.eventRenderer.hideByHash(e.affectedInstances),this.fillRenderer.renderSegs("highlight",e.segs))},n.prototype._unrenderEventDrag=function(e){e&&(this.eventRenderer.showByHash(e.affectedInstances),this.fillRenderer.unrender("highlight"))},n.prototype._renderEventResize=function(e){e&&(this.eventRenderer.hideByHash(e.affectedInstances),this.fillRenderer.renderSegs("highlight",e.segs),this.mirrorRenderer.renderSegs(e.segs,{isResizing:!0,sourceSeg:e.sourceSeg}))},n.prototype._unrenderEventResize=function(e){e&&(this.eventRenderer.showByHash(e.affectedInstances),this.fillRenderer.unrender("highlight"),this.mirrorRenderer.unrender(e.segs,{isResizing:!0,sourceSeg:e.sourceSeg}))},n.prototype.removeSegPopover=function(){this.segPopover&&this.segPopover.hide()},n.prototype.limitRows=function(e){var t,r,n=this.eventRenderer.rowStructs||[];for(t=0;t<n.length;t++)this.unlimitRow(t),!1!==(r=!!e&&("number"==typeof e?e:this.computeRowLevelLimit(t)))&&this.limitRow(t,r)},n.prototype.computeRowLevelLimit=function(e){var r,n,i=this.rowEls[e],o=i.getBoundingClientRect().bottom,s=t.findChildren(this.eventRenderer.rowStructs[e].tbodyEl);for(r=0;r<s.length;r++)if(n=s[r],n.classList.remove("fc-limited"),n.getBoundingClientRect().bottom>o)return r;return!1},n.prototype.limitRow=function(e,r){var n,i,o,s,l,a,d,c,h,p,u,f,g,m,y,v=this,b=this,w=b.colCnt,S=b.isRtl,C=this.eventRenderer.rowStructs[e],E=[],R=0,H=function(n){for(;R<n;)a=v.getCellSegs(e,R,r),a.length&&(h=i[r-1][R],y=v.renderMoreLink(e,R,a),m=t.createElement("div",null,y),h.appendChild(m),E.push(m)),R++};if(r&&r<C.segLevels.length){for(n=C.segLevels[r-1],i=C.cellMatrix,o=t.findChildren(C.tbodyEl).slice(r),o.forEach(function(e){e.classList.add("fc-limited")}),s=0;s<n.length;s++){l=n[s];var D=S?w-1-l.lastCol:l.firstCol,P=S?w-1-l.firstCol:l.lastCol;for(H(D),c=[],d=0;R<=P;)a=this.getCellSegs(e,R,r),c.push(a),d+=a.length,R++;if(d){for(h=i[r-1][D],p=h.rowSpan||1,u=[],f=0;f<c.length;f++)g=t.createElement("td",{className:"fc-more-cell",rowSpan:p}),a=c[f],y=this.renderMoreLink(e,D+f,[l].concat(a)),m=t.createElement("div",null,y),g.appendChild(m),u.push(g),E.push(g);h.classList.add("fc-limited"),t.insertAfterElement(h,u),o.push(h)}}H(this.colCnt),C.moreEls=E,C.limitedEls=o}},n.prototype.unlimitRow=function(e){var r=this.eventRenderer.rowStructs[e];r.moreEls&&(r.moreEls.forEach(t.removeElement),r.moreEls=null),r.limitedEls&&(r.limitedEls.forEach(function(e){e.classList.remove("fc-limited")}),r.limitedEls=null)},n.prototype.renderMoreLink=function(e,r,n){var i=this,o=this,s=o.view,l=o.dateEnv,a=t.createElement("a",{className:"fc-more"});return a.innerText=this.getMoreLinkText(n.length),a.addEventListener("click",function(t){var o=i.opt("eventLimitClick"),a=i.isRtl?i.colCnt-r-1:r,d=i.props.cells[e][a].date,c=t.currentTarget,h=i.getCellEl(e,r),p=i.getCellSegs(e,r),u=i.resliceDaySegs(p,d),f=i.resliceDaySegs(n,d);"function"==typeof o&&(o=i.publiclyTrigger("eventLimitClick",[{date:l.toDate(d),allDay:!0,dayEl:h,moreEl:c,segs:u,hiddenSegs:f,jsEvent:t,view:s}])),"popover"===o?i.showSegPopover(e,r,c,u):"string"==typeof o&&s.calendar.zoomTo(d,o)}),a},n.prototype.showSegPopover=function(e,r,n,i){var o,s,l=this,a=this,d=a.calendar,h=a.view,p=a.theme,u=this.isRtl?this.colCnt-r-1:r,f=n.parentNode;o=1===this.rowCnt?h.el:this.rowEls[e],s={className:"fc-more-popover "+p.getClass("popover"),parentEl:h.el,top:t.computeRect(o).top,autoHide:!0,content:function(t){l.segPopoverTile=new g(l.context,t),l.updateSegPopoverTile(l.props.cells[e][u].date,i)},hide:function(){l.segPopoverTile.destroy(),l.segPopoverTile=null,l.segPopover.destroy(),l.segPopover=null}},this.isRtl?s.right=t.computeRect(f).right+1:s.left=t.computeRect(f).left-1,this.segPopover=new c(s),this.segPopover.show(),d.releaseAfterSizingTriggers()},n.prototype.resliceDaySegs=function(e,r){for(var n=r,i=t.addDays(n,1),o={start:n,end:i},s=[],l=0,d=e;l<d.length;l++){var c=d[l],h=c.eventRange,p=h.range,u=t.intersectRanges(p,o);u&&s.push(a({},c,{eventRange:{def:h.def,ui:a({},h.ui,{durationEditable:!1}),instance:h.instance,range:u},isStart:c.isStart&&u.start.valueOf()===p.start.valueOf(),isEnd:c.isEnd&&u.end.valueOf()===p.end.valueOf()}))}return s},n.prototype.getMoreLinkText=function(e){var t=this.opt("eventLimitText");return"function"==typeof t?t(e):"+"+e+" "+t},n.prototype.getCellSegs=function(e,t,r){for(var n,i=this.eventRenderer.rowStructs[e].segMatrix,o=r||0,s=[];o<i.length;)n=i[o][t],n&&s.push(n),o++;return s},n}(t.DateComponent),S=t.createFormatter({week:"numeric"}),C=function(e){function n(r,n,i,o){var s=e.call(this,r,n,i,o)||this;s.renderHeadIntroHtml=function(){var e=s.theme;return s.colWeekNumbersVisible?'<th class="fc-week-number '+e.getClass("widgetHeader")+'" '+s.weekNumberStyleAttr()+"><span>"+t.htmlEscape(s.opt("weekLabel"))+"</span></th>":""},s.renderDayGridNumberIntroHtml=function(e,r){var n=s.dateEnv,i=r.props.cells[e][0].date;return s.colWeekNumbersVisible?'<td class="fc-week-number" '+s.weekNumberStyleAttr()+">"+t.buildGotoAnchorHtml(s,{date:i,type:"week",forceOff:1===r.colCnt},n.format(i,S))+"</td>":""},s.renderDayGridBgIntroHtml=function(){var e=s.theme;return s.colWeekNumbersVisible?'<td class="fc-week-number '+e.getClass("widgetContent")+'" '+s.weekNumberStyleAttr()+"></td>":""},s.renderDayGridIntroHtml=function(){return s.colWeekNumbersVisible?'<td class="fc-week-number" '+s.weekNumberStyleAttr()+"></td>":""},s.el.classList.add("fc-dayGrid-view"),s.el.innerHTML=s.renderSkeletonHtml(),s.scroller=new t.ScrollComponent("hidden","auto");var l=s.scroller.el;s.el.querySelector(".fc-body > tr > td").appendChild(l),l.classList.add("fc-day-grid-container");var a=t.createElement("div",{className:"fc-day-grid"});l.appendChild(a);var d;return s.opt("weekNumbers")?s.opt("weekNumbersWithinDays")?(d=!0,s.colWeekNumbersVisible=!1):(d=!1,s.colWeekNumbersVisible=!0):(s.colWeekNumbersVisible=!1,d=!1),s.dayGrid=new w(s.context,a,{renderNumberIntroHtml:s.renderDayGridNumberIntroHtml,renderBgIntroHtml:s.renderDayGridBgIntroHtml,renderIntroHtml:s.renderDayGridIntroHtml,colWeekNumbersVisible:s.colWeekNumbersVisible,cellWeekNumbersVisible:d}),s}return r(n,e),n.prototype.destroy=function(){e.prototype.destroy.call(this),this.dayGrid.destroy(),this.scroller.destroy()},n.prototype.renderSkeletonHtml=function(){var e=this.theme;return'<table class="'+e.getClass("tableGrid")+'">'+(this.opt("columnHeader")?'<thead class="fc-head"><tr><td class="fc-head-container '+e.getClass("widgetHeader")+'">&nbsp;</td></tr></thead>':"")+'<tbody class="fc-body"><tr><td class="'+e.getClass("widgetContent")+'"></td></tr></tbody></table>'},n.prototype.weekNumberStyleAttr=function(){return null!=this.weekNumberWidth?'style="width:'+this.weekNumberWidth+'px"':""},n.prototype.hasRigidRows=function(){var e=this.opt("eventLimit");return e&&"number"!=typeof e},n.prototype.updateSize=function(t,r,n){e.prototype.updateSize.call(this,t,r,n),this.dayGrid.updateSize(t)},n.prototype.updateBaseSize=function(e,r,n){var i,o,s=this.dayGrid,l=this.opt("eventLimit"),a=this.header?this.header.el:null;if(!s.rowEls)return void(n||(i=this.computeScrollerHeight(r),this.scroller.setHeight(i)));this.colWeekNumbersVisible&&(this.weekNumberWidth=t.matchCellWidths(t.findElements(this.el,".fc-week-number"))),this.scroller.clear(),a&&t.uncompensateScroll(a),s.removeSegPopover(),l&&"number"==typeof l&&s.limitRows(l),i=this.computeScrollerHeight(r),this.setGridHeight(i,n),l&&"number"!=typeof l&&s.limitRows(l),n||(this.scroller.setHeight(i),o=this.scroller.getScrollbarWidths(),(o.left||o.right)&&(a&&t.compensateScroll(a,o),i=this.computeScrollerHeight(r),this.scroller.setHeight(i)),this.scroller.lockOverflow(o))},n.prototype.computeScrollerHeight=function(e){return e-t.subtractInnerElHeight(this.el,this.scroller.el)},n.prototype.setGridHeight=function(e,r){this.opt("monthMode")?(r&&(e*=this.dayGrid.rowCnt/6),t.distributeHeight(this.dayGrid.rowEls,e,!r)):r?t.undistributeHeight(this.dayGrid.rowEls):t.distributeHeight(this.dayGrid.rowEls,e,!0)},n.prototype.computeDateScroll=function(e){return{top:0}},n.prototype.queryDateScroll=function(){return{top:this.scroller.getScrollTop()}},n.prototype.applyDateScroll=function(e){void 0!==e.top&&this.scroller.setScrollTop(e.top)},n}(t.View);C.prototype.dateProfileGeneratorClass=d;var E=function(e){function t(t,r){var n=e.call(this,t,r.el)||this;return n.slicer=new R,n.dayGrid=r,t.calendar.registerInteractiveComponent(n,{el:n.dayGrid.el}),n}return r(t,e),t.prototype.destroy=function(){e.prototype.destroy.call(this),this.calendar.unregisterInteractiveComponent(this)},t.prototype.render=function(e){var t=this.dayGrid,r=e.dateProfile,n=e.dayTable;t.receiveProps(a({},this.slicer.sliceProps(e,r,e.nextDayThreshold,t,n),{dateProfile:r,cells:n.cells,isRigid:e.isRigid}))},t.prototype.buildPositionCaches=function(){this.dayGrid.buildPositionCaches()},t.prototype.queryHit=function(e,t){var r=this.dayGrid.positionToHit(e,t);if(r)return{component:this.dayGrid,dateSpan:r.dateSpan,dayEl:r.dayEl,rect:{left:r.relativeRect.left,right:r.relativeRect.right,top:r.relativeRect.top,bottom:r.relativeRect.bottom},layer:0}},t}(t.DateComponent),R=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return r(t,e),t.prototype.sliceRange=function(e,t){return t.sliceRange(e)},t}(t.Slicer),H=function(e){function n(r,n,i,o){var l=e.call(this,r,n,i,o)||this;return l.buildDayTable=t.memoize(s),l.opt("columnHeader")&&(l.header=new t.DayHeader(l.context,l.el.querySelector(".fc-head-container"))),l.simpleDayGrid=new E(l.context,l.dayGrid),l}return r(n,e),n.prototype.destroy=function(){e.prototype.destroy.call(this),this.header&&this.header.destroy(),this.simpleDayGrid.destroy()},n.prototype.render=function(t){e.prototype.render.call(this,t);var r=this.props.dateProfile,n=this.dayTable=this.buildDayTable(r,this.dateProfileGenerator);this.header&&this.header.receiveProps({dateProfile:r,dates:n.headerDates,datesRepDistinctDays:1===n.rowCnt,renderIntroHtml:this.renderHeadIntroHtml}),this.simpleDayGrid.receiveProps({dateProfile:r,dayTable:n,businessHours:t.businessHours,dateSelection:t.dateSelection,eventStore:t.eventStore,eventUiBases:t.eventUiBases,eventSelection:t.eventSelection,eventDrag:t.eventDrag,eventResize:t.eventResize,isRigid:this.hasRigidRows(),nextDayThreshold:this.nextDayThreshold})},n}(C),D=t.createPlugin({defaultView:"dayGridMonth",views:{dayGrid:H,dayGridDay:{type:"dayGrid",duration:{days:1}},dayGridWeek:{type:"dayGrid",duration:{weeks:1}},dayGridMonth:{type:"dayGrid",duration:{months:1},monthMode:!0,fixedWeekCount:!0}}});e.AbstractDayGridView=C,e.DayBgRow=y,e.DayGrid=w,e.DayGridSlicer=R,e.DayGridView=H,e.SimpleDayGrid=E,e.buildBasicDayTable=s,e.default=D,Object.defineProperty(e,"__esModule",{value:!0})});

/*!
FullCalendar Google Calendar Plugin v4.2.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports,require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","@fullcalendar/core"],r):(e=e||self,r(e.FullCalendarGoogleCalendar={},e.FullCalendar))}(this,function(e,r){"use strict";function t(e){var r;return/^[^\/]+@([^\/\.]+\.)*(google|googlemail|gmail)\.com$/.test(e)?e:(r=/^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^\/]*)/.exec(e))||(r=/^https?:\/\/www.google.com\/calendar\/feeds\/([^\/]*)/.exec(e))?decodeURIComponent(r[1]):void 0}function n(e){return s+"/"+encodeURIComponent(e.googleCalendarId)+"/events"}function o(e,t,n,o){var a,l,i;return o.canComputeOffset?(l=o.formatIso(e.start),i=o.formatIso(e.end)):(l=r.addDays(e.start,-1).toISOString(),i=r.addDays(e.end,1).toISOString()),a=d({},n||{},{key:t,timeMin:l,timeMax:i,singleEvents:!0,maxResults:9999}),"local"!==o.timeZone&&(a.timeZone=o.timeZone),a}function a(e,r){return e.map(function(e){return l(e,r)})}function l(e,r){var t=e.htmlLink||null;return t&&r&&(t=i(t,"ctz="+r)),{id:e.id,title:e.summary,start:e.start.dateTime||e.start.date,end:e.end.dateTime||e.end.date,url:t,location:e.location,description:e.description}}function i(e,r){return e.replace(/(\?.*?)?(#|$)/,function(e,t,n){return(t?t+"&":"?")+r+n})}/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
var d=function(){return d=Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++){r=arguments[t];for(var o in r)Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o])}return e},d.apply(this,arguments)},s="https://www.googleapis.com/calendar/v3/calendars",c={url:String,googleCalendarApiKey:String,googleCalendarId:String,data:null},u={parseMeta:function(e){if("string"==typeof e&&(e={url:e}),"object"==typeof e){var n=r.refineProps(e,c);if(!n.googleCalendarId&&n.url&&(n.googleCalendarId=t(n.url)),delete n.url,n.googleCalendarId)return n}return null},fetch:function(e,t,l){var i=e.calendar,d=e.eventSource.meta,s=d.googleCalendarApiKey||i.opt("googleCalendarApiKey");if(s){var c=n(d),u=o(e.range,s,d.data,i.dateEnv);r.requestJson("GET",c,u,function(e,r){e.error?l({message:"Google Calendar API: "+e.error.message,errors:e.error.errors,xhr:r}):t({rawEvents:a(e.items,u.timeZone),xhr:r})},function(e,r){l({message:e,xhr:r})})}else l({message:"Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/"})}},g=r.createPlugin({eventSourceDefs:[u]});e.default=g,Object.defineProperty(e,"__esModule",{value:!0})});


/*!
FullCalendar List View Plugin v4.2.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","@fullcalendar/core"],t):(e=e||self,t(e.FullCalendarList={},e.FullCalendar))}(this,function(e,t){"use strict";function n(e,t){function n(){this.constructor=e}s(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}function r(e){for(var n=t.startOfDay(e.renderRange.start),r=e.renderRange.end,s=[],a=[];n<r;)s.push(n),a.push({start:n,end:t.addDays(n,1)}),n=t.addDays(n,1);return{dayDates:s,dayRanges:a}}/*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
var s=function(e,t){return(s=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])})(e,t)},a=function(e){function r(t){var n=e.call(this,t.context)||this;return n.listView=t,n}return n(r,e),r.prototype.attachSegs=function(e){e.length?this.listView.renderSegList(e):this.listView.renderEmptyMessage()},r.prototype.detachSegs=function(){},r.prototype.renderSegHtml=function(e){var n,r=this.context,s=r.view,a=r.theme,i=e.eventRange,o=i.def,l=i.instance,d=i.ui,c=o.url,p=["fc-list-item"].concat(d.classNames),h=d.backgroundColor;return n=o.allDay?t.getAllDayHtml(s):t.isMultiDayRange(i.range)?e.isStart?t.htmlEscape(this._getTimeText(l.range.start,e.end,!1)):e.isEnd?t.htmlEscape(this._getTimeText(e.start,l.range.end,!1)):t.getAllDayHtml(s):t.htmlEscape(this.getTimeText(i)),c&&p.push("fc-has-url"),'<tr class="'+p.join(" ")+'">'+(this.displayEventTime?'<td class="fc-list-item-time '+a.getClass("widgetContent")+'">'+(n||"")+"</td>":"")+'<td class="fc-list-item-marker '+a.getClass("widgetContent")+'"><span class="fc-event-dot"'+(h?' style="background-color:'+h+'"':"")+'></span></td><td class="fc-list-item-title '+a.getClass("widgetContent")+'"><a'+(c?' href="'+t.htmlEscape(c)+'"':"")+">"+t.htmlEscape(o.title||"")+"</a></td></tr>"},r.prototype.computeEventTimeFormat=function(){return{hour:"numeric",minute:"2-digit",meridiem:"short"}},r}(t.FgEventRenderer),i=function(e){function s(n,s,i,o){var l=e.call(this,n,s,i,o)||this;l.computeDateVars=t.memoize(r),l.eventStoreToSegs=t.memoize(l._eventStoreToSegs);var d=l.eventRenderer=new a(l);l.renderContent=t.memoizeRendering(d.renderSegs.bind(d),d.unrender.bind(d)),l.el.classList.add("fc-list-view");for(var c=(l.theme.getClass("listView")||"").split(" "),p=0,h=c;p<h.length;p++){var u=h[p];u&&l.el.classList.add(u)}return l.scroller=new t.ScrollComponent("hidden","auto"),l.el.appendChild(l.scroller.el),l.contentEl=l.scroller.el,n.calendar.registerInteractiveComponent(l,{el:l.el}),l}return n(s,e),s.prototype.render=function(e){var t=this.computeDateVars(e.dateProfile),n=t.dayDates,r=t.dayRanges;this.dayDates=n,this.renderContent(this.eventStoreToSegs(e.eventStore,e.eventUiBases,r))},s.prototype.destroy=function(){e.prototype.destroy.call(this),this.scroller.destroy(),this.calendar.unregisterInteractiveComponent(this)},s.prototype.updateSize=function(t,n,r){e.prototype.updateSize.call(this,t,n,r),this.eventRenderer.computeSizes(t),this.eventRenderer.assignSizes(t),this.scroller.clear(),r||this.scroller.setHeight(this.computeScrollerHeight(n))},s.prototype.computeScrollerHeight=function(e){return e-t.subtractInnerElHeight(this.el,this.scroller.el)},s.prototype._eventStoreToSegs=function(e,n,r){return this.eventRangesToSegs(t.sliceEventStore(e,n,this.props.dateProfile.activeRange,this.nextDayThreshold).fg,r)},s.prototype.eventRangesToSegs=function(e,t){for(var n=[],r=0,s=e;r<s.length;r++){var a=s[r];n.push.apply(n,this.eventRangeToSegs(a,t))}return n},s.prototype.eventRangeToSegs=function(e,n){var r,s,a,i=this,o=i.dateEnv,l=i.nextDayThreshold,d=e.range,c=e.def.allDay,p=[];for(r=0;r<n.length;r++)if((s=t.intersectRanges(d,n[r]))&&(a={component:this,eventRange:e,start:s.start,end:s.end,isStart:e.isStart&&s.start.valueOf()===d.start.valueOf(),isEnd:e.isEnd&&s.end.valueOf()===d.end.valueOf(),dayIndex:r},p.push(a),!a.isEnd&&!c&&r+1<n.length&&d.end<o.add(n[r+1].start,l))){a.end=d.end,a.isEnd=!0;break}return p},s.prototype.renderEmptyMessage=function(){this.contentEl.innerHTML='<div class="fc-list-empty-wrap2"><div class="fc-list-empty-wrap1"><div class="fc-list-empty">'+t.htmlEscape(this.opt("noEventsMessage"))+"</div></div></div>"},s.prototype.renderSegList=function(e){var n,r,s,a=this.groupSegsByDay(e),i=t.htmlToElement('<table class="fc-list-table '+this.calendar.theme.getClass("tableList")+'"><tbody></tbody></table>'),o=i.querySelector("tbody");for(n=0;n<a.length;n++)if(r=a[n])for(o.appendChild(this.buildDayHeaderRow(this.dayDates[n])),r=this.eventRenderer.sortEventSegs(r),s=0;s<r.length;s++)o.appendChild(r[s].el);this.contentEl.innerHTML="",this.contentEl.appendChild(i)},s.prototype.groupSegsByDay=function(e){var t,n,r=[];for(t=0;t<e.length;t++)n=e[t],(r[n.dayIndex]||(r[n.dayIndex]=[])).push(n);return r},s.prototype.buildDayHeaderRow=function(e){var n=this.dateEnv,r=t.createFormatter(this.opt("listDayFormat")),s=t.createFormatter(this.opt("listDayAltFormat"));return t.createElement("tr",{className:"fc-list-heading","data-date":n.formatIso(e,{omitTime:!0})},'<td class="'+(this.calendar.theme.getClass("tableListHeading")||this.calendar.theme.getClass("widgetHeader"))+'" colspan="3">'+(r?t.buildGotoAnchorHtml(this,e,{class:"fc-list-heading-main"},t.htmlEscape(n.format(e,r))):"")+(s?t.buildGotoAnchorHtml(this,e,{class:"fc-list-heading-alt"},t.htmlEscape(n.format(e,s))):"")+"</td>")},s}(t.View);i.prototype.fgSegSelector=".fc-list-item";var o=t.createPlugin({views:{list:{class:i,buttonTextKey:"list",listDayFormat:{month:"long",day:"numeric",year:"numeric"}},listDay:{type:"list",duration:{days:1},listDayFormat:{weekday:"long"}},listWeek:{type:"list",duration:{weeks:1},listDayFormat:{weekday:"long"},listDayAltFormat:{month:"long",day:"numeric",year:"numeric"}},listMonth:{type:"list",duration:{month:1},listDayAltFormat:{weekday:"long"}},listYear:{type:"list",duration:{year:1},listDayAltFormat:{weekday:"long"}}}});e.ListView=i,e.default=o,Object.defineProperty(e,"__esModule",{value:!0})});

/*!
FullCalendar Moment Plugin v4.3.0
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports,require("moment"),require("@fullcalendar/core")):"function"==typeof define&&define.amd?define(["exports","moment","@fullcalendar/core"],t):t((e=e||self).FullCalendarMoment={},e.moment,e.FullCalendar)}(this,function(e,t,n){"use strict";var r=t;var a=n.createPlugin({cmdFormatter:function(e,t){var n=function e(t){var n=t.match(/^(.*?)\{(.*)\}(.*)$/);if(n){var r=e(n[2]);return{head:n[1],middle:r,tail:n[3],whole:n[1]+r.whole+n[3]}}return{head:null,middle:null,tail:null,whole:t}}(e);if(t.end){var r=l(t.start.array,t.timeZone,t.start.timeZoneOffset,t.localeCodes[0]),a=l(t.end.array,t.timeZone,t.end.timeZoneOffset,t.localeCodes[0]);return function e(t,n,r,a){if(t.middle){var o=n(t.head),l=e(t.middle,n,r,a),u=n(t.tail),i=r(t.head),d=e(t.middle,n,r,a),f=r(t.tail);if(o===i&&u===f)return o+(l===d?l:l+a+d)+u}var c=n(t.whole),m=r(t.whole);return c===m?c:c+a+m}(n,o(r),o(a),t.separator)}return l(t.date.array,t.timeZone,t.date.timeZoneOffset,t.localeCodes[0]).format(n.whole)}});function o(e){return function(t){return t?e.format(t):""}}function l(e,t,n,a){var o;return"local"===t?o=r(e):"UTC"===t?o=r.utc(e):r.tz?o=r.tz(e,t):(o=r.utc(e),null!=n&&o.utcOffset(n)),o.locale(a),o}e.default=a,e.toDuration=function(e){return r.duration(e)},e.toMoment=function(e,t){if(!(t instanceof n.Calendar))throw new Error("must supply a Calendar instance");return l(e,t.dateEnv.timeZone,null,t.dateEnv.locale.codes[0])},Object.defineProperty(e,"__esModule",{value:!0})});

!function(t,o){"function"==typeof define&&define.amd?define(o):"object"==typeof exports?module.exports=o():t.tingle=o()}(this,function(){function t(t){var o={onClose:null,onOpen:null,beforeOpen:null,beforeClose:null,stickyFooter:!1,footer:!1,cssClass:[],closeLabel:"Close",closeMethods:["overlay","button","escape"]};this.opts=r({},o,t),this.init()}function o(){return'<svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg"><path d="M.3 9.7c.2.2.4.3.7.3.3 0 .5-.1.7-.3L5 6.4l3.3 3.3c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L6.4 5l3.3-3.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0L5 3.6 1.7.3C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L3.6 5 .3 8.3c-.4.4-.4 1 0 1.4z" fill="#000" fill-rule="nonzero"/></svg>'}function e(){this.modalBoxFooter&&(this.modalBoxFooter.style.width=this.modalBox.clientWidth+"px",this.modalBoxFooter.style.left=this.modalBox.offsetLeft+"px")}function s(){this.modal=document.createElement("div"),this.modal.classList.add("tingle-modal"),0!==this.opts.closeMethods.length&&-1!==this.opts.closeMethods.indexOf("overlay")||this.modal.classList.add("tingle-modal--noOverlayClose"),this.modal.style.display="none",this.opts.cssClass.forEach(function(t){"string"==typeof t&&this.modal.classList.add(t)},this),-1!==this.opts.closeMethods.indexOf("button")&&(this.modalCloseBtn=document.createElement("button"),this.modalCloseBtn.type="button",this.modalCloseBtn.classList.add("tingle-modal__close"),this.modalCloseBtnIcon=document.createElement("span"),this.modalCloseBtnIcon.classList.add("tingle-modal__closeIcon"),this.modalCloseBtnIcon.innerHTML=o(),this.modalCloseBtnLabel=document.createElement("span"),this.modalCloseBtnLabel.classList.add("tingle-modal__closeLabel"),this.modalCloseBtnLabel.innerHTML=this.opts.closeLabel,this.modalCloseBtn.appendChild(this.modalCloseBtnIcon),this.modalCloseBtn.appendChild(this.modalCloseBtnLabel)),this.modalBox=document.createElement("div"),this.modalBox.classList.add("tingle-modal-box"),this.modalBoxContent=document.createElement("div"),this.modalBoxContent.classList.add("tingle-modal-box__content"),this.modalBox.appendChild(this.modalBoxContent),-1!==this.opts.closeMethods.indexOf("button")&&this.modal.appendChild(this.modalCloseBtn),this.modal.appendChild(this.modalBox)}function i(){this.modalBoxFooter=document.createElement("div"),this.modalBoxFooter.classList.add("tingle-modal-box__footer"),this.modalBox.appendChild(this.modalBoxFooter)}function n(){this._events={clickCloseBtn:this.close.bind(this),clickOverlay:d.bind(this),resize:this.checkOverflow.bind(this),keyboardNav:l.bind(this)},-1!==this.opts.closeMethods.indexOf("button")&&this.modalCloseBtn.addEventListener("click",this._events.clickCloseBtn),this.modal.addEventListener("mousedown",this._events.clickOverlay),window.addEventListener("resize",this._events.resize),document.addEventListener("keydown",this._events.keyboardNav)}function l(t){-1!==this.opts.closeMethods.indexOf("escape")&&27===t.which&&this.isOpen()&&this.close()}function d(t){-1!==this.opts.closeMethods.indexOf("overlay")&&!a(t.target,"tingle-modal")&&t.clientX<this.modal.clientWidth&&this.close()}function a(t,o){for(;(t=t.parentElement)&&!t.classList.contains(o););return t}function h(){-1!==this.opts.closeMethods.indexOf("button")&&this.modalCloseBtn.removeEventListener("click",this._events.clickCloseBtn),this.modal.removeEventListener("mousedown",this._events.clickOverlay),window.removeEventListener("resize",this._events.resize),document.removeEventListener("keydown",this._events.keyboardNav)}function r(){for(var t=1;t<arguments.length;t++)for(var o in arguments[t])arguments[t].hasOwnProperty(o)&&(arguments[0][o]=arguments[t][o]);return arguments[0]}var c=!1;return t.prototype.init=function(){if(!this.modal)return s.call(this),n.call(this),document.body.insertBefore(this.modal,document.body.firstChild),this.opts.footer&&this.addFooter(),this},t.prototype._busy=function(t){c=t},t.prototype._isBusy=function(){return c},t.prototype.destroy=function(){null!==this.modal&&(this.isOpen()&&this.close(!0),h.call(this),this.modal.parentNode.removeChild(this.modal),this.modal=null)},t.prototype.isOpen=function(){return!!this.modal.classList.contains("tingle-modal--visible")},t.prototype.open=function(){if(!this._isBusy()){this._busy(!0);var t=this;return"function"==typeof t.opts.beforeOpen&&t.opts.beforeOpen(),this.modal.style.removeProperty?this.modal.style.removeProperty("display"):this.modal.style.removeAttribute("display"),this._scrollPosition=window.pageYOffset,document.body.classList.add("tingle-enabled"),document.body.style.top=-this._scrollPosition+"px",this.setStickyFooter(this.opts.stickyFooter),this.modal.classList.add("tingle-modal--visible"),"function"==typeof t.opts.onOpen&&t.opts.onOpen.call(t),t._busy(!1),this.checkOverflow(),this}},t.prototype.close=function(t){if(!this._isBusy()){if(this._busy(!0),t=t||!1,"function"==typeof this.opts.beforeClose){if(!this.opts.beforeClose.call(this))return void this._busy(!1)}document.body.classList.remove("tingle-enabled"),window.scrollTo(0,this._scrollPosition),document.body.style.top=null,this.modal.classList.remove("tingle-modal--visible");var o=this;o.modal.style.display="none","function"==typeof o.opts.onClose&&o.opts.onClose.call(this),o._busy(!1)}},t.prototype.setContent=function(t){return"string"==typeof t?this.modalBoxContent.innerHTML=t:(this.modalBoxContent.innerHTML="",this.modalBoxContent.appendChild(t)),this.isOpen()&&this.checkOverflow(),this},t.prototype.getContent=function(){return this.modalBoxContent},t.prototype.addFooter=function(){return i.call(this),this},t.prototype.setFooterContent=function(t){return this.modalBoxFooter.innerHTML=t,this},t.prototype.getFooterContent=function(){return this.modalBoxFooter},t.prototype.setStickyFooter=function(t){return this.isOverflow()||(t=!1),t?this.modalBox.contains(this.modalBoxFooter)&&(this.modalBox.removeChild(this.modalBoxFooter),this.modal.appendChild(this.modalBoxFooter),this.modalBoxFooter.classList.add("tingle-modal-box__footer--sticky"),e.call(this),this.modalBoxContent.style["padding-bottom"]=this.modalBoxFooter.clientHeight+20+"px"):this.modalBoxFooter&&(this.modalBox.contains(this.modalBoxFooter)||(this.modal.removeChild(this.modalBoxFooter),this.modalBox.appendChild(this.modalBoxFooter),this.modalBoxFooter.style.width="auto",this.modalBoxFooter.style.left="",this.modalBoxContent.style["padding-bottom"]="",this.modalBoxFooter.classList.remove("tingle-modal-box__footer--sticky"))),this},t.prototype.addFooterBtn=function(t,o,e){var s=document.createElement("button");return s.innerHTML=t,s.addEventListener("click",e),"string"==typeof o&&o.length&&o.split(" ").forEach(function(t){s.classList.add(t)}),this.modalBoxFooter.appendChild(s),s},t.prototype.resize=function(){console.warn("Resize is deprecated and will be removed in version 1.0")},t.prototype.isOverflow=function(){var t=window.innerHeight;return this.modalBox.clientHeight>=t},t.prototype.checkOverflow=function(){this.modal.classList.contains("tingle-modal--visible")&&(this.isOverflow()?this.modal.classList.add("tingle-modal--overflow"):this.modal.classList.remove("tingle-modal--overflow"),!this.isOverflow()&&this.opts.stickyFooter?this.setStickyFooter(!1):this.isOverflow()&&this.opts.stickyFooter&&(e.call(this),this.setStickyFooter(!0)))},{modal:t}});