import express from 'express';
import { protectRoute } from '../middlewares/authMiddleware.js';
import { getMessages, getUsersForSiderbar, sendMessage } from '../controllers/messageController.js'


const router =express.Router();

router.get("/users", protectRoute, getUsersForSiderbar);
router.get("/:id", protectRoute, getMessages)

router.post("/send/:id", protectRoute, sendMessage)

export default router;
