import express from 'express';
import * as skillController from '../controllers/skillController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', skillController.getAllSkillExchanges);
router.post('/', authMiddleware, skillController.createSkillExchange);
router.get('/:id', skillController.getSkillExchangeById);
router.put('/:id', authMiddleware, skillController.updateSkillExchange);
router.delete('/:id', authMiddleware, skillController.deleteSkillExchange);

export default router;
