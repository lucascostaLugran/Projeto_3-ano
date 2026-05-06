const express = require("express");
const router = express.Router();
const albumController = require('../controllers/albumController');

router.get("/search", albumController.searchAlbums);
router.get("/:id", albumController.getAlbumById);

module.exports = router;