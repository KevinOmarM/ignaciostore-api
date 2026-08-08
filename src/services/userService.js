const userModel = require("../models/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { uploadImage } = require("../helpers/cloudinary.js")
const fs = require("fs");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const getAllUsersService = async ({ page = 1, limit = 10, status = "all", search = "", role = "all", debt = "all" }) => {
  try {
    const options = {
      page: Number(page) > 0 ? Number(page) : 1,
      limit: Number(limit) > 0 ? Math.min(Number(limit), 50) : 10,
      select: "firstName lastName username role debt status profilePhoto",
      sort: debt === "debtDesc" ? { debt: -1, _id: 1 }
        : debt === "debtAsc" ? { debt: 1, _id: 1 }
          : { firstName: 1, _id: 1 },
      collation: { locale: "es", strength: 1 },
    };

    const query = {}

    if (status && status !== "all") query.status = status
    if (role && role !== "all") query.role = role

    const term = String(search || "").trim()
    if (term) {
      const regex = { $regex: escapeRegex(term), $options: "i" }
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { username: regex },
      ]
    }

    return await userModel.paginate(query, options);
  } catch (error) {
    throw new Error(`Error obteniendo usuarios: ${error.message}`);
  }
};

const getUserByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const user = await userModel
      .findById(id)
      .select("firstName lastName username password role debt status profilePhoto");

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  } catch (error) {
    throw new Error(`Error obteniendo usuario: ${error.message}`);
  }
};

const createUserService = async ({
  firstName,
  lastName,
  username,
  password,
  role = "user",
  debt = 0,
}) => {
  try {
    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    const newUser = await userModel.create({
      firstName,
      lastName,
      username,
      password,
      role,
      debt,
    });

    console.log(newUser);

    // Retornar sin contraseña
    const userResponse = await userModel
      .findById(newUser._id)
      .select(
        "firstName lastName username role debt status createdAt updatedAt profilePhoto",
      );

    return userResponse;
  } catch (error) {
    throw new Error(`Error creando usuario: ${error.message}`);
  }
};

const updateUserService = async (id, updateData) => {
  try {
    //validate user ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    //Filter and validate only update allowed fields
    const allowedFields = [
      "firstName",
      "lastName",
      "username",
      "password",
      "role",
      "status",
      "debt",
    ];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error("No hay campos válidos para actualizar");
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(id, filteredData, {
        new: true,
        runValidators: true,
      })
      .select(
        "firstName lastName username role status createdAt updatedAt",
      );

    if (!updatedUser) {
      throw new Error("Usuario no encontrado");
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Error actualizando usuario: ${error.message}`);
  }
};

const deleteUserService = async (id) => {
  try {
    const isDeleted = await userModel.findById(id);

    if (!isDeleted) {
      throw new Error("Usuario no encontrado");
    }

    const deletedUser = await userModel.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true },
    );

    if (!deletedUser) {
      throw new Error("Usuario no encontrado");
    }

    return deletedUser;
  } catch (error) {
    throw new Error(`Error eliminando usuario: ${error.message}`);
  }
};

const addUserDebtService = async (id, amount) => {
  try {
    //validate Id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const user = await userModel.findById(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const newDebt = user.debt + amount;
    if (newDebt < 0) {
      throw new Error("La deuda no puede ser negativa");
    }

    user.debt = newDebt;
    await user.save();
  } catch (error) {
    throw new Error(`Error agregando deuda al usuario: ${error.message}`);
  }
};

const subtractUserDebtService = async (id, amount) => {
  try {
    //validate Id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const user = await userModel.findById(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.debt -= amount;

    await user.save();
  } catch (error) {
    throw new Error(`Error restando deuda al usuario: ${error.message}`);
  }
};

const getUserByUsernameService = async (username) => {
  try {
    if (!username) return null;

    const user = await userModel.findOne({ username });
    return user; // null si no existe
  } catch (error) {
    throw new Error(`Error obteniendo usuario por username: ${error.message}`);
  }
};

const getAllUsersNamesService = async () => {
  try {
    const users = await userModel
      .find()
      .select("firstName lastName username")
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    return users.map((user) => ({
      id: user._id,
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      username: user.username,
    }));
  } catch (error) {
    throw new Error(`Error obteniendo nombres de usuarios: ${error.message}`);
  }
};

const changePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    const userData = await userModel.findById(userId).select("password");
    if (!userData) {
      throw new Error("Usuario no encontrado");
    }
    // valido que la contraseña es correcta 
    const isValidPassword = await bcrypt.compare(currentPassword, userData.password)
    if (!isValidPassword) {
      throw new Error("Credenciales Invalidas")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.findOneAndUpdate({ _id: userId }, { password: hashedPassword })
  } catch (error) {
    throw new Error(`Error al cambiar contraseña: ${error.message}`);
  }
}



const changeUserPhotoService = async (userId, filePath) => {
  try {
    const result = await uploadImage(filePath, "storage/img/users");

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error al borrar archivo temporal:", err);
    });

    const imageData = {
      url: result.secure_url,
      public_id: result.public_id,
    };

    await userModel.findByIdAndUpdate(userId, { profilePhoto: imageData });
  } catch (error) {
    throw new Error(`Error al cambiar la foto de perfil: ${error.message}`);
  }
};

module.exports = {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  addUserDebtService,
  subtractUserDebtService,
  getUserByUsernameService,
  getAllUsersNamesService,
  changePasswordService,
  changeUserPhotoService
};
