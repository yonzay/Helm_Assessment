import { Router } from 'express';
import { ValidationMiddleware } from '../../middleware/validation_middleware';
import { UserValidations } from '../../validations/user_validations';
import { UserController } from '../../controllers/user/user_controller';

class UserRoutes {
    public user_router: Router = Router();
    constructor() {
          //endpoint for logging in
          this.user_router.post('/login', ValidationMiddleware.validate(UserValidations.login), UserController.login);
          //endpoint for extending a logged in users session
          this.user_router.post('/extend_session', ValidationMiddleware.validate(UserValidations.extend_session), UserController.extend_session);
          //endpoint for logging out
          this.user_router.post('/logout', ValidationMiddleware.validate(UserValidations.logout), UserController.logout);
          //endpoint for querying data
          this.user_router.post('/query', ValidationMiddleware.validate(UserValidations.query), UserController.query);
          //endpoint for sending requests to event hosts to join their events
          this.user_router.post('/join_request', ValidationMiddleware.validate(UserValidations.join_request), UserController.join_request);
          //endpoint for leaving events that a user is apart of
          this.user_router.post('/leave_event', ValidationMiddleware.validate(UserValidations.leave_event), UserController.leave_event);
          //endpoint for sending invitations to users for your event
          this.user_router.post('/send_invitation', ValidationMiddleware.validate(UserValidations.send_invitation), UserController.send_invitation);
          //endpoint for replying to both join requests and invitations
          this.user_router.post('/reply', ValidationMiddleware.validate(UserValidations.reply), UserController.reply);
    }
};

export { UserRoutes }