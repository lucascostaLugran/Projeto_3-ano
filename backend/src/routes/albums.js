const express = require("express");
const router = express.Router();

const albumController = require("../controllers/albumController");
const authMiddleware = require("../middleware/authMiddleware");

const { 
  addToCollection, 
  getCollection 
} = require("../controllers/authController");
router.get("/search", albumController.searchAlbums);

router.get("/collection", authMiddleware, getCollection);
router.post("/collection", authMiddleware, addToCollection);

router.get("/:id", albumController.getAlbumById);

module.exports = router;