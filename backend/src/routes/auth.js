const express = require("express");
const router = express.Router();

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
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/favorite", addFavoriteArtist);
router.delete("/favorite", removeFavoriteArtist);

module.exports = router;