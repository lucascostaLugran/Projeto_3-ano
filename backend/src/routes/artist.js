const express = require("express");
const router = express.Router();

const { 
  searchArtists, 
  getArtistById, 
  addFavoriteArtist, 
  removeFavoriteArtist 
} = require("../controllers/artistController");

router.get("/search", searchArtists);
router.get("/:id", getArtistById);

router.post("/:id/favorite", addFavoriteArtist);
router.delete("/favorite", removeFavoriteArtist);

module.exports = router;