const productModel = require("../models/productModel.js")
const { default: mongoose } = require("mongoose")
const BuyLogsService = require("./buyLogs.js")
const cartModel = require("../models/cart.js")
const { io } = require("../../index.js")

class productService {

    async createProduct(productData) {
        try {
            const newProduct = await productModel.create(productData)
            newProduct.status = "active"
            await newProduct.save()
            io.emit('products:updated');
            return newProduct
        } catch (error) {
            throw new Error("Error al crear el producto: " + error.message)
        }
    }

    async getAllProducts({
        page = 1,
        limit = 10,
        status = "all",
        search = "",
        stockStatus = "all",
    } = {}) {
        try {
            const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                select: "-createdAt -updatedAt -__v",
                sort: { name: 1 },
                collation: { locale: "es", strength: 1 }
            }

            const query = {}

            if (status && status !== "all") query.status = status

            const term = search.trim()
            if (term) {
                query.name = { $regex: escapeRegex(term), $options: "i" }
            }

            if (stockStatus === "soldOut") query.stock = 0
            if (stockStatus === "last") query.stock = 1
            if (stockStatus === "available") query.stock = { $gt: 0 }

            const products = await productModel.paginate(query, options)
            return products
        } catch (error) {
            console.log(error)
            throw new Error("Error al obtener los productos: " + error.message)
        }
    }

    async getProductById(id) {
        try {
            const product = await productModel.findById(id).select("-createdAt -updatedAt -__v")
            return product
        } catch (error) {
            throw new Error("Error al obtener el producto: " + error.message)
        }
    }

    async searchProductByName(name, page = 1, limit = 10) {
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

    async updateProduct(id, productData) {
        try {
            Object.keys(productData).forEach(key => {
                if (productData[key] === undefined || productData[key] === null) delete productData[key];
            });
            const updatedProduct = await productModel.findByIdAndUpdate(id, productData, { returnDocument: "after" })
            io.emit('products:updated');
            return updatedProduct
        } catch (error) {
            throw new Error("Error al actualizar el producto: " + error.message)
        }
    }

    async deleteProduct(id) {
        try {
            await productModel.findByIdAndDelete(id)
            io.emit('products:updated');
            return "Producto eliminado"
        } catch (error) {
            throw new Error("Error al eliminar el producto: " + error.message)
        }
    }

    // async buyProducts(products, userId) {

    //     const session = await mongoose.startSession()
    //     session.startTransaction()

    //     try {

    //         const updatedProducts = []

    //         for (const item of products) {

    //             const { id, quantity } = item

    //             if (!quantity || quantity <= 0)
    //                 throw new Error("Cantidad inválida")

    //             const product = await productModel.findOneAndUpdate(
    //                 {
    //                     _id: id,
    //                     status: { $ne: "blocked" },
    //                     stock: { $gte: quantity }
    //                 },
    //                 { $inc: { stock: -quantity } },
    //                 { new: true, session }
    //             )

    //             if (!product)
    //                 throw new Error(`Producto sin stock: ${id}`)

    //             updatedProducts.push({
    //                 id: product._id,
    //                 name: product.name,
    //                 price: product.price,
    //                 quantity: quantity
    //             })
    //         }

    //         await BuyLogsService.createLog({
    //             id_user: userId,
    //             products: updatedProducts
    //         }, session)

    //         await session.commitTransaction()
    //         session.endSession()

    //         return updatedProducts

    //     } catch (error) {

    //         await session.abortTransaction()
    //         session.endSession()

    //         throw new Error("Error al comprar productos: " + error.message)
    //     }
    // }


    // La base de datos no permitía escrituras reintentables, lo cual daba como resultado un error,
    // es por eso que se tomo la decisión de rehacer la función de compra con un rollback manual en caso de un error.
    async buyCartProducts(products, userId) {
        const updatedProducts = []
        const rollbackActions = []

        console.log(products)

        try {
            for (const item of products) {
                const { id, quantity, stock } = item

                // verificamos si la cantidad existe y es igual o mayor a 0
                if (!quantity || quantity <= 0)
                    throw new Error("Cantidad inválida")

                // obtenemos el producto para validar antes de actualizar
                const product = await productModel.findById(id).select('stock').lean();

                // en caso de haber stock pero al querer comprar mas cantidad que este
                if (product.stock < quantity) throw new Error('Supera el stock');

                // actualizamos el stock del producto
                const currentProduct = await productModel.findOneAndUpdate(
                    {
                        _id: id,
                        status: { $ne: "blocked" },
                        stock: { $gte: quantity }
                    },
                    { $inc: { stock: -quantity } },
                    { returnDocument: 'after' }
                )

                // si hay stock hacemos la compra, si esta completamente agotado simplemente ignoramos este producto
                if (currentProduct) {
                    rollbackActions.push({ id, quantity })
                    updatedProducts.push({
                        id: currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        quantity: quantity
                    })
                }
            }

            // borramos todo del carrito
            await Promise.all(
                updatedProducts.map(item => {
                    this.deleteFromCart(userId, item.id, item.quantity)
                })
            );

            // registramos en los logs las compras realizadas
            await BuyLogsService.createLog({
                id_user: userId,
                products: updatedProducts
            })

            // avisar por medio del socket que se hizo una compra
            io.emit('products:updated');

            return updatedProducts;
        } catch (error) {
            console.error("Error detectado", error)
            for (const action of rollbackActions) {
                await productModel.updateOne(
                    { _id: action.id },
                    { $inc: { stock: action.quantity } }
                )
            }

            throw new Error(error)
        }
    }

    async buyProduct(userId, product) {
        try {
            // obtengo el producto filtrando y validando que haya stock suficiente para la cantidad
            const currentProduct = await productModel.findOneAndUpdate(
                {
                    _id: product.id,
                    status: { $ne: "blocked" },
                    stock: { $gte: product.quantity }
                },
                { $inc: { stock: -product.quantity } },
                { returnDocument: 'after' }
            )

            // si no hay producto es que no hay suficiente stock o esta bloqueado
            if (!currentProduct) throw new Error('Supera el stock');

            // después de modificar el producto es necesario registrar la compra en los logs
            await BuyLogsService.createLog({
                id_user: userId,
                products: [currentProduct]
            })

            // emitimos la señal para decir que hubo cambios
            io.emit('products:updated')

            return currentProduct;
        } catch (error) {
            console.log(error)
            throw new Error('Error al comprar producto: ', error.message)
        }
    }

    async addProductToCart(cartData) {
        try {
            // obtengo el stock actual del producto
            const product = await productModel
                .findById(cartData.productId)
                .select('stock')
                .lean();

            if (!product) {
                throw new Error('Producto no encontrado');
            }

            const currentProductStock = product.stock;

            // actualizo el producto en el carrito
            const updatedCart = await cartModel.findOneAndUpdate(
                { user_id: cartData.userId, product_id: cartData.productId },
                { $inc: { quantity: cartData.quantity } },
                { upsert: true, new: true }
            );

            // si es mayor al stock actual, deshago los cambios y retorno error
            if (updatedCart.quantity > currentProductStock) {
                const cantidadRevertida = updatedCart.quantity - cartData.quantity;

                if (cantidadRevertida <= 0) {
                    await cartModel.deleteOne({
                        user_id: cartData.userId,
                        product_id: cartData.productId
                    });
                } else {
                    await cartModel.findOneAndUpdate(
                        { user_id: cartData.userId, product_id: cartData.productId },
                        { $inc: { quantity: -cartData.quantity } }
                    );
                }

                throw new Error('Supera el stock');
            }

            return "Ok";
        } catch (error) {
            throw error;
        }
    }

    async getCartProducts(userId) {
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