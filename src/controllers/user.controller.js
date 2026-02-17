const User = require("../models/userModel.js");

exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const users = await User.paginate(
      {},
      {
        page,
        limit,
        sort: { createdAt: -1 },
      },
    );

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(400).json({ message: "Error al crear usuario", error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: "Error al actualizar usuario", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar usuario", error: error.message });
  }
};