const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
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
router.post("/:id/favorite", authMiddleware, addFavoriteArtist);
router.delete("/favorite", authMiddleware, removeFavoriteArtist);



module.exports = router;