const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  createList,
  getLists,
  addAlbumToList,
  getListById,
  removeAlbumFromList,
  deleteList
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.post("/lists", authMiddleware, createList);
router.get("/lists", authMiddleware, getLists);
router.get("/lists/:listId", authMiddleware, getListById);

router.post("/lists/:listId/add-album", authMiddleware, addAlbumToList);
router.delete("/lists/:listId/:albumId", authMiddleware, removeAlbumFromList);

router.delete("/lists/:listId", authMiddleware, deleteList);

module.exports = router;