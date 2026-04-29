import express from 'express';
import * as interactionController from '../controllers/interactionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/interest', authMiddleware, interactionController.expressInterest);
router.get('/item/:itemId', interactionController.getItemInterests);
router.get('/user/:userId', authMiddleware, interactionController.getUserInteractions);
router.post('/message', authMiddleware, interactionController.sendMessage);
router.get('/messages/:userId', authMiddleware, interactionController.getMessages);
router.post('/report', authMiddleware, interactionController.reportContent);

export default router;
