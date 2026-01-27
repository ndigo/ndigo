import { empty as on, is as M, curryN as Ot, allPass as bt, complement as be, cond as Se, T as v, F as E, both as ke, pipe as w, trim as St, isEmpty as kt, sort as cn, comparator as un, test as Ie, zip as fn, curry as oe, join as It, append as ln, equals as xt, replace as y, match as dn, unapply as hn, reduce as mn, concat as gn, defaultTo as pn, path as yn, split as Yt, when as Dn, toLower as ie, toUpper as ce, isNil as xe, identity as wn, toString as $t, always as Mn, slice as On, tryCatch as bn, partial as Sn, ifElse as kn, either as Ye, toPairs as In, map as xn, prepend as Yn, has as $e, propSatisfies as Tt, propEq as Wt, gt as $n, __ as Tn, length as Wn, dec as Nn } from "ramda";
import { F as wf, T as Mf, __ as Of, add as bf, addIndex as Sf, addIndexRight as kf, adjust as If, all as xf, allPass as Yf, always as $f, and as Tf, andThen as Wf, any as Nf, anyPass as vf, ap as Ff, aperture as Pf, append as _f, apply as Cf, applySpec as Ef, applyTo as Af, ascend as Hf, ascendNatural as Lf, assoc as Rf, assocPath as Uf, binary as qf, bind as zf, both as Xf, call as jf, chain as Zf, clamp as Bf, clone as Qf, collectBy as Gf, comparator as Vf, complement as Jf, compose as Kf, composeWith as el, concat as tl, cond as nl, construct as rl, constructN as al, converge as sl, count as ol, countBy as il, curry as cl, curryN as ul, dec as fl, defaultTo as ll, descend as dl, descendNatural as hl, difference as ml, differenceWith as gl, dissoc as pl, dissocPath as yl, divide as Dl, drop as wl, dropLast as Ml, dropLastWhile as Ol, dropRepeats as bl, dropRepeatsBy as Sl, dropRepeatsWith as kl, dropWhile as Il, either as xl, endsWith as Yl, eqBy as $l, eqProps as Tl, equals as Wl, evolve as Nl, filter as vl, find as Fl, findIndex as Pl, findLast as _l, findLastIndex as Cl, flatten as El, flip as Al, forEach as Hl, forEachObjIndexed as Ll, fromPairs as Rl, groupBy as Ul, groupWith as ql, gt as zl, gte as Xl, has as jl, hasIn as Zl, hasPath as Bl, head as Ql, identical as Gl, identity as Vl, ifElse as Jl, inc as Kl, includes as ed, indexBy as td, indexOf as nd, init as rd, innerJoin as ad, insert as sd, insertAll as od, intersection as id, intersperse as cd, into as ud, invert as fd, invertObj as ld, invoker as dd, is as hd, isNil as md, join as gd, juxt as pd, keys as yd, keysIn as Dd, last as wd, lastIndexOf as Md, length as Od, lens as bd, lensIndex as Sd, lensPath as kd, lensProp as Id, lift as xd, liftN as Yd, lt as $d, lte as Td, map as Wd, mapAccum as Nd, mapAccumRight as vd, mapObjIndexed as Fd, match as Pd, mathMod as _d, max as Cd, maxBy as Ed, mean as Ad, median as Hd, memoizeWith as Ld, mergeAll as Rd, mergeDeepLeft as Ud, mergeDeepRight as qd, mergeDeepWith as zd, mergeDeepWithKey as Xd, mergeLeft as jd, mergeRight as Zd, mergeWith as Bd, mergeWithKey as Qd, min as Gd, minBy as Vd, modulo as Jd, multiply as Kd, nAry as eh, negate as th, none as nh, not as rh, nth as ah, nthArg as sh, o as oh, objOf as ih, of as ch, omit as uh, once as fh, or as lh, otherwise as dh, over as hh, pair as mh, partial as gh, partialRight as ph, partition as yh, path as Dh, pathEq as wh, pathOr as Mh, pathSatisfies as Oh, pick as bh, pickAll as Sh, pickBy as kh, pipe as Ih, pipeWith as xh, pluck as Yh, prepend as $h, product as Th, project as Wh, prop as Nh, propEq as vh, propIs as Fh, propOr as Ph, propSatisfies as _h, props as Ch, reduce as Eh, reduceBy as Ah, reduceRight as Hh, reduceWhile as Lh, reduced as Rh, reject as Uh, remove as qh, repeat as zh, replace as Xh, reverse as jh, scan as Zh, sequence as Bh, set as Qh, slice as Gh, sort as Vh, sortBy as Jh, sortWith as Kh, split as em, splitAt as tm, splitEvery as nm, splitWhen as rm, startsWith as am, subtract as sm, sum as om, symmetricDifference as im, symmetricDifferenceWith as cm, tail as um, take as fm, takeLast as lm, takeLastWhile as dm, takeWhile as hm, tap as mm, test as gm, thunkify as pm, times as ym, toLower as Dm, toPairs as wm, toPairsIn as Mm, toUpper as Om, transduce as bm, transpose as Sm, traverse as km, trim as Im, tryCatch as xm, type as Ym, unapply as $m, unary as Tm, uncurryN as Wm, unfold as Nm, union as vm, unionWith as Fm, uniq as Pm, uniqBy as _m, uniqWith as Cm, unless as Em, unnest as Am, until as Hm, update as Lm, useWith as Rm, values as Um, valuesIn as qm, view as zm, when as Xm, where as jm, whereAny as Zm, whereEq as Bm, without as Qm, xprod as Gm, zip as Vm, zipObj as Jm, zipWith as Km } from "ramda";
import vn from "slug";
import { getDefaultOptions as Fn } from "date-fns";
import { isFuture as tg, isPast as ng } from "date-fns";
const G = 6048e5, Nt = 864e5, vt = 6e4, Ft = 36e5, K = 43200, ze = 1440, Xe = Symbol.for("constructDateFrom");
function p(e, t) {
  return typeof e == "function" ? e(t) : e && typeof e == "object" && Xe in e ? e[Xe](t) : e instanceof Date ? new e.constructor(t) : new Date(t);
}
function l(e, t) {
  return p(t || e, e);
}
function H(e, t, n) {
  const r = l(e, n?.in);
  return isNaN(t) ? p(n?.in || e, NaN) : (t && r.setDate(r.getDate() + t), r);
}
function Te(e, t, n) {
  const r = l(e, n?.in);
  if (isNaN(t)) return p(n?.in || e, NaN);
  if (!t)
    return r;
  const a = r.getDate(), s = p(n?.in || e, r.getTime());
  s.setMonth(r.getMonth() + t + 1, 0);
  const o = s.getDate();
  return a >= o ? s : (r.setFullYear(
    s.getFullYear(),
    s.getMonth(),
    a
  ), r);
}
function u(e, t, n = []) {
  return n.length >= t ? e(...n.slice(0, t).reverse()) : (...r) => u(e, t, n.concat(r));
}
function Pn(e, t) {
  return l(e, t?.in).getDay() === 6;
}
function _n(e, t) {
  return l(e, t?.in).getDay() === 0;
}
function Z(e, t) {
  const n = l(e, t?.in).getDay();
  return n === 0 || n === 6;
}
function Cn(e, t, n) {
  const r = l(e, n?.in), a = Z(r, n);
  if (isNaN(t)) return p(n?.in, NaN);
  const s = r.getHours(), o = t < 0 ? -1 : 1, i = Math.trunc(t / 5);
  r.setDate(r.getDate() + i * 7);
  let c = Math.abs(t % 5);
  for (; c > 0; )
    r.setDate(r.getDate() + o), Z(r, n) || (c -= 1);
  return a && Z(r, n) && t !== 0 && (Pn(r, n) && r.setDate(r.getDate() + (o < 0 ? 2 : -1)), _n(r, n) && r.setDate(r.getDate() + (o < 0 ? 1 : -2))), r.setHours(s), r;
}
const Zi = u(Cn, 2), Bi = u(H, 2);
function We(e, t, n) {
  return p(n?.in || e, +l(e) + t);
}
function En(e, t, n) {
  return We(e, t * Ft, n);
}
const Qi = u(En, 2);
let An = {};
function x() {
  return An;
}
function k(e, t) {
  const n = x(), r = t?.weekStartsOn ?? t?.locale?.options?.weekStartsOn ?? n.weekStartsOn ?? n.locale?.options?.weekStartsOn ?? 0, a = l(e, t?.in), s = a.getDay(), o = (s < r ? 7 : 0) + s - r;
  return a.setDate(a.getDate() - o), a.setHours(0, 0, 0, 0), a;
}
function W(e, t) {
  return k(e, { ...t, weekStartsOn: 1 });
}
function F(e, t) {
  const n = l(e, t?.in), r = n.getFullYear(), a = p(n, 0);
  a.setFullYear(r + 1, 0, 4), a.setHours(0, 0, 0, 0);
  const s = W(a), o = p(n, 0);
  o.setFullYear(r, 0, 4), o.setHours(0, 0, 0, 0);
  const i = W(o);
  return n.getTime() >= s.getTime() ? r + 1 : n.getTime() >= i.getTime() ? r : r - 1;
}
function I(e) {
  const t = l(e), n = new Date(
    Date.UTC(
      t.getFullYear(),
      t.getMonth(),
      t.getDate(),
      t.getHours(),
      t.getMinutes(),
      t.getSeconds(),
      t.getMilliseconds()
    )
  );
  return n.setUTCFullYear(t.getFullYear()), +e - +n;
}
function O(e, ...t) {
  const n = p.bind(
    null,
    e || t.find((r) => typeof r == "object")
  );
  return t.map(n);
}
function B(e, t) {
  const n = l(e, t?.in);
  return n.setHours(0, 0, 0, 0), n;
}
function R(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = B(r), o = B(a), i = +s - I(s), c = +o - I(o);
  return Math.round((i - c) / Nt);
}
function L(e, t) {
  const n = F(e, t), r = p(t?.in || e, 0);
  return r.setFullYear(n, 0, 4), r.setHours(0, 0, 0, 0), W(r);
}
function Pt(e, t, n) {
  let r = l(e, n?.in);
  const a = R(
    r,
    L(r, n)
  ), s = p(n?.in || e, 0);
  return s.setFullYear(t, 0, 4), s.setHours(0, 0, 0, 0), r = L(s), r.setDate(r.getDate() + a), r;
}
function _t(e, t, n) {
  return Pt(e, F(e, n) + t, n);
}
const Gi = u(_t, 2), Vi = u(We, 2);
function Hn(e, t, n) {
  const r = l(e, n?.in);
  return r.setTime(r.getTime() + t * vt), r;
}
const Ji = u(Hn, 2), Ki = u(Te, 2);
function Ct(e, t, n) {
  return Te(e, t * 3, n);
}
const ec = u(Ct, 2);
function Ln(e, t, n) {
  return We(e, t * 1e3, n);
}
const tc = u(Ln, 2);
function Ne(e, t, n) {
  return H(e, t * 7, n);
}
const nc = u(Ne, 2);
function Rn(e, t, n) {
  return Te(e, t * 12, n);
}
const rc = u(Rn, 2);
function T(e, t) {
  const n = +l(e) - +l(t);
  return n < 0 ? -1 : n > 0 ? 1 : n;
}
function Un(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  );
  return +B(r) == +B(a);
}
function qn(e) {
  return e instanceof Date || typeof e == "object" && Object.prototype.toString.call(e) === "[object Date]";
}
function ne(e) {
  return !(!qn(e) && typeof e != "number" || isNaN(+l(e)));
}
function zn(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  );
  if (!ne(r) || !ne(a)) return NaN;
  const s = R(r, a), o = s < 0 ? -1 : 1, i = Math.trunc(s / 7);
  let c = i * 5, f = H(a, i * 7);
  for (; !Un(r, f); )
    c += Z(f, n) ? 0 : o, f = H(f, o);
  return c === 0 ? 0 : c;
}
const ac = u(zn, 2), sc = u(R, 2);
function Et(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  );
  return F(r, n) - F(a, n);
}
const oc = u(Et, 2);
function Xn(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = W(r), o = W(a), i = +s - I(s), c = +o - I(o);
  return Math.round((i - c) / G);
}
const ic = u(Xn, 2);
function At(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = r.getFullYear() - a.getFullYear(), o = r.getMonth() - a.getMonth();
  return s * 12 + o;
}
const cc = u(At, 2);
function we(e, t) {
  const n = l(e, t?.in);
  return Math.trunc(n.getMonth() / 3) + 1;
}
function jn(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = r.getFullYear() - a.getFullYear(), o = we(r) - we(a);
  return s * 4 + o;
}
const uc = u(jn, 2);
function Ht(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = k(r, n), o = k(a, n), i = +s - I(s), c = +o - I(o);
  return Math.round((i - c) / G);
}
const fc = u(Ht, 2);
function Lt(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  );
  return r.getFullYear() - a.getFullYear();
}
const lc = u(Lt, 2);
function Rt(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = je(r, a), o = Math.abs(
    R(r, a)
  );
  r.setDate(r.getDate() - s * o);
  const i = +(je(r, a) === -s), c = s * (o - i);
  return c === 0 ? 0 : c;
}
function je(e, t) {
  const n = e.getFullYear() - t.getFullYear() || e.getMonth() - t.getMonth() || e.getDate() - t.getDate() || e.getHours() - t.getHours() || e.getMinutes() - t.getMinutes() || e.getSeconds() - t.getSeconds() || e.getMilliseconds() - t.getMilliseconds();
  return n < 0 ? -1 : n > 0 ? 1 : n;
}
const dc = u(Rt, 2);
function V(e) {
  return (t) => {
    const r = (e ? Math[e] : Math.trunc)(t);
    return r === 0 ? 0 : r;
  };
}
function Zn(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = (+r - +a) / Ft;
  return V(n?.roundingMethod)(s);
}
const hc = u(Zn, 2);
function Bn(e, t, n) {
  return _t(e, -t, n);
}
function Qn(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = T(r, a), o = Math.abs(
    Et(r, a, n)
  ), i = Bn(r, s * o, n), c = +(T(i, a) === -s), f = s * (o - c);
  return f === 0 ? 0 : f;
}
const mc = u(Qn, 2);
function ve(e, t) {
  return +l(e) - +l(t);
}
const gc = u(ve, 2);
function Gn(e, t, n) {
  const r = ve(e, t) / vt;
  return V(n?.roundingMethod)(r);
}
const pc = u(Gn, 2);
function Ut(e, t) {
  const n = l(e, t?.in);
  return n.setHours(23, 59, 59, 999), n;
}
function Fe(e, t) {
  const n = l(e, t?.in), r = n.getMonth();
  return n.setFullYear(n.getFullYear(), r + 1, 0), n.setHours(23, 59, 59, 999), n;
}
function Vn(e, t) {
  const n = l(e, t?.in);
  return +Ut(n, t) == +Fe(n, t);
}
function Pe(e, t, n) {
  const [r, a, s] = O(
    n?.in,
    e,
    e,
    t
  ), o = T(a, s), i = Math.abs(
    At(a, s)
  );
  if (i < 1) return 0;
  a.getMonth() === 1 && a.getDate() > 27 && a.setDate(30), a.setMonth(a.getMonth() - o * i);
  let c = T(a, s) === -o;
  Vn(r) && i === 1 && T(r, s) === 1 && (c = !1);
  const f = o * (i - +c);
  return f === 0 ? 0 : f;
}
const yc = u(Pe, 2);
function Jn(e, t, n) {
  const r = Pe(e, t, n) / 3;
  return V(n?.roundingMethod)(r);
}
const Dc = u(Jn, 2);
function qt(e, t, n) {
  const r = ve(e, t) / 1e3;
  return V(n?.roundingMethod)(r);
}
const wc = u(qt, 2);
function Kn(e, t, n) {
  const r = Rt(e, t, n) / 7;
  return V(n?.roundingMethod)(r);
}
const Mc = u(Kn, 2);
function er(e, t, n) {
  const [r, a] = O(
    n?.in,
    e,
    t
  ), s = T(r, a), o = Math.abs(Lt(r, a));
  r.setFullYear(1584), a.setFullYear(1584);
  const i = T(r, a) === -s, c = s * (o - +i);
  return c === 0 ? 0 : c;
}
const Oc = u(er, 2);
function P(e, t) {
  const [n, r] = O(e, t.start, t.end);
  return { start: n, end: r };
}
function zt(e, t) {
  const { start: n, end: r } = P(t?.in, e);
  let a = +n > +r;
  const s = a ? +n : +r, o = a ? r : n;
  o.setHours(0, 0, 0, 0);
  let i = t?.step ?? 1;
  if (!i) return [];
  i < 0 && (i = -i, a = !a);
  const c = [];
  for (; +o <= s; )
    c.push(p(n, o)), o.setDate(o.getDate() + i), o.setHours(0, 0, 0, 0);
  return a ? c.reverse() : c;
}
const bc = u(zt, 1);
function tr(e, t) {
  const { start: n, end: r } = P(t?.in, e);
  let a = +n > +r;
  const s = a ? +n : +r, o = a ? r : n;
  o.setMinutes(0, 0, 0);
  let i = t?.step ?? 1;
  if (!i) return [];
  i < 0 && (i = -i, a = !a);
  const c = [];
  for (; +o <= s; )
    c.push(p(n, o)), o.setHours(o.getHours() + i);
  return a ? c.reverse() : c;
}
const Sc = u(tr, 1);
function nr(e, t) {
  const { start: n, end: r } = P(t?.in, e);
  let a = +n > +r;
  const s = a ? +n : +r, o = a ? r : n;
  o.setHours(0, 0, 0, 0), o.setDate(1);
  let i = t?.step ?? 1;
  if (!i) return [];
  i < 0 && (i = -i, a = !a);
  const c = [];
  for (; +o <= s; )
    c.push(p(n, o)), o.setMonth(o.getMonth() + i);
  return a ? c.reverse() : c;
}
const kc = u(nr, 1);
function j(e, t) {
  const n = l(e, t?.in), r = n.getMonth(), a = r - r % 3;
  return n.setMonth(a, 1), n.setHours(0, 0, 0, 0), n;
}
function rr(e, t) {
  const { start: n, end: r } = P(t?.in, e);
  let a = +n > +r;
  const s = a ? +j(n) : +j(r);
  let o = j(a ? r : n), i = t?.step ?? 1;
  if (!i) return [];
  i < 0 && (i = -i, a = !a);
  const c = [];
  for (; +o <= s; )
    c.push(p(n, o)), o = Ct(o, i);
  return a ? c.reverse() : c;
}
const Ic = u(rr, 1);
function ar(e, t) {
  const { start: n, end: r } = P(t?.in, e);
  let a = +n > +r;
  const s = k(a ? r : n, t), o = k(a ? n : r, t);
  s.setHours(15), o.setHours(15);
  const i = +o.getTime();
  let c = s, f = t?.step ?? 1;
  if (!f) return [];
  f < 0 && (f = -f, a = !a);
  const d = [];
  for (; +c <= i; )
    c.setHours(0), d.push(p(n, c)), c = Ne(c, f), c.setHours(15);
  return a ? d.reverse() : d;
}
const xc = u(ar, 1);
function _e(e, t) {
  const { start: n, end: r } = P(t?.in, e), a = zt({ start: n, end: r }, t), s = [];
  let o = 0;
  for (; o < a.length; ) {
    const i = a[o++];
    Z(i) && s.push(p(n, i));
  }
  return s;
}
const Yc = u(_e, 1);
function ue(e, t) {
  const n = l(e, t?.in);
  return n.setDate(1), n.setHours(0, 0, 0, 0), n;
}
function sr(e, t) {
  const n = ue(e, t), r = Fe(e, t);
  return _e({ start: n, end: r }, t);
}
const $c = u(sr, 1);
function Xt(e, t) {
  const n = l(e, t?.in), r = n.getFullYear();
  return n.setFullYear(r + 1, 0, 0), n.setHours(23, 59, 59, 999), n;
}
function Ce(e, t) {
  const n = l(e, t?.in);
  return n.setFullYear(n.getFullYear(), 0, 1), n.setHours(0, 0, 0, 0), n;
}
function or(e, t) {
  const n = Ce(e, t), r = Xt(e, t);
  return _e({ start: n, end: r }, t);
}
const Tc = u(or, 1);
function ir(e, t) {
  const { start: n, end: r } = P(t?.in, e);
  let a = +n > +r;
  const s = a ? +n : +r, o = a ? r : n;
  o.setHours(0, 0, 0, 0), o.setMonth(0, 1);
  let i = t?.step ?? 1;
  if (!i) return [];
  i < 0 && (i = -i, a = !a);
  const c = [];
  for (; +o <= s; )
    c.push(p(n, o)), o.setFullYear(o.getFullYear() + i);
  return a ? c.reverse() : c;
}
const Wc = u(ir, 1), Nc = u(Ut, 1);
function cr(e, t) {
  const n = l(e, t?.in), r = n.getFullYear(), a = 9 + Math.floor(r / 10) * 10;
  return n.setFullYear(a, 11, 31), n.setHours(23, 59, 59, 999), n;
}
const vc = u(cr, 1);
function ur(e, t) {
  const n = l(e, t?.in);
  return n.setMinutes(59, 59, 999), n;
}
const Fc = u(ur, 1);
function jt(e, t) {
  const n = x(), r = t?.weekStartsOn ?? t?.locale?.options?.weekStartsOn ?? n.weekStartsOn ?? n.locale?.options?.weekStartsOn ?? 0, a = l(e, t?.in), s = a.getDay(), o = (s < r ? -7 : 0) + 6 - (s - r);
  return a.setDate(a.getDate() + o), a.setHours(23, 59, 59, 999), a;
}
function fr(e, t) {
  return jt(e, { ...t, weekStartsOn: 1 });
}
const Pc = u(fr, 1);
function lr(e, t) {
  const n = F(e, t), r = p(t?.in || e, 0);
  r.setFullYear(n + 1, 0, 4), r.setHours(0, 0, 0, 0);
  const a = W(r, t);
  return a.setMilliseconds(a.getMilliseconds() - 1), a;
}
const _c = u(lr, 1);
function dr(e, t) {
  const n = l(e, t?.in);
  return n.setSeconds(59, 999), n;
}
const Cc = u(dr, 1), Ec = u(Fe, 1);
function hr(e, t) {
  const n = l(e, t?.in), r = n.getMonth(), a = r - r % 3 + 3;
  return n.setMonth(a, 0), n.setHours(23, 59, 59, 999), n;
}
const Ac = u(hr, 1);
function mr(e, t) {
  const n = l(e, t?.in);
  return n.setMilliseconds(999), n;
}
const Hc = u(mr, 1), Lc = u(jt, 1), Rc = u(Xt, 1), gr = {
  lessThanXSeconds: {
    one: "less than a second",
    other: "less than {{count}} seconds"
  },
  xSeconds: {
    one: "1 second",
    other: "{{count}} seconds"
  },
  halfAMinute: "half a minute",
  lessThanXMinutes: {
    one: "less than a minute",
    other: "less than {{count}} minutes"
  },
  xMinutes: {
    one: "1 minute",
    other: "{{count}} minutes"
  },
  aboutXHours: {
    one: "about 1 hour",
    other: "about {{count}} hours"
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours"
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days"
  },
  aboutXWeeks: {
    one: "about 1 week",
    other: "about {{count}} weeks"
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks"
  },
  aboutXMonths: {
    one: "about 1 month",
    other: "about {{count}} months"
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months"
  },
  aboutXYears: {
    one: "about 1 year",
    other: "about {{count}} years"
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years"
  },
  overXYears: {
    one: "over 1 year",
    other: "over {{count}} years"
  },
  almostXYears: {
    one: "almost 1 year",
    other: "almost {{count}} years"
  }
}, pr = (e, t, n) => {
  let r;
  const a = gr[e];
  return typeof a == "string" ? r = a : t === 1 ? r = a.one : r = a.other.replace("{{count}}", t.toString()), n?.addSuffix ? n.comparison && n.comparison > 0 ? "in " + r : r + " ago" : r;
};
function le(e) {
  return (t = {}) => {
    const n = t.width ? String(t.width) : e.defaultWidth;
    return e.formats[n] || e.formats[e.defaultWidth];
  };
}
const yr = {
  full: "EEEE, MMMM do, y",
  long: "MMMM do, y",
  medium: "MMM d, y",
  short: "MM/dd/yyyy"
}, Dr = {
  full: "h:mm:ss a zzzz",
  long: "h:mm:ss a z",
  medium: "h:mm:ss a",
  short: "h:mm a"
}, wr = {
  full: "{{date}} 'at' {{time}}",
  long: "{{date}} 'at' {{time}}",
  medium: "{{date}}, {{time}}",
  short: "{{date}}, {{time}}"
}, Mr = {
  date: le({
    formats: yr,
    defaultWidth: "full"
  }),
  time: le({
    formats: Dr,
    defaultWidth: "full"
  }),
  dateTime: le({
    formats: wr,
    defaultWidth: "full"
  })
}, Or = {
  lastWeek: "'last' eeee 'at' p",
  yesterday: "'yesterday at' p",
  today: "'today at' p",
  tomorrow: "'tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: "P"
}, br = (e, t, n, r) => Or[e];
function q(e) {
  return (t, n) => {
    const r = n?.context ? String(n.context) : "standalone";
    let a;
    if (r === "formatting" && e.formattingValues) {
      const o = e.defaultFormattingWidth || e.defaultWidth, i = n?.width ? String(n.width) : o;
      a = e.formattingValues[i] || e.formattingValues[o];
    } else {
      const o = e.defaultWidth, i = n?.width ? String(n.width) : e.defaultWidth;
      a = e.values[i] || e.values[o];
    }
    const s = e.argumentCallback ? e.argumentCallback(t) : t;
    return a[s];
  };
}
const Sr = {
  narrow: ["B", "A"],
  abbreviated: ["BC", "AD"],
  wide: ["Before Christ", "Anno Domini"]
}, kr = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["Q1", "Q2", "Q3", "Q4"],
  wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
}, Ir = {
  narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  abbreviated: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ],
  wide: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
}, xr = {
  narrow: ["S", "M", "T", "W", "T", "F", "S"],
  short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  wide: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ]
}, Yr = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  }
}, $r = {
  narrow: {
    am: "a",
    pm: "p",
    midnight: "mi",
    noon: "n",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  abbreviated: {
    am: "AM",
    pm: "PM",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  },
  wide: {
    am: "a.m.",
    pm: "p.m.",
    midnight: "midnight",
    noon: "noon",
    morning: "in the morning",
    afternoon: "in the afternoon",
    evening: "in the evening",
    night: "at night"
  }
}, Tr = (e, t) => {
  const n = Number(e), r = n % 100;
  if (r > 20 || r < 10)
    switch (r % 10) {
      case 1:
        return n + "st";
      case 2:
        return n + "nd";
      case 3:
        return n + "rd";
    }
  return n + "th";
}, Wr = {
  ordinalNumber: Tr,
  era: q({
    values: Sr,
    defaultWidth: "wide"
  }),
  quarter: q({
    values: kr,
    defaultWidth: "wide",
    argumentCallback: (e) => e - 1
  }),
  month: q({
    values: Ir,
    defaultWidth: "wide"
  }),
  day: q({
    values: xr,
    defaultWidth: "wide"
  }),
  dayPeriod: q({
    values: Yr,
    defaultWidth: "wide",
    formattingValues: $r,
    defaultFormattingWidth: "wide"
  })
};
function z(e) {
  return (t, n = {}) => {
    const r = n.width, a = r && e.matchPatterns[r] || e.matchPatterns[e.defaultMatchWidth], s = t.match(a);
    if (!s)
      return null;
    const o = s[0], i = r && e.parsePatterns[r] || e.parsePatterns[e.defaultParseWidth], c = Array.isArray(i) ? vr(i, (h) => h.test(o)) : (
      // [TODO] -- I challenge you to fix the type
      Nr(i, (h) => h.test(o))
    );
    let f;
    f = e.valueCallback ? e.valueCallback(c) : c, f = n.valueCallback ? (
      // [TODO] -- I challenge you to fix the type
      n.valueCallback(f)
    ) : f;
    const d = t.slice(o.length);
    return { value: f, rest: d };
  };
}
function Nr(e, t) {
  for (const n in e)
    if (Object.prototype.hasOwnProperty.call(e, n) && t(e[n]))
      return n;
}
function vr(e, t) {
  for (let n = 0; n < e.length; n++)
    if (t(e[n]))
      return n;
}
function Fr(e) {
  return (t, n = {}) => {
    const r = t.match(e.matchPattern);
    if (!r) return null;
    const a = r[0], s = t.match(e.parsePattern);
    if (!s) return null;
    let o = e.valueCallback ? e.valueCallback(s[0]) : s[0];
    o = n.valueCallback ? n.valueCallback(o) : o;
    const i = t.slice(a.length);
    return { value: o, rest: i };
  };
}
const Pr = /^(\d+)(th|st|nd|rd)?/i, _r = /\d+/i, Cr = {
  narrow: /^(b|a)/i,
  abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
  wide: /^(before christ|before common era|anno domini|common era)/i
}, Er = {
  any: [/^b/i, /^(a|c)/i]
}, Ar = {
  narrow: /^[1234]/i,
  abbreviated: /^q[1234]/i,
  wide: /^[1234](th|st|nd|rd)? quarter/i
}, Hr = {
  any: [/1/i, /2/i, /3/i, /4/i]
}, Lr = {
  narrow: /^[jfmasond]/i,
  abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
  wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
}, Rr = {
  narrow: [
    /^j/i,
    /^f/i,
    /^m/i,
    /^a/i,
    /^m/i,
    /^j/i,
    /^j/i,
    /^a/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ],
  any: [
    /^ja/i,
    /^f/i,
    /^mar/i,
    /^ap/i,
    /^may/i,
    /^jun/i,
    /^jul/i,
    /^au/i,
    /^s/i,
    /^o/i,
    /^n/i,
    /^d/i
  ]
}, Ur = {
  narrow: /^[smtwf]/i,
  short: /^(su|mo|tu|we|th|fr|sa)/i,
  abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
  wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
}, qr = {
  narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
  any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
}, zr = {
  narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
  any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
}, Xr = {
  any: {
    am: /^a/i,
    pm: /^p/i,
    midnight: /^mi/i,
    noon: /^no/i,
    morning: /morning/i,
    afternoon: /afternoon/i,
    evening: /evening/i,
    night: /night/i
  }
}, jr = {
  ordinalNumber: Fr({
    matchPattern: Pr,
    parsePattern: _r,
    valueCallback: (e) => parseInt(e, 10)
  }),
  era: z({
    matchPatterns: Cr,
    defaultMatchWidth: "wide",
    parsePatterns: Er,
    defaultParseWidth: "any"
  }),
  quarter: z({
    matchPatterns: Ar,
    defaultMatchWidth: "wide",
    parsePatterns: Hr,
    defaultParseWidth: "any",
    valueCallback: (e) => e + 1
  }),
  month: z({
    matchPatterns: Lr,
    defaultMatchWidth: "wide",
    parsePatterns: Rr,
    defaultParseWidth: "any"
  }),
  day: z({
    matchPatterns: Ur,
    defaultMatchWidth: "wide",
    parsePatterns: qr,
    defaultParseWidth: "any"
  }),
  dayPeriod: z({
    matchPatterns: zr,
    defaultMatchWidth: "any",
    parsePatterns: Xr,
    defaultParseWidth: "any"
  })
}, Ee = {
  code: "en-US",
  formatDistance: pr,
  formatLong: Mr,
  formatRelative: br,
  localize: Wr,
  match: jr,
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};
function Zt(e, t) {
  const n = l(e, t?.in);
  return R(n, Ce(n)) + 1;
}
function Ae(e, t) {
  const n = l(e, t?.in), r = +W(n) - +L(n);
  return Math.round(r / G) + 1;
}
function He(e, t) {
  const n = l(e, t?.in), r = n.getFullYear(), a = x(), s = t?.firstWeekContainsDate ?? t?.locale?.options?.firstWeekContainsDate ?? a.firstWeekContainsDate ?? a.locale?.options?.firstWeekContainsDate ?? 1, o = p(t?.in || e, 0);
  o.setFullYear(r + 1, 0, s), o.setHours(0, 0, 0, 0);
  const i = k(o, t), c = p(t?.in || e, 0);
  c.setFullYear(r, 0, s), c.setHours(0, 0, 0, 0);
  const f = k(c, t);
  return +n >= +i ? r + 1 : +n >= +f ? r : r - 1;
}
function re(e, t) {
  const n = x(), r = t?.firstWeekContainsDate ?? t?.locale?.options?.firstWeekContainsDate ?? n.firstWeekContainsDate ?? n.locale?.options?.firstWeekContainsDate ?? 1, a = He(e, t), s = p(t?.in || e, 0);
  return s.setFullYear(a, 0, r), s.setHours(0, 0, 0, 0), k(s, t);
}
function Le(e, t) {
  const n = l(e, t?.in), r = +k(n, t) - +re(n, t);
  return Math.round(r / G) + 1;
}
function g(e, t) {
  const n = e < 0 ? "-" : "", r = Math.abs(e).toString().padStart(t, "0");
  return n + r;
}
const $ = {
  // Year
  y(e, t) {
    const n = e.getFullYear(), r = n > 0 ? n : 1 - n;
    return g(t === "yy" ? r % 100 : r, t.length);
  },
  // Month
  M(e, t) {
    const n = e.getMonth();
    return t === "M" ? String(n + 1) : g(n + 1, 2);
  },
  // Day of the month
  d(e, t) {
    return g(e.getDate(), t.length);
  },
  // AM or PM
  a(e, t) {
    const n = e.getHours() / 12 >= 1 ? "pm" : "am";
    switch (t) {
      case "a":
      case "aa":
        return n.toUpperCase();
      case "aaa":
        return n;
      case "aaaaa":
        return n[0];
      case "aaaa":
      default:
        return n === "am" ? "a.m." : "p.m.";
    }
  },
  // Hour [1-12]
  h(e, t) {
    return g(e.getHours() % 12 || 12, t.length);
  },
  // Hour [0-23]
  H(e, t) {
    return g(e.getHours(), t.length);
  },
  // Minute
  m(e, t) {
    return g(e.getMinutes(), t.length);
  },
  // Second
  s(e, t) {
    return g(e.getSeconds(), t.length);
  },
  // Fraction of second
  S(e, t) {
    const n = t.length, r = e.getMilliseconds(), a = Math.trunc(
      r * Math.pow(10, n - 3)
    );
    return g(a, t.length);
  }
}, _ = {
  midnight: "midnight",
  noon: "noon",
  morning: "morning",
  afternoon: "afternoon",
  evening: "evening",
  night: "night"
}, Ze = {
  // Era
  G: function(e, t, n) {
    const r = e.getFullYear() > 0 ? 1 : 0;
    switch (t) {
      // AD, BC
      case "G":
      case "GG":
      case "GGG":
        return n.era(r, { width: "abbreviated" });
      // A, B
      case "GGGGG":
        return n.era(r, { width: "narrow" });
      // Anno Domini, Before Christ
      case "GGGG":
      default:
        return n.era(r, { width: "wide" });
    }
  },
  // Year
  y: function(e, t, n) {
    if (t === "yo") {
      const r = e.getFullYear(), a = r > 0 ? r : 1 - r;
      return n.ordinalNumber(a, { unit: "year" });
    }
    return $.y(e, t);
  },
  // Local week-numbering year
  Y: function(e, t, n, r) {
    const a = He(e, r), s = a > 0 ? a : 1 - a;
    if (t === "YY") {
      const o = s % 100;
      return g(o, 2);
    }
    return t === "Yo" ? n.ordinalNumber(s, { unit: "year" }) : g(s, t.length);
  },
  // ISO week-numbering year
  R: function(e, t) {
    const n = F(e);
    return g(n, t.length);
  },
  // Extended year. This is a single number designating the year of this calendar system.
  // The main difference between `y` and `u` localizers are B.C. years:
  // | Year | `y` | `u` |
  // |------|-----|-----|
  // | AC 1 |   1 |   1 |
  // | BC 1 |   1 |   0 |
  // | BC 2 |   2 |  -1 |
  // Also `yy` always returns the last two digits of a year,
  // while `uu` pads single digit years to 2 characters and returns other years unchanged.
  u: function(e, t) {
    const n = e.getFullYear();
    return g(n, t.length);
  },
  // Quarter
  Q: function(e, t, n) {
    const r = Math.ceil((e.getMonth() + 1) / 3);
    switch (t) {
      // 1, 2, 3, 4
      case "Q":
        return String(r);
      // 01, 02, 03, 04
      case "QQ":
        return g(r, 2);
      // 1st, 2nd, 3rd, 4th
      case "Qo":
        return n.ordinalNumber(r, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "QQQ":
        return n.quarter(r, {
          width: "abbreviated",
          context: "formatting"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "QQQQQ":
        return n.quarter(r, {
          width: "narrow",
          context: "formatting"
        });
      // 1st quarter, 2nd quarter, ...
      case "QQQQ":
      default:
        return n.quarter(r, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone quarter
  q: function(e, t, n) {
    const r = Math.ceil((e.getMonth() + 1) / 3);
    switch (t) {
      // 1, 2, 3, 4
      case "q":
        return String(r);
      // 01, 02, 03, 04
      case "qq":
        return g(r, 2);
      // 1st, 2nd, 3rd, 4th
      case "qo":
        return n.ordinalNumber(r, { unit: "quarter" });
      // Q1, Q2, Q3, Q4
      case "qqq":
        return n.quarter(r, {
          width: "abbreviated",
          context: "standalone"
        });
      // 1, 2, 3, 4 (narrow quarter; could be not numerical)
      case "qqqqq":
        return n.quarter(r, {
          width: "narrow",
          context: "standalone"
        });
      // 1st quarter, 2nd quarter, ...
      case "qqqq":
      default:
        return n.quarter(r, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // Month
  M: function(e, t, n) {
    const r = e.getMonth();
    switch (t) {
      case "M":
      case "MM":
        return $.M(e, t);
      // 1st, 2nd, ..., 12th
      case "Mo":
        return n.ordinalNumber(r + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "MMM":
        return n.month(r, {
          width: "abbreviated",
          context: "formatting"
        });
      // J, F, ..., D
      case "MMMMM":
        return n.month(r, {
          width: "narrow",
          context: "formatting"
        });
      // January, February, ..., December
      case "MMMM":
      default:
        return n.month(r, { width: "wide", context: "formatting" });
    }
  },
  // Stand-alone month
  L: function(e, t, n) {
    const r = e.getMonth();
    switch (t) {
      // 1, 2, ..., 12
      case "L":
        return String(r + 1);
      // 01, 02, ..., 12
      case "LL":
        return g(r + 1, 2);
      // 1st, 2nd, ..., 12th
      case "Lo":
        return n.ordinalNumber(r + 1, { unit: "month" });
      // Jan, Feb, ..., Dec
      case "LLL":
        return n.month(r, {
          width: "abbreviated",
          context: "standalone"
        });
      // J, F, ..., D
      case "LLLLL":
        return n.month(r, {
          width: "narrow",
          context: "standalone"
        });
      // January, February, ..., December
      case "LLLL":
      default:
        return n.month(r, { width: "wide", context: "standalone" });
    }
  },
  // Local week of year
  w: function(e, t, n, r) {
    const a = Le(e, r);
    return t === "wo" ? n.ordinalNumber(a, { unit: "week" }) : g(a, t.length);
  },
  // ISO week of year
  I: function(e, t, n) {
    const r = Ae(e);
    return t === "Io" ? n.ordinalNumber(r, { unit: "week" }) : g(r, t.length);
  },
  // Day of the month
  d: function(e, t, n) {
    return t === "do" ? n.ordinalNumber(e.getDate(), { unit: "date" }) : $.d(e, t);
  },
  // Day of year
  D: function(e, t, n) {
    const r = Zt(e);
    return t === "Do" ? n.ordinalNumber(r, { unit: "dayOfYear" }) : g(r, t.length);
  },
  // Day of week
  E: function(e, t, n) {
    const r = e.getDay();
    switch (t) {
      // Tue
      case "E":
      case "EE":
      case "EEE":
        return n.day(r, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "EEEEE":
        return n.day(r, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "EEEEEE":
        return n.day(r, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "EEEE":
      default:
        return n.day(r, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Local day of week
  e: function(e, t, n, r) {
    const a = e.getDay(), s = (a - r.weekStartsOn + 8) % 7 || 7;
    switch (t) {
      // Numerical value (Nth day of week with current locale or weekStartsOn)
      case "e":
        return String(s);
      // Padded numerical value
      case "ee":
        return g(s, 2);
      // 1st, 2nd, ..., 7th
      case "eo":
        return n.ordinalNumber(s, { unit: "day" });
      case "eee":
        return n.day(a, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "eeeee":
        return n.day(a, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "eeeeee":
        return n.day(a, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "eeee":
      default:
        return n.day(a, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Stand-alone local day of week
  c: function(e, t, n, r) {
    const a = e.getDay(), s = (a - r.weekStartsOn + 8) % 7 || 7;
    switch (t) {
      // Numerical value (same as in `e`)
      case "c":
        return String(s);
      // Padded numerical value
      case "cc":
        return g(s, t.length);
      // 1st, 2nd, ..., 7th
      case "co":
        return n.ordinalNumber(s, { unit: "day" });
      case "ccc":
        return n.day(a, {
          width: "abbreviated",
          context: "standalone"
        });
      // T
      case "ccccc":
        return n.day(a, {
          width: "narrow",
          context: "standalone"
        });
      // Tu
      case "cccccc":
        return n.day(a, {
          width: "short",
          context: "standalone"
        });
      // Tuesday
      case "cccc":
      default:
        return n.day(a, {
          width: "wide",
          context: "standalone"
        });
    }
  },
  // ISO day of week
  i: function(e, t, n) {
    const r = e.getDay(), a = r === 0 ? 7 : r;
    switch (t) {
      // 2
      case "i":
        return String(a);
      // 02
      case "ii":
        return g(a, t.length);
      // 2nd
      case "io":
        return n.ordinalNumber(a, { unit: "day" });
      // Tue
      case "iii":
        return n.day(r, {
          width: "abbreviated",
          context: "formatting"
        });
      // T
      case "iiiii":
        return n.day(r, {
          width: "narrow",
          context: "formatting"
        });
      // Tu
      case "iiiiii":
        return n.day(r, {
          width: "short",
          context: "formatting"
        });
      // Tuesday
      case "iiii":
      default:
        return n.day(r, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM or PM
  a: function(e, t, n) {
    const a = e.getHours() / 12 >= 1 ? "pm" : "am";
    switch (t) {
      case "a":
      case "aa":
        return n.dayPeriod(a, {
          width: "abbreviated",
          context: "formatting"
        });
      case "aaa":
        return n.dayPeriod(a, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "aaaaa":
        return n.dayPeriod(a, {
          width: "narrow",
          context: "formatting"
        });
      case "aaaa":
      default:
        return n.dayPeriod(a, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // AM, PM, midnight, noon
  b: function(e, t, n) {
    const r = e.getHours();
    let a;
    switch (r === 12 ? a = _.noon : r === 0 ? a = _.midnight : a = r / 12 >= 1 ? "pm" : "am", t) {
      case "b":
      case "bb":
        return n.dayPeriod(a, {
          width: "abbreviated",
          context: "formatting"
        });
      case "bbb":
        return n.dayPeriod(a, {
          width: "abbreviated",
          context: "formatting"
        }).toLowerCase();
      case "bbbbb":
        return n.dayPeriod(a, {
          width: "narrow",
          context: "formatting"
        });
      case "bbbb":
      default:
        return n.dayPeriod(a, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // in the morning, in the afternoon, in the evening, at night
  B: function(e, t, n) {
    const r = e.getHours();
    let a;
    switch (r >= 17 ? a = _.evening : r >= 12 ? a = _.afternoon : r >= 4 ? a = _.morning : a = _.night, t) {
      case "B":
      case "BB":
      case "BBB":
        return n.dayPeriod(a, {
          width: "abbreviated",
          context: "formatting"
        });
      case "BBBBB":
        return n.dayPeriod(a, {
          width: "narrow",
          context: "formatting"
        });
      case "BBBB":
      default:
        return n.dayPeriod(a, {
          width: "wide",
          context: "formatting"
        });
    }
  },
  // Hour [1-12]
  h: function(e, t, n) {
    if (t === "ho") {
      let r = e.getHours() % 12;
      return r === 0 && (r = 12), n.ordinalNumber(r, { unit: "hour" });
    }
    return $.h(e, t);
  },
  // Hour [0-23]
  H: function(e, t, n) {
    return t === "Ho" ? n.ordinalNumber(e.getHours(), { unit: "hour" }) : $.H(e, t);
  },
  // Hour [0-11]
  K: function(e, t, n) {
    const r = e.getHours() % 12;
    return t === "Ko" ? n.ordinalNumber(r, { unit: "hour" }) : g(r, t.length);
  },
  // Hour [1-24]
  k: function(e, t, n) {
    let r = e.getHours();
    return r === 0 && (r = 24), t === "ko" ? n.ordinalNumber(r, { unit: "hour" }) : g(r, t.length);
  },
  // Minute
  m: function(e, t, n) {
    return t === "mo" ? n.ordinalNumber(e.getMinutes(), { unit: "minute" }) : $.m(e, t);
  },
  // Second
  s: function(e, t, n) {
    return t === "so" ? n.ordinalNumber(e.getSeconds(), { unit: "second" }) : $.s(e, t);
  },
  // Fraction of second
  S: function(e, t) {
    return $.S(e, t);
  },
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(e, t, n) {
    const r = e.getTimezoneOffset();
    if (r === 0)
      return "Z";
    switch (t) {
      // Hours and optional minutes
      case "X":
        return Qe(r);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return N(r);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimiter
      default:
        return N(r, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(e, t, n) {
    const r = e.getTimezoneOffset();
    switch (t) {
      // Hours and optional minutes
      case "x":
        return Qe(r);
      // Hours, minutes and optional seconds without `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return N(r);
      // Hours, minutes and optional seconds with `:` delimiter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimiter
      default:
        return N(r, ":");
    }
  },
  // Timezone (GMT)
  O: function(e, t, n) {
    const r = e.getTimezoneOffset();
    switch (t) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + Be(r, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + N(r, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(e, t, n) {
    const r = e.getTimezoneOffset();
    switch (t) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return "GMT" + Be(r, ":");
      // Long
      case "zzzz":
      default:
        return "GMT" + N(r, ":");
    }
  },
  // Seconds timestamp
  t: function(e, t, n) {
    const r = Math.trunc(+e / 1e3);
    return g(r, t.length);
  },
  // Milliseconds timestamp
  T: function(e, t, n) {
    return g(+e, t.length);
  }
};
function Be(e, t = "") {
  const n = e > 0 ? "-" : "+", r = Math.abs(e), a = Math.trunc(r / 60), s = r % 60;
  return s === 0 ? n + String(a) : n + String(a) + t + g(s, 2);
}
function Qe(e, t) {
  return e % 60 === 0 ? (e > 0 ? "-" : "+") + g(Math.abs(e) / 60, 2) : N(e, t);
}
function N(e, t = "") {
  const n = e > 0 ? "-" : "+", r = Math.abs(e), a = g(Math.trunc(r / 60), 2), s = g(r % 60, 2);
  return n + a + t + s;
}
const Ge = (e, t) => {
  switch (e) {
    case "P":
      return t.date({ width: "short" });
    case "PP":
      return t.date({ width: "medium" });
    case "PPP":
      return t.date({ width: "long" });
    case "PPPP":
    default:
      return t.date({ width: "full" });
  }
}, Bt = (e, t) => {
  switch (e) {
    case "p":
      return t.time({ width: "short" });
    case "pp":
      return t.time({ width: "medium" });
    case "ppp":
      return t.time({ width: "long" });
    case "pppp":
    default:
      return t.time({ width: "full" });
  }
}, Zr = (e, t) => {
  const n = e.match(/(P+)(p+)?/) || [], r = n[1], a = n[2];
  if (!a)
    return Ge(e, t);
  let s;
  switch (r) {
    case "P":
      s = t.dateTime({ width: "short" });
      break;
    case "PP":
      s = t.dateTime({ width: "medium" });
      break;
    case "PPP":
      s = t.dateTime({ width: "long" });
      break;
    case "PPPP":
    default:
      s = t.dateTime({ width: "full" });
      break;
  }
  return s.replace("{{date}}", Ge(r, t)).replace("{{time}}", Bt(a, t));
}, Br = {
  p: Bt,
  P: Zr
}, Qr = /^D+$/, Gr = /^Y+$/, Vr = ["D", "DD", "YY", "YYYY"];
function Jr(e) {
  return Qr.test(e);
}
function Kr(e) {
  return Gr.test(e);
}
function ea(e, t, n) {
  const r = ta(e, t, n);
  if (console.warn(r), Vr.includes(e)) throw new RangeError(r);
}
function ta(e, t, n) {
  const r = e[0] === "Y" ? "years" : "days of the month";
  return `Use \`${e.toLowerCase()}\` instead of \`${e}\` (in \`${t}\`) for formatting ${r} to the input \`${n}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
}
const na = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g, ra = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g, aa = /^'([^]*?)'?$/, sa = /''/g, oa = /[a-zA-Z]/;
function ia(e, t, n) {
  const r = x(), a = n?.locale ?? r.locale ?? Ee, s = n?.firstWeekContainsDate ?? n?.locale?.options?.firstWeekContainsDate ?? r.firstWeekContainsDate ?? r.locale?.options?.firstWeekContainsDate ?? 1, o = n?.weekStartsOn ?? n?.locale?.options?.weekStartsOn ?? r.weekStartsOn ?? r.locale?.options?.weekStartsOn ?? 0, i = l(e, n?.in);
  if (!ne(i))
    throw new RangeError("Invalid time value");
  let c = t.match(ra).map((d) => {
    const h = d[0];
    if (h === "p" || h === "P") {
      const m = Br[h];
      return m(d, a.formatLong);
    }
    return d;
  }).join("").match(na).map((d) => {
    if (d === "''")
      return { isToken: !1, value: "'" };
    const h = d[0];
    if (h === "'")
      return { isToken: !1, value: ca(d) };
    if (Ze[h])
      return { isToken: !0, value: d };
    if (h.match(oa))
      throw new RangeError(
        "Format string contains an unescaped latin alphabet character `" + h + "`"
      );
    return { isToken: !1, value: d };
  });
  a.localize.preprocessor && (c = a.localize.preprocessor(i, c));
  const f = {
    firstWeekContainsDate: s,
    weekStartsOn: o,
    locale: a
  };
  return c.map((d) => {
    if (!d.isToken) return d.value;
    const h = d.value;
    (!n?.useAdditionalWeekYearTokens && Kr(h) || !n?.useAdditionalDayOfYearTokens && Jr(h)) && ea(h, t, String(e));
    const m = Ze[h[0]];
    return m(i, h, a.localize, f);
  }).join("");
}
function ca(e) {
  const t = e.match(aa);
  return t ? t[1].replace(sa, "'") : e;
}
function ua(e, t, n) {
  const r = x(), a = n?.locale ?? r.locale ?? Ee, s = 2520, o = T(e, t);
  if (isNaN(o)) throw new RangeError("Invalid time value");
  const i = Object.assign({}, n, {
    addSuffix: n?.addSuffix,
    comparison: o
  }), [c, f] = O(
    n?.in,
    ...o > 0 ? [t, e] : [e, t]
  ), d = qt(f, c), h = (I(f) - I(c)) / 1e3, m = Math.round((d - h) / 60);
  let D;
  if (m < 2)
    return n?.includeSeconds ? d < 5 ? a.formatDistance("lessThanXSeconds", 5, i) : d < 10 ? a.formatDistance("lessThanXSeconds", 10, i) : d < 20 ? a.formatDistance("lessThanXSeconds", 20, i) : d < 40 ? a.formatDistance("halfAMinute", 0, i) : d < 60 ? a.formatDistance("lessThanXMinutes", 1, i) : a.formatDistance("xMinutes", 1, i) : m === 0 ? a.formatDistance("lessThanXMinutes", 1, i) : a.formatDistance("xMinutes", m, i);
  if (m < 45)
    return a.formatDistance("xMinutes", m, i);
  if (m < 90)
    return a.formatDistance("aboutXHours", 1, i);
  if (m < ze) {
    const S = Math.round(m / 60);
    return a.formatDistance("aboutXHours", S, i);
  } else {
    if (m < s)
      return a.formatDistance("xDays", 1, i);
    if (m < K) {
      const S = Math.round(m / ze);
      return a.formatDistance("xDays", S, i);
    } else if (m < K * 2)
      return D = Math.round(m / K), a.formatDistance("aboutXMonths", D, i);
  }
  if (D = Pe(f, c), D < 12) {
    const S = Math.round(m / K);
    return a.formatDistance("xMonths", S, i);
  } else {
    const S = D % 12, Y = Math.trunc(D / 12);
    return S < 3 ? a.formatDistance("aboutXYears", Y, i) : S < 9 ? a.formatDistance("overXYears", Y, i) : a.formatDistance("almostXYears", Y + 1, i);
  }
}
const Uc = u(ua, 2), fa = [
  "years",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds"
];
function la(e, t) {
  const n = x(), r = t?.locale ?? n.locale ?? Ee, a = t?.format ?? fa, s = t?.zero ?? !1, o = t?.delimiter ?? " ";
  return r.formatDistance ? a.reduce((c, f) => {
    const d = `x${f.replace(/(^.)/, (m) => m.toUpperCase())}`, h = e[f];
    return h !== void 0 && (s || e[f]) ? c.concat(r.formatDistance(d, h)) : c;
  }, []).join(o) : "";
}
const qc = u(la, 1);
function Qt(e, t) {
  return l(e, t?.in).getDate();
}
const zc = u(Qt, 1);
function Gt(e, t) {
  return l(e, t?.in).getDay();
}
const Xc = u(Gt, 1), jc = u(Zt, 1);
function Vt(e, t) {
  const n = l(e, t?.in), r = n.getFullYear(), a = n.getMonth(), s = p(n, 0);
  return s.setFullYear(r, a + 1, 0), s.setHours(0, 0, 0, 0), s.getDate();
}
const Zc = u(Vt, 1);
function da(e, t) {
  const r = l(e, t?.in).getFullYear();
  return r % 400 === 0 || r % 4 === 0 && r % 100 !== 0;
}
function ha(e, t) {
  const n = l(e, t?.in);
  return Number.isNaN(+n) ? NaN : da(n) ? 366 : 365;
}
const Bc = u(ha, 1);
function ma(e, t) {
  const r = l(e, t?.in).getFullYear();
  return Math.floor(r / 10) * 10;
}
const Qc = u(ma, 1);
function ga(e, t) {
  return l(e, t?.in).getHours();
}
const Gc = u(ga, 1);
function Jt(e, t) {
  const n = l(e, t?.in).getDay();
  return n === 0 ? 7 : n;
}
const Vc = u(Jt, 1), Jc = u(Ae, 1), Kc = u(F, 1);
function pa(e, t) {
  const n = L(e, t), a = +L(Ne(n, 60)) - +n;
  return Math.round(a / G);
}
const eu = u(pa, 1);
function ya(e) {
  return l(e).getMilliseconds();
}
const tu = u(ya, 1);
function Da(e, t) {
  return l(e, t?.in).getMinutes();
}
const nu = u(Da, 1);
function wa(e, t) {
  return l(e, t?.in).getMonth();
}
const ru = u(wa, 1);
function Ma(e, t) {
  const [n, r] = [
    +l(e.start),
    +l(e.end)
  ].sort((h, m) => h - m), [a, s] = [
    +l(t.start),
    +l(t.end)
  ].sort((h, m) => h - m);
  if (!(n < s && a < r)) return 0;
  const i = a < n ? n : a, c = i - I(i), f = s > r ? r : s, d = f - I(f);
  return Math.ceil((d - c) / Nt);
}
const au = u(Ma, 2), su = u(we, 1);
function Oa(e) {
  return l(e).getSeconds();
}
const ou = u(Oa, 1);
function ba(e) {
  return +l(e);
}
const iu = u(ba, 1);
function Sa(e) {
  return Math.trunc(+l(e) / 1e3);
}
const cu = u(Sa, 1), uu = u(Le, 1);
function ka(e, t) {
  const n = x(), r = t?.weekStartsOn ?? t?.locale?.options?.weekStartsOn ?? n.weekStartsOn ?? n.locale?.options?.weekStartsOn ?? 0, a = Qt(l(e, t?.in));
  if (isNaN(a)) return NaN;
  const s = Gt(ue(e, t));
  let o = r - s;
  o <= 0 && (o += 7);
  const i = a - o;
  return Math.ceil(i / 7) + 1;
}
const fu = u(ka, 1), lu = u(He, 1);
function Ia(e, t) {
  const n = l(e, t?.in), r = n.getMonth();
  return n.setFullYear(n.getFullYear(), r + 1, 0), n.setHours(0, 0, 0, 0), l(n, t?.in);
}
function xa(e, t) {
  const n = l(e, t?.in);
  return Ht(
    Ia(n, t),
    ue(n, t),
    t
  ) + 1;
}
const du = u(xa, 1);
function Ya(e, t) {
  return l(e, t?.in).getFullYear();
}
const hu = u(Ya, 1);
function $a(e, t) {
  return +l(e) > +l(t);
}
const mu = u($a, 2);
function Ta(e, t) {
  return +l(e) < +l(t);
}
const gu = u(Ta, 2);
function Wa(e, t, n) {
  const r = l(e, n?.in), a = Le(r, n) - t;
  return r.setDate(r.getDate() - a * 7), l(r, n?.in);
}
function Na(e, t, n) {
  const r = l(e, n?.in), a = Ae(r, n) - t;
  return r.setDate(r.getDate() - a * 7), r;
}
function va(e, t, n) {
  const r = x(), a = n?.weekStartsOn ?? n?.locale?.options?.weekStartsOn ?? r.weekStartsOn ?? r.locale?.options?.weekStartsOn ?? 0, s = l(e, n?.in), o = s.getDay(), c = (t % 7 + 7) % 7, f = 7 - a, d = t < 0 || t > 6 ? t - (o + f) % 7 : (c + f) % 7 - (o + f) % 7;
  return H(s, d, n);
}
function Fa(e, t, n) {
  const r = l(e, n?.in), a = Jt(r, n), s = t - a;
  return H(r, s, n);
}
function Pa(e, t) {
  const n = l(e, t?.in);
  return n.setMinutes(0, 0, 0), n;
}
function _a(e, t) {
  const n = l(e, t?.in);
  return n.setSeconds(0, 0), n;
}
function Ca(e, t) {
  const n = l(e, t?.in);
  return n.setMilliseconds(0), n;
}
const Ea = u(ne, 1);
function Kt(e, t, n) {
  const r = l(e, n?.in), a = r.getFullYear(), s = r.getDate(), o = p(n?.in || e, 0);
  o.setFullYear(a, t, 15), o.setHours(0, 0, 0, 0);
  const i = Vt(o);
  return r.setMonth(t, Math.min(s, i)), r;
}
function Aa(e, t, n) {
  const r = l(e, n?.in);
  return r.setDate(t), r;
}
const pu = u(Aa, 2), yu = u(va, 2);
function Ha(e, t, n) {
  const r = l(e, n?.in);
  return r.setMonth(0), r.setDate(t), r;
}
const Du = u(Ha, 2);
function La(e, t, n) {
  const r = l(e, n?.in);
  return r.setHours(t), r;
}
const wu = u(La, 2), Mu = u(Fa, 2), Ou = u(Na, 2), bu = u(Pt, 2);
function Ra(e, t, n) {
  const r = l(e, n?.in);
  return r.setMilliseconds(t), r;
}
const Su = u(Ra, 2);
function Ua(e, t, n) {
  const r = l(e, n?.in);
  return r.setMinutes(t), r;
}
const ku = u(Ua, 2), Iu = u(Kt, 2);
function qa(e, t, n) {
  const r = l(e, n?.in), a = Math.trunc(r.getMonth() / 3) + 1, s = t - a;
  return Kt(r, r.getMonth() + s * 3);
}
const xu = u(qa, 2);
function za(e, t, n) {
  const r = l(e, n?.in);
  return r.setSeconds(t), r;
}
const Yu = u(za, 2), $u = u(Wa, 2);
function Xa(e, t, n) {
  const r = x(), a = n?.firstWeekContainsDate ?? n?.locale?.options?.firstWeekContainsDate ?? r.firstWeekContainsDate ?? r.locale?.options?.firstWeekContainsDate ?? 1, s = R(
    l(e, n?.in),
    re(e, n),
    n
  ), o = p(n?.in || e, 0);
  o.setFullYear(t, 0, a), o.setHours(0, 0, 0, 0);
  const i = re(o, n);
  return i.setDate(i.getDate() + s), i;
}
const Tu = u(Xa, 2);
function ja(e, t, n) {
  const r = l(e, n?.in);
  return isNaN(+r) ? p(n?.in || e, NaN) : (r.setFullYear(t), r);
}
const Wu = u(ja, 2), Nu = u(B, 1);
function Za(e, t) {
  const n = l(e, t?.in), r = n.getFullYear(), a = Math.floor(r / 10) * 10;
  return n.setFullYear(a, 0, 1), n.setHours(0, 0, 0, 0), n;
}
const vu = u(Za, 1), Fu = u(Pa, 1), Pu = u(W, 1), _u = u(L, 1), Cu = u(_a, 1), Eu = u(ue, 1), Au = u(j, 1), Hu = u(Ca, 1), Lu = u(k, 1), Ru = u(re, 1), Uu = u(Ce, 1);
function Ve(e, t, n) {
  const r = Fn(), a = Ga(e, n.timeZone, n.locale ?? r.locale);
  return "formatToParts" in a ? Ba(a, t) : Qa(a, t);
}
function Ba(e, t) {
  const n = e.formatToParts(t);
  for (let r = n.length - 1; r >= 0; --r)
    if (n[r].type === "timeZoneName")
      return n[r].value;
}
function Qa(e, t) {
  const n = e.format(t).replace(/\u200E/g, ""), r = / [\w-+ ]+$/.exec(n);
  return r ? r[0].substr(1) : "";
}
function Ga(e, t, n) {
  return new Intl.DateTimeFormat(n ? [n.code, "en-US"] : void 0, {
    timeZone: t,
    timeZoneName: e
  });
}
function Va(e, t) {
  const n = ns(t);
  return "formatToParts" in n ? Ka(n, e) : es(n, e);
}
const Ja = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};
function Ka(e, t) {
  try {
    const n = e.formatToParts(t), r = [];
    for (let a = 0; a < n.length; a++) {
      const s = Ja[n[a].type];
      s !== void 0 && (r[s] = parseInt(n[a].value, 10));
    }
    return r;
  } catch (n) {
    if (n instanceof RangeError)
      return [NaN];
    throw n;
  }
}
function es(e, t) {
  const n = e.format(t), r = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(n);
  return [
    parseInt(r[3], 10),
    parseInt(r[1], 10),
    parseInt(r[2], 10),
    parseInt(r[4], 10),
    parseInt(r[5], 10),
    parseInt(r[6], 10)
  ];
}
const de = {}, Je = new Intl.DateTimeFormat("en-US", {
  hourCycle: "h23",
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
}).format(/* @__PURE__ */ new Date("2014-06-25T04:00:00.123Z")), ts = Je === "06/25/2014, 00:00:00" || Je === "‎06‎/‎25‎/‎2014‎ ‎00‎:‎00‎:‎00";
function ns(e) {
  return de[e] || (de[e] = ts ? new Intl.DateTimeFormat("en-US", {
    hourCycle: "h23",
    timeZone: e,
    year: "numeric",
    month: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : new Intl.DateTimeFormat("en-US", {
    hour12: !1,
    timeZone: e,
    year: "numeric",
    month: "numeric",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })), de[e];
}
function Re(e, t, n, r, a, s, o) {
  const i = /* @__PURE__ */ new Date(0);
  return i.setUTCFullYear(e, t, n), i.setUTCHours(r, a, s, o), i;
}
const Ke = 36e5, rs = 6e4, he = {
  timezoneZ: /^(Z)$/,
  timezoneHH: /^([+-]\d{2})$/,
  timezoneHHMM: /^([+-])(\d{2}):?(\d{2})$/
};
function fe(e, t, n) {
  if (!e)
    return 0;
  let r = he.timezoneZ.exec(e);
  if (r)
    return 0;
  let a, s;
  if (r = he.timezoneHH.exec(e), r)
    return a = parseInt(r[1], 10), et(a) ? -(a * Ke) : NaN;
  if (r = he.timezoneHHMM.exec(e), r) {
    a = parseInt(r[2], 10);
    const o = parseInt(r[3], 10);
    return et(a, o) ? (s = Math.abs(a) * Ke + o * rs, r[1] === "+" ? -s : s) : NaN;
  }
  if (os(e)) {
    t = new Date(t || Date.now());
    const o = n ? t : as(t), i = Me(o, e);
    return -(n ? i : ss(t, i, e));
  }
  return NaN;
}
function as(e) {
  return Re(e.getFullYear(), e.getMonth(), e.getDate(), e.getHours(), e.getMinutes(), e.getSeconds(), e.getMilliseconds());
}
function Me(e, t) {
  const n = Va(e, t), r = Re(n[0], n[1] - 1, n[2], n[3] % 24, n[4], n[5], 0).getTime();
  let a = e.getTime();
  const s = a % 1e3;
  return a -= s >= 0 ? s : 1e3 + s, r - a;
}
function ss(e, t, n) {
  let a = e.getTime() - t;
  const s = Me(new Date(a), n);
  if (t === s)
    return t;
  a -= s - t;
  const o = Me(new Date(a), n);
  return s === o ? s : Math.max(s, o);
}
function et(e, t) {
  return -23 <= e && e <= 23 && (t == null || 0 <= t && t <= 59);
}
const tt = {};
function os(e) {
  if (tt[e])
    return !0;
  try {
    return new Intl.DateTimeFormat(void 0, { timeZone: e }), tt[e] = !0, !0;
  } catch {
    return !1;
  }
}
const is = 60 * 1e3, cs = {
  // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
  X: function(e, t, n) {
    const r = me(n.timeZone, e);
    if (r === 0)
      return "Z";
    switch (t) {
      // Hours and optional minutes
      case "X":
        return nt(r);
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XX`
      case "XXXX":
      case "XX":
        return C(r);
      // Hours, minutes and optional seconds with `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `XXX`
      case "XXXXX":
      case "XXX":
      // Hours and minutes with `:` delimeter
      default:
        return C(r, ":");
    }
  },
  // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
  x: function(e, t, n) {
    const r = me(n.timeZone, e);
    switch (t) {
      // Hours and optional minutes
      case "x":
        return nt(r);
      // Hours, minutes and optional seconds without `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xx`
      case "xxxx":
      case "xx":
        return C(r);
      // Hours, minutes and optional seconds with `:` delimeter
      // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
      // so this token always has the same output as `xxx`
      case "xxxxx":
      case "xxx":
      // Hours and minutes with `:` delimeter
      default:
        return C(r, ":");
    }
  },
  // Timezone (GMT)
  O: function(e, t, n) {
    const r = me(n.timeZone, e);
    switch (t) {
      // Short
      case "O":
      case "OO":
      case "OOO":
        return "GMT" + us(r, ":");
      // Long
      case "OOOO":
      default:
        return "GMT" + C(r, ":");
    }
  },
  // Timezone (specific non-location)
  z: function(e, t, n) {
    switch (t) {
      // Short
      case "z":
      case "zz":
      case "zzz":
        return Ve("short", e, n);
      // Long
      case "zzzz":
      default:
        return Ve("long", e, n);
    }
  }
};
function me(e, t) {
  const n = e ? fe(e, t, !0) / is : t?.getTimezoneOffset() ?? 0;
  if (Number.isNaN(n))
    throw new RangeError("Invalid time zone specified: " + e);
  return n;
}
function ae(e, t) {
  const n = e < 0 ? "-" : "";
  let r = Math.abs(e).toString();
  for (; r.length < t; )
    r = "0" + r;
  return n + r;
}
function C(e, t = "") {
  const n = e > 0 ? "-" : "+", r = Math.abs(e), a = ae(Math.floor(r / 60), 2), s = ae(Math.floor(r % 60), 2);
  return n + a + t + s;
}
function nt(e, t) {
  return e % 60 === 0 ? (e > 0 ? "-" : "+") + ae(Math.abs(e) / 60, 2) : C(e, t);
}
function us(e, t = "") {
  const n = e > 0 ? "-" : "+", r = Math.abs(e), a = Math.floor(r / 60), s = r % 60;
  return s === 0 ? n + String(a) : n + String(a) + t + ae(s, 2);
}
function rt(e) {
  const t = new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate(), e.getHours(), e.getMinutes(), e.getSeconds(), e.getMilliseconds()));
  return t.setUTCFullYear(e.getFullYear()), +e - +t;
}
const en = /(Z|[+-]\d{2}(?::?\d{2})?| UTC| [a-zA-Z]+\/[a-zA-Z_]+(?:\/[a-zA-Z_]+)?)$/, ge = 36e5, at = 6e4, fs = 2, b = {
  dateTimePattern: /^([0-9W+-]+)(T| )(.*)/,
  datePattern: /^([0-9W+-]+)(.*)/,
  // year tokens
  YY: /^(\d{2})$/,
  YYY: [
    /^([+-]\d{2})$/,
    // 0 additional digits
    /^([+-]\d{3})$/,
    // 1 additional digit
    /^([+-]\d{4})$/
    // 2 additional digits
  ],
  YYYY: /^(\d{4})/,
  YYYYY: [
    /^([+-]\d{4})/,
    // 0 additional digits
    /^([+-]\d{5})/,
    // 1 additional digit
    /^([+-]\d{6})/
    // 2 additional digits
  ],
  // date tokens
  MM: /^-(\d{2})$/,
  DDD: /^-?(\d{3})$/,
  MMDD: /^-?(\d{2})-?(\d{2})$/,
  Www: /^-?W(\d{2})$/,
  WwwD: /^-?W(\d{2})-?(\d{1})$/,
  HH: /^(\d{2}([.,]\d*)?)$/,
  HHMM: /^(\d{2}):?(\d{2}([.,]\d*)?)$/,
  HHMMSS: /^(\d{2}):?(\d{2}):?(\d{2}([.,]\d*)?)$/,
  // time zone tokens (to identify the presence of a tz)
  timeZone: en
};
function Q(e, t = {}) {
  if (arguments.length < 1)
    throw new TypeError("1 argument required, but only " + arguments.length + " present");
  if (e === null)
    return /* @__PURE__ */ new Date(NaN);
  const n = t.additionalDigits == null ? fs : Number(t.additionalDigits);
  if (n !== 2 && n !== 1 && n !== 0)
    throw new RangeError("additionalDigits must be 0, 1 or 2");
  if (e instanceof Date || typeof e == "object" && Object.prototype.toString.call(e) === "[object Date]")
    return new Date(e.getTime());
  if (typeof e == "number" || Object.prototype.toString.call(e) === "[object Number]")
    return new Date(e);
  if (Object.prototype.toString.call(e) !== "[object String]")
    return /* @__PURE__ */ new Date(NaN);
  const r = ls(e), { year: a, restDateString: s } = ds(r.date, n), o = hs(s, a);
  if (o === null || isNaN(o.getTime()))
    return /* @__PURE__ */ new Date(NaN);
  if (o) {
    const i = o.getTime();
    let c = 0, f;
    if (r.time && (c = ms(r.time), c === null || isNaN(c)))
      return /* @__PURE__ */ new Date(NaN);
    if (r.timeZone || t.timeZone) {
      if (f = fe(r.timeZone || t.timeZone, new Date(i + c)), isNaN(f))
        return /* @__PURE__ */ new Date(NaN);
    } else
      f = rt(new Date(i + c)), f = rt(new Date(i + c + f));
    return new Date(i + c + f);
  } else
    return /* @__PURE__ */ new Date(NaN);
}
function ls(e) {
  const t = {};
  let n = b.dateTimePattern.exec(e), r;
  if (n ? (t.date = n[1], r = n[3]) : (n = b.datePattern.exec(e), n ? (t.date = n[1], r = n[2]) : (t.date = null, r = e)), r) {
    const a = b.timeZone.exec(r);
    a ? (t.time = r.replace(a[1], ""), t.timeZone = a[1].trim()) : t.time = r;
  }
  return t;
}
function ds(e, t) {
  if (e) {
    const n = b.YYY[t], r = b.YYYYY[t];
    let a = b.YYYY.exec(e) || r.exec(e);
    if (a) {
      const s = a[1];
      return {
        year: parseInt(s, 10),
        restDateString: e.slice(s.length)
      };
    }
    if (a = b.YY.exec(e) || n.exec(e), a) {
      const s = a[1];
      return {
        year: parseInt(s, 10) * 100,
        restDateString: e.slice(s.length)
      };
    }
  }
  return {
    year: null
  };
}
function hs(e, t) {
  if (t === null)
    return null;
  let n, r, a;
  if (!e || !e.length)
    return n = /* @__PURE__ */ new Date(0), n.setUTCFullYear(t), n;
  let s = b.MM.exec(e);
  if (s)
    return n = /* @__PURE__ */ new Date(0), r = parseInt(s[1], 10) - 1, ot(t, r) ? (n.setUTCFullYear(t, r), n) : /* @__PURE__ */ new Date(NaN);
  if (s = b.DDD.exec(e), s) {
    n = /* @__PURE__ */ new Date(0);
    const o = parseInt(s[1], 10);
    return ys(t, o) ? (n.setUTCFullYear(t, 0, o), n) : /* @__PURE__ */ new Date(NaN);
  }
  if (s = b.MMDD.exec(e), s) {
    n = /* @__PURE__ */ new Date(0), r = parseInt(s[1], 10) - 1;
    const o = parseInt(s[2], 10);
    return ot(t, r, o) ? (n.setUTCFullYear(t, r, o), n) : /* @__PURE__ */ new Date(NaN);
  }
  if (s = b.Www.exec(e), s)
    return a = parseInt(s[1], 10) - 1, it(a) ? st(t, a) : /* @__PURE__ */ new Date(NaN);
  if (s = b.WwwD.exec(e), s) {
    a = parseInt(s[1], 10) - 1;
    const o = parseInt(s[2], 10) - 1;
    return it(a, o) ? st(t, a, o) : /* @__PURE__ */ new Date(NaN);
  }
  return null;
}
function ms(e) {
  let t, n, r = b.HH.exec(e);
  if (r)
    return t = parseFloat(r[1].replace(",", ".")), pe(t) ? t % 24 * ge : NaN;
  if (r = b.HHMM.exec(e), r)
    return t = parseInt(r[1], 10), n = parseFloat(r[2].replace(",", ".")), pe(t, n) ? t % 24 * ge + n * at : NaN;
  if (r = b.HHMMSS.exec(e), r) {
    t = parseInt(r[1], 10), n = parseInt(r[2], 10);
    const a = parseFloat(r[3].replace(",", "."));
    return pe(t, n, a) ? t % 24 * ge + n * at + a * 1e3 : NaN;
  }
  return null;
}
function st(e, t, n) {
  t = t || 0, n = n || 0;
  const r = /* @__PURE__ */ new Date(0);
  r.setUTCFullYear(e, 0, 4);
  const a = r.getUTCDay() || 7, s = t * 7 + n + 1 - a;
  return r.setUTCDate(r.getUTCDate() + s), r;
}
const gs = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], ps = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function tn(e) {
  return e % 400 === 0 || e % 4 === 0 && e % 100 !== 0;
}
function ot(e, t, n) {
  if (t < 0 || t > 11)
    return !1;
  if (n != null) {
    if (n < 1)
      return !1;
    const r = tn(e);
    if (r && n > ps[t] || !r && n > gs[t])
      return !1;
  }
  return !0;
}
function ys(e, t) {
  if (t < 1)
    return !1;
  const n = tn(e);
  return !(n && t > 366 || !n && t > 365);
}
function it(e, t) {
  return !(e < 0 || e > 52 || t != null && (t < 0 || t > 6));
}
function pe(e, t, n) {
  return !(e < 0 || e >= 25 || t != null && (t < 0 || t >= 60) || n != null && (n < 0 || n >= 60));
}
const Ds = /([xXOz]+)|''|'(''|[^'])+('|$)/g;
function ws(e, t, n = {}) {
  t = String(t);
  const r = t.match(Ds);
  if (r) {
    const a = Q(n.originalDate || e, n);
    t = r.reduce(function(s, o) {
      if (o[0] === "'")
        return s;
      const i = s.indexOf(o), c = s[i - 1] === "'", f = s.replace(o, "'" + cs[o[0]](a, o, n) + "'");
      return c ? f.substring(0, i - 1) + f.substring(i + 1) : f;
    }, t);
  }
  return ia(e, t, n);
}
function J(e, t, n = []) {
  return n.length >= t ? e(...n.slice(0, t).reverse()) : function(...r) {
    return J(e, t, n.concat(r));
  };
}
const qu = J(ws, 2);
function Ms(e, t, n) {
  e = Q(e, n);
  const r = fe(t, e, !0), a = new Date(e.getTime() - r), s = /* @__PURE__ */ new Date(0);
  return s.setFullYear(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()), s.setHours(a.getUTCHours(), a.getUTCMinutes(), a.getUTCSeconds(), a.getUTCMilliseconds()), s;
}
function Os(e, t, n) {
  if (typeof e == "string" && !e.match(en))
    return Q(e, { ...n, timeZone: t });
  e = Q(e, n);
  const r = Re(e.getFullYear(), e.getMonth(), e.getDate(), e.getHours(), e.getMinutes(), e.getSeconds(), e.getMilliseconds()).getTime(), a = fe(t, new Date(r));
  return new Date(r + a);
}
const zu = J(Os, 2), Xu = J(Q, 1), ju = J(Ms, 2), bs = M(ArrayBuffer), Ss = M(Map), ks = M(Set), Is = M(Int8Array), xs = M(Int16Array), Ys = M(Int32Array), $s = M(Float32Array), Ts = M(Float64Array), Ws = M(Uint8Array), Ns = M(Uint16Array), vs = M(Uint32Array), Fs = M(WeakMap), Ps = M(WeakSet), _s = (e) => {
  let t = on(e);
  return t === void 0 && (t = Ss(e) ? /* @__PURE__ */ new Map() : ks(e) ? /* @__PURE__ */ new Set() : Fs(e) ? /* @__PURE__ */ new WeakMap() : Ps(e) ? /* @__PURE__ */ new WeakSet() : bs(e) ? new ArrayBuffer(0) : Is(e) ? new Int8Array(0) : xs(e) ? new Int16Array(0) : Ys(e) ? new Int32Array(0) : $s(e) ? new Float32Array(0) : Ts(e) ? new Float64Array(0) : Ws(e) ? new Uint8Array(0) : Ns(e) ? new Uint16Array(0) : vs(e) ? new Uint32Array(0) : void 0), t;
}, Zu = (e) => {
  const t = {};
  let n = 0;
  for (; n < e.length; ) {
    const [r, a] = e[n];
    t.hasOwnProperty(r) ? Array.isArray(t[r]) ? t[r].push(a) : t[r] = [t[r], a] : t[r] = a, n += 1;
  }
  return t;
}, { abs: Cs, max: Es } = Math, As = Ot(3, (e, t, n) => {
  n === void 0 && (n = t), e === 0 && (e = 0), t === 0 && (t = 0), n === 0 && (n = 0), e = Es(Cs(e), 1);
  const r = t > n, a = [];
  for (; r ? t > n : t < n; )
    a.push(t), t = r ? t - e : t + e;
  return a;
}), Bu = As(1), { isFinite: Hs, isNaN: Ls } = Number, Rs = be(Ls), Us = M(Number), se = bt([Us, Rs, Hs]), Ue = M(String), qs = ke(Ue, w(St, be(kt))), ct = Se([
  [se, v],
  [qs, (e) => se(+e)],
  [v, E]
]), zs = un((e, t) => e < t), Xs = cn(zs), { abs: ee, max: js, min: Zs, pow: Bs } = Math, Qs = {
  relaxZeros: !0
}, Gs = /^-?(0+)\d/, Vs = (e, t) => {
  const n = ye(e, t, "-", !1) || [], r = ye(t, e, "", !1) || [], a = ye(e, t, "-?", !0) || [];
  return n.concat(a).concat(r).join("|");
}, ut = (e, t, n) => e.some((r) => r[t] === n), ft = (e, t) => Number(String(e).slice(0, -t) + "9".repeat(t)), lt = (e, t) => e - e % Bs(10, t), ye = (e, t, n, r) => {
  const a = [];
  for (const s of e) {
    const { value: o } = s;
    !r && !ut(t, "value", o) && a.push(`${n}${o}`), r && ut(t, "value", o) && a.push(`${n}${o}`);
  }
  return a;
}, dt = Ie(Gs), Js = (e, t, n) => {
  if (!t.isPadded)
    return String(e);
  const r = ee(t?.maxLen - String(e).length), a = n.relaxZeros !== !1;
  switch (r) {
    case 0:
      return "";
    case 1:
      return a ? "0?" : "0";
    case 2:
      return a ? "0{0,2}" : "00";
    default:
      return a ? `0{0,${r}}` : `0{${r}}`;
  }
}, Ks = (e, t, n) => {
  if (e === t)
    return { pattern: e, count: [], digits: 0 };
  const r = fn(e, t), a = r.length;
  let s = "", o = 0;
  for (let i = 0; i < a; i++) {
    let [c, f] = r[i];
    c === f ? s += c : c !== "0" || f !== "9" ? s += to(Number(c), Number(f)) : o++;
  }
  return o && (s += n.shorthand === !0 ? "\\d" : "[0-9]"), { pattern: s, count: [o], digits: a };
}, ht = (e, t, n, r) => {
  const a = eo(e, t), s = [];
  let o = e, i;
  for (let c = 0; c < a.length; c++) {
    const f = a[c], d = Ks(String(o), String(f), r);
    let h = "";
    if (!n.isPadded && i && i.pattern === d.pattern) {
      i.count.length > 1 && i.count.pop(), i.count.push(d.count[0]), i.value = `${i.pattern}${gt(i.count)}`, o = f + 1;
      continue;
    }
    n.isPadded && (h = Js(f, n, r)), d.value = `${h}${d.pattern}${gt(d.count)}`, s.push(d), o = f + 1, i = d;
  }
  return s;
}, eo = (e, t) => {
  let n = 1, r = 1, a = ft(e, n), s = /* @__PURE__ */ new Set([t]);
  for (; e <= a && a <= t; )
    s.add(a), n += 1, a = ft(e, n);
  for (a = lt(t + 1, r) - 1; e < a && a <= t; )
    s.add(a), r += 1, a = lt(t + 1, r) - 1;
  return Xs([...s]);
}, to = (e, t) => `[${e}${t - e === 1 ? "" : "-"}${t}]`, mt = (e) => se(e) ? e : Number(e), gt = (e) => {
  const [t = 0, n = ""] = e;
  return n || t > 1 ? `{${t + (n ? "," + n : "")}}` : "";
}, A = (e, t = void 0, n = Qs) => {
  if (ct(e) === !1)
    throw new TypeError("regExpRange: expected the first argument to be a number");
  if (t === void 0 || e === t)
    return String(e);
  if (ct(t) === !1)
    throw new TypeError("regExpRange: expected the second argument to be a number.");
  typeof n.strictZeros == "boolean" && (n.relaxZeros = n.strictZeros === !1);
  const { capture: r, relaxZeros: a, shorthand: s, wrap: o } = n, i = `${e}:${t}=${a}${s}${r}${o}`;
  if (A?.cache.has(i))
    return A?.cache?.get(i)?.result;
  let c = mt(e), f = mt(t), d = Zs(c, f), h = js(c, f);
  if (ee(d - h) === 1) {
    let U = `${e}|${t}`;
    return r ? `(${U})` : o === !1 ? U : `(?:${U})`;
  }
  const m = dt(String(e)) || dt(String(t)), D = { min: e, max: t, a: d, b: h };
  let S = [], Y = [];
  if (m && (D.isPadded = m, D.maxLen = String(D.max).length), d < 0) {
    const U = h < 0 ? ee(h) : 1;
    Y = ht(U, ee(d), D, n), d = D.a = 0;
  }
  return h >= 0 && (S = ht(d, h, D, n)), D.negatives = Y, D.positives = S, D.result = Vs(Y, S), r === !0 ? D.result = `(${D.result})` : o !== !1 && S.length + Y.length > 1 && (D.result = `(?:${D.result})`), A.cache.set(i, D), D.result;
};
A.cache = /* @__PURE__ */ new Map();
A.clearCache = () => A.cache.clear();
function no(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var te = { exports: {} }, ro = te.exports, pt;
function ao() {
  return pt || (pt = 1, function(e) {
    (function(t, n, r) {
      function a(c) {
        var f = this, d = i();
        f.next = function() {
          var h = 2091639 * f.s0 + f.c * 23283064365386963e-26;
          return f.s0 = f.s1, f.s1 = f.s2, f.s2 = h - (f.c = h | 0);
        }, f.c = 1, f.s0 = d(" "), f.s1 = d(" "), f.s2 = d(" "), f.s0 -= d(c), f.s0 < 0 && (f.s0 += 1), f.s1 -= d(c), f.s1 < 0 && (f.s1 += 1), f.s2 -= d(c), f.s2 < 0 && (f.s2 += 1), d = null;
      }
      function s(c, f) {
        return f.c = c.c, f.s0 = c.s0, f.s1 = c.s1, f.s2 = c.s2, f;
      }
      function o(c, f) {
        var d = new a(c), h = f && f.state, m = d.next;
        return m.int32 = function() {
          return d.next() * 4294967296 | 0;
        }, m.double = function() {
          return m() + (m() * 2097152 | 0) * 11102230246251565e-32;
        }, m.quick = m, h && (typeof h == "object" && s(h, d), m.state = function() {
          return s(d, {});
        }), m;
      }
      function i() {
        var c = 4022871197, f = function(d) {
          d = String(d);
          for (var h = 0; h < d.length; h++) {
            c += d.charCodeAt(h);
            var m = 0.02519603282416938 * c;
            c = m >>> 0, m -= c, m *= c, c = m >>> 0, m -= c, c += m * 4294967296;
          }
          return (c >>> 0) * 23283064365386963e-26;
        };
        return f;
      }
      n && n.exports ? n.exports = o : this.alea = o;
    })(
      ro,
      e
    );
  }(te)), te.exports;
}
var so = ao();
const oo = /* @__PURE__ */ no(so);
function io() {
  try {
    const e = new Uint8Array(256);
    return crypto.getRandomValues(e), String.fromCharCode.apply(0, e);
  } catch {
    return String(Date.now);
  }
}
const co = oo(io(), { entropy: !0 }).double, uo = (e = Number.MIN_SAFE_INTEGER, t = Number.MAX_SAFE_INTEGER) => e + (t - e) * co(), qe = (e, t) => (e = typeof e != "number" ? Number.MIN_SAFE_INTEGER : ~~e, t = typeof t != "number" ? Number.MAX_SAFE_INTEGER : ~~t, Math.round(uo(e - 0.5, t + 0.499999999999))), fo = (e) => Array.prototype.splice.call(e, qe(0, e.length - 1), 1)[0], lo = oe((e, t) => {
  const n = t.length, r = [];
  for (e = Math.max(Math.min(e, n), 1); e--; )
    r.push(fo(t));
  return r;
});
function Qu(e) {
  const t = e.length, n = [];
  let r = -1, a;
  for (; ++r < t; )
    a = qe(0, r), n[r] = n[a], n[a] = e[r];
  return n;
}
const Gu = oe(
  (e, t) => It(e, ln("", t))
), Vu = (e) => {
  let t = kt(e);
  return e != null && t === !1 && (t = w(_s, xt(e))(e)), t;
}, nn = "0123456789abcdef".split(""), ho = nn.length - 1, X = (e = 6) => {
  e <= 0 && (e = 6);
  let t = "";
  for (; e--; )
    t += nn[qe(0, ho)];
  return t;
}, Ju = () => `${X(8)}-${X(4)}-4${X(3)}-${lo(1, [8, 9, "a", "b"]) + X(3)}-${X(12)}`, mo = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x2F;": "/",
  "&#x60;": "`",
  "&#x3D;": "="
}, go = /&#0+/g, po = /&#?0*(amp|lt|gt|quot|39|x2F|x60|x3D);/g, yo = (e) => mo[e], Ku = (e) => e.replace(go, "&#").replace(po, yo), rn = "%[a-f0-9]{2}", Do = new RegExp(rn, "gi"), yt = new RegExp(`(${rn})+`, "gi"), wo = /\+/g, Mo = hn(mn(gn, [])), an = It(""), Dt = dn(Do), Oo = y(wo, " ");
function bo(e) {
  try {
    return decodeURIComponent(e);
  } catch {
    let n = Dt(e), r = 1;
    for (; r < n.length; r++)
      e = an(Oe(n, r)), n = Dt(e);
    return e;
  }
}
function Oe(e, t = 1) {
  try {
    return [decodeURIComponent(an(e))];
  } catch {
  }
  if (e.length === 1)
    return e;
  const n = e.slice(0, t), r = e.slice(t);
  return Mo([], Oe(n), Oe(r));
}
function So(e) {
  const t = {
    "%FE%FF": "��",
    "%FF%FE": "��"
  };
  let n = yt.exec(e);
  for (; n; ) {
    try {
      t[n[0]] = decodeURIComponent(n[0]);
    } catch {
      const c = bo(n[0]);
      c !== n[0] && (t[n[0]] = c);
    }
    n = yt.exec(e);
  }
  t["%C2"] = "�";
  const r = Object.keys(t), a = r.length;
  let s = 0, o;
  for (; s < a; s++)
    o = r[s], e = e.replace(new RegExp(o, "g"), t[o]);
  return e;
}
function ef(e) {
  try {
    return decodeURIComponent(Oo(e));
  } catch {
    return So(e);
  }
}
const ko = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
}, Io = /[&<>"'`=\/]/g, xo = (e) => ko[e], tf = (e) => e.replace(Io, xo), Yo = /[!'()*]/g, $o = (e) => `%${e.charCodeAt(0).toString(16).toUpperCase()}`, nf = (e) => encodeURIComponent(e).replace(Yo, $o), To = /\{\{([^\}]+)\}\}/g, wt = pn(""), Wo = Yt("."), rf = (e, t, n = To) => {
  const r = (a, s) => wt(yn(Wo(s), t));
  return w(wt, (a) => a.replace(n, r))(e);
}, No = /[^\x20-\x7E]/g, af = y(No, ""), vo = /[^\x20\x2D0-9A-Z\x5Fa-z\xC0-\xD6\xD8-\xF6\xF8-\xFF]/g, sn = y(vo, ""), Fo = /[\xC0-\xFF\u0152\u0153\u0160\u0161\u0178\u0192\uA732\uA733]/g, Po = /[\u0300-\u036f]/g, _o = /[\uA732]/g, Co = /[\xC6]/g, Eo = /[\xDF]/g, Ao = /[\xD0]/g, Ho = /[\xD8]/g, Lo = /[\u0152]/g, Ro = /[\xDE]/g, Uo = /[\uA733]/g, qo = /[\xE6]/g, zo = /[\xF0]/g, Xo = /[\u0192]/g, jo = /[\xF8]/g, Zo = /[\u0153]/g, Bo = /[\xFE]/g, Qo = (e) => e.normalize("NFD"), Go = y(Po, ""), Vo = w(y(_o, "AA"), y(Uo, "aa")), Jo = w(y(Co, "AE"), y(qo, "ae")), Ko = y(Eo, "B"), ei = y(Xo, "f"), ti = w(y(Ao, "D"), y(zo, "d")), ni = w(y(Ho, "O"), y(jo, "o")), ri = w(y(Lo, "OE"), y(Zo, "oe")), ai = w(y(Ro, "P"), y(Bo, "p")), si = Dn(
  Ie(Fo),
  w(
    Qo,
    Go,
    Vo,
    Jo,
    Ko,
    ti,
    ei,
    ni,
    ri,
    ai
  )
), sf = oe(
  (e, t) => w(
    sn,
    (n) => vn(n, { remove: null, replacement: e, lower: !1 }),
    ie
  )(t)
), oi = /[\-_]/g, ii = /\s[a-z]/g, ci = /\s+/g, ui = /^[A-Z]/g, fi = y(ci, ""), li = y(oi, " "), di = w(
  si,
  sn,
  li,
  // Convert first character of each word to uppercase
  (e) => e.replace(ii, ce),
  fi,
  // Convert first character to lowercase
  (e) => e.replace(ui, ie)
), hi = /^[a-z]/, of = w(
  di,
  (e) => e.replace(hi, ce)
), mi = /^\w|\s\w/g, cf = w(ie, (e) => e.replace(mi, ce)), gi = /[gimsuy]+/g, pi = /^\//, yi = /\/([gimsuy]*)$/, Di = /.+\/([gimsuy]*)$/, De = /* @__PURE__ */ new Map(), wi = Ie(gi), Mi = y(pi, ""), Oi = y(yi, ""), bi = y(Di, "$1"), Si = w(Mi, Oi), uf = (e) => {
  let t;
  if (De.has(e))
    t = De.get(e);
  else {
    const n = bi(e), r = Si(e);
    t = wi(n) ? new RegExp(r, n) : new RegExp(r), De.set(e, t);
  }
  return t;
}, ki = /(^\w)|\.\s+(\w)/gm, ff = w(ie, (e) => e.replace(ki, ce)), Ii = Mn(""), lf = Se([
  [xe, Ii],
  [Ue, wn],
  [v, $t]
]), df = Ot(2, (e, t) => {
  t = St(t);
  const n = t.length;
  if (n && t.indexOf(e) !== -1) {
    const r = n - 1, a = t[r] === e, s = a && t[n - 2] === e;
    return Yt(e, a && !s ? On(0, r, t) : t);
  }
  return [t];
}), xi = M(Function), Yi = Sn(Reflect.construct, [String, []]), $i = w(Yi, v), hf = (e) => ke(xi, bn($i, E))(e), Ti = M(Date), Wi = Ye(Ti, se), mf = kn(Wi, Ea, E), Ni = be(xe), vi = xt(null), Fi = ([e, t]) => t === !0 ? $e(e) : Tt(Ye(M(t), vi), e), Pi = w(In, xn(Fi), Yn(Ni)), _i = w(Pi, bt), Ci = (e, t) => _i(e)(t), Ei = oe(Ci), Ai = Wt("nodeType", 1), Hi = Wt("length", 0), Mt = Tt($n(Tn, 0), "length"), Li = w(Wn, Nn, $t), Ri = $e("0"), Ui = (e) => $e(Li(e), e), qi = (e) => typeof e != "object", gf = Se([
  [xe, E],
  [Ye(Array.isArray, Ue), v],
  [qi, E],
  [Ai, Mt],
  [Hi, v],
  [Mt, ke(Ri, Ui)],
  [v, E]
]), pf = Ei({ then: Function });
export {
  wf as F,
  Mf as T,
  Of as __,
  bf as add,
  Zi as addBusinessDays,
  Bi as addDays,
  Qi as addHours,
  Gi as addISOWeekYears,
  Sf as addIndex,
  kf as addIndexRight,
  Vi as addMilliseconds,
  Ji as addMinutes,
  Ki as addMonths,
  ec as addQuarters,
  tc as addSeconds,
  nc as addWeeks,
  rc as addYears,
  If as adjust,
  xf as all,
  Yf as allPass,
  $f as always,
  Tf as and,
  Wf as andThen,
  Nf as any,
  vf as anyPass,
  Ff as ap,
  Pf as aperture,
  _f as append,
  Cf as apply,
  Ef as applySpec,
  Af as applyTo,
  Hf as ascend,
  Lf as ascendNatural,
  Rf as assoc,
  Uf as assocPath,
  qf as binary,
  zf as bind,
  Xf as both,
  jf as call,
  Zf as chain,
  Bf as clamp,
  Qf as clone,
  Gf as collectBy,
  Vf as comparator,
  Jf as complement,
  Kf as compose,
  el as composeWith,
  tl as concat,
  nl as cond,
  rl as construct,
  al as constructN,
  sl as converge,
  ol as count,
  il as countBy,
  cl as curry,
  ul as curryN,
  fl as dec,
  Ku as decodeHTML,
  ef as decodeURIComponent,
  ll as defaultTo,
  dl as descend,
  hl as descendNatural,
  ml as difference,
  ac as differenceInBusinessDays,
  sc as differenceInCalendarDays,
  oc as differenceInCalendarISOWeekYears,
  ic as differenceInCalendarISOWeeks,
  cc as differenceInCalendarMonths,
  uc as differenceInCalendarQuarters,
  fc as differenceInCalendarWeeks,
  lc as differenceInCalendarYears,
  dc as differenceInDays,
  hc as differenceInHours,
  mc as differenceInISOWeekYears,
  gc as differenceInMilliseconds,
  pc as differenceInMinutes,
  yc as differenceInMonths,
  Dc as differenceInQuarters,
  wc as differenceInSeconds,
  Mc as differenceInWeeks,
  Oc as differenceInYears,
  gl as differenceWith,
  pl as dissoc,
  yl as dissocPath,
  Dl as divide,
  wl as drop,
  Ml as dropLast,
  Ol as dropLastWhile,
  bl as dropRepeats,
  Sl as dropRepeatsBy,
  kl as dropRepeatsWith,
  Il as dropWhile,
  bc as eachDayOfInterval,
  Sc as eachHourOfInterval,
  kc as eachMonthOfInterval,
  Ic as eachQuarterOfInterval,
  xc as eachWeekOfInterval,
  Yc as eachWeekendOfInterval,
  $c as eachWeekendOfMonth,
  Tc as eachWeekendOfYear,
  Wc as eachYearOfInterval,
  xl as either,
  _s as empty,
  tf as encodeHTML,
  nf as encodeURIComponent,
  Nc as endOfDay,
  vc as endOfDecade,
  Fc as endOfHour,
  Pc as endOfISOWeek,
  _c as endOfISOWeekYear,
  Cc as endOfMinute,
  Ec as endOfMonth,
  Ac as endOfQuarter,
  Hc as endOfSecond,
  Lc as endOfWeek,
  Rc as endOfYear,
  Yl as endsWith,
  $l as eqBy,
  Tl as eqProps,
  Wl as equals,
  Nl as evolve,
  vl as filter,
  Fl as find,
  Pl as findIndex,
  _l as findLast,
  Cl as findLastIndex,
  El as flatten,
  Al as flip,
  Hl as forEach,
  Ll as forEachObjIndexed,
  qu as format,
  Uc as formatDistance,
  qc as formatDuration,
  Rl as fromPairs,
  Zu as fromRepeatedPairs,
  zc as getDate,
  Xc as getDay,
  jc as getDayOfYear,
  Zc as getDaysInMonth,
  Bc as getDaysInYear,
  Qc as getDecade,
  Gc as getHours,
  Vc as getISODay,
  Jc as getISOWeek,
  Kc as getISOWeekYear,
  eu as getISOWeeksInYear,
  tu as getMilliseconds,
  nu as getMinutes,
  ru as getMonth,
  au as getOverlappingDaysInIntervals,
  su as getQuarter,
  ou as getSeconds,
  iu as getTime,
  cu as getUnixTime,
  uu as getWeek,
  fu as getWeekOfMonth,
  lu as getWeekYear,
  du as getWeeksInMonth,
  hu as getYear,
  Ul as groupBy,
  ql as groupWith,
  zl as gt,
  Xl as gte,
  Ju as guid,
  jl as has,
  Zl as hasIn,
  Bl as hasPath,
  Ql as head,
  Gl as identical,
  Vl as identity,
  Jl as ifElse,
  Kl as inc,
  ed as includes,
  td as indexBy,
  nd as indexOf,
  rd as init,
  ad as innerJoin,
  sd as insert,
  od as insertAll,
  rf as interpolate,
  id as intersection,
  cd as intersperse,
  ud as into,
  fd as invert,
  ld as invertObj,
  dd as invoker,
  hd as is,
  mu as isAfter,
  gu as isBefore,
  hf as isConstructor,
  Vu as isEmpty,
  xi as isFunction,
  tg as isFuture,
  md as isNil,
  se as isNumber,
  ct as isNumeric,
  ng as isPast,
  Ue as isString,
  mf as isValidDate,
  gd as join,
  pd as juxt,
  yd as keys,
  Dd as keysIn,
  wd as last,
  Md as lastIndexOf,
  Od as length,
  bd as lens,
  Sd as lensIndex,
  kd as lensPath,
  Id as lensProp,
  xd as lift,
  Yd as liftN,
  Ei as like,
  gf as likeArray,
  pf as likePromise,
  $d as lt,
  Td as lte,
  Wd as map,
  Nd as mapAccum,
  vd as mapAccumRight,
  Fd as mapObjIndexed,
  Pd as match,
  _d as mathMod,
  Cd as max,
  Ed as maxBy,
  Ad as mean,
  Hd as median,
  Ld as memoizeWith,
  Rd as mergeAll,
  Ud as mergeDeepLeft,
  qd as mergeDeepRight,
  zd as mergeDeepWith,
  Xd as mergeDeepWithKey,
  jd as mergeLeft,
  Zd as mergeRight,
  Bd as mergeWith,
  Qd as mergeWithKey,
  Gd as min,
  Vd as minBy,
  Jd as modulo,
  Kd as multiply,
  eh as nAry,
  th as negate,
  nh as none,
  rh as not,
  ah as nth,
  sh as nthArg,
  oh as o,
  ih as objOf,
  ch as of,
  uh as omit,
  fh as once,
  lh as or,
  dh as otherwise,
  hh as over,
  mh as pair,
  gh as partial,
  ph as partialRight,
  yh as partition,
  Dh as path,
  wh as pathEq,
  Mh as pathOr,
  Oh as pathSatisfies,
  bh as pick,
  Sh as pickAll,
  kh as pickBy,
  Ih as pipe,
  xh as pipeWith,
  Yh as pluck,
  $h as prepend,
  Th as product,
  Wh as project,
  Nh as prop,
  vh as propEq,
  Fh as propIs,
  Ph as propOr,
  _h as propSatisfies,
  Ch as props,
  uo as rand,
  X as randHex,
  qe as randInt,
  co as random,
  Bu as range,
  As as rangeN,
  Eh as reduce,
  Ah as reduceBy,
  Hh as reduceRight,
  Lh as reduceWhile,
  Rh as reduced,
  A as regExpRange,
  Uh as reject,
  qh as remove,
  af as removeNonPrintable,
  sn as removeNonWord,
  zh as repeat,
  Xh as replace,
  si as replaceDiacritics,
  jh as reverse,
  lo as sample,
  Zh as scan,
  Bh as sequence,
  Qh as set,
  pu as setDate,
  yu as setDay,
  Du as setDayOfYear,
  wu as setHours,
  Mu as setISODay,
  Ou as setISOWeek,
  bu as setISOWeekYear,
  Su as setMilliseconds,
  ku as setMinutes,
  Iu as setMonth,
  xu as setQuarter,
  Yu as setSeconds,
  $u as setWeek,
  Tu as setWeekYear,
  Wu as setYear,
  Qu as shuffle,
  Gh as slice,
  sf as slugify,
  Vh as sort,
  Jh as sortBy,
  Kh as sortWith,
  em as split,
  tm as splitAt,
  nm as splitEvery,
  rm as splitWhen,
  Nu as startOfDay,
  vu as startOfDecade,
  Fu as startOfHour,
  Pu as startOfISOWeek,
  _u as startOfISOWeekYear,
  Cu as startOfMinute,
  Eu as startOfMonth,
  Au as startOfQuarter,
  Hu as startOfSecond,
  Lu as startOfWeek,
  Ru as startOfWeekYear,
  Uu as startOfYear,
  am as startsWith,
  sm as subtract,
  om as sum,
  im as symmetricDifference,
  cm as symmetricDifferenceWith,
  um as tail,
  fm as take,
  lm as takeLast,
  dm as takeLastWhile,
  hm as takeWhile,
  mm as tap,
  gm as test,
  pm as thunkify,
  ym as times,
  di as toCamel,
  Xu as toDate,
  Dm as toLower,
  wm as toPairs,
  Mm as toPairsIn,
  of as toPascal,
  cf as toProper,
  uf as toRegExp,
  ff as toSentence,
  lf as toString,
  Om as toUpper,
  Gu as trailingJoin,
  df as trailingSplit,
  bm as transduce,
  Sm as transpose,
  km as traverse,
  Im as trim,
  xm as tryCatch,
  Ym as type,
  $m as unapply,
  Tm as unary,
  Wm as uncurryN,
  Nm as unfold,
  vm as union,
  Fm as unionWith,
  Pm as uniq,
  _m as uniqBy,
  Cm as uniqWith,
  Em as unless,
  Am as unnest,
  Hm as until,
  Lm as update,
  Rm as useWith,
  ju as utcToZonedTime,
  Um as values,
  qm as valuesIn,
  zm as view,
  Xm as when,
  jm as where,
  Zm as whereAny,
  Bm as whereEq,
  Qm as without,
  Gm as xprod,
  Vm as zip,
  Jm as zipObj,
  Km as zipWith,
  zu as zonedTimeToUTC
};
//# sourceMappingURL=index.js.map
