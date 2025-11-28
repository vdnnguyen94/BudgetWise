import express from 'express';
import {
  getGoals,
  createGoal,
  contributeToGoal,
  updateGoal,
  deleteGoal,
  checkAlerts
} from '../controllers/goalController.js';

const router = express.Router();

router.get('/:userId', getGoals);
router.post('/:userId', createGoal);
router.put('/:userId/:goalId/contribute', contributeToGoal);
router.put('/:userId/:goalId', updateGoal);
router.delete('/:userId/:goalId', deleteGoal);
router.get('/:userId/check-alerts', checkAlerts);

export default router;
