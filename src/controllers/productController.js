const productService = require("../services/productService.js");
const { customResponse } = require("../helpers/objectDataResponse.js")
const { uploadImage, deleteImage } = require("../helpers/cloudinary.js")
const fs = require("fs-extra");

const createProductController = async (req, res) => {
  try {
    const productData = req.body

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

      if(imageData) {
        productData.image = imageData
      }

      console.log(productData)

      // Eliminamos archivo temporal
      await fs.remove(req.files.image.tempFilePath);
    }

    const newProduct = await productService.createProduct(productData)
    customResponse(res, 201, newProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al crear el producto")
    console.error("Error en createProduct controller:", error.message);
  }
}

const getAllProductsController = async (req, res) => {
    try {
      const products = await productService.getAllProducts()
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
      const product = await productService.searchProductByName(name)
      customResponse(res, 200, product, "Ok")
    } catch (error) {
      customResponse(res, 500, error, "Error al obtener el producto")
    }
  }

const updateProductController = async (req, res) => {
  try {
    const { id } = req.params
    const productData = {...req.body};

    //Convertir price y stock a números si vienen en el body
    if (productData.price) productData.price = Number(productData.price);
    if (productData.stock) productData.stock = Number(productData.stock);

    const existingProduct = await productService.getProductById(id)
    if (!existingProduct) {
      return customResponse(res, 404, null, "Producto no encontrado")
    }

    // Verificamos si viene una nueva imagen
    if(req.files?.image) {
      // Si el producto ya tiene una imagen, la eliminamos de Cloudinary
      if(existingProduct.image?.public_id) {
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
    customResponse(res, 200, updatedProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al actualizar el producto")
  }
}

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params
    const deletedProduct = await productService.deleteProduct(id)
    customResponse(res, 200, deletedProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al eliminar el producto")
  }
}

const buyProductController = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId
    const product = await productService.buyProduct(id, userId)
    customResponse(res, 200, product, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al comprar el producto")
  }
}

module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByName,
  updateProductController,
  deleteProductController,
  buyProductController
}