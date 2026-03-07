const router = require("express").Router();
const { checkAuth } = require("../../middleware/auth.js");
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    getProductByName,
    updateProductController,
    deleteProductController,
    buyProductsController,
    addProductToCart,
    getCartProducts,
    deleteFromCart
} = require("../../controllers/productController");

router.get("/", checkAuth, getAllProductsController);
router.get("/search/:name", checkAuth, getProductByName);
router.get("/:id", checkAuth, getProductByIdController);

router.post("/", checkAuth, createProductController);
router.put("/:id", checkAuth, updateProductController);

router.post("/buy", checkAuth, buyProductsController);
router.post("/addToCart", checkAuth, addProductToCart);
router.get("/getCartProducts/:userId", checkAuth, getCartProducts);
router.post("/deleteFromCart", checkAuth, deleteFromCart);

router.delete("/:id", checkAuth, deleteProductController);

module.exports = router;