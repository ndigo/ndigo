import { routeMapping, ModelAndView } from '@blue/dispatcher';

@routeMapping( '' )
class IndexController {
    @routeMapping( '/index' )
    handleIndex( route ){
        console.log( 'IndexController::Handling Route', route );
        return new ModelAndView( 'todoApp', {} );
    }
}

export default IndexController;
