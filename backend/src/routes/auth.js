const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  addFavoriteArtist,
  removeFavoriteArtist
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/favorite", authMiddleware, addFavoriteArtist);
router.delete("/favorite", authMiddleware, removeFavoriteArtist);
router.post("/collection", authMiddleware, authController.addToCollection);
router.get("/collection", authMiddleware, authController.getCollection);
router.post("/collection", authMiddleware, authController.addToCollection);

module.exports = router;