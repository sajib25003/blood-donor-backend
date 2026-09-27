import { Router } from 'express';
import authMiddleware from '../../middleware/authMiddleware';
import authorizeRoles from '../../middleware/authorizeRoles';
import { DonorControllers } from './donor.controller';

const donorRouter = Router();

donorRouter.post('/', DonorControllers.createDonor);
donorRouter.get('/', DonorControllers.getAllDonors);
donorRouter.get('/stats', DonorControllers.getDonorStats);

donorRouter.get('/:id', authMiddleware, authorizeRoles('admin'), DonorControllers.getDonorById);
donorRouter.patch('/:id', authMiddleware, authorizeRoles('admin'), DonorControllers.updateDonor);
donorRouter.delete('/:id', authMiddleware, authorizeRoles('admin'), DonorControllers.deleteDonor);

export default donorRouter;
