import { createNull as ie, Null as ae, escalate as St, likeEnumerable as Tt } from "@blue/core";
import { likeContentSource as It, likeContentSourceAware as Ft } from "@blue/content";
import { propIs as jt, lastIndexOf as Lt, like as A, complement as oe, isNil as se, isFunction as ze, path as Nt, reduce as Dt, pathSatisfies as Gt, both as We, propSatisfies as Ut, test as $t, allPass as Ht, split as qt, pipe as zt, uniq as Wt, is as Bt } from "@blue/util";
import { likeAwareAnd as fe, AsAware as ue, likeDestroyable as Vt, likeFactory as Yt, likeRegistry as Zt, likeAware as Jt, RegistryProxyHandler as Qt, DefaultFactory as Xt, AsNameAware as Kt } from "@blue/factory";
import { keypathExpression as Se } from "@blue/parser";
import { Level as Be, AsLevelComparator as er, newEntry as tr } from "@blue/logger";
const P = "@@emitter/events", U = "@@emitter/every", { defineProperty: rr, deleteProperty: Te, getPrototypeOf: nr } = Reflect, { hasOwnProperty: ir } = Object.prototype, { keys: ar } = Object, { isArray: Y } = Array, or = /^on(.+)$/, sr = jt(Function), Ve = sr("listener"), Ie = Lt(":"), fr = fe(A({ setApplicationEventEmitter: Function })), ur = A({
  emit: Function,
  eventTypes: Function,
  listener: Function,
  listenerCount: Function,
  listeners: Function,
  off: Function,
  on: Function
}), lr = (n, e, t) => {
  let i, s;
  if (Y(t))
    for (i = 0, s = t.length; i < s; i += 1)
      re(n, e, t[i], NaN);
  else
    re(n, e, t, NaN);
}, cr = (n, e, t = !1) => {
  let i, s, p;
  for (const b in e) {
    if (!t)
      p = b;
    else if (s = or.exec(b)) {
      const g = s[1];
      p = `${g[0].toLowerCase()}${g.slice(1)}`;
    }
    p && (i = e[p], mr(i) && lr(n, p, i));
  }
}, re = (n, e, t, i) => {
  hr(n, ie());
  const s = n[P];
  if (s[":on"] && (L(n, ":on", [e, Ve(t) ? t.listener : t], !1), s[":on"] = n[P][":on"]), !s[e])
    s[e] = t;
  else if (Y(s[e]))
    switch (isNaN(i) || i) {
      case !0:
        s[e].push(t);
        break;
      case 0:
        s[e].unshift(t);
        break;
      default:
        s[e].splice(i, 0, t);
        break;
    }
  else
    s[e] = i === 0 ? [t, s[e]] : [s[e], t];
  n[P] = s;
}, hr = (n, e) => {
  const t = ir.call(n, P), i = nr(n);
  (!t || i && n[P] === i[P]) && rr(n, P, {
    value: e,
    configurable: !0,
    enumerable: !1,
    writable: !0
  });
}, dr = (n, e, t) => {
  let i = !1, s = typeof e == "string" ? Ie(e) : -1;
  for (; s > 0; )
    i = e && L(n, e, t, !1) || i, e = e.substring(0, s), s = Ie(e);
  return i = e && L(n, e, t, e !== U) || i, i;
}, H = (n, e) => {
  const t = e.length;
  for (let i = 0; i < t; i += 1)
    L(n, "error", [e[i]], !1);
}, L = (n, e, t, i) => {
  const s = n[P], p = oe(se);
  let b = !1, g;
  if (p(s)) {
    if (e === "error" && !s.error)
      throw t[0] instanceof Error ? t[0] : new Error('Uncaught, unspecified "error" event.');
    g = s[e], p(g) && (je(g, t, n), b = !0), i && (g = s[U], p(g) && (je(g, t, n), b = !0));
  }
  return b;
}, Fe = (n, e) => n === e || Ve(n) && n.listener === e, je = (n, e, t) => {
  const i = ze(n);
  switch (e.length) {
    case 0:
      yr(n, i, t);
      break;
    case 1:
      vr(n, i, t, e[0]);
      break;
    case 2:
      wr(n, i, t, e[0], e[1]);
      break;
    case 3:
      gr(n, i, t, e[0], e[1], e[2]);
      break;
    default:
      br(n, i, t, e);
      break;
  }
}, pr = (n) => ar(n[P]), yr = (n, e, t) => {
  const i = [];
  if (e)
    try {
      n.call(t);
    } catch (s) {
      i.push(s);
    }
  else {
    const s = n.length, p = n.slice();
    let b = 0;
    for (; b < s; b += 1)
      try {
        p[b].call(t);
      } catch (g) {
        i.push(g);
      }
  }
  i.length && H(t, i);
}, vr = (n, e, t, i) => {
  const s = [];
  if (e)
    try {
      n.call(t, i);
    } catch (p) {
      s.push(p);
    }
  else {
    const p = n.length, b = n.slice();
    let g = 0;
    for (; g < p; g += 1)
      try {
        b[g].call(t, i);
      } catch (O) {
        s.push(O);
      }
  }
  s.length && H(t, s);
}, wr = (n, e, t, i, s) => {
  const p = [];
  if (e)
    try {
      n.call(t, i, s);
    } catch (b) {
      p.push(b);
    }
  else {
    const b = n.length, g = n.slice();
    let O = 0;
    for (; O < b; O += 1)
      try {
        g[O].call(t, i, s);
      } catch (x) {
        p.push(x);
      }
  }
  p.length && H(t, p);
}, gr = (n, e, t, i, s, p) => {
  const b = [];
  if (e)
    try {
      n.call(t, i, s, p);
    } catch (g) {
      b.push(g);
    }
  else {
    const g = n.length, O = n.slice();
    let x = 0;
    for (; x < g; x += 1)
      try {
        O[x].call(t, i, s, p);
      } catch (I) {
        b.push(I);
      }
  }
  b.length && H(t, b);
}, br = (n, e, t, i) => {
  const s = [];
  if (e)
    try {
      n.apply(t, i);
    } catch (p) {
      s.push(p);
    }
  else {
    const p = n.length, b = n.slice();
    let g = 0;
    for (; g < p; g += 1)
      try {
        b[g].apply(t, i);
      } catch (O) {
        s.push(O);
      }
  }
  s.length && H(t, s);
}, mr = (n) => ze(n) || Y(n), Pr = (n, e, t) => {
  const i = n[P][e];
  if (Fe(i, t))
    Te(n[P], e), n[P][":off"] && L(n, ":off", [e, t], !1);
  else if (Y(i)) {
    let s = -1;
    for (let p = i.length; p-- > 0; )
      if (Fe(i[p], t)) {
        s = p;
        break;
      }
    s > -1 && (i.length === 1 ? (i.length = 0, Te(n[P], e)) : _r(i, s), n[P][":off"] && L(n, ":off", [e, t], !1));
  }
}, _r = (n, e) => {
  const t = n.length;
  let i = e, s = i + 1;
  for (; s < t; i += 1, s += 1)
    n[i] = n[s];
  n.pop();
}, Ye = (n) => class extends n {
  get [Symbol.toStringTag]() {
    return "EventEmitter";
  }
  /**
   * Execute the listeners for the specified event `type` with the supplied arguments.
   *
   * The `type` can be namespaced using `:`, which will result in multiple events being triggered in succession. Listeners can be associated with the fully namespaced `type` or a subset of the `type`.
   *
   * Returns `true` if the event had listeners, `false` otherwise.
   * @function module:context.AsEventEmitter#emit
   * @param {module:context.EventType} type The event type.
   * @param {...*} [data] The data passed into the listeners.
   * @return {external:boolean} Whether or not the event had listeners.
   * @since 1.0.0
   * @example <caption>Emitting an event</caption>
   * const greeter = new Emitter();
   * greeter.on( 'hello', () => console.log( 'Hello!' ) );
   * greeter.emtest( 'hello' );     // true
   * // Hello!
   * greeter.emtest( 'goodbye' );   // false
   * @example <caption>Emitting an event with data</caption>
   * const greeter = new Emitter();
   * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
   * greeter.emtest( 'hello', 'World' );
   * // Hello, World!
   * @example <caption>Emitting a namespaced event</caption>
   * const greeter = new Emitter();
   * greeter.on( 'greeting:hello', ( name ) => console.log( `Hello, ${ name }!` ) );
   * greeter.on( 'greeting:hi', ( name ) => console.log( `Hi, ${ name }!` ) );
   * greeter.on( 'greeting', ( name ) => console.log( `${ name } was greeted.` );
   *
   * // This event will not be triggered by emitting "greeting:hello"
   * greeter.on( 'hello', ( name ) => console.log( `Hello again, ${ name }` );
   *
   * greeter.emtest( 'greeting:hi', 'Mark' );
   * // Hi, Mark!
   * // Mark was greeted.
   *
   * greeter.emtest( 'greeting:hello', 'Jeff' );
   * // Hello, Jeff!
   * // Jeff was greeted.
   */
  emit(t, ...i) {
    return dr(this, t, i);
  }
  /**
   * @function module:context.AsEventEmitter#eventTypes
   * @return {external:Array<module:context.EventType>} The list of event types registered to the emitter.
   * @since 2.0.0
   * @example
   * const greeter = new Emitter();
   * greeter.on( 'hello', () => console.log( `Hello` ) );
   * greeter.on( 'hi', () => console.log( `Hi` ) );
   *
   * console.log( greeter.eventTypes() );
   * // [ 'hello', 'hi' ]
   */
  eventTypes() {
    return pr(this);
  }
  /**
   * @function module:context.AsEventEmitter#listenerCount
   * @param {module:context.EventType} type The event type.
   * @return {external:number} The number of listeners for that event type within the given emitter.
   * @since 1.0.0
   * @example
   * const greeter = new Emitter();
   * greeter.on( 'hello', () => console.log( 'Hello!' ) );
   * console.log( greeter.listenerCount( 'hello' ) );
   * // 1
   * console.log( greeter.listenerCount( 'goodbye' ) );
   * // 0
   */
  listenerCount(t) {
    let i;
    return !this[P] || !this[P][t] ? i = 0 : typeof this[P][t] == "function" ? i = 1 : i = this[P][t].length, i;
  }
  /**
   * @function module:context.AsEventEmitter#listeners
   * @param {module:context.EventType} type The event type.
   * @return {external:number} The number of listeners for that event type within the given emitter.
   * @since 1.0.0
   * @example
   * const hello = function(){
   *  console.log( 'Hello!' );
   * },
   *  greeter = new Emitter();
   *
   * greeter.on( 'hello', hello );
   * greeter.emtest( 'hello' );
   * // Hello!
   *
   * console.log( greeter.listeners( 'hello' )[ 0 ] === hello );
   * // true
   */
  listeners(t) {
    let i;
    if (!this[P] || !this[P][t])
      i = [];
    else {
      const s = this[P][t];
      typeof s > "u" ? i = [] : typeof s == "function" ? i = [s] : i = s.slice();
    }
    return i;
  }
  /**
   * Adds a listener for the specified event `type`. If no `type` is given the listener will be triggered any event `type`.
   *
   * No checks are made to see if the `listener` has already been added. Multiple calls passing the same combination `type` and `listener` will result in the `listener` being added multiple times.
   * @function module:context.AsEventEmitter#on
   * @param {module:context.EventType} [type] The event type.
   * @param {module:context.EventListener} listener The event callback.
   * @return {module:context.EventEmitter} The emitter.
   * @since 1.0.0
   * @emits {:on} when listeners are added
   * @example <caption>Listen to all event types</caption>
   * const greeter = new Emitter();
   * greeter.on( () => console.log( 'Greeted' ) );
   * greeter.emtest( 'hello' );
   * // Greeted
   * greeter.emtest( 'goodbye' );
   * // Greeted
   * @example <caption>Listener to a specified event type</caption>
   * const greeter = new Emitter();
   * greeter.on( 'hello', ( name ) => console.log( `Hello, ${ name }!` ) );
   * greeter.emtest( 'hello', 'World' );
   * // Hello, World!
   * greeter.emtest( 'hi', 'World' );
   */
  on(t = U, i) {
    if (typeof i > "u") {
      if (typeof t == "function")
        i = t, t = U;
      else if (typeof t == "object")
        return cr(this, t, !1), this;
    }
    return re(this, t, i, NaN), this;
  }
  /**
   * Removes the `listener` for the specified event `type`. If no `type` is given it is assumed the `listener` is not associated with a specific `type`.
   *
   * If any single listener has been added multiple times for the specified `type`, then `emitter.off()` must be called multiple times to remove each instance.
   * @function module:context.AsEventEmitter#off
   * @param {module:context.EventType} type The event type.
   * @param {module:context.EventListener} listener The event callback.
   * @return {module:context.EventEmitter} The emitter.
   * @since 1.0.0
   * @emits {:off} when listeners are removed
   * @example <caption>Remove a listener from any event type</caption>
   * function greet( name ){
   *  console.log( `Greetings, ${ name }!` );
   * }
   *
   * const greeter = new Emitter();
   * greeter.on( greet );
   * greeter.emtest( 'hello' 'Jeff' );
   * // Greetings, Jeff!
   * greeter.emtest( 'hi' 'Jeff' );
   * // Greetings, Jeff!
   * greeter.off( greet );
   * greeter.emtest( 'yo', 'Jeff' );
   * @example <caption>Remove a listener from a specified event type</caption>
   * function hello( name ){
   *  console.log( `Hello, ${ name }!` );
   * }
   *
   * const greeter = new Emitter();
   * greeter.on( 'hello', hello );
   * greeter.emtest( 'hello', 'Jeff' );
   * // Hello, Jeff!
   * greeter.off( 'hello', hello );
   * greeter.emtest( 'hello', 'Jeff' );
   */
  off(t, i) {
    if (typeof t == "function" && typeof i > "u" && (i = t, t = U), typeof i != "function")
      throw new TypeError("listener must be a function");
    return !this[P] || !this[P][t] ? this : (Pr(this, t, i), this);
  }
}, { defineProperty: Mr, getPrototypeOf: Er, setPrototypeOf: Le } = Reflect, kr = (n, e) => {
  const t = oe(se);
  return Gt(t, n, e);
}, Or = (n, e) => (Le(e, null), Le(n, e), Er(n)), xr = (n) => {
  const e = ie();
  return Dt(Or, e)(n), e;
}, Rr = A({
  getProperty: Function,
  getRequiredProperty: Function,
  hasProperty: Function
});
class Cr {
  #e;
  properties;
  /**
   * @member {external:Array<module:core.JSONObject>} module:context.PrototypalPropertyResolver#propertySources
   */
  get propertySources() {
    return this.#e;
  }
  set propertySources(e) {
    this.#e = e, Mr(this, "properties", {
      value: e.length === 1 ? e[0] : xr(e),
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  constructor(e) {
    this.propertySources = e;
  }
  /**
   * @function module:context.PrototypalPropertyResolver#getProperty
   * @param {external:string} key
   * @param {module:core.JSONValue} [defaultValue]
   * @returns {module:core.JSONValue}
   */
  getProperty(e, t) {
    const i = Se.run(e);
    if (!i.isError) {
      const s = i.result;
      return s ? Nt(s, this.properties) ?? t : t;
    }
    return t;
  }
  /**
   * @function module:context.PrototypalPropertyResolver#getRequiredProperty
   * @param {external:string} key
   * @returns {module:core.JSONValue}
   */
  getRequiredProperty(e) {
    const t = this.getProperty(e);
    if (typeof t > "u")
      throw new Error(`Required property "${e}" missing`);
    return t;
  }
  /**
   * @function module:context.PrototypalPropertyResolver#hasProperty
   * @param {external:string} key
   * @returns {external:boolean}
   */
  hasProperty(e) {
    const t = Se.run(e);
    if (!t.isError) {
      const i = t.result;
      return i ? kr(i, this.properties) : !1;
    }
    return !1;
  }
}
const { defineProperty: Ar } = Reflect;
class Ze {
  #e;
  #t;
  #r;
  get propertySources() {
    return this.#e.propertySources;
  }
  set propertySources(e) {
    this.#e.propertySources = e;
  }
  get [Symbol.toStringTag]() {
    return `Environment:${[...this.#t].join(",")}`;
  }
  get activeProfiles() {
    return [...this.#t];
  }
  set activeProfiles(e) {
    const t = this.#t;
    t.size && t.clear(), e.forEach(t.add, t);
  }
  get defaultProfiles() {
    return [...this.#r];
  }
  set defaultProfiles(e) {
    const t = this.#r;
    t.size && t.clear(), e.forEach(t.add, t);
  }
  constructor(e = []) {
    this.#t = /* @__PURE__ */ new Set(), this.#r = /* @__PURE__ */ new Set(), this.#e = new Cr(e);
  }
  addActiveProfile(e) {
    this.#t.add(e);
  }
  hasProperty(e) {
    return this.#e.hasProperty(e);
  }
  getProperty(e, t) {
    return this.#e.getProperty(e, t);
  }
  getRequiredProperty(e) {
    return this.#e.getRequiredProperty(e);
  }
  merge(e) {
    if (e.propertySources.length) {
      const t = this.propertySources.concat(e.propertySources);
      this.propertySources = t;
    }
    e.activeProfiles.length && e.activeProfiles.forEach((t) => this.addActiveProfile(t)), e.defaultProfiles.length && e.defaultProfiles.forEach((t) => this.defaultProfiles.push(t));
  }
  _isActiveProfile(e) {
    return this.#t.has(e);
  }
}
const Sr = (n) => class extends ue(n) {
  environment;
  setEnvironment(e) {
    Ar(this, "environment", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
}, Tr = We(
  Rr,
  A({ activeProfiles: Array, defaultProfiles: Array, addActiveProfile: Function })
), Ir = fe(A({ setEnvironment: Function })), Fr = Ut(Tr, "environment"), jr = We(oe(se), Fr);
class un extends Ze {
}
class Je extends Ze {
}
const { defineProperty: $ } = Reflect, Lr = /^(?:[a-z]+:)?\/\//i, Nr = $t(Lr), Dr = (n) => class extends ue(n) {
  loader;
  setResourceLoader(e) {
    $(this, "loader", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
}, ln = A({ exists: Boolean }), Gr = A({ getResource: Function }), Ur = A({ setResourceLoader: Function });
class $r {
  url;
  value;
  get exists() {
    return !0;
  }
  constructor(e, t) {
    const i = Nr(e) ? new URL(e) : new URL(e, location.href);
    i.pathname.lastIndexOf(".") === -1 && (i.pathname += ".js"), $(this, "url", {
      value: i,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), $(this, "value", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
}
class Hr {
  value;
  get exists() {
    return !1;
  }
  constructor(e, t) {
    $(this, "path", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), $(this, "value", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
}
const Qe = (n) => class extends n {
  async getResource(t) {
    try {
      const i = await import(t);
      return new $r(t, i);
    } catch (i) {
      throw new Hr(t, i);
    }
  }
};
class cn extends Qe(ae) {
}
const { defineProperty: T } = Reflect;
let qr = 0;
const hn = Symbol("@@context/child"), dn = Ht([
  It,
  Vt,
  jr,
  ur,
  Yt,
  Zt,
  Gr
]), zr = fe(A({ setApplicationContext: Function }));
class Xe extends Ye(Qe(Xt)) {
  #e;
  #t;
  #r;
  #n;
  createdTimestamp;
  destroyed;
  destroyedTimestamp;
  get environment() {
    return this.#e || (this.#e = this._createEnvironment()), this.#e;
  }
  get id() {
    return this.#t;
  }
  get name() {
    return this.#r;
  }
  get parent() {
    return this.#n;
  }
  get path() {
    const e = [];
    let t = this;
    for (this.name && e.unshift(this.name); t.parent; )
      t = t.parent, e.unshift(t.name);
    return e.join("/");
  }
  constructor(e, t) {
    if (super(), this.#e = null, this.#r = e ?? null, this.#n = null, this.setId(++qr), T(this, "createdTimestamp", {
      value: Date.now(),
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), T(this, "root", {
      value: this,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), T(this, "destroyed", {
      value: !1,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), T(this, "destroyedTimestamp", {
      value: -1,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), t)
      for (const i in t)
        this.setValue(i, t[i]);
  }
  /*
  broadcast( type: EventType, ...data: any[] ): void {
      direct<ApplicationContext>( this, ( parentContext ) => parentContext.emit( type, ...data ), true );
  }
  */
  bubble(e, ...t) {
    St(this, (i) => i.emit(e, ...t), !0);
  }
  destroy() {
    this.destroyed || (T(this, "destroyed", {
      value: !0,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), T(this, "destroyedTimestamp", {
      value: Date.now(),
      configurable: !0,
      enumerable: !1,
      writable: !1
    }));
  }
  getContent(e, t) {
    throw new Error("Method not implemented.");
  }
  setEnvironment(e) {
    this.#e = e;
  }
  setId(e) {
    this.#t = e;
  }
  setName(e) {
    this.#r = e;
  }
  setParent(e) {
    this.#n = e;
  }
  _createEnvironment() {
    return new Je();
  }
}
class pn extends Xe {
  constructor(e, t) {
    return super(e, t), new Proxy(this, new Qt());
  }
}
const yn = (n) => class extends ue(n) {
  applicationContext;
  /**
   * @function module:context.AsApplicationContextAware#setApplicationContext
   * @param {module:context.ApplicationContext} applicationContext The application context to be set.
   */
  setApplicationContext(e) {
    T(this, "applicationContext", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
};
class vn {
  applicationContext;
  constructor(e) {
    T(this, "applicationContext", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  processAfterInitialization(e, t) {
    return t;
  }
  processBeforeInitialization(e, t) {
    if (Jt(t)) {
      const { applicationContext: i } = this;
      Ir(t) && t.setEnvironment(i.environment), Ur(t) && t.setResourceLoader(i), fr(t) && t.setApplicationEventEmitter(i), Ft(t) && t.setContentSource(i), zr(t) && t.setApplicationContext(i);
    }
    return t;
  }
}
var Ne = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, De = {};
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
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
var Ge;
function Wr() {
  if (Ge) return De;
  Ge = 1;
  var n;
  return function(e) {
    (function(t) {
      var i = typeof globalThis == "object" ? globalThis : typeof Ne == "object" ? Ne : typeof self == "object" ? self : typeof this == "object" ? this : O(), s = p(e);
      typeof i.Reflect < "u" && (s = p(i.Reflect, s)), t(s, i), typeof i.Reflect > "u" && (i.Reflect = e);
      function p(x, I) {
        return function(S, N) {
          Object.defineProperty(x, S, { configurable: !0, writable: !0, value: N }), I && I(S, N);
        };
      }
      function b() {
        try {
          return Function("return this;")();
        } catch {
        }
      }
      function g() {
        try {
          return (0, eval)("(function() { return this; })()");
        } catch {
        }
      }
      function O() {
        return b() || g();
      }
    })(function(t, i) {
      var s = Object.prototype.hasOwnProperty, p = typeof Symbol == "function", b = p && typeof Symbol.toPrimitive < "u" ? Symbol.toPrimitive : "@@toPrimitive", g = p && typeof Symbol.iterator < "u" ? Symbol.iterator : "@@iterator", O = typeof Object.create == "function", x = { __proto__: [] } instanceof Array, I = !O && !x, S = {
        // create an object in dictionary mode (a.k.a. "slow" mode in v8)
        create: O ? function() {
          return te(/* @__PURE__ */ Object.create(null));
        } : x ? function() {
          return te({ __proto__: null });
        } : function() {
          return te({});
        },
        has: I ? function(r, a) {
          return s.call(r, a);
        } : function(r, a) {
          return a in r;
        },
        get: I ? function(r, a) {
          return s.call(r, a) ? r[a] : void 0;
        } : function(r, a) {
          return r[a];
        }
      }, N = Object.getPrototypeOf(Function), D = typeof Map == "function" && typeof Map.prototype.entries == "function" ? Map : Ot(), J = typeof Set == "function" && typeof Set.prototype.entries == "function" ? Set : xt(), Q = typeof WeakMap == "function" ? WeakMap : Rt(), F = p ? Symbol.for("@reflect-metadata:registry") : void 0, W = Mt(), pe = Et(W);
      function at(r, a, o, f) {
        if (y(o)) {
          if (!Me(r))
            throw new TypeError();
          if (!Ee(a))
            throw new TypeError();
          return yt(r, a);
        } else {
          if (!Me(r))
            throw new TypeError();
          if (!M(a))
            throw new TypeError();
          if (!M(f) && !y(f) && !j(f))
            throw new TypeError();
          return j(f) && (f = void 0), o = C(o), vt(r, a, o, f);
        }
      }
      t("decorate", at);
      function ot(r, a) {
        function o(f, d) {
          if (!M(f))
            throw new TypeError();
          if (!y(d) && !Pt(d))
            throw new TypeError();
          ge(r, a, f, d);
        }
        return o;
      }
      t("metadata", ot);
      function st(r, a, o, f) {
        if (!M(o))
          throw new TypeError();
        return y(f) || (f = C(f)), ge(r, a, o, f);
      }
      t("defineMetadata", st);
      function ft(r, a, o) {
        if (!M(a))
          throw new TypeError();
        return y(o) || (o = C(o)), ye(r, a, o);
      }
      t("hasMetadata", ft);
      function ut(r, a, o) {
        if (!M(a))
          throw new TypeError();
        return y(o) || (o = C(o)), X(r, a, o);
      }
      t("hasOwnMetadata", ut);
      function lt(r, a, o) {
        if (!M(a))
          throw new TypeError();
        return y(o) || (o = C(o)), ve(r, a, o);
      }
      t("getMetadata", lt);
      function ct(r, a, o) {
        if (!M(a))
          throw new TypeError();
        return y(o) || (o = C(o)), we(r, a, o);
      }
      t("getOwnMetadata", ct);
      function ht(r, a) {
        if (!M(r))
          throw new TypeError();
        return y(a) || (a = C(a)), be(r, a);
      }
      t("getMetadataKeys", ht);
      function dt(r, a) {
        if (!M(r))
          throw new TypeError();
        return y(a) || (a = C(a)), me(r, a);
      }
      t("getOwnMetadataKeys", dt);
      function pt(r, a, o) {
        if (!M(a))
          throw new TypeError();
        if (y(o) || (o = C(o)), !M(a))
          throw new TypeError();
        y(o) || (o = C(o));
        var f = G(
          a,
          o,
          /*Create*/
          !1
        );
        return y(f) ? !1 : f.OrdinaryDeleteMetadata(r, a, o);
      }
      t("deleteMetadata", pt);
      function yt(r, a) {
        for (var o = r.length - 1; o >= 0; --o) {
          var f = r[o], d = f(a);
          if (!y(d) && !j(d)) {
            if (!Ee(d))
              throw new TypeError();
            a = d;
          }
        }
        return a;
      }
      function vt(r, a, o, f) {
        for (var d = r.length - 1; d >= 0; --d) {
          var k = r[d], E = k(a, o, f);
          if (!y(E) && !j(E)) {
            if (!M(E))
              throw new TypeError();
            f = E;
          }
        }
        return f;
      }
      function ye(r, a, o) {
        var f = X(r, a, o);
        if (f)
          return !0;
        var d = ee(a);
        return j(d) ? !1 : ye(r, d, o);
      }
      function X(r, a, o) {
        var f = G(
          a,
          o,
          /*Create*/
          !1
        );
        return y(f) ? !1 : _e(f.OrdinaryHasOwnMetadata(r, a, o));
      }
      function ve(r, a, o) {
        var f = X(r, a, o);
        if (f)
          return we(r, a, o);
        var d = ee(a);
        if (!j(d))
          return ve(r, d, o);
      }
      function we(r, a, o) {
        var f = G(
          a,
          o,
          /*Create*/
          !1
        );
        if (!y(f))
          return f.OrdinaryGetOwnMetadata(r, a, o);
      }
      function ge(r, a, o, f) {
        var d = G(
          o,
          f,
          /*Create*/
          !0
        );
        d.OrdinaryDefineOwnMetadata(r, a, o, f);
      }
      function be(r, a) {
        var o = me(r, a), f = ee(r);
        if (f === null)
          return o;
        var d = be(f, a);
        if (d.length <= 0)
          return o;
        if (o.length <= 0)
          return d;
        for (var k = new J(), E = [], v = 0, u = o; v < u.length; v++) {
          var l = u[v], c = k.has(l);
          c || (k.add(l), E.push(l));
        }
        for (var h = 0, w = d; h < w.length; h++) {
          var l = w[h], c = k.has(l);
          c || (k.add(l), E.push(l));
        }
        return E;
      }
      function me(r, a) {
        var o = G(
          r,
          a,
          /*create*/
          !1
        );
        return o ? o.OrdinaryOwnMetadataKeys(r, a) : [];
      }
      function Pe(r) {
        if (r === null)
          return 1;
        switch (typeof r) {
          case "undefined":
            return 0;
          case "boolean":
            return 2;
          case "string":
            return 3;
          case "symbol":
            return 4;
          case "number":
            return 5;
          case "object":
            return r === null ? 1 : 6;
          default:
            return 6;
        }
      }
      function y(r) {
        return r === void 0;
      }
      function j(r) {
        return r === null;
      }
      function wt(r) {
        return typeof r == "symbol";
      }
      function M(r) {
        return typeof r == "object" ? r !== null : typeof r == "function";
      }
      function gt(r, a) {
        switch (Pe(r)) {
          case 0:
            return r;
          case 1:
            return r;
          case 2:
            return r;
          case 3:
            return r;
          case 4:
            return r;
          case 5:
            return r;
        }
        var o = "string", f = ke(r, b);
        if (f !== void 0) {
          var d = f.call(r, o);
          if (M(d))
            throw new TypeError();
          return d;
        }
        return bt(r);
      }
      function bt(r, a) {
        var o, f;
        {
          var d = r.toString;
          if (B(d)) {
            var f = d.call(r);
            if (!M(f))
              return f;
          }
          var o = r.valueOf;
          if (B(o)) {
            var f = o.call(r);
            if (!M(f))
              return f;
          }
        }
        throw new TypeError();
      }
      function _e(r) {
        return !!r;
      }
      function mt(r) {
        return "" + r;
      }
      function C(r) {
        var a = gt(r);
        return wt(a) ? a : mt(a);
      }
      function Me(r) {
        return Array.isArray ? Array.isArray(r) : r instanceof Object ? r instanceof Array : Object.prototype.toString.call(r) === "[object Array]";
      }
      function B(r) {
        return typeof r == "function";
      }
      function Ee(r) {
        return typeof r == "function";
      }
      function Pt(r) {
        switch (Pe(r)) {
          case 3:
            return !0;
          case 4:
            return !0;
          default:
            return !1;
        }
      }
      function K(r, a) {
        return r === a || r !== r && a !== a;
      }
      function ke(r, a) {
        var o = r[a];
        if (o != null) {
          if (!B(o))
            throw new TypeError();
          return o;
        }
      }
      function Oe(r) {
        var a = ke(r, g);
        if (!B(a))
          throw new TypeError();
        var o = a.call(r);
        if (!M(o))
          throw new TypeError();
        return o;
      }
      function xe(r) {
        return r.value;
      }
      function Re(r) {
        var a = r.next();
        return a.done ? !1 : a;
      }
      function Ce(r) {
        var a = r.return;
        a && a.call(r);
      }
      function ee(r) {
        var a = Object.getPrototypeOf(r);
        if (typeof r != "function" || r === N || a !== N)
          return a;
        var o = r.prototype, f = o && Object.getPrototypeOf(o);
        if (f == null || f === Object.prototype)
          return a;
        var d = f.constructor;
        return typeof d != "function" || d === r ? a : d;
      }
      function _t() {
        var r;
        !y(F) && typeof i.Reflect < "u" && !(F in i.Reflect) && typeof i.Reflect.defineMetadata == "function" && (r = kt(i.Reflect));
        var a, o, f, d = new Q(), k = {
          registerProvider: E,
          getProvider: u,
          setProvider: c
        };
        return k;
        function E(h) {
          if (!Object.isExtensible(k))
            throw new Error("Cannot add provider to a frozen registry.");
          switch (!0) {
            case r === h:
              break;
            case y(a):
              a = h;
              break;
            case a === h:
              break;
            case y(o):
              o = h;
              break;
            case o === h:
              break;
            default:
              f === void 0 && (f = new J()), f.add(h);
              break;
          }
        }
        function v(h, w) {
          if (!y(a)) {
            if (a.isProviderFor(h, w))
              return a;
            if (!y(o)) {
              if (o.isProviderFor(h, w))
                return a;
              if (!y(f))
                for (var m = Oe(f); ; ) {
                  var _ = Re(m);
                  if (!_)
                    return;
                  var R = xe(_);
                  if (R.isProviderFor(h, w))
                    return Ce(m), R;
                }
            }
          }
          if (!y(r) && r.isProviderFor(h, w))
            return r;
        }
        function u(h, w) {
          var m = d.get(h), _;
          return y(m) || (_ = m.get(w)), y(_) && (_ = v(h, w), y(_) || (y(m) && (m = new D(), d.set(h, m)), m.set(w, _))), _;
        }
        function l(h) {
          if (y(h))
            throw new TypeError();
          return a === h || o === h || !y(f) && f.has(h);
        }
        function c(h, w, m) {
          if (!l(m))
            throw new Error("Metadata provider not registered.");
          var _ = u(h, w);
          if (_ !== m) {
            if (!y(_))
              return !1;
            var R = d.get(h);
            y(R) && (R = new D(), d.set(h, R)), R.set(w, m);
          }
          return !0;
        }
      }
      function Mt() {
        var r;
        return !y(F) && M(i.Reflect) && Object.isExtensible(i.Reflect) && (r = i.Reflect[F]), y(r) && (r = _t()), !y(F) && M(i.Reflect) && Object.isExtensible(i.Reflect) && Object.defineProperty(i.Reflect, F, {
          enumerable: !1,
          configurable: !1,
          writable: !1,
          value: r
        }), r;
      }
      function Et(r) {
        var a = new Q(), o = {
          isProviderFor: function(l, c) {
            var h = a.get(l);
            return y(h) ? !1 : h.has(c);
          },
          OrdinaryDefineOwnMetadata: E,
          OrdinaryHasOwnMetadata: d,
          OrdinaryGetOwnMetadata: k,
          OrdinaryOwnMetadataKeys: v,
          OrdinaryDeleteMetadata: u
        };
        return W.registerProvider(o), o;
        function f(l, c, h) {
          var w = a.get(l), m = !1;
          if (y(w)) {
            if (!h)
              return;
            w = new D(), a.set(l, w), m = !0;
          }
          var _ = w.get(c);
          if (y(_)) {
            if (!h)
              return;
            if (_ = new D(), w.set(c, _), !r.setProvider(l, c, o))
              throw w.delete(c), m && a.delete(l), new Error("Wrong provider for target.");
          }
          return _;
        }
        function d(l, c, h) {
          var w = f(
            c,
            h,
            /*Create*/
            !1
          );
          return y(w) ? !1 : _e(w.has(l));
        }
        function k(l, c, h) {
          var w = f(
            c,
            h,
            /*Create*/
            !1
          );
          if (!y(w))
            return w.get(l);
        }
        function E(l, c, h, w) {
          var m = f(
            h,
            w,
            /*Create*/
            !0
          );
          m.set(l, c);
        }
        function v(l, c) {
          var h = [], w = f(
            l,
            c,
            /*Create*/
            !1
          );
          if (y(w))
            return h;
          for (var m = w.keys(), _ = Oe(m), R = 0; ; ) {
            var Ae = Re(_);
            if (!Ae)
              return h.length = R, h;
            var Ct = xe(Ae);
            try {
              h[R] = Ct;
            } catch (At) {
              try {
                Ce(_);
              } finally {
                throw At;
              }
            }
            R++;
          }
        }
        function u(l, c, h) {
          var w = f(
            c,
            h,
            /*Create*/
            !1
          );
          if (y(w) || !w.delete(l))
            return !1;
          if (w.size === 0) {
            var m = a.get(c);
            y(m) || (m.delete(h), m.size === 0 && a.delete(m));
          }
          return !0;
        }
      }
      function kt(r) {
        var a = r.defineMetadata, o = r.hasOwnMetadata, f = r.getOwnMetadata, d = r.getOwnMetadataKeys, k = r.deleteMetadata, E = new Q(), v = {
          isProviderFor: function(u, l) {
            var c = E.get(u);
            return !y(c) && c.has(l) ? !0 : d(u, l).length ? (y(c) && (c = new J(), E.set(u, c)), c.add(l), !0) : !1;
          },
          OrdinaryDefineOwnMetadata: a,
          OrdinaryHasOwnMetadata: o,
          OrdinaryGetOwnMetadata: f,
          OrdinaryOwnMetadataKeys: d,
          OrdinaryDeleteMetadata: k
        };
        return v;
      }
      function G(r, a, o) {
        var f = W.getProvider(r, a);
        if (!y(f))
          return f;
        if (o) {
          if (W.setProvider(r, a, pe))
            return pe;
          throw new Error("Illegal state.");
        }
      }
      function Ot() {
        var r = {}, a = [], o = (
          /** @class */
          function() {
            function v(u, l, c) {
              this._index = 0, this._keys = u, this._values = l, this._selector = c;
            }
            return v.prototype["@@iterator"] = function() {
              return this;
            }, v.prototype[g] = function() {
              return this;
            }, v.prototype.next = function() {
              var u = this._index;
              if (u >= 0 && u < this._keys.length) {
                var l = this._selector(this._keys[u], this._values[u]);
                return u + 1 >= this._keys.length ? (this._index = -1, this._keys = a, this._values = a) : this._index++, { value: l, done: !1 };
              }
              return { value: void 0, done: !0 };
            }, v.prototype.throw = function(u) {
              throw this._index >= 0 && (this._index = -1, this._keys = a, this._values = a), u;
            }, v.prototype.return = function(u) {
              return this._index >= 0 && (this._index = -1, this._keys = a, this._values = a), { value: u, done: !0 };
            }, v;
          }()
        ), f = (
          /** @class */
          function() {
            function v() {
              this._keys = [], this._values = [], this._cacheKey = r, this._cacheIndex = -2;
            }
            return Object.defineProperty(v.prototype, "size", {
              get: function() {
                return this._keys.length;
              },
              enumerable: !0,
              configurable: !0
            }), v.prototype.has = function(u) {
              return this._find(
                u,
                /*insert*/
                !1
              ) >= 0;
            }, v.prototype.get = function(u) {
              var l = this._find(
                u,
                /*insert*/
                !1
              );
              return l >= 0 ? this._values[l] : void 0;
            }, v.prototype.set = function(u, l) {
              var c = this._find(
                u,
                /*insert*/
                !0
              );
              return this._values[c] = l, this;
            }, v.prototype.delete = function(u) {
              var l = this._find(
                u,
                /*insert*/
                !1
              );
              if (l >= 0) {
                for (var c = this._keys.length, h = l + 1; h < c; h++)
                  this._keys[h - 1] = this._keys[h], this._values[h - 1] = this._values[h];
                return this._keys.length--, this._values.length--, K(u, this._cacheKey) && (this._cacheKey = r, this._cacheIndex = -2), !0;
              }
              return !1;
            }, v.prototype.clear = function() {
              this._keys.length = 0, this._values.length = 0, this._cacheKey = r, this._cacheIndex = -2;
            }, v.prototype.keys = function() {
              return new o(this._keys, this._values, d);
            }, v.prototype.values = function() {
              return new o(this._keys, this._values, k);
            }, v.prototype.entries = function() {
              return new o(this._keys, this._values, E);
            }, v.prototype["@@iterator"] = function() {
              return this.entries();
            }, v.prototype[g] = function() {
              return this.entries();
            }, v.prototype._find = function(u, l) {
              if (!K(this._cacheKey, u)) {
                this._cacheIndex = -1;
                for (var c = 0; c < this._keys.length; c++)
                  if (K(this._keys[c], u)) {
                    this._cacheIndex = c;
                    break;
                  }
              }
              return this._cacheIndex < 0 && l && (this._cacheIndex = this._keys.length, this._keys.push(u), this._values.push(void 0)), this._cacheIndex;
            }, v;
          }()
        );
        return f;
        function d(v, u) {
          return v;
        }
        function k(v, u) {
          return u;
        }
        function E(v, u) {
          return [v, u];
        }
      }
      function xt() {
        var r = (
          /** @class */
          function() {
            function a() {
              this._map = new D();
            }
            return Object.defineProperty(a.prototype, "size", {
              get: function() {
                return this._map.size;
              },
              enumerable: !0,
              configurable: !0
            }), a.prototype.has = function(o) {
              return this._map.has(o);
            }, a.prototype.add = function(o) {
              return this._map.set(o, o), this;
            }, a.prototype.delete = function(o) {
              return this._map.delete(o);
            }, a.prototype.clear = function() {
              this._map.clear();
            }, a.prototype.keys = function() {
              return this._map.keys();
            }, a.prototype.values = function() {
              return this._map.keys();
            }, a.prototype.entries = function() {
              return this._map.entries();
            }, a.prototype["@@iterator"] = function() {
              return this.keys();
            }, a.prototype[g] = function() {
              return this.keys();
            }, a;
          }()
        );
        return r;
      }
      function Rt() {
        var r = 16, a = S.create(), o = f();
        return (
          /** @class */
          function() {
            function u() {
              this._key = f();
            }
            return u.prototype.has = function(l) {
              var c = d(
                l,
                /*create*/
                !1
              );
              return c !== void 0 ? S.has(c, this._key) : !1;
            }, u.prototype.get = function(l) {
              var c = d(
                l,
                /*create*/
                !1
              );
              return c !== void 0 ? S.get(c, this._key) : void 0;
            }, u.prototype.set = function(l, c) {
              var h = d(
                l,
                /*create*/
                !0
              );
              return h[this._key] = c, this;
            }, u.prototype.delete = function(l) {
              var c = d(
                l,
                /*create*/
                !1
              );
              return c !== void 0 ? delete c[this._key] : !1;
            }, u.prototype.clear = function() {
              this._key = f();
            }, u;
          }()
        );
        function f() {
          var u;
          do
            u = "@@WeakMap@@" + v();
          while (S.has(a, u));
          return a[u] = !0, u;
        }
        function d(u, l) {
          if (!s.call(u, o)) {
            if (!l)
              return;
            Object.defineProperty(u, o, { value: S.create() });
          }
          return u[o];
        }
        function k(u, l) {
          for (var c = 0; c < l; ++c)
            u[c] = Math.random() * 255 | 0;
          return u;
        }
        function E(u) {
          if (typeof Uint8Array == "function") {
            var l = new Uint8Array(u);
            return typeof crypto < "u" ? crypto.getRandomValues(l) : typeof msCrypto < "u" ? msCrypto.getRandomValues(l) : k(l, u), l;
          }
          return k(new Array(u), u);
        }
        function v() {
          var u = E(r);
          u[6] = u[6] & 79 | 64, u[8] = u[8] & 191 | 128;
          for (var l = "", c = 0; c < r; ++c) {
            var h = u[c];
            (c === 4 || c === 6 || c === 8) && (l += "-"), h < 16 && (l += "0"), l += h.toString(16).toLowerCase();
          }
          return l;
        }
      }
      function te(r) {
        return r.__ = void 0, delete r.__, r;
      }
    });
  }(n || (n = {})), De;
}
Wr();
const {
  defineMetadata: q,
  defineProperty: V,
  getMetadata: Z,
  getOwnPropertyDescriptor: ne,
  hasMetadata: z
} = Reflect, { isArray: Ke } = Array, et = "config:constructor", le = "config:profile", ce = "config:property", he = "config:property:source", de = "config:entry", Br = (n) => q(et, !0, n), Vr = (n, e, t) => q(le, Ke(n) ? n : n.split(","), e, t), Yr = (n, e, t) => q(ce, n, e, t), Ue = (n, e) => {
  if (Ke(n))
    q(he, n, e);
  else
    throw new TypeError("value must be an array of JSON objects");
}, $e = (n, e, t) => q(de, n, e, t), He = (n, e) => Z(le, n, e), Zr = (n, e) => Z(ce, n, e), tt = (n) => Z(he, n), Jr = (n, e) => Z(de, n, e), rt = (n) => z(et, n), qe = (n, e) => z(le, n, e), Qr = (n, e) => z(ce, n, e), nt = (n) => z(he, n), Xr = (n, e) => z(de, n, e), Kr = qt(","), en = zt(Kr, Wt), wn = (n) => (rt(n) || Br(n), n), gn = (n) => (e, t, i) => (Vr(en(n), e, t), t && !i && (i = ne(e, t)), t ? i : e), bn = (n) => (e, t) => {
  Yr(n, e, t), V(e, t, {
    value: null,
    configurable: !0,
    enumerable: !0,
    writable: !1
  });
}, mn = (n) => (e) => {
  let t;
  if (Tt(n) ? (t = ie(), n.forEach((i, s) => t[s] = i)) : t = n, nt(e)) {
    const i = tt(e);
    i.unshift(t), Ue(i, e);
  } else
    Ue([t], e);
  return e;
}, Pn = (n, e, t) => typeof n == "string" ? (i, s, p) => ($e(n, i, s), p || (p = ne(i, s)), p.enumerable || (p.enumerable = !0), p) : ($e(e, n, e), t || (t = ne(n, e)), t.enumerable || (t.enumerable = !0), t);
class it {
  environment;
  registry;
  constructor(e, t) {
    V(this, "registry", {
      value: e,
      configurable: !0,
      enumerable: !1,
      writable: !1
    }), V(this, "environment", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !1
    });
  }
  parse(e) {
    const t = e.length;
    let i = 0;
    for (; i < t; i++) {
      const s = e[i];
      if (rt(s) && (!qe(s) || this._isActiveProfile(He(s)))) {
        const p = new s();
        if (nt(s)) {
          const b = tt(s);
          this.processPropertySource(b), this.processProperty(p);
        }
        this.processConfiguration(p);
      }
    }
  }
  /**
   * Process the given `@configuration` decorator metadata.
   * @function module:context~ConfigurationClassParser#processConfiguration
   */
  processConfiguration(e) {
    for (const t in e)
      if ((!qe(e, t) || this._isActiveProfile(He(e, t))) && Xr(e, t)) {
        const i = Jr(e, t);
        this.processEntry(i, e[t].bind(e));
      }
  }
  /**
   * Process the given `@property` decorator metadata.
   * @function module:context~ConfigurationClassParser#processProperty
   */
  processProperty(e) {
    for (const t in e)
      if (Qr(e, t)) {
        const i = Zr(e, t), s = this.environment.getProperty(i);
        V(e, t, {
          value: s,
          configurable: !0,
          enumerable: !1,
          writable: !1
        });
      }
  }
  /**
   * Process the given `@propertySource` decorator metadata.
   * @function module:context~ConfigurationClassParser#processPropertySource
   */
  processPropertySource(e) {
    this.environment.propertySources = e;
  }
  /**
   * Process the given `@entry` decorator metadata.
   * @function module:context~ConfigurationClassParser#processValue
   */
  processEntry(e, t) {
    this.registry.setValue(e, t());
  }
  /**
   * @private
   * @function module:context~ConfigurationClassParser#_isActiveProfile
   * @param {external:Array<external:string>} profiles
   * @returns {external:boolean} Whether or not the profiles provided are active
   */
  _isActiveProfile(e) {
    const t = this.environment.activeProfiles, i = e.length;
    let s = 0;
    for (; s < i; s++)
      if (t.indexOf(e[s]) !== -1)
        return !0;
    return !1;
  }
}
class _n extends Dr(Sr(ae)) {
  environment;
  processEntryRegistry(e) {
    this.environment || (this.environment = new Je()), new it(e, this.environment).parse([e]);
  }
}
class Mn extends Xe {
  #e;
  constructor(e) {
    super(e), this.#e = new it(this, this.environment);
  }
  /**
   * @function module:context.MetadataConfigApplicationContext#register
   * @param {Object} configClass The configuration class
   */
  register(e) {
    this.#e.parse([e]);
  }
}
const tn = Bt(Be);
class En extends er(Ye(Kt(ae))) {
  name;
  #e;
  get threshold() {
    return this.#e;
  }
  set threshold(e) {
    tn(e) && (this.emit("change", this.#e, e), this.#e = e);
  }
  constructor() {
    super(), this.threshold = Be.ALL;
  }
  log(e, t) {
    if (this.compare(this.threshold, e) >= 0) {
      const i = tr(this.name, e, t);
      this.emit(`log:${e.name}`, i);
    }
  }
}
export {
  hn as $ChildContext,
  Ze as AbstractEnvironment,
  vn as ApplicationContextAwareProcessor,
  yn as AsApplicationContextAware,
  Sr as AsEnvironmentAware,
  Ye as AsEventEmitter,
  Qe as AsModuleResourceLoader,
  Dr as AsResourceLoaderAware,
  _n as ConfigurationProcessor,
  cn as DefaultResourceLoader,
  En as EventLogger,
  Xe as GenericApplicationContext,
  Mn as MetadataConfigApplicationContext,
  un as MockEnvironment,
  Cr as PrototypalPropertyResolver,
  pn as ProxiedGenericApplicationContext,
  Je as StandardEnvironment,
  $r as URLResource,
  Hr as UnresolvedResource,
  wn as configuration,
  Pn as entry,
  dn as likeApplicationContext,
  zr as likeApplicationContextAware,
  fr as likeApplicationEventEmitterAware,
  Tr as likeEnvironment,
  Ir as likeEnvironmentAware,
  jr as likeEnvironmentSource,
  ur as likeEventEmitter,
  Rr as likePropertyResolver,
  ln as likeResource,
  Gr as likeResourceLoader,
  Ur as likeResourceLoaderAware,
  gn as profile,
  bn as property,
  mn as propertySource
};
//# sourceMappingURL=index.js.map
