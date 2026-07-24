const productService = require("../services/productService.js");
const { customResponse } = require("../helpers/objectDataResponse.js")
const { uploadImage, deleteImage } = require("../helpers/cloudinary.js")
const logService = require("../services/logService.js");
const fs = require("fs-extra");
const mongoose = require("mongoose")

const createProductController = async (req, res) => {
  try {

    const {
      name,
      description,
      price,
      stock,
      status,
      createdBy
    } = req.body;
    console.log("createdBy recibido:", createdBy);
    const author = new mongoose.Types.ObjectId(createdBy)

    const productData = {}
    if (name) productData.name = name;
    if (description) productData.description = description;
    if (price) productData.price = Number(price);
    if (stock) productData.stock = Number(stock);
    if (status) productData.status = status;




    let imageData = {
      url: "",
      public_id: "",
    };

    // Verificamos si viene imagen
    if (req.files?.image) {
      const result = await uploadImage(
        req.files.image.tempFilePath,
        "storage/img/products"
      );

      imageData = {
        url: result.secure_url,
        public_id: result.public_id,
      };

      if (imageData) {
        productData.image = imageData
      }

      console.log(productData)

      // Eliminamos archivo temporal
      await fs.remove(req.files.image.tempFilePath);
    }


    const newProduct = await productService.createProduct(productData)
    await logService.createLog(author, "Crear producto", `Producto ${name} creado`)
    customResponse(res, 201, newProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al crear el producto")
    console.error("Error en createProduct controller:", error.message);
  }
}

const getAllProductsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, includeBlocked = "false" } = req.query
    const shouldIncludeBlocked = String(includeBlocked).toLowerCase() === "true"
    const products = await productService.getAllProducts(page, limit, shouldIncludeBlocked)
    customResponse(res, 200, products, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al obtener los productos")
  }
}

const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params
    const product = await productService.getProductById(id)
    customResponse(res, 200, product, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al obtener el producto")
  }
}

const getProductByName = async (req, res) => {
  try {
    const { name } = req.params
    const { page = 1, limit = 10 } = req.query
    const product = await productService.searchProductByName(name, page, limit)
    customResponse(res, 200, product, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al obtener el producto")
  }
}

const addProductToCart = async (req, res) => {
  try {
    const cartData = req.body
    const cartProducts = await productService.addProductToCart(cartData)
    customResponse(res, 200, cartProducts, "Ok")
  } catch (error) {
    if (error.message === 'Supera el stock') {
      customResponse(res, 400, error, "Supera el stock")
    } else {
      customResponse(res, 500, error, "Error al agregar el producto al carrito")
    }
  }
}

const getCartProducts = async (req, res) => {
  try {
    const { userId } = req.params
    const cartProducts = await productService.getCartProducts(userId)
    customResponse(res, 200, cartProducts, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al obtener el carrito")
  }
}

const updateProductController = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      price,
      stock,
      status,
    } = req.body;
    const productData = {};

    if (name) productData.name = name;
    if (description) productData.description = description;
    if (price !== undefined) productData.price = Number(price);
    if (stock !== undefined) productData.stock = Number(stock);
    if (status) productData.status = status;

    const author = req.user?.id
    const updatedBy = new mongoose.Types.ObjectId(author)

    const existingProduct = await productService.getProductById(id)
    if (!existingProduct) {
      return customResponse(res, 404, null, "Producto no encontrado")
    }

    // Verificamos si viene una nueva imagen
    if (req.files?.image) {
      // Si el producto ya tiene una imagen, la eliminamos de Cloudinary
      if (existingProduct.image?.public_id) {
        await deleteImage(existingProduct.image.public_id)
      }

      // Subimos la nueva imagen
      const result = await uploadImage(
        req.files.image.tempFilePath,
        "storage/img/products"
      );

      //Guardar nueva info
      productData.image = {
        url: result.secure_url,
        public_id: result.public_id,
      }

      // Eliminamos archivo temporal
      await fs.remove(req.files.image.tempFilePath);
    }
    const updatedProduct = await productService.updateProduct(id, productData)

    try {
      await logService.createLog(updatedBy, "Actualizar producto", `Producto ${updatedProduct.name} actualizado`)

    } catch (error) {
      console.error("Error al crear log de actualización de producto:", error.message);
    }
    customResponse(res, 200, updatedProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al actualizar el producto")
  }
}

const deleteFromCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body
    const deletedCart = await productService.deleteFromCart(userId, productId, quantity)
    customResponse(res, 200, deletedCart, "Ok")
  } catch (error) {
    customResponse(res, 500, error.message, "Error al eliminar el producto del carrito")
  }
}

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params


    getProduct = await productService.getProductById(id)
    if (!getProduct) {
      return customResponse(res, 404, null, "Producto no encontrado")
    }

    if (getProduct.status === "blocked") {
      return customResponse(res, 400, null, "El producto ya está eliminado")
    }

    const author = req.user?.id
    const deletedBy = new mongoose.Types.ObjectId(author)

    const deletedProduct = await productService.deleteProduct(id)
    await logService.createLog(deletedBy, "Eliminar producto", `Producto ${getProduct.name} eliminado`)
    customResponse(res, 200, deletedProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al eliminar el producto")
    throw new Error(error.message)
  }
}

const buyCartProductsController = async (req, res) => {
  try {
    const userId = req.user.userId
    const { products } = req.body

    if (!products || !Array.isArray(products) || products.length === 0)
      return customResponse(res, 400, null, "Lista de productos inválida")

    const result = await productService.buyCartProducts(products, userId)

    customResponse(res, 200, result, "Compra realizada")

  } catch (error) {
    if (error.message === 'Error: Supera el stock') {
      return customResponse(res, 400, error, 'Supera el stock')
    } else {
      return customResponse(res, 500, error, "Error al comprar")
    }
  }
}

const buyProductController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body || {};

    if (!mongoose.isValidObjectId(userId)) return customResponse(res, 400, {}, "Id inválido");
    if (quantity === undefined) return customResponse(res, 400, {}, "La cantidad es requerida.");
    if (quantity === 0 || quantity < 0 || !Number.isInteger(quantity)) return customResponse(res, 400, {}, "Cantidad inválida");

    const result = await productService.buyProduct(userId, { id: productId, quantity });

    return customResponse(res, 200, {}, "Compra realizada");
  } catch (error) {
    return customResponse(res, 500, error, "Error al comprar");
  }
}

module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByName,
  updateProductController,
  deleteProductController,
  buyCartProductsController,
  buyProductController,
  addProductToCart,
  getCartProducts,
  deleteFromCart
}