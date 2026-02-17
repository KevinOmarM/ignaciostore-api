const Product = require("../models/productModel.js");
//si gustas esto lo puedes borrar o lo puedes refatorizar
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const products = await Product.paginate(
      {},
      {
        page,
        limit,
        sort: { createdAt: -1 },
      },
    );

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener productos", error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener producto", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(400).json({ message: "Error al crear producto", error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json(updatedProduct);
  } catch (error) {
    return res.status(400).json({ message: "Error al actualizar producto", error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar producto", error: error.message });
  }
};
