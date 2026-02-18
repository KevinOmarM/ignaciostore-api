const productService = require("../services/productService.js");
const { customResponse } = require("../helpers/objectDataResponse.js")
const { uploadImage, deleteImage } = require("../helpers/cloudinary.js")
const logService = require("../services/logService.js");
const fs = require("fs-extra");

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

    const productData = {}
    if(name) productData.name = name;
    if(description) productData.description = description;
    if(price) productData.price = Number(price);
    if(stock) productData.stock = Number(stock);
    if(status) productData.status = status;
  

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
    await logService.createLog(createdBy, "Crear producto", `Producto ${name} creado`)
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
    const {
      name,
      description,
      price,
      stock,
      status,
      updatedBy
    } = req.body;
    const productData = {};

    if (name) productData.name = name;
    if (description) productData.description = description;
    if (price !== undefined) productData.price = Number(price);
    if (stock !== undefined) productData.stock = Number(stock);
    if (status) productData.status = status;

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
    await logService.createLog(updatedBy, "Actualizar producto", `Producto ${updatedProduct.name} actualizado`)
    customResponse(res, 200, updatedProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al actualizar el producto")
  }
}

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params
    const { deletedBy } = req.body

    getProduct = await productService.getProductById(id)
    if (!getProduct) {
      return customResponse(res, 404, null, "Producto no encontrado")
    }
    
    const deletedProduct = await productService.deleteProduct(id)
    await logService.createLog(deletedBy, "Eliminar producto", `Producto ${getProduct.name} eliminado`)
    customResponse(res, 200, deletedProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al eliminar el producto")
    throw new Error(error.message)
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