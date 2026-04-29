import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile/:id', userController.getUserProfile);
router.put('/profile/:id', authMiddleware, userController.updateUserProfile);
router.get('/:id/skills', userController.getUserSkills);
router.post('/:id/skills', authMiddleware, userController.addSkill);
router.delete('/skills/:skillId', authMiddleware, userController.deleteSkill);

export default router;
