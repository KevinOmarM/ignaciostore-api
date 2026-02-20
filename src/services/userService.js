const userModel = require("../models/userModel");
const mongoose = require("mongoose");

const getAllUsersService = async ({ page = 1, limit = 10 }) => {
  try {
    const options = {
      page,
      limit,
      select: "firstName lastName username role debt status",
    };

    const result = await userModel.paginate({}, options);

    return result;
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
      .select("firstName lastName username password role debt status");

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
        "firstName lastName username role debt status createdAt updatedAt",
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
        "firstName lastName username password role status createdAt updatedAt",
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

module.exports = {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  addUserDebtService,
  subtractUserDebtService,
  getUserByUsernameService,
};
