const router = require("express").Router();
const productCtrl = require("../../src/controllers/product.controller");

router.get("/", productCtrl.getProducts);
router.get("/:id", productCtrl.getProductById);

router.post("/", productCtrl.createProduct);
router.put("/:id", productCtrl.updateProduct);
router.delete("/:id", productCtrl.deleteProduct);

module.exports = router;
