var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Pattern } from '../src/decorators';
export class Test {
    foo;
    bar;
    constructor(arg1, arg2) {
        this.test(arg1, arg2);
    }
    test(arg1, arg2) {
        this.foo = arg1;
        this.bar = arg2;
    }
}
__decorate([
    Pattern({ regex: /foo/ }),
    __metadata("design:type", String)
], Test.prototype, "foo", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdERlY29yYXRvcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0ZXN0RGVjb3JhdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsTUFBTSxPQUFPLElBQUk7SUFFYixHQUFHLENBQVM7SUFFWixHQUFHLENBQVM7SUFFWixZQUFhLElBQVksRUFBRSxJQUFZO1FBQ25DLElBQUksQ0FBQyxJQUFJLENBQUUsSUFBSSxFQUFFLElBQUksQ0FBRSxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLENBQUUsSUFBWSxFQUFFLElBQVk7UUFDNUIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDaEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBWkc7SUFEQyxPQUFPLENBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUU7O2lDQUNoQiJ9