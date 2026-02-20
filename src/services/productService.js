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

    async getAllProducts(page = 1, limit = 10) {
        try {

            const options = {
                page: parseInt(page, 10),
                limit : parseInt(limit, 10),
                select: "-createdAt -updatedAt -__v",
                sort: { name: 1 },
                collation: { locale: "es", strength: 1 }
            }
            const products = await productModel.paginate({}, options)
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

            Object.keys(productData).forEach(key => {
                if (productData[key] === undefined || productData[key] === null) delete productData[key];
            });
            const updatedProduct = await productModel.findByIdAndUpdate(id, productData, {returnDocument: "after"})
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

    async buyProducts(products, userId) {

        const session = await mongoose.startSession()
        session.startTransaction()

        try {

            const updatedProducts = []

            for (const item of products) {

                const { id, quantity } = item

                if (!quantity || quantity <= 0)
                    throw new Error("Cantidad inválida")

                const product = await productModel.findOneAndUpdate(
                    {
                        _id: id,
                        status: { $ne: "blocked" },
                        stock: { $gte: quantity }
                    },
                    { $inc: { stock: -quantity } },
                    { new: true, session }
                )

                if (!product)
                    throw new Error(`Producto sin stock: ${id}`)

                updatedProducts.push({
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity
                })
            }

            await BuyLogsService.createLog({
                id_user: userId,
                products: updatedProducts
            }, session)

            await session.commitTransaction()
            session.endSession()

            return updatedProducts

        } catch (error) {

            await session.abortTransaction()
            session.endSession()

            throw new Error("Error al comprar productos: " + error.message)
        }
    }


}

module.exports = new productService()