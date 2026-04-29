import express from 'express';
import * as itemController from '../controllers/itemController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', itemController.getAllItems);
router.post('/', authMiddleware, itemController.createItem);
router.get('/user/:userId', itemController.getUserItems);
router.get('/:id', itemController.getItemById);
router.put('/:id', authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);

export default router;
