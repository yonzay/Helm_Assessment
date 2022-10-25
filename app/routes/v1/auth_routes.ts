import { Router } from 'express';
import { ValidationMiddleware } from '../../middleware/validation_middleware';
import { AuthValidations } from '../../validations/auth_validations';
import { AuthCreateController } from '../../controllers/auth/auth_create_controller';
import { AuthUpdateController } from '../../controllers/auth/auth_update_controller';
import { AuthDeleteController } from '../../controllers/auth/auth_delete_controller';

class AuthRoutes {
    public create_router: Router = Router();
    public update_router: Router = Router();
    public delete_router: Router = Router();
    constructor() {
        //endpoints for creating documents
        this.create_router.post('/create_user', ValidationMiddleware.validate(AuthValidations.create_user), AuthCreateController.create_user);
        this.create_router.post('/create_event', ValidationMiddleware.validate(AuthValidations.create_event), AuthCreateController.create_event);
        //endpoints for updating documents
        this.update_router.post('/update_user', ValidationMiddleware.validate(AuthValidations.update_user), AuthUpdateController.update_user);
        this.update_router.post('/update_event', ValidationMiddleware.validate(AuthValidations.update_event), AuthUpdateController.update_event);
        this.update_router.post('/update_participants', ValidationMiddleware.validate(AuthValidations.update_participants), AuthUpdateController.update_participants);
        //endpoints for deleting documents
        this.delete_router.post('/delete_user', ValidationMiddleware.validate(AuthValidations.delete_user), AuthDeleteController.delete_user);
        this.delete_router.post('/delete_event', ValidationMiddleware.validate(AuthValidations.delete_event), AuthDeleteController.delete_event);
    }
};

export { AuthRoutes }