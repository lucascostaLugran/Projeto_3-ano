const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  addFavoriteArtist,
  removeFavoriteArtist,
  addToCollection,
  getCollection,
  removeFromCollection   
} = require("../controllers/authController");


router.post("/register", register);
router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.post("/favorite", authMiddleware, addFavoriteArtist);
router.delete("/favorite", authMiddleware, removeFavoriteArtist);

router.get("/collection", authMiddleware, getCollection);
router.post("/collection", authMiddleware, addToCollection);
router.delete("/collection", authMiddleware, removeFromCollection);
module.exports = router;