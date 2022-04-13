import express from 'express';
const router = express.Router();
import userController from '../controllers/user.js';
import checking from '../middleware/check-auth.js';

router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUser);
router.post('/signup', userController.newUser);
router.post('/login', userController.loggedUser);
router.patch('/updateUser/:userId', checking, userController.updateUser);
router.patch('/joinTeam', checking, userController.joinTeam);
router.delete('/:userId', checking, userController.deleteUser);


export default router;