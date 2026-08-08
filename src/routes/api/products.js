const router = require("express").Router();
const { checkAuth } = require("../../middleware/auth.js");
const {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    getProductByName,
    updateProductController,
    deleteProductController,
    buyCartProductsController,
    addProductToCart,
    getCartProducts,
    deleteFromCart,
    buyProductController
} = require("../../controllers/productController");

router.get("/", checkAuth, getAllProductsController);
router.get("/search/:name", checkAuth, getProductByName);
router.get("/:id", checkAuth, getProductByIdController);

router.post("/", checkAuth, createProductController);
router.put("/:id", checkAuth, updateProductController);

router.post("/buyCart", checkAuth, buyCartProductsController);
router.post("/:productId/buy", checkAuth, buyProductController)
router.post("/addToCart", checkAuth, addProductToCart);
router.get("/getCartProducts/:userId", checkAuth, getCartProducts);
router.post("/deleteFromCart", checkAuth, deleteFromCart);

router.delete("/:id", checkAuth, deleteProductController);

module.exports = router;