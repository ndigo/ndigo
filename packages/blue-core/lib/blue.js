/**
 * @author Jeff Rose
 */
import { createNull } from './null';
const blue = createNull();
// TODO This fails on the benchmark scripts because globalThis doesn't exist. Need to fix the scripts and then restore this.
/*
Reflect.defineProperty( globalThis, 'blue', {
    value: blue,
    configurable: true,
    enumerable: true,
    writable: false
} );
*/
export default blue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmx1ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ibHVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUVwQyxNQUFNLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztBQUUxQiw0SEFBNEg7QUFDNUg7Ozs7Ozs7RUFPRTtBQUVGLGVBQWUsSUFBSSxDQUFDIn0=