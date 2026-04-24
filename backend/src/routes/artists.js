const express = require("express");
const router = express.Router();

const { 
  createArtist,
  createArtistsBulk,
  updateArtistsBulk,
  searchArtists, 
  getArtistById, 
} = require("../controllers/artistController");


router.put("/bulk", updateArtistsBulk);   
router.post("/", createArtist);
router.post("/bulk", createArtistsBulk);
router.get("/search", searchArtists);
router.get("/:id", getArtistById);


module.exports = router;