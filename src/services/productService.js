const productModel = require("../models/productModel.js")
const { default: mongoose } = require("mongoose")
const BuyLogsService = require("./buyLogs.js")
const cartModel = require("../models/cart.js")

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

    async getAllProducts(page = 1, limit = 10, includeBlocked = false) {
        try {

            const options = {
                page: parseInt(page, 10),
                limit : parseInt(limit, 10),
                select: "-createdAt -updatedAt -__v",
                sort: { name: 1 },
                collation: { locale: "es", strength: 1 }
            }
            const query = includeBlocked
                ? {}
                : { status: { $ne: "blocked" } }

            const products = await productModel.paginate(query, options)
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

    async searchProductByName(name, page = 1, limit = 10){
        try {
            const query = {
                name: { $regex: name, $options: "i" },
                status: { $ne: "blocked" }
            }

            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                select: "-createdAt -updatedAt -__v",
                sort: { name: 1 },
                collation: { locale: "es", strength: 1 }
            }

            const products = await productModel.paginate(query, options)
            return products
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

    async addProductToCart(cartData){
        try {
            await cartModel.findOneAndUpdate(
                { user_id: cartData.userId, product_id: cartData.productId },
                { $inc: { quantity: cartData.quantity } },
                { upsert: true, new: true }
            )
            return "Ok"
        } catch (error) {
            throw new Error("Error al agregar el producto al carrito: " + error.message)
        }
    }

    async getCartProducts(userId){
        try {
            const cartProducts = await cartModel.find({ user_id: userId }).populate("product_id")
            return cartProducts
        } catch (error) {
            throw new Error("Error al obtener el carrito: " + error.message)
        }
    }

async deleteFromCart(userId, productId, quantity = 1) {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId) || 
            !mongoose.Types.ObjectId.isValid(productId)) {
            throw new Error("IDs inválidos");
        }

        const cartItem = await cartModel.findOne({ 
            user_id: userId, 
            product_id: productId 
        });

        if (!cartItem) {
            throw new Error("Producto no encontrado en el carrito");
        }

        if (cartItem.quantity <= quantity) {
            await cartModel.deleteOne({ 
                user_id: userId, 
                product_id: productId 
            });
            return { success: true, message: "Producto eliminado del carrito" };
        } else {
            cartItem.quantity -= quantity;
            await cartItem.save();
            return { 
                success: true, 
                message: `Cantidad reducida a ${cartItem.quantity} unidades` 
            };
        }
    } catch (error) {
        throw new Error("Error al modificar el carrito: " + error.message);
    }
}


}

module.exports = new productService()