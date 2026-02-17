const router = require("express").Router();
const userCtrl = require("../../src/controllers/user.controller");

router.get("/", userCtrl.getUsers);
router.get("/:id", userCtrl.getUserById);

router.post("/", userCtrl.createUser);
router.put("/:id", userCtrl.updateUser);
router.delete("/:id", userCtrl.deleteUser);

module.exports = router;