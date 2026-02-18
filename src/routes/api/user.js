const express = require("express");
const router = express.Router();
const checkAuth = require("../../middlewares/checkAuth");

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addUserDebt,
  subtractUserDebt,
} = require("../../controllers/user.controller"); 

// Get all users (paginated)
router.get("/", checkAuth, getAllUsers);

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
