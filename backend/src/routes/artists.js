const express = require("express");
const router = express.Router();

const { 
  createArtist,
  createArtistsBulk,
  updateArtistsBulk,
  searchArtists, 
  getArtistById, 
  getArtistAlbums
} = require("../controllers/artistController");
const { 
  addFavoriteArtist,
  removeFavoriteArtist
} = require("../controllers/authController");


router.put("/bulk", updateArtistsBulk);   
router.post("/", createArtist);
router.post("/bulk", createArtistsBulk);
router.get("/search", searchArtists);
router.get("/:id/albums", getArtistAlbums);
router.get("/:id", getArtistById);
router.post("/:id/favorite", addFavoriteArtist);
router.delete("/favorite", removeFavoriteArtist);



module.exports = router;