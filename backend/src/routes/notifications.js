const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, notificationController.getNotifications);
router.patch("/:id/read", authMiddleware, notificationController.markAsRead);
router.delete('/:id', authMiddleware, notificationController.deleteNotification);
router.delete('/', authMiddleware, notificationController.clearNotifications);
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

module.exports = router;