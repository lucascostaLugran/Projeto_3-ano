const express = require("express");
const router = express.Router();

const {
  createAlbum,
  createAlbumsBulk
} = require("../controllers/albumController");

router.post("/", createAlbum);
router.post("/bulk", createAlbumsBulk);

module.exports = router;