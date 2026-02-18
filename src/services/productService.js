const productModel = require("../models/productModel.js")
const { default: mongoose } = require("mongoose")
const BuyLogsService = require("./buyLogs.js")

class productService {

    async createProduct(productData) {
        try {
            const newProduct = await productModel.create(productData)
            newProduct.status = "active"
            await newProduct.save()
            return newProduct
        } catch (error) {
            throw new Error("Error al crear el producto: " + error.message)
        }
    }

    async getAllProducts(){
        try {
            const products = await productModel.find().select("-createdAt -updatedAt -__v")
            return products
        } catch (error) {
            throw new Error("Error al obtener los productos: " + error.message)
        }
    }

    async getProductById(id){
        try {
            const product = await productModel.findById(id).select("-createdAt -updatedAt -__v")
            return product
        } catch (error) {
            throw new Error("Error al obtener el producto: " + error.message)
        }
    }

    async searchProductByName(name){
        try {
            const product = await productModel.find({
                $or: [
                    { name: { $regex: name, $options: "i" } },
                ]
            }).collation({ locale: "es" , strength: 1}).select("-createdAt -updatedAt -__v")
            return product
        } catch (error) {
            throw new Error("Error al buscar el producto: " + error.message)
        }
    }

    async updateProduct(id, productData){
        try {
            const updatedProduct = await productModel.findByIdAndUpdate(id, productData, {new: true})
            return updatedProduct
        } catch (error) {
            throw new Error("Error al actualizar el producto: " + error.message)
        }
    }

    async deleteProduct(id){
        try {
            await productModel.findByIdAndUpdate(id, {status: "blocked"})
            return "Producto eliminado"
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    }

    async buyProduct(id, userId){
        try {

            const product = await productModel.findOneAndUpdate(
                {
                    _id: id,
                    status: { $ne: "blocked" },
                    stock: { $gt: 0 }
                },
                {
                    $inc: { stock: -1 }
                },
                { new: true }
            )

            if (!product){
                throw new Error("Producto no disponible o sin stock")
            }

            await BuyLogsService.createLog({
                id_user: userId,
                products: [{
                    id: product._id,
                    name: product.name,
                    price: product.price
                }]
            })

            return product

        } catch (error) {
            console.log(error)
            throw new Error("Error al comprar el producto: " + error.message)
        }
    }

}

module.exports = new productService()