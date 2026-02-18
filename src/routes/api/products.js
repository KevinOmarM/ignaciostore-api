const router = require("express").Router();
const { checkAuth } = require("../../middleware/auth.js");
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    getProductByName,
    updateProductController,
    deleteProductController,
    buyProductController

} = require("../../controllers/productController");

router.get("/", checkAuth, getAllProductsController);
router.get("/:id", checkAuth, getProductByIdController);
router.get("/search/:name", checkAuth, getProductByName);

router.post("/", checkAuth, createProductController);
router.put("/:id", checkAuth, updateProductController);
router.delete("/:id", checkAuth, deleteProductController);
router.post("/buy/:id", checkAuth, buyProductController);

module.exports = router;
