const productService = require("../services/productService.js");
const { customResponse } = require("../../helpers/objectDataResponse.js")

const createProductController = async (req, res) => {
  try {
    const productData = req.body
    const newProduct = await productService.createProduct(productData)
    customResponse(res, 201, newProduct, "Ok")
  } catch (error) {
    customResponse(res, 500, error, "Error al crear el producto")
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
    const productData = req.body
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

module.exports = {
  createProductController,
  getAllProductsController,
  getProductByIdController,
  getProductByName,
  updateProductController,
  deleteProductController
}