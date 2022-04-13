import express from 'express';
const router = express.Router();
import teamController from '../controllers/team.js';
import checking from '../middleware/check-auth.js';

router.get('/', teamController.getAllTeams);
router.get('/:teamId', teamController.getTeam);
router.post('/', checking, teamController.newTeam);
router.patch('/:teamId', checking,  teamController.updateTeam);
router.delete('/:teamId', checking, teamController.deleteTeam);

export default router;
