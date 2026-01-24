var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { routeMapping, ModelAndView } from '@blue/dispatcher';
let IndexController = class IndexController {
    handleIndex(route) {
        console.log('IndexController::Handling Route', route);
        return new ModelAndView('todoApp', {});
    }
};
__decorate([
    routeMapping('/index'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], IndexController.prototype, "handleIndex", null);
IndexController = __decorate([
    routeMapping('')
], IndexController);
export default IndexController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFHOUQsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtJQUVqQixXQUFXLENBQUMsS0FBSztRQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsT0FBTyxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNKLENBQUE7QUFKRztJQURDLFlBQVksQ0FBQyxRQUFRLENBQUM7Ozs7a0RBSXRCO0FBTEMsZUFBZTtJQURwQixZQUFZLENBQUMsRUFBRSxDQUFDO0dBQ1gsZUFBZSxDQU1wQjtBQUVELGVBQWUsZUFBZSxDQUFDIn0=