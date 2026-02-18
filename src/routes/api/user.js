const express = require("express");
const router = express.Router();

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
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Create User
router.post("/", createUser);

// Update user
router.put("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);

// Add debt to user
router.put("/:id/add-debt", addUserDebt);

// Subtract debt from user
router.put("/:id/subtract-debt", subtractUserDebt);

module.exports = router;
