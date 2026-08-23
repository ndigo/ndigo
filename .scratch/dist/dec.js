var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import '@tsmetadata/polyfill';
const AUTH_REQUIRED_KEY = 'auth:required';
function authenticated(target, context) {
    if (context.kind === 'class') {
        context.metadata[AUTH_REQUIRED_KEY] = true;
    }
    else {
        context.metadata[`${AUTH_REQUIRED_KEY}:${String(context.name)}`] = true;
    }
}
let OpenController = (() => {
    let _instanceExtraInitializers = [];
    let _secure_decorators;
    return class OpenController {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _secure_decorators = [authenticated];
            __esDecorate(this, null, _secure_decorators, { kind: "method", name: "secure", static: false, private: false, access: { has: obj => "secure" in obj, get: obj => obj.secure }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        secure() {
            return 'secret';
        }
        constructor() {
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
})();
let ClosedController = (() => {
    let _classDecorators = [authenticated];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ClosedController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ClosedController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        open() {
            return 'public';
        }
    };
    return ClosedController = _classThis;
})();
const sm = Symbol.metadata;
const meta = (obj) => obj[sm] ?? null;
const inst = new OpenController();
const bound = inst.secure.bind(inst);
const unbound = OpenController.prototype.secure;
console.log('class metadata (Open):    ', JSON.stringify(meta(OpenController)));
console.log('method fn metadata:       ', JSON.stringify(meta(unbound)));
console.log('unbound.constructor.name: ', unbound.constructor?.name);
console.log('bound.constructor.name:   ', bound.constructor?.name);
console.log('class metadata (Closed):  ', JSON.stringify(meta(ClosedController)));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vZGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLHNCQUFzQixDQUFDO0FBRTlCLE1BQU0saUJBQWlCLEdBQUcsZUFBZSxDQUFDO0FBRTFDLFNBQVMsYUFBYSxDQUFDLE1BQWUsRUFBRSxPQUE0RDtJQUNoRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7UUFDM0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUMvQyxDQUFDO1NBQU0sQ0FBQztRQUNKLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxpQkFBaUIsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDNUUsQ0FBQztBQUNMLENBQUM7SUFFSyxjQUFjOzs7aUJBQWQsY0FBYzs7O2tDQUNmLGFBQWE7WUFDZCxxS0FBQSxNQUFNLDZEQUVMOzs7UUFGRCxNQUFNO1lBQ0YsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQzs7WUFKQyxtREFBYzs7OztJQVFkLGdCQUFnQjs0QkFEckIsYUFBYTs7Ozs7Ozs7WUFDZCw2S0FJQzs7O1lBSkssdURBQWdCOztRQUNsQixJQUFJO1lBQ0EsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQzs7OztBQUdMLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDM0IsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFZLEVBQVcsRUFBRSxDQUFFLEdBQStDLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ3JHLE1BQU0sSUFBSSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7QUFDbEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFFaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekUsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsRUFBRyxPQUErQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM5RixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFHLEtBQTZCLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMifQ==