import { isBefore as dt, like as g, comparator as q, cond as x, isString as k, isNumber as mt, identity as j, T as P, pipe as w, map as G, fromPairs as bt, always as J, ifElse as yt, complement as E, isEmpty as St, toPairs as _t, reduce as xt, split as Pt, likeArray as D, isNil as At, invoker as C, propIs as z, both as wt, allPass as Ct, anyPass as It, mergeLeft as Tt, equals as K } from "@blue/util";
import { glob as Et, wildcardExpression as Mt } from "@blue/parser";
class Y {
}
Reflect.setPrototypeOf(Y.prototype, null);
const H = Object.create.bind(Object, null), { defineProperty: B } = Reflect, U = (r, t) => r < t;
class Q {
  value;
  get [Symbol.toStringTag]() {
    return "ValueComparator";
  }
  constructor(t) {
    B(this, "value", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
}
const ar = g({ compareTo: Function }), or = g({ compare: Function }), lr = q(U), ur = (r) => (t, e) => -r(t, e);
class Z {
  get [Symbol.toStringTag]() {
    return "PredicateComparator";
  }
  compare;
  constructor(t) {
    B(this, "compare", {
      value: q(t),
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
}
class tt extends Z {
  constructor() {
    super(U);
  }
}
class Ot {
  compare(t, e) {
    return t.compareTo(e);
  }
}
class Nt extends Z {
  constructor() {
    super(dt);
  }
}
class Lt extends tt {
}
class $t extends tt {
  compareIgnoreCase(t, e) {
    return typeof t == "string" && typeof e == "string" && this.compare(t.toLowerCase(), e.toLowerCase());
  }
}
const cr = new Ot(), hr = new Nt(), et = new Lt(), p = new $t(), { freeze: Ft, keys: y } = Object, { parseFloat: vt } = Number, I = /* @__PURE__ */ new Map(), Wt = J(""), kt = J(1), Rt = Pt("="), h = "*", Vt = "q", R = yt(
  E(St),
  w(_t, xt((r, [t, e]) => `${r};${t}=${e}`, "")),
  Wt
);
class Xt {
  compare(t, e) {
    return t.isWildcardType && !e.isWildcardType ? 1 : !t.isWildcardType && e.isWildcardType ? -1 : t.type !== e.type ? 0 : t.isWildcardSubtype && !e.isWildcardSubtype ? 1 : !t.isWildcardSubtype && e.isWildcardSubtype ? -1 : t.subtype !== e.subtype ? 0 : this.compareParameters(t, e);
  }
  compareParameters(t, e) {
    const s = y(t.parameters).length, i = y(e.parameters).length;
    return et.compare(i, s);
  }
}
const rt = new Xt();
class qt {
  compare(t, e) {
    const s = t.qualityFactor, i = e.qualityFactor, n = et.compare(i, s);
    return n !== 0 ? (
      // audio/*;q=0.7 < audio/*;q=0.3
      n
    ) : rt.compare(t, e);
  }
}
const jt = new qt();
class a extends Y {
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
    return this.type === h;
  }
  get isWildcardSubtype() {
    return this.subtype === h;
  }
  get qualityFactor() {
    return x([
      [k, vt],
      [mt, j],
      [P, kt]
    ])(this.parameters[Vt]);
  }
  static for(t, e = null, s = {}) {
    const i = k(e), n = i ? `${t}/${e}${R(s)}` : t;
    if (n?.length) {
      if (!I.has(n))
        if (i) {
          const l = new a(t, e, s);
          I.set(n, l);
        } else {
          const [l, o] = n.split("/"), u = o.split(";");
          u.shift();
          const d = u.length ? w(G(Rt, u), bt) : {}, c = new a(l, o, d);
          I.set(n, c);
        }
      return I.get(n);
    }
    return null;
  }
  static qualityFactorComparator = jt;
  static specificityComparator = rt;
  constructor(t = h, e = h, s = {}) {
    if (super(), this.type = t, this.parameters = s, this.vendor = !1, this.personal = !1, this.experimental = !1, e.indexOf("+") !== -1 && e.substr(-1) !== "+") {
      const i = e.split("+", 2);
      this.subtype = i[0], this.facets = i[0].split("."), this.suffix = i[1];
    } else
      this.subtype = e, this.facets = e.split("."), this.suffix = null;
    if (this.facets.length > 0) {
      const i = this.facets[0];
      this.vendor = i === "vnd", this.personal = i === "prs", this.experimental = i === "x" && this.subtype.substring(0, 2).toLowerCase() === "x-";
    }
    Ft(this);
  }
  /**
   * @function module:core.MediaType#compareTo
   * @param {module:core.MediaType} mediaType
   * @returns {external:number}
   */
  compareTo(t) {
    let e;
    if (e = p.compare(this.type, t.type), e !== 0 || (e = p.compare(this.subtype, t.subtype), e !== 0))
      return e;
    const s = y(this.parameters), i = y(t.parameters), n = s.length, l = i.length;
    if (e = n - l, e !== 0)
      return e;
    let o = 0, u, d, c, A;
    for (; o < n; o++)
      if (u = s[o], c = i[o], e = p.compare(u, c), e !== 0 || (d = String(this.parameters[u]), A = String(t.parameters[c]), e = p.compare(d, A), e !== 0))
        return e;
    return 0;
  }
  /**
   * @function module:core.MediaType#compareToIgnoreCase
   * @param {module:core.MediaType} mediaType
   * @returns {external:number}
   */
  compareToIgnoreCase(t) {
    let e;
    if (e = p.compareIgnoreCase(this.type, t.type), e !== 0 || (e = p.compareIgnoreCase(this.subtype, t.subtype), e !== 0))
      return e;
    const s = y(this.parameters), i = y(t.parameters), n = s.length, l = i.length;
    if (e = n - l, e !== 0)
      return e;
    let o = 0, u, d, c, A;
    for (; o < n; o++)
      if (u = s[o], c = i[o], e = p.compareIgnoreCase(u, c), e !== 0 || (d = String(this.parameters[u]), A = String(t.parameters[c]), e = p.compareIgnoreCase(d, A), e !== 0))
        return e;
    return 0;
  }
  equals(t) {
    return this.compareTo(t) === 0;
  }
  /**
   * Creates a new blob of the media type with the given parameters
   * @function module:core.MediaType#createBlob
   * @param {external:BufferSource | externsl:Blob | external:string } data
   * @param {external:string} endings
   * @returns {external:Blob} A new blob of the media type
   */
  createBlob(t, e = "transparent") {
    return new Blob(t, {
      type: this.toString(),
      endings: e
    });
  }
  /**
   * Indicates whether the `MediaType` includes the given `MediaType`.
   *
   * For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.
   * @function module:core.MediaType#includes
   * @param {module:core.MediaType} value
   * @returns {external:boolean} If this `MediaType` includes the given `MediaType`.
   */
  includes(t = null) {
    if (!t)
      return !1;
    if (this.isWildcardType)
      return !0;
    if (this.type === t.type) {
      if (this.subtype === t.subtype)
        return !0;
      if (this.isWildcardSubtype) {
        const e = this.subtype.lastIndexOf("+");
        if (e === -1)
          return !0;
        {
          const s = t.subtype.lastIndexOf("+");
          if (s !== -1) {
            const i = this.subtype.substring(0, e), n = this.subtype.substring(e + 1), l = t.subtype.substring(s + 1);
            if (n === l && h === i)
              return !0;
          }
        }
      }
    }
    return !1;
  }
  matches(t) {
    return this.type === h || t.type === h || this.type === t.type && (this.subtype === h || t.subtype === h) ? !0 : this.type === t.type && this.subtype === t.subtype;
  }
  toJSON() {
    return this.toString();
  }
  toString() {
    const t = this.suffix === null ? `${this.type}/${this.subtype}` : `${this.type}/${this.subtype}+${this.suffix}`, e = R(this.parameters);
    return `${t}${e}`;
  }
  withCharset(t) {
    return new a(this.type, this.subtype, { charset: t });
  }
}
const Gt = a.for("application", "x-www-form-urlencoded"), Jt = a.for("application", "octet-stream"), Dt = a.for("application", "javascript"), zt = a.for("application", "json"), Kt = a.for("application", "pdf"), Yt = a.for("application", "ssml+xml"), Ht = a.for("application", "svg+xml"), Bt = a.for("application", "xhtml"), Ut = a.for("application", "xhtml+xml"), Qt = a.for("application", "xml"), Zt = a.for("application", "zip"), te = a.for("font", "ttf"), ee = a.for("font", "woff"), re = a.for("image", "bmp"), se = a.for("image", "gif"), ie = a.for("image", "jpeg"), ne = a.for("image", "png"), ae = a.for("image", "svg+xml"), oe = a.for("image", "tiff"), le = a.for("image", "webp"), ue = a.for("image", "x-icon"), ce = a.for("multipart", "form-data"), he = a.for("text", "css"), fe = a.for("text", "csv"), pe = a.for("text", "html"), ge = a.for("text", "json"), de = a.for("text", "xml"), me = a.for("text", "plain"), be = a.for("*", "*"), fr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  APPLICATION_FORM_URLENCODED: Gt,
  APPLICATION_JAVASCRIPT: Dt,
  APPLICATION_JSON: zt,
  APPLICATION_OCTET_STREAM: Jt,
  APPLICATION_PDF: Kt,
  APPLICATION_SSML_XML: Yt,
  APPLICATION_SVG_XML: Ht,
  APPLICATION_XHTML: Bt,
  APPLICATION_XHTML_XML: Ut,
  APPLICATION_XML: Qt,
  APPLICATION_ZIP: Zt,
  FONT_TTF: te,
  FONT_WOFF: ee,
  IMAGE_BMP: re,
  IMAGE_GIF: se,
  IMAGE_JPEG: ie,
  IMAGE_PNG: ne,
  IMAGE_SVG_XML: ae,
  IMAGE_TIFF: oe,
  IMAGE_WEBP: le,
  IMAGE_X_ICON: ue,
  MULTIPART_FORM_DATA: ce,
  TEXT_CSS: he,
  TEXT_CSV: fe,
  TEXT_HTML: pe,
  TEXT_JSON: ge,
  TEXT_PLAIN: me,
  TEXT_XML: de,
  WILDCARD: be
}, Symbol.toStringTag, { value: "Module" })), { isArray: st } = Array, { entries: ye, keys: Se, values: _e } = Object, F = z(Function), xe = F("entries"), Pe = F("keys"), Ae = F("values"), we = C(0, "entries"), Ce = C(0, "keys"), Ie = C(0, "values"), Te = (r) => st(r) && r.length === 2, pr = (r) => st(r) && (r.length ? Te(r[0]) : !0), Ee = (r) => E(At)(r) && r[Symbol.iterator] !== void 0;
class it {
  #t;
  #e;
  [Symbol.iterator]() {
    return this;
  }
  constructor(t) {
    this.#t = t, this.#e = 0;
  }
  next() {
    return this.#e < this.#t.length ? { done: !1, value: this.#t[this.#e++] } : { done: !0 };
  }
}
const M = (r) => new it(r);
class nt {
  #t;
  constructor(t) {
    this.#t = x([
      [xe, we],
      [P, w(ye, M)]
    ])(t);
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.#t.next();
  }
}
const gr = (r) => new nt(r);
class at {
  #t;
  constructor(t) {
    this.#t = x([
      [Pe, Ce],
      [P, w(Se, M)]
    ])(t);
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.#t.next();
  }
}
const dr = (r) => new at(r);
class ot {
  #t;
  constructor(t) {
    this.#t = x([
      [Ae, Ie],
      [P, w(_e, M)]
    ])(t);
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    return this.#t.next();
  }
}
const mr = (r) => new ot(r);
class Me {
  #t;
  #e;
  #r;
  [Symbol.iterator]() {
    return this;
  }
  constructor(t, e, s) {
    if (s === 0)
      throw new RangeError('"step" cannot be 0');
    typeof e > "u" ? (this.#r = 0, this.#t = t, this.#e = 1) : typeof s > "u" ? (this.#r = t, this.#t = e, this.#e = 1) : (this.#r = t, this.#t = e, this.#e = s);
  }
  next() {
    const t = this.#t, e = this.#r, s = this.#e;
    if (s > 0 && e < t || s < 0 && e > t) {
      const i = { done: !1, value: e };
      return this.#r += s, i;
    } else
      return { done: !0 };
  }
}
const br = (r, t, e) => new Me(r, t, e), yr = x([
  [Ee, (r) => r[Symbol.iterator]()],
  [D, M],
  [P, () => {
    throw new TypeError('"collection" is not iterable.');
  }]
]), N = (r) => {
  switch (typeof r) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
    case "undefined":
      return !0;
    case "object":
      return r === null;
    default:
      return !1;
  }
}, Oe = E(N), { isArray: v } = Array, { parse: Ne, stringify: Le } = JSON, lt = z(Function), ut = lt("toJSON"), ct = lt("toString"), $e = E(v), Fe = C(0, "toJSON"), ve = C(0, "toString"), W = (r) => K(Ne(Le(r)), r), Sr = wt(v, W), _r = Ct([Oe, $e, W]), ht = (r) => {
  switch (typeof r) {
    case "boolean":
    case "number":
    case "string":
      return !0;
    case "object":
      return r === null || W(r);
    default:
      return !1;
  }
}, xr = It([ht, ut, ct]), ft = x([
  [ut, Fe],
  [ht, j],
  [ct, ve],
  [v, G((r) => ft(r))],
  [P, Tt(H())]
]), { defineProperty: S } = Reflect, { max: We, min: ke } = Math, T = 1, O = (r, t, e, s, i) => {
  let n = 0;
  for (; n < i; n++)
    e[n + s] = r[n + t], r[n + t] = void 0;
}, Re = (r) => (r = r >>> 0, r = r - 1, r = r | r >> 1, r = r | r >> 2, r = r | r >> 4, r = r | r >> 8, r = r | r >> 16, r + 1);
class f {
  _capacity;
  _head;
  _tail;
  _full;
  static MAX_CAPACITY;
  static MIN_CAPACITY;
  get [Symbol.toStringTag]() {
    return "RingBuffer";
  }
  get capacity() {
    return this._capacity;
  }
  set capacity(t) {
    typeof t != "number" ? this._capacity = f.MIN_CAPACITY : this._capacity = Re(ke(We(f.MIN_CAPACITY, t), f.MAX_CAPACITY));
  }
  get isEmpty() {
    return !this.isFull && this._head === this._tail;
  }
  get isFull() {
    return (this._full & T) !== 0;
  }
  get length() {
    let t;
    const e = this._capacity;
    if (this.isFull)
      t = e;
    else {
      const s = this._head, i = this._tail;
      t = s >= i ? s - i : e + s - i;
    }
    return t;
  }
  constructor(t = f.MIN_CAPACITY) {
    S(this, "_capacity", {
      value: f.MIN_CAPACITY,
      configurable: !0,
      enumerable: !1,
      writable: !0
    }), S(this, "_full", {
      value: 0,
      configurable: !0,
      enumerable: !1,
      writable: !0
    }), S(this, "_head", {
      value: 0,
      configurable: !0,
      enumerable: !1,
      writable: !0
    }), S(this, "_tail", {
      value: 0,
      configurable: !0,
      enumerable: !1,
      writable: !0
    }), typeof t == "number" ? this.capacity = t : D(t) && this.put.apply(this, t);
  }
  [Symbol.iterator]() {
    return new it(this);
  }
  get() {
    let t;
    if (this.length) {
      const e = this._tail;
      t = this[e], this[e] = void 0, this._tail = e + 1 & this._capacity - 1, this._full = this._full & ~T;
    }
    return t;
  }
  put(...t) {
    const e = t.length;
    if (e) {
      const s = this._capacity - 1;
      let i = 0, n = this._head;
      for (; i < e; i++)
        this[n] = t[i], n = n + 1 & s, !this.isFull && n === this._tail && (this._full = this._full | T);
      this._head = n, this.isFull && (this._tail = n);
    }
    return this.length;
  }
  toJSON() {
    const { length: t } = this, e = new Array(t);
    let s = 0;
    for (; s < t; )
      e[s] = ft(this[s++]);
    return e;
  }
  toString() {
    return this.toJSON().join(",");
  }
}
S(f, "MAX_CAPACITY", {
  value: 1 << 30 | 0,
  configurable: !0,
  enumerable: !1,
  writable: !1
});
S(f, "MIN_CAPACITY", {
  value: 16,
  configurable: !0,
  enumerable: !1,
  writable: !1
});
class Pr extends f {
  get [Symbol.toStringTag]() {
    return "ResizableRingBuffer";
  }
  /**
   * @function module:core.ResizableRingBuffer#put
   * @param {external:Array} items
   * @returns {external:number} The number of items
   */
  put(...t) {
    const e = this.length, s = t.length, i = s + e;
    return i > this._capacity && this.resizeTo(i), super.put.apply(this, t);
  }
  /**
   * @function module:core.ResizableRingBuffer#resizeTo
   * @param {external:number} newCapacity
   * @returns {external:number} The number of items
   */
  resizeTo(t) {
    const e = this._capacity, s = this._head, i = this._tail;
    if (this.capacity = t, i < s) {
      const n = this.length;
      O(this, i, this, 0, n), this._tail = 0, this._head = n;
    } else if (i > s) {
      const n = e - i;
      O(this, i, this, 0, n), O(this, 0, this, n, s), this._tail = 0, this._head = n;
    } else i === s && (this._tail = 0, this._head = this.isFull ? e : 0);
    this._full = this._full & ~T;
  }
}
const Ar = (r) => class extends r {
  entries() {
    return new nt(this);
  }
  forEach(t, e) {
    const s = this.length;
    if (s)
      for (let i = 0; i < s; i++)
        t.call(e || this, this[i], i, this);
  }
  keys() {
    return new at(this);
  }
  values() {
    return new ot(this);
  }
};
class Ve extends Map {
  get [Symbol.toStringTag]() {
    return "MultiValueMap";
  }
  /**
   * @function module:core.MultiValueMap#add
   * @param {*} key
   * @param {*} value
   * @returns {module:core.MultiValueMap} this
   */
  add(t, e) {
    const s = this.has(t) ? this.get(t) : [];
    return s.push(e), super.set(t, s);
  }
}
const wr = g({ prototype: Object });
class Cr {
  promise;
  /**
   * Fulfills the associated promise with the specified value, or propagates the state of an existing promise. If the associated promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing.
   * @function module:core.Deferred#resolve
   * @param {T} [value] If this value is not a promise, including undefined, it becomes the fulfillment value of the associated promise. If this value is a promise, then the associated promise will be resolved to the passed promise, and follow the state as the provided promise (including any future transitions).
   */
  resolve;
  /**
   * Rejects the associated promise with the specified reason. If the promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing.
   * @function module:core.Deferred#reject
   * @param {*} [reason] The rejection reason for the associated promise. Although the reason can be undefined, it is generally an {@link external:Error} object, like in exception handling.
   */
  reject;
  get [Symbol.toStringTag]() {
    return "Deferred";
  }
  constructor() {
    this.resolve = null, this.reject = null, this.promise = new Promise((t, e) => {
      this.resolve = t, this.reject = e;
    }), Object.freeze(this);
  }
}
const Ir = g({ entries: Function, forEach: Function, keys: Function, values: Function }), V = g({ equals: Function }), Tr = (r, t) => V(r) && V(t) ? r.equals(t) : N(r) && N(t) ? r === t : K(r, t), { setPrototypeOf: pt } = Reflect, gt = (r) => class extends r {
  toJSON() {
    const t = H();
    return t.name = this.name, t.message = this.message, t.stack = this.stack, t;
  }
  toString() {
    return this.message;
  }
};
class Er extends gt(Error) {
  get [Symbol.toStringTag]() {
    return "ApplicationError";
  }
  constructor(t) {
    super(t), this.name = "ApplicationError", pt(this, new.target.prototype);
  }
}
class Xe extends gt(Error) {
  get [Symbol.toStringTag]() {
    return "FrameworkError";
  }
  constructor(t) {
    super(t), this.name = "FrameworkError", pt(this, new.target.prototype);
  }
}
class Mr extends Xe {
  get [Symbol.toStringTag]() {
    return "IllegalStateError";
  }
  constructor(t = "Unable to complete operation due to misconfiguration") {
    super(t);
  }
}
const L = ".", m = "/", _ = "*", qe = `${_}${_}`, je = `${L}${_}`, Ge = `${m}${_}`, $ = `${m}${qe}`, Or = g({ getPatternComparator: Function, match: Function, merge: Function });
class Je extends Q {
  compare(t, e) {
    const { value: s } = this, i = t === s, n = e === s;
    return i && n ? 0 : i ? -1 : n ? 1 : 0;
  }
}
class De extends Q {
  compare(t, e) {
    const s = new X(t), i = new X(e);
    if (s.isLeastSpecific && i.isLeastSpecific)
      return 0;
    if (s.isLeastSpecific)
      return 1;
    if (i.isLeastSpecific)
      return -1;
    const { value: n } = this, l = t === n, o = e === n;
    return l && o ? 0 : l ? -1 : o ? 1 : s.isPrefixPattern && i.isPrefixPattern ? i.length - s.length : s.isPrefixPattern && i.doubleWildcards === 0 ? 1 : i.isPrefixPattern && s.doubleWildcards === 0 ? -1 : s.totalCount !== i.totalCount ? s.totalCount - i.totalCount : s.length !== i.length ? i.length - s.length : s.singleWildcards < i.singleWildcards ? -1 : i.singleWildcards < s.singleWildcards ? 1 : 0;
  }
}
class Nr {
  merge(t, e) {
    if (typeof t != "string")
      throw new TypeError('"pattern1" must be a string');
    if (typeof e != "string")
      throw new TypeError('"pattern2" must be a string');
    const s = t.length === 0, i = e.length === 0, n = !s && t.indexOf(m) === 0, l = !i && e.indexOf(m) === 0;
    if (s && i)
      return "";
    if (s)
      return e;
    if (i)
      return t;
    {
      const o = t.indexOf(L) !== -1, u = e.indexOf(L) !== -1;
      if (o && !u)
        return `${e}${m}${n ? t.substring(1) : t}`;
      if (!o && u)
        return `${t}${m}${l ? e.substring(1) : e}`;
      if (o && u)
        throw new Error(`Cannot combine "${t}" and "${e}"`);
    }
    return `${t}${m}${l ? e.substring(1) : e}`;
  }
  getPatternComparator(t) {
    return new Je(t);
  }
  match(t, e) {
    return t === e;
  }
}
class Lr {
  getPatternComparator(t) {
    return new De(t);
  }
  match(t, e) {
    return new RegExp(Et.run(t).result).test(e);
  }
  merge(t, e) {
    if (typeof t != "string")
      throw new TypeError('"pattern1" must be a string');
    if (typeof e != "string")
      throw new TypeError('"pattern2" must be a string');
    return t.endsWith(Ge) ? `${t.substring(0, t.length - 2)}${e}` : t.endsWith($) ? `${t}${e}` : `${t}${e}`;
  }
}
class X {
  #t;
  pattern;
  doubleWildcards;
  singleWildcards;
  get isLeastSpecific() {
    return this.pattern === null || this.#t;
  }
  get isPrefixPattern() {
    return !this.#t && this.pattern.endsWith($);
  }
  get length() {
    return this.pattern ? this.pattern.length : 0;
  }
  get totalCount() {
    return this.singleWildcards + 2 * this.doubleWildcards;
  }
  constructor(t = null) {
    this.pattern = t, this.doubleWildcards = 0, this.singleWildcards = 0, this.pattern && (this._initCounters(), this.#t = this.pattern === $);
  }
  _initCounters() {
    let t = 0;
    const e = this.pattern;
    if (e) {
      const s = e.length;
      for (; t < s; )
        switch (e[t]) {
          case _:
            t + 1 < s && e[t + 1] === _ ? (this.doubleWildcards++, t++) : t > 0 && e.substring(t - 1) === je && this.singleWildcards++;
          default:
            t++;
            break;
        }
    }
  }
}
const $r = (r) => class extends r {
  #t;
  #e;
  pathMatcher;
  matches(t, e) {
    const s = e || this.pathMatcher;
    if (s) {
      const i = this.#t ?? [], n = this.#e ?? [];
      let l, o;
      if (i.length) {
        for (o = i.length, l = 0; l < o; l++)
          if (s.match(i[l], t))
            return !1;
      }
      if (!n.length)
        return !0;
      for (o = n.length, l = 0; l < o; l++)
        if (s.match(n[l], t))
          return !0;
    }
    return !1;
  }
  setExcludePatterns(t = []) {
    this.#t = t;
  }
  setIncludePatterns(t = []) {
    this.#e = t;
  }
}, b = Reflect.defineProperty;
class Fr {
  xf;
  constructor(t) {
    b(this, "xf", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  "@@transducer/init"() {
    return this.xf["@@transducer/init"]();
  }
  "@@transducer/result"(t) {
    return this.xf["@@transducer/result"](t);
  }
  "@@transducer/step"(t, e) {
    return this.xf["@@transducer/step"](t, e);
  }
}
const ze = g({ "@@transducer/reduced": !0 }), Ke = g({ "@@transducer/step": Function });
function vr(r) {
  return ze(r) ? r : {
    "@@transducer/reduced": !0,
    "@@transducer/value": r
  };
}
class Ye {
  "@@transducer/init"() {
    return 0;
  }
  "@@transducer/result"(t) {
    return t;
  }
  "@@transducer/step"(t) {
    return t + 1;
  }
}
const He = () => new Ye(), Wr = () => He;
class Be {
  "@@transducer/init"() {
    return [];
  }
  "@@transducer/result"(t) {
    return t;
  }
  "@@transducer/step"(t, e) {
    return t.push(e), t;
  }
}
const Ue = () => new Be(), kr = () => Ue;
class Qe {
  _getKey;
  _getValue;
  constructor(t, e) {
    b(this, "_getKey", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), b(this, "_getValue", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  "@@transducer/init"() {
    return /* @__PURE__ */ new Map();
  }
  "@@transducer/result"(t) {
    return t;
  }
  "@@transducer/step"(t, e) {
    return t.set(this._getKey(e), this._getValue(e)), t;
  }
}
const Rr = (r, t) => () => new Qe(r, t);
class Ze {
  _getKey;
  _getValue;
  constructor(t, e) {
    b(this, "_getKey", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), b(this, "_getValue", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  "@@transducer/init"() {
    return new Ve();
  }
  "@@transducer/result"(t) {
    return t;
  }
  "@@transducer/step"(t, e) {
    return t.add(this._getKey(e), this._getValue(e)), t;
  }
}
const Vr = (r, t) => () => new Ze(r, t);
class tr {
  _getKey;
  _getValue;
  constructor(t, e) {
    b(this, "_getKey", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), b(this, "_getValue", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  "@@transducer/init"() {
    return {};
  }
  "@@transducer/result"(t) {
    return t;
  }
  "@@transducer/step"(t, e) {
    return t[this._getKey(e)] = this._getValue(e), t;
  }
}
const Xr = (r, t) => () => new tr(r, t);
class er {
  set;
  constructor(t = /* @__PURE__ */ new Set()) {
    this.set = t;
  }
  "@@transducer/init"() {
    return this.set;
  }
  "@@transducer/result"(t) {
    return t;
  }
  "@@transducer/step"(t, e) {
    return t.add(e), t;
  }
}
const qr = (r) => () => new er(r), jr = (r, t, e) => (s, ...i) => {
  if (arguments.length === 0)
    return e();
  if (!Array.isArray(s)) {
    let n = 0;
    const l = r.length;
    for (; n < l; ) {
      const o = r[n], u = s[o];
      if (typeof u == "function")
        return u.apply(s, i);
      n++;
    }
    return Ke(s) ? t.apply(null, i)(s) : e.apply(void 0, arguments);
  }
};
function rr(r, t, e = !1) {
  const s = e ? [r] : r.children;
  s?.length && s.forEach((i) => t(i) !== !1 && rr(i, t));
}
function sr(r, t, e = !1) {
  const s = e ? r : r.parent;
  s && t(s) !== !1 && sr(s, t);
}
const Gr = (r, t) => r?.length && t ? r.indexOf(t) : -1;
class Jr extends RegExp {
  constructor(t = "*") {
    const e = Mt.run(t).result;
    super(e);
  }
}
export {
  Q as AbstractValueComparator,
  Er as ApplicationError,
  Ar as AsEnumerableRingBuffer,
  $r as AsPathMatcherFilter,
  gt as AsSerializableError,
  Cr as Deferred,
  Fr as DelegatingTransformer,
  nt as EntriesIterator,
  Nr as EqualsPathMatcher,
  Xe as FrameworkError,
  Lr as GlobPathMatcher,
  X as GlobPatternInfo,
  Mr as IllegalStateError,
  it as IndexedIterator,
  at as KeysIterator,
  a as MediaType,
  fr as MediaTypes,
  Ve as MultiValueMap,
  Y as Null,
  Me as RangeIterator,
  Pr as ResizableRingBuffer,
  f as RingBuffer,
  ot as ValuesIterator,
  Jr as WildcardExp,
  Ye as XCount,
  Be as XToArray,
  Qe as XToMap,
  Ze as XToMultiValueMap,
  tr as XToRecord,
  er as XToSet,
  cr as comparableComparator,
  Wr as count,
  H as createNull,
  hr as dateComparator,
  rr as direct,
  jr as dispatchable,
  gr as entriesIterator,
  Tr as equates,
  sr as escalate,
  yr as getIterator,
  Gr as indexOf,
  M as indexedIterator,
  ur as invertComparison,
  pr as isEntries,
  Te as isEntry,
  Sr as isJSONArray,
  _r as isJSONObject,
  ht as isJSONValue,
  Oe as isNotPrimitive,
  N as isPrimitive,
  dr as keysIterator,
  ar as likeComparable,
  or as likeComparator,
  wr as likeConstructable,
  Ir as likeEnumerable,
  V as likeEquatable,
  Ee as likeIterable,
  Or as likePathMatcher,
  ze as likeReduced,
  xr as likeSerializable,
  Ke as likeTransformer,
  lr as naturalComparison,
  et as numberComparator,
  br as rangeIterator,
  vr as reduce,
  ft as serialize,
  p as stringComparator,
  kr as toArray,
  Rr as toMap,
  Vr as toMultiValueMap,
  Xr as toRecord,
  qr as toSet,
  mr as valuesIterator,
  He as xCount,
  Ue as xToArray
};
//# sourceMappingURL=index.js.map
