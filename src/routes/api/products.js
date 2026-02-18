const router = require("express").Router();
const { checkAuth } = require("../../../middleware/auth");
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    getProductByName,
    updateProductController,
    deleteProductController

} = require("../../controllers/productController");

router.get("/", checkAuth, getAllProductsController);
router.get("/:id", checkAuth, getProductByIdController);
router.get("/search/:name", checkAuth, getProductByName);

router.post("/", checkAuth, createProductController);
router.put("/:id", checkAuth, updateProductController);
router.delete("/:id", checkAuth, deleteProductController);

module.exports = router;
