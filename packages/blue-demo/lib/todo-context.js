var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApplicationContextAwareProcessor, configuration, MetadataConfigApplicationContext, entry, } from '@blue/context';
import { MetadataHandlerMapping } from '@blue/dispatcher';
import { NameViewResolver } from '@blue/view';
import IndexController from './index-controller';
import MyTodoApp from './todo-app-view';
let ToDoconfiguration = class ToDoconfiguration {
    todoApp() {
        return new MyTodoApp();
    }
    indexController() {
        return new IndexController();
    }
    handlerMapping() {
        // TODO Fix the default handler mappings
        return new MetadataHandlerMapping();
    }
    viewResolver() {
        return new NameViewResolver();
    }
};
__decorate([
    entry,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ToDoconfiguration.prototype, "todoApp", null);
__decorate([
    entry,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ToDoconfiguration.prototype, "indexController", null);
__decorate([
    entry,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ToDoconfiguration.prototype, "handlerMapping", null);
__decorate([
    entry,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ToDoconfiguration.prototype, "viewResolver", null);
ToDoconfiguration = __decorate([
    configuration
], ToDoconfiguration);
const context = new MetadataConfigApplicationContext('todo'), processor = new ApplicationContextAwareProcessor(context);
context.addProcessor(processor);
context.register(ToDoconfiguration);
export default context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1jb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RvZG8tY29udGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsZ0NBQWdDLEVBQ2hDLGFBQWEsRUFDYixnQ0FBZ0MsRUFDaEMsS0FBSyxHQUNSLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM5QyxPQUFPLGVBQWUsTUFBTSxvQkFBb0IsQ0FBQztBQUNqRCxPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQztBQUd4QyxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjtJQUVuQixPQUFPO1FBQ0gsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFHRCxlQUFlO1FBQ1gsT0FBTyxJQUFJLGVBQWUsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHRCxjQUFjO1FBQ1Ysd0NBQXdDO1FBQ3hDLE9BQU8sSUFBSSxzQkFBc0IsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFHRCxZQUFZO1FBQ1IsT0FBTyxJQUFJLGdCQUFnQixFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNKLENBQUE7QUFuQkc7SUFEQyxLQUFLOzs7O2dEQUdMO0FBR0Q7SUFEQyxLQUFLOzs7O3dEQUdMO0FBR0Q7SUFEQyxLQUFLOzs7O3VEQUlMO0FBR0Q7SUFEQyxLQUFLOzs7O3FEQUdMO0FBcEJDLGlCQUFpQjtJQUR0QixhQUFhO0dBQ1IsaUJBQWlCLENBcUJ0QjtBQUVELE1BQU0sT0FBTyxHQUFHLElBQUksZ0NBQWdDLENBQUMsTUFBTSxDQUFDLEVBQ3hELFNBQVMsR0FBRyxJQUFJLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRTlELE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDaEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRXBDLGVBQWUsT0FBTyxDQUFDIn0=