import '@tsmetadata/polyfill';

const AUTH_REQUIRED_KEY = 'auth:required';

function authenticated(target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
    if (context.kind === 'class') {
        context.metadata[AUTH_REQUIRED_KEY] = true;
    } else {
        context.metadata[`${AUTH_REQUIRED_KEY}:${String(context.name)}`] = true;
    }
}

class OpenController {
    @authenticated
    secure() {
        return 'secret';
    }
}

@authenticated
class ClosedController {
    open() {
        return 'public';
    }
}

const sm = Symbol.metadata;
const meta = (obj: unknown): unknown => (obj as unknown as Record<PropertyKey, unknown>)[sm] ?? null;
const inst = new OpenController();
const bound = inst.secure.bind(inst);
const unbound = OpenController.prototype.secure;

console.log('class metadata (Open):    ', JSON.stringify(meta(OpenController)));
console.log('method fn metadata:       ', JSON.stringify(meta(unbound)));
console.log('unbound.constructor.name: ', (unbound as unknown as Function).constructor?.name);
console.log('bound.constructor.name:   ', (bound as unknown as Function).constructor?.name);
console.log('class metadata (Closed):  ', JSON.stringify(meta(ClosedController)));
