const router = require("express").Router();
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    getProductByName,
    updateProductController,
    deleteProductController

} = require("../../controllers/productController");

router.get("/", getAllProductsController);
router.get("/:id", getProductByIdController);
router.get("/search/:name", getProductByName);

router.post("/", createProductController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);

module.exports = router;
