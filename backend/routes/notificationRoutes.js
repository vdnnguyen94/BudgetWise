import express from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.patch("/:notificationId/read", markAsRead);
router.delete("/:notificationId", deleteNotification);

router.get('/:userId', getNotifications);



export default router;