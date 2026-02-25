const express = require("express");
const router = express.Router();
const { checkAuth } = require("../../middleware/auth.js");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addUserDebt,
  subtractUserDebt,
  getAllUsersNames,
} = require("../../controllers/user.controller.js"); 

// Get all users (paginated)
router.get("/", checkAuth, getAllUsers);

// Obtener todos los nombres de usuarios
router.get("/names", checkAuth, getAllUsersNames);

// Get user by ID
router.get("/:id", checkAuth, getUserById);

// Create User
router.post("/", checkAuth, createUser);

// Update user
router.put("/:id", checkAuth, updateUser);

// Delete user
router.delete("/:id", checkAuth, deleteUser);

// Add debt to user
router.put("/:id/add-debt", checkAuth, addUserDebt);

// Subtract debt from user
router.put("/:id/subtract-debt", checkAuth, subtractUserDebt);



module.exports = router;
