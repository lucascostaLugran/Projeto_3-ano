const express = require("express");
const router = express.Router();

const { 
  createArtist,
  createArtistsBulk,
  updateArtistsBulk,
  searchArtists, 
  getArtistById, 
  addFavoriteArtist, 
  removeFavoriteArtist 
} = require("../controllers/artistController");


router.put("/bulk", updateArtistsBulk);   
router.post("/", createArtist);
router.post("/bulk", createArtistsBulk);
router.get("/search", searchArtists);
router.get("/:id", getArtistById);

router.post("/:id/favorite", addFavoriteArtist);
router.delete("/favorite", removeFavoriteArtist);

module.exports = router;