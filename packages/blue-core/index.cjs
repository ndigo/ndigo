'use strict';
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
const n = require('@blue/util'),
    D = require('@blue/parser');
class k {}
Reflect.setPrototypeOf(k.prototype, null);
const N = Object.create.bind(Object, null),
    { defineProperty: K } = Reflect,
    B = (r, t) => r < t;
class F {
    value;
    get [Symbol.toStringTag]() {
        return 'ValueComparator';
    }
    constructor(t) {
        K(this, 'value', { value: t, configurable: !0, enumerable: !1, writable: !1 });
    }
}
const _t = n.like({ compareTo: Function }),
    xt = n.like({ compare: Function }),
    At = n.comparator(B),
    Ct = (r) => (t, e) => -r(t, e);
class Y {
    get [Symbol.toStringTag]() {
        return 'PredicateComparator';
    }
    compare;
    constructor(t) {
        K(this, 'compare', { value: n.comparator(t), configurable: !0, enumerable: !1, writable: !1 });
    }
}
class H extends Y {
    constructor() {
        super(B);
    }
}
class It {
    compare(t, e) {
        return t.compareTo(e);
    }
}
class wt extends Y {
    constructor() {
        super(n.isBefore);
    }
}
class Tt extends H {}
class Et extends H {
    compareIgnoreCase(t, e) {
        return typeof t == 'string' && typeof e == 'string' && this.compare(t.toLowerCase(), e.toLowerCase());
    }
}
const Mt = new It(),
    Ot = new wt(),
    L = new Tt(),
    g = new Et(),
    { freeze: kt, keys: y } = Object,
    { parseFloat: Nt } = Number,
    A = new Map(),
    Ft = n.always(''),
    Lt = n.always(1),
    $t = n.split('='),
    p = '*',
    vt = 'q',
    z = n.ifElse(
        n.complement(n.isEmpty),
        n.pipe(
            n.toPairs,
            n.reduce((r, [t, e]) => `${r};${t}=${e}`, '')
        ),
        Ft
    );
