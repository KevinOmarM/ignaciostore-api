const router = require("express").Router();
const userCtrl = require("../../controllers/user.controller");

router.get("/", userCtrl.getUsers);
router.get("/:id", userCtrl.getUserById);

router.post("/", userCtrl.postUser);
router.put("/:id", userCtrl.putUser);
router.delete("/:id", userCtrl.deleteUser);

module.exports = router;