import { Router } from 'express';
import authMiddleware from '../../middleware/authMiddleware';
import authorizeRoles from '../../middleware/authorizeRoles';
import { UpdateRequestControllers } from './updateRequest.controller';

const updateRequestRouter = Router();

updateRequestRouter.post('/', UpdateRequestControllers.createUpdateRequest);
updateRequestRouter.get('/', authMiddleware, authorizeRoles('admin'), UpdateRequestControllers.getAllUpdateRequests);
updateRequestRouter.patch('/:id', authMiddleware, authorizeRoles('admin'), UpdateRequestControllers.updateRequestStatus);

export default updateRequestRouter;
