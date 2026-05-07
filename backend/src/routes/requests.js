const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, requestController.createRequest);
router.get("/", authMiddleware, requestController.getUserRequests);
router.patch("/:id", requestController.updateRequest); // sem auth — simula admin

module.exports = router;