class Rt {
    compare(t, e) {
        return t.isWildcardType && !e.isWildcardType
            ? 1
            : !t.isWildcardType && e.isWildcardType
              ? -1
              : t.type !== e.type
                ? 0
                : t.isWildcardSubtype && !e.isWildcardSubtype
                  ? 1
                  : !t.isWildcardSubtype && e.isWildcardSubtype
                    ? -1
                    : t.subtype !== e.subtype
                      ? 0
                      : this.compareParameters(t, e);
    }
    compareParameters(t, e) {
        const s = y(t.parameters).length,
            i = y(e.parameters).length;
        return L.compare(i, s);
    }
}
const U = new Rt();
class Wt {
    compare(t, e) {
        const s = t.qualityFactor,
            i = e.qualityFactor,
            a = L.compare(i, s);
        return a !== 0 ? a : U.compare(t, e);
    }
}
const Vt = new Wt();
class o extends k {
    experimental;
    facets;
    parameters;
    personal;
    suffix;
    subtype;
    type;
    vendor;
    get [Symbol.toStringTag]() {
        return `MediaType:${this.toString()}`;
    }
    get isWildcardType() {
        return this.type === p;
    }
    get isWildcardSubtype() {
        return this.subtype === p;
    }
    get qualityFactor() {
        return n.cond([
            [n.isString, Nt],
            [n.isNumber, n.identity],
            [n.T, Lt],
        ])(this.parameters[vt]);
    }
    static for(t, e = null, s = {}) {
        const i = n.isString(e),
            a = i ? `${t}/${e}${z(s)}` : t;
        if (a?.length) {
            if (!A.has(a))
                if (i) {
                    const u = new o(t, e, s);
                    A.set(a, u);
                } else {
                    const [u, l] = a.split('/'),
                        c = l.split(';');
                    c.shift();
                    const d = c.length ? n.pipe(n.map($t, c), n.fromPairs) : {},
                        f = new o(u, l, d);
                    A.set(a, f);
                }
            return A.get(a);
        }
        return null;
    }
    static qualityFactorComparator = Vt;
    static specificityComparator = U;
    constructor(t = p, e = p, s = {}) {
        if (
            (super(),
            (this.type = t),
            (this.parameters = s),
            (this.vendor = !1),
            (this.personal = !1),
            (this.experimental = !1),
            e.indexOf('+') !== -1 && e.substr(-1) !== '+')
        ) {
            const i = e.split('+', 2);
            (this.subtype = i[0]), (this.facets = i[0].split('.')), (this.suffix = i[1]);
        } else (this.subtype = e), (this.facets = e.split('.')), (this.suffix = null);
        if (this.facets.length > 0) {
            const i = this.facets[0];
            (this.vendor = i === 'vnd'),
                (this.personal = i === 'prs'),
                (this.experimental = i === 'x' && this.subtype.substring(0, 2).toLowerCase() === 'x-');
        }
        kt(this);
    }
    compareTo(t) {
        let e;
        if (((e = g.compare(this.type, t.type)), e !== 0 || ((e = g.compare(this.subtype, t.subtype)), e !== 0)))
            return e;
        const s = y(this.parameters),
            i = y(t.parameters),
            a = s.length,
            u = i.length;
        if (((e = a - u), e !== 0)) return e;
        let l = 0,
            c,
            d,
            f,
            _;
        for (; l < a; l++)
            if (
                ((c = s[l]),
                (f = i[l]),
                (e = g.compare(c, f)),
                e !== 0 ||
                    ((d = String(this.parameters[c])), (_ = String(t.parameters[f])), (e = g.compare(d, _)), e !== 0))
            )
                return e;
        return 0;
    }
    compareToIgnoreCase(t) {
        let e;
        if (
            ((e = g.compareIgnoreCase(this.type, t.type)),
            e !== 0 || ((e = g.compareIgnoreCase(this.subtype, t.subtype)), e !== 0))
        )
            return e;
        const s = y(this.parameters),
            i = y(t.parameters),
            a = s.length,
            u = i.length;
        if (((e = a - u), e !== 0)) return e;
        let l = 0,
            c,
            d,
            f,
            _;
        for (; l < a; l++)
            if (
                ((c = s[l]),
                (f = i[l]),
                (e = g.compareIgnoreCase(c, f)),
                e !== 0 ||
                    ((d = String(this.parameters[c])),
                    (_ = String(t.parameters[f])),
                    (e = g.compareIgnoreCase(d, _)),
                    e !== 0))
            )
                return e;
        return 0;
    }
    equals(t) {
        return this.compareTo(t) === 0;
    }
    createBlob(t, e = 'transparent') {
        return new Blob(t, { type: this.toString(), endings: e });
    }
    includes(t = null) {
        if (!t) return !1;
        if (this.isWildcardType) return !0;
        if (this.type === t.type) {
            if (this.subtype === t.subtype) return !0;
            if (this.isWildcardSubtype) {
                const e = this.subtype.lastIndexOf('+');
                if (e === -1) return !0;
                {
                    const s = t.subtype.lastIndexOf('+');
                    if (s !== -1) {
                        const i = this.subtype.substring(0, e),
                            a = this.subtype.substring(e + 1),
                            u = t.subtype.substring(s + 1);
                        if (a === u && p === i) return !0;
                    }
                }
            }
        }
        return !1;
    }
    matches(t) {
        return this.type === p || t.type === p || (this.type === t.type && (this.subtype === p || t.subtype === p))
            ? !0
            : this.type === t.type && this.subtype === t.subtype;
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        const t = this.suffix === null ? `${this.type}/${this.subtype}` : `${this.type}/${this.subtype}+${this.suffix}`,
            e = z(this.parameters);
        return `${t}${e}`;
    }
    withCharset(t) {
        return new o(this.type, this.subtype, { charset: t });
    }
}
const Xt = o.for('application', 'x-www-form-urlencoded'),
    qt = o.for('application', 'octet-stream'),
    jt = o.for('application', 'javascript'),
    Gt = o.for('application', 'json'),
    Jt = o.for('application', 'pdf'),
    zt = o.for('application', 'ssml+xml'),
    Dt = o.for('application', 'svg+xml'),
    Kt = o.for('application', 'xhtml'),
    Bt = o.for('application', 'xhtml+xml'),
    Yt = o.for('application', 'xml'),
    Ht = o.for('application', 'zip'),
    Ut = o.for('font', 'ttf'),
    Qt = o.for('font', 'woff'),
    Zt = o.for('image', 'bmp'),
    te = o.for('image', 'gif'),
    ee = o.for('image', 'jpeg'),
    re = o.for('image', 'png'),
    se = o.for('image', 'svg+xml'),
    ie = o.for('image', 'tiff'),
    ne = o.for('image', 'webp'),
    ae = o.for('image', 'x-icon'),
    oe = o.for('multipart', 'form-data'),
    le = o.for('text', 'css'),
    ue = o.for('text', 'csv'),
    ce = o.for('text', 'html'),
    he = o.for('text', 'json'),
    fe = o.for('text', 'xml'),
    pe = o.for('text', 'plain'),
    ge = o.for('*', '*'),
    de = Object.freeze(
        Object.defineProperty(
            {
                __proto__: null,
                APPLICATION_FORM_URLENCODED: Xt,
                APPLICATION_JAVASCRIPT: jt,
                APPLICATION_JSON: Gt,
                APPLICATION_OCTET_STREAM: qt,
                APPLICATION_PDF: Jt,
                APPLICATION_SSML_XML: zt,
                APPLICATION_SVG_XML: Dt,
                APPLICATION_XHTML: Kt,
                APPLICATION_XHTML_XML: Bt,
                APPLICATION_XML: Yt,
                APPLICATION_ZIP: Ht,
                FONT_TTF: Ut,
                FONT_WOFF: Qt,
                IMAGE_BMP: Zt,
                IMAGE_GIF: te,
                IMAGE_JPEG: ee,
                IMAGE_PNG: re,
                IMAGE_SVG_XML: se,
                IMAGE_TIFF: ie,
                IMAGE_WEBP: ne,
                IMAGE_X_ICON: ae,
                MULTIPART_FORM_DATA: oe,
                TEXT_CSS: le,
                TEXT_CSV: ue,
                TEXT_HTML: ce,
                TEXT_JSON: he,
                TEXT_PLAIN: pe,
                TEXT_XML: fe,
                WILDCARD: ge,
            },
            Symbol.toStringTag,
            { value: 'Module' }
        )
    ),
    { isArray: Q } = Array,
    { entries: me, keys: be, values: ye } = Object,
    $ = n.propIs(Function),
    Se = $('entries'),
    Pe = $('keys'),
    _e = $('values'),
    xe = n.invoker(0, 'entries'),
    Ae = n.invoker(0, 'keys'),
    Ce = n.invoker(0, 'values'),
    Z = (r) => Q(r) && r.length === 2,
    Ie = (r) => Q(r) && (r.length ? Z(r[0]) : !0),
    tt = (r) => n.complement(n.isNil)(r) && r[Symbol.iterator] !== void 0;
class v {
    #t;
    #e;
    [Symbol.iterator]() {
        return this;
    }
    constructor(t) {
        (this.#t = t), (this.#e = 0);
    }
    next() {
        return this.#e < this.#t.length ? { done: !1, value: this.#t[this.#e++] } : { done: !0 };
    }
}
const x = (r) => new v(r);
class R {
    #t;
    constructor(t) {
        this.#t = n.cond([
            [Se, xe],
            [n.T, n.pipe(me, x)],
        ])(t);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        return this.#t.next();
    }
}
const we = (r) => new R(r);
class W {
    #t;
    constructor(t) {
        this.#t = n.cond([
            [Pe, Ae],
            [n.T, n.pipe(be, x)],
        ])(t);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        return this.#t.next();
    }
}
const Te = (r) => new W(r);
class V {
    #t;
    constructor(t) {
        this.#t = n.cond([
            [_e, Ce],
            [n.T, n.pipe(ye, x)],
        ])(t);
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        return this.#t.next();
    }
}
const Ee = (r) => new V(r);
class et {
    #t;
    #e;
    #r;
    [Symbol.iterator]() {
        return this;
    }
    constructor(t, e, s) {
        if (s === 0) throw new RangeError('"step" cannot be 0');
        typeof e > 'u'
            ? ((this.#r = 0), (this.#t = t), (this.#e = 1))
            : typeof s > 'u'
              ? ((this.#r = t), (this.#t = e), (this.#e = 1))
              : ((this.#r = t), (this.#t = e), (this.#e = s));
    }
    next() {
        const t = this.#t,
            e = this.#r,
            s = this.#e;
        if ((s > 0 && e < t) || (s < 0 && e > t)) {
            const i = { done: !1, value: e };
            return (this.#r += s), i;
        } else return { done: !0 };
    }
}
const Me = (r, t, e) => new et(r, t, e),
    Oe = n.cond([
        [tt, (r) => r[Symbol.iterator]()],
        [n.likeArray, x],
        [
            n.T,
            () => {
                throw new TypeError('"collection" is not iterable.');
            },
        ],
    ]),
    I = (r) => {
        switch (typeof r) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'string':
            case 'symbol':
            case 'undefined':
                return !0;
            case 'object':
                return r === null;
            default:
                return !1;
        }
    },
    rt = n.complement(I),
    { isArray: X } = Array,
    { parse: ke, stringify: Ne } = JSON,
    st = n.propIs(Function),
    it = st('toJSON'),
    nt = st('toString'),
    Fe = n.complement(X),
    Le = n.invoker(0, 'toJSON'),
    $e = n.invoker(0, 'toString'),
    q = (r) => n.equals(ke(Ne(r)), r),
    ve = n.both(X, q),
    Re = n.allPass([rt, Fe, q]),
    j = (r) => {
        switch (typeof r) {
            case 'boolean':
            case 'number':
            case 'string':
                return !0;
            case 'object':
                return r === null || q(r);
            default:
                return !1;
        }
    },
    We = n.anyPass([j, it, nt]),
    G = n.cond([
        [it, Le],
        [j, n.identity],
        [nt, $e],
        [X, n.map((r) => G(r))],
        [n.T, n.mergeLeft(N())],
    ]),
    { defineProperty: S } = Reflect,
    { max: Ve, min: Xe } = Math,
    C = 1,
    w = (r, t, e, s, i) => {
        let a = 0;
        for (; a < i; a++) (e[a + s] = r[a + t]), (r[a + t] = void 0);
    },
    qe = (r) => (
        (r = r >>> 0),
        (r = r - 1),
        (r = r | (r >> 1)),
        (r = r | (r >> 2)),
        (r = r | (r >> 4)),
        (r = r | (r >> 8)),
        (r = r | (r >> 16)),
        r + 1
    );
class h {
    _capacity;
    _head;
    _tail;
    _full;
    static MAX_CAPACITY;
    static MIN_CAPACITY;
    get [Symbol.toStringTag]() {
        return 'RingBuffer';
    }
    get capacity() {
        return this._capacity;
    }
    set capacity(t) {
        typeof t != 'number'
            ? (this._capacity = h.MIN_CAPACITY)
            : (this._capacity = qe(Xe(Ve(h.MIN_CAPACITY, t), h.MAX_CAPACITY)));
    }
    get isEmpty() {
        return !this.isFull && this._head === this._tail;
    }
    get isFull() {
        return (this._full & C) !== 0;
    }
    get length() {
        let t;
        const e = this._capacity;
        if (this.isFull) t = e;
        else {
            const s = this._head,
                i = this._tail;
            t = s >= i ? s - i : e + s - i;
        }
        return t;
    }
    constructor(t = h.MIN_CAPACITY) {
        S(this, '_capacity', { value: h.MIN_CAPACITY, configurable: !0, enumerable: !1, writable: !0 }),
            S(this, '_full', { value: 0, configurable: !0, enumerable: !1, writable: !0 }),
            S(this, '_head', { value: 0, configurable: !0, enumerable: !1, writable: !0 }),
            S(this, '_tail', { value: 0, configurable: !0, enumerable: !1, writable: !0 }),
            typeof t == 'number' ? (this.capacity = t) : n.likeArray(t) && this.put.apply(this, t);
    }
    [Symbol.iterator]() {
        return new v(this);
    }
    get() {
        let t;
        if (this.length) {
            const e = this._tail;
            (t = this[e]),
                (this[e] = void 0),
                (this._tail = (e + 1) & (this._capacity - 1)),
                (this._full = this._full & ~C);
        }
        return t;
    }
    put(...t) {
        const e = t.length;
        if (e) {
            const s = this._capacity - 1;
            let i = 0,
                a = this._head;
            for (; i < e; i++)
                (this[a] = t[i]), (a = (a + 1) & s), !this.isFull && a === this._tail && (this._full = this._full | C);
            (this._head = a), this.isFull && (this._tail = a);
        }
        return this.length;
    }
    toJSON() {
        const { length: t } = this,
            e = new Array(t);
        let s = 0;
        for (; s < t; ) e[s] = G(this[s++]);
        return e;
    }
    toString() {
        return this.toJSON().join(',');
    }
}
S(h, 'MAX_CAPACITY', { value: (1 << 30) | 0, configurable: !0, enumerable: !1, writable: !1 });
S(h, 'MIN_CAPACITY', { value: 16, configurable: !0, enumerable: !1, writable: !1 });
class je extends h {
    get [Symbol.toStringTag]() {
        return 'ResizableRingBuffer';
    }
    put(...t) {
        const e = this.length,
            s = t.length,
            i = s + e;
        return i > this._capacity && this.resizeTo(i), super.put.apply(this, t);
    }
    resizeTo(t) {
        const e = this._capacity,
            s = this._head,
            i = this._tail;
        if (((this.capacity = t), i < s)) {
            const a = this.length;
            w(this, i, this, 0, a), (this._tail = 0), (this._head = a);
        } else if (i > s) {
            const a = e - i;
            w(this, i, this, 0, a), w(this, 0, this, a, s), (this._tail = 0), (this._head = a);
        } else i === s && ((this._tail = 0), (this._head = this.isFull ? e : 0));
        this._full = this._full & ~C;
    }
}
const Ge = (r) =>
    class extends r {
        entries() {
            return new R(this);
        }
        forEach(t, e) {
            const s = this.length;
            if (s) for (let i = 0; i < s; i++) t.call(e || this, this[i], i, this);
        }
        keys() {
            return new W(this);
        }
        values() {
            return new V(this);
        }
    };
class at extends Map {
    get [Symbol.toStringTag]() {
        return 'MultiValueMap';
    }
    add(t, e) {
        const s = this.has(t) ? this.get(t) : [];
        return s.push(e), super.set(t, s);
    }
}
const Je = n.like({ prototype: Object });
class ze {
    promise;
    resolve;
    reject;
    get [Symbol.toStringTag]() {
        return 'Deferred';
    }
    constructor() {
        (this.resolve = null),
            (this.reject = null),
            (this.promise = new Promise((t, e) => {
                (this.resolve = t), (this.reject = e);
            })),
            Object.freeze(this);
    }
}
const De = n.like({ entries: Function, forEach: Function, keys: Function, values: Function }),
    T = n.like({ equals: Function }),
    Ke = (r, t) => (T(r) && T(t) ? r.equals(t) : I(r) && I(t) ? r === t : n.equals(r, t)),
    { setPrototypeOf: ot } = Reflect,
    J = (r) =>
        class extends r {
            toJSON() {
                const t = N();
                return (t.name = this.name), (t.message = this.message), (t.stack = this.stack), t;
            }
            toString() {
                return this.message;
            }
        };
class Be extends J(Error) {
    get [Symbol.toStringTag]() {
        return 'ApplicationError';
    }
    constructor(t) {
        super(t), (this.name = 'ApplicationError'), ot(this, new.target.prototype);
    }
}
class lt extends J(Error) {
    get [Symbol.toStringTag]() {
        return 'FrameworkError';
    }
    constructor(t) {
        super(t), (this.name = 'FrameworkError'), ot(this, new.target.prototype);
    }
}
class Ye extends lt {
    get [Symbol.toStringTag]() {
        return 'IllegalStateError';
    }
    constructor(t = 'Unable to complete operation due to misconfiguration') {
        super(t);
    }
}
const E = '.',
    m = '/',
    P = '*',
    He = `${P}${P}`,
    Ue = `${E}${P}`,
    Qe = `${m}${P}`,
    M = `${m}${He}`,
    Ze = n.like({ getPatternComparator: Function, match: Function, merge: Function });
class tr extends F {
    compare(t, e) {
        const { value: s } = this,
            i = t === s,
            a = e === s;
        return i && a ? 0 : i ? -1 : a ? 1 : 0;
    }
}
class er extends F {
    compare(t, e) {
        const s = new O(t),
            i = new O(e);
        if (s.isLeastSpecific && i.isLeastSpecific) return 0;
        if (s.isLeastSpecific) return 1;
        if (i.isLeastSpecific) return -1;
        const { value: a } = this,
            u = t === a,
            l = e === a;
        return u && l
            ? 0
            : u
              ? -1
              : l
                ? 1
                : s.isPrefixPattern && i.isPrefixPattern
                  ? i.length - s.length
                  : s.isPrefixPattern && i.doubleWildcards === 0
                    ? 1
                    : i.isPrefixPattern && s.doubleWildcards === 0
                      ? -1
                      : s.totalCount !== i.totalCount
                        ? s.totalCount - i.totalCount
                        : s.length !== i.length
                          ? i.length - s.length
                          : s.singleWildcards < i.singleWildcards
                            ? -1
                            : i.singleWildcards < s.singleWildcards
                              ? 1
                              : 0;
    }
}
class rr {
    merge(t, e) {
        if (typeof t != 'string') throw new TypeError('"pattern1" must be a string');
        if (typeof e != 'string') throw new TypeError('"pattern2" must be a string');
        const s = t.length === 0,
            i = e.length === 0,
            a = !s && t.indexOf(m) === 0,
            u = !i && e.indexOf(m) === 0;
        if (s && i) return '';
        if (s) return e;
        if (i) return t;
        {
            const l = t.indexOf(E) !== -1,
                c = e.indexOf(E) !== -1;
            if (l && !c) return `${e}${m}${a ? t.substring(1) : t}`;
            if (!l && c) return `${t}${m}${u ? e.substring(1) : e}`;
            if (l && c) throw new Error(`Cannot combine "${t}" and "${e}"`);
        }
        return `${t}${m}${u ? e.substring(1) : e}`;
    }
    getPatternComparator(t) {
        return new tr(t);
    }
    match(t, e) {
        return t === e;
    }
}
class sr {
    getPatternComparator(t) {
        return new er(t);
    }
    match(t, e) {
        return new RegExp(D.glob.run(t).result).test(e);
    }
    merge(t, e) {
        if (typeof t != 'string') throw new TypeError('"pattern1" must be a string');
        if (typeof e != 'string') throw new TypeError('"pattern2" must be a string');
        return t.endsWith(Qe) ? `${t.substring(0, t.length - 2)}${e}` : t.endsWith(M) ? `${t}${e}` : `${t}${e}`;
    }
}
class O {
    #t;
    pattern;
    doubleWildcards;
    singleWildcards;
    get isLeastSpecific() {
        return this.pattern === null || this.#t;
    }
    get isPrefixPattern() {
        return !this.#t && this.pattern.endsWith(M);
    }
    get length() {
        return this.pattern ? this.pattern.length : 0;
    }
    get totalCount() {
        return this.singleWildcards + 2 * this.doubleWildcards;
    }
    constructor(t = null) {
        (this.pattern = t),
            (this.doubleWildcards = 0),
            (this.singleWildcards = 0),
            this.pattern && (this._initCounters(), (this.#t = this.pattern === M));
    }
    _initCounters() {
        let t = 0;
        const e = this.pattern;
        if (e) {
            const s = e.length;
            for (; t < s; )
                switch (e[t]) {
                    case P:
                        t + 1 < s && e[t + 1] === P
                            ? (this.doubleWildcards++, t++)
                            : t > 0 && e.substring(t - 1) === Ue && this.singleWildcards++;
                    default:
                        t++;
                        break;
                }
        }
    }
}
const ir = (r) =>
        class extends r {
            #t;
            #e;
            pathMatcher;
            matches(t, e) {
                const s = e || this.pathMatcher;
                if (s) {
                    const i = this.#t ?? [],
                        a = this.#e ?? [];
                    let u, l;
                    if (i.length) {
                        for (l = i.length, u = 0; u < l; u++) if (s.match(i[u], t)) return !1;
                    }
                    if (!a.length) return !0;
                    for (l = a.length, u = 0; u < l; u++) if (s.match(a[u], t)) return !0;
                }
                return !1;
            }
            setExcludePatterns(t = []) {
                this.#t = t;
            }
            setIncludePatterns(t = []) {
                this.#e = t;
            }
        },
    b = Reflect.defineProperty;
class nr {
    xf;
    constructor(t) {
        b(this, 'xf', { value: t, configurable: !0, enumerable: !1, writable: !1 });
    }
    '@@transducer/init'() {
        return this.xf['@@transducer/init']();
    }
    '@@transducer/result'(t) {
        return this.xf['@@transducer/result'](t);
    }
    '@@transducer/step'(t, e) {
        return this.xf['@@transducer/step'](t, e);
    }
}
const ut = n.like({ '@@transducer/reduced': !0 }),
    ct = n.like({ '@@transducer/step': Function });
function ar(r) {
    return ut(r) ? r : { '@@transducer/reduced': !0, '@@transducer/value': r };
}
class ht {
    '@@transducer/init'() {
        return 0;
    }
    '@@transducer/result'(t) {
        return t;
    }
    '@@transducer/step'(t) {
        return t + 1;
    }
}
const ft = () => new ht(),
    or = () => ft;
class pt {
    '@@transducer/init'() {
        return [];
    }
    '@@transducer/result'(t) {
        return t;
    }
    '@@transducer/step'(t, e) {
        return t.push(e), t;
    }
}
const gt = () => new pt(),
    lr = () => gt;
class dt {
    _getKey;
    _getValue;
    constructor(t, e) {
        b(this, '_getKey', { value: t, configurable: !0, enumerable: !1, writable: !1 }),
            b(this, '_getValue', { value: e, configurable: !0, enumerable: !1, writable: !1 });
    }
    '@@transducer/init'() {
        return new Map();
    }
    '@@transducer/result'(t) {
        return t;
    }
    '@@transducer/step'(t, e) {
        return t.set(this._getKey(e), this._getValue(e)), t;
    }
}
const ur = (r, t) => () => new dt(r, t);
class mt {
    _getKey;
    _getValue;
    constructor(t, e) {
        b(this, '_getKey', { value: t, configurable: !0, enumerable: !1, writable: !1 }),
            b(this, '_getValue', { value: e, configurable: !0, enumerable: !1, writable: !1 });
    }
    '@@transducer/init'() {
        return new at();
    }
    '@@transducer/result'(t) {
        return t;
    }
    '@@transducer/step'(t, e) {
        return t.add(this._getKey(e), this._getValue(e)), t;
    }
}
const cr = (r, t) => () => new mt(r, t);
class bt {
    _getKey;
    _getValue;
    constructor(t, e) {
        b(this, '_getKey', { value: t, configurable: !0, enumerable: !1, writable: !1 }),
            b(this, '_getValue', { value: e, configurable: !0, enumerable: !1, writable: !1 });
    }
    '@@transducer/init'() {
        return {};
    }
    '@@transducer/result'(t) {
        return t;
    }
    '@@transducer/step'(t, e) {
        return (t[this._getKey(e)] = this._getValue(e)), t;
    }
}
const hr = (r, t) => () => new bt(r, t);
class yt {
    set;
    constructor(t = new Set()) {
        this.set = t;
    }
    '@@transducer/init'() {
        return this.set;
    }
    '@@transducer/result'(t) {
        return t;
    }
    '@@transducer/step'(t, e) {
        return t.add(e), t;
    }
}
const fr = (r) => () => new yt(r),
    pr =
        (r, t, e) =>
        (s, ...i) => {
            if (arguments.length === 0) return e();
            if (!Array.isArray(s)) {
                let a = 0;
                const u = r.length;
                for (; a < u; ) {
                    const l = r[a],
                        c = s[l];
                    if (typeof c == 'function') return c.apply(s, i);
                    a++;
                }
                return ct(s) ? t.apply(null, i)(s) : e.apply(void 0, arguments);
            }
        };
function St(r, t, e = !1) {
    const s = e ? [r] : r.children;
    s?.length && s.forEach((i) => t(i) !== !1 && St(i, t));
}
function Pt(r, t, e = !1) {
    const s = e ? r : r.parent;
    s && t(s) !== !1 && Pt(s, t);
}
const gr = (r, t) => (r?.length && t ? r.indexOf(t) : -1);
class dr extends RegExp {
    constructor(t = '*') {
        const e = D.wildcardExpression.run(t).result;
        super(e);
    }
}
exports.AbstractValueComparator = F;
exports.ApplicationError = Be;
exports.AsEnumerableRingBuffer = Ge;
exports.AsPathMatcherFilter = ir;
exports.AsSerializableError = J;
exports.Deferred = ze;
exports.DelegatingTransformer = nr;
exports.EntriesIterator = R;
exports.EqualsPathMatcher = rr;
exports.FrameworkError = lt;
exports.GlobPathMatcher = sr;
exports.GlobPatternInfo = O;
exports.IllegalStateError = Ye;
exports.IndexedIterator = v;
exports.KeysIterator = W;
exports.MediaType = o;
exports.MediaTypes = de;
exports.MultiValueMap = at;
exports.Null = k;
exports.RangeIterator = et;
exports.ResizableRingBuffer = je;
exports.RingBuffer = h;
exports.ValuesIterator = V;
exports.WildcardExp = dr;
exports.XCount = ht;
exports.XToArray = pt;
exports.XToMap = dt;
exports.XToMultiValueMap = mt;
exports.XToRecord = bt;
exports.XToSet = yt;
exports.comparableComparator = Mt;
exports.count = or;
exports.createNull = N;
exports.dateComparator = Ot;
exports.direct = St;
exports.dispatchable = pr;
exports.entriesIterator = we;
exports.equates = Ke;
exports.escalate = Pt;
exports.getIterator = Oe;
exports.indexOf = gr;
exports.indexedIterator = x;
exports.invertComparison = Ct;
exports.isEntries = Ie;
exports.isEntry = Z;
exports.isJSONArray = ve;
exports.isJSONObject = Re;
exports.isJSONValue = j;
exports.isNotPrimitive = rt;
exports.isPrimitive = I;
exports.keysIterator = Te;
exports.likeComparable = _t;
exports.likeComparator = xt;
exports.likeConstructable = Je;
exports.likeEnumerable = De;
exports.likeEquatable = T;
exports.likeIterable = tt;
exports.likePathMatcher = Ze;
exports.likeReduced = ut;
exports.likeSerializable = We;
exports.likeTransformer = ct;
exports.naturalComparison = At;
exports.numberComparator = L;
exports.rangeIterator = Me;
exports.reduce = ar;
exports.serialize = G;
exports.stringComparator = g;
exports.toArray = lr;
exports.toMap = ur;
exports.toMultiValueMap = cr;
exports.toRecord = hr;
exports.toSet = fr;
exports.valuesIterator = Ee;
exports.xCount = ft;
exports.xToArray = gt;
//# sourceMappingURL=index.cjs.map
