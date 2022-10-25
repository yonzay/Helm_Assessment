import { Router } from 'express';
import { route } from './definitions';
import { AuthRoutes } from './auth_routes';
import { UserRoutes } from './user_routes';

class Routes {
    public router: Router = Router();
    private auth_routes: AuthRoutes = new AuthRoutes();
    private user_routes: UserRoutes = new UserRoutes();
    private default_routes: route[] = [
        {
            path: '/auth/create',
            router: this.auth_routes.create_router
        },
        {
            path: '/auth/update',
            router: this.auth_routes.update_router
        },
        {
            path: '/auth/delete',
            router: this.auth_routes.delete_router
        },
        {
            path: '/user',
            router: this.user_routes.user_router
        }
    ];
    constructor() {
        this.default_routes.forEach(default_route => this.router.use(default_route.path, default_route.router));
    }
};

export { Routes }