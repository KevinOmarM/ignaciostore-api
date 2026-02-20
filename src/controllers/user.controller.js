const { customResponse } = require("../helpers/objectDataResponse");
const {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  addUserDebtService,
  subtractUserDebtService,
  getUserByUsernameService,
} = require("../services/userService");
const bcrypt = require("bcrypt");
const logService = require("../services/logService.js");
const mongoose = require("mongoose");

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await getAllUsersService({ page, limit });

    return customResponse(res, 200, users, "Usuarios obtenidos exitosamente");
  } catch (error) {
    console.error("Error en getAllUsers controller:", error.message);
    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdService(id);

    return customResponse(res, 200, user, "Usuario obtenido exitosamente");
  } catch (error) {
    console.error("Error en getUserById controller:", error.message);

    if (error.message.includes("no encontrado")) {
      return customResponse(res, 404, null, error.message);
    }

    if (error.message.includes("ID inválido")) {
      return customResponse(res, 400, null, error.message);
    }

    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, password, role, debt } = req.body;

    if (!firstName || !lastName || !username || !password) {
      return customResponse(res, 400, null, "Faltan campos obligatorios");
    }

    author = req.user?.id;
    const createdBy = new mongoose.Types.ObjectId(author);

    const existingUser = await getUserByUsernameService(username);

    if (existingUser) {
      return customResponse(res, 400, null, "El usuario ya existe");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("username:", username);

    const newUser = await createUserService({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role,
      debt,
    });

    console.log(newUser);
    await logService.createLog(
      createdBy,
      "Crear usuario",
      `Usuario ${username} creado`,
    );
    return customResponse(res, 201, newUser, "Usuario creado exitosamente");
  } catch (error) {
    console.error("Error en createUser controller:", error.message);

    if (error.message.includes("ya existe")) {
      return customResponse(res, 400, null, error.message);
    }

    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Object.keys(req.body).length === 0) {
      return customResponse(
        res,
        400,
        null,
        "Debe proporcionar al menos un campo para actualizar",
      );
    }

    const { firstName, lastName, username, password, role, debt } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (username) updateData.username = username;
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }
    if (role) updateData.role = role;
    if (debt !== undefined) updateData.debt = debt;

    // Revisamos si hay al menos un campo o imagen para actualizar
    if (Object.keys(updateData).length === 0 && !req.files?.image) {
      return customResponse(
        res,
        400,
        null,
        "Debe proporcionar al menos un campo para actualizar",
      );
    }
    author = req.user?.id;
    const updatedBy = new mongoose.Types.ObjectId(author);

    const updatedUser = await updateUserService(id, updateData);

    await logService.createLog(
      updatedBy,
      "Actualizar usuario",
      `Usuario ${updatedUser.username} actualizado`,
    );

    return customResponse(
      res,
      200,
      updatedUser,
      "Usuario actualizado exitosamente",
    );
  } catch (error) {
    console.error("Error en updateUser controller:", error.message);

    if (error.message.includes("ID inválido")) {
      return customResponse(res, 400, null, error.message);
    }

    if (error.message.includes("no encontrado")) {
      return customResponse(res, 404, null, error.message);
    }

    if (error.message.includes("campos válidos")) {
      return customResponse(res, 400, null, error.message);
    }

    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserByIdService(id);

    if (user.status === "inactive") {
      return customResponse(res, 400, null, "El usuario ya está desactivado");
    }
    const deletedUser = await deleteUserService(id);

    const author = req.user?.id;
    const deletedBy = new mongoose.Types.ObjectId(author);

    await logService.createLog(
      deletedBy,
      "Eliminar usuario",
      `Usuario ${user.username} eliminado`,
    );

    return customResponse(
      res,
      200,
      deletedUser,
      "Usuario desactivado exitosamente",
    );
  } catch (error) {
    console.error("Error en deleteUser controller:", error.message);

    if (error.message.includes("ID inválido")) {
      return customResponse(res, 400, null, error.message);
    }

    if (error.message.includes("no encontrado")) {
      return customResponse(res, 404, null, error.message);
    }

    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const addUserDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const user = await getUserByIdService(id);
    if (!amount || amount <= 0) {
      return customResponse(res, 400, null, "Monto inválido");
    }

    await addUserDebtService(id, amount);

    return customResponse(res, 200, null, "Deuda agregada correctamente");
  } catch (error) {
    console.error("Error en addUserDebt controller:", error.message);

    if (error.message.includes("ID inválido")) {
      return customResponse(res, 400, null, error.message);
    }

    if (error.message.includes("no encontrado")) {
      return customResponse(res, 404, null, error.message);
    }

    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const subtractUserDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, subtractedBy } = req.body;

    const user = await getUserByIdService(id);
    if (!amount || amount <= 0) {
      return customResponse(res, 400, null, "Monto inválido");
    }

    await subtractUserDebtService(id, amount);

    await logService.createLog(
      subtractedBy,
      "Pagar deuda",
      `Usuario ${user.username} tiene ahora deuda de $${user.debt}`,
    );

    return customResponse(res, 200, null, "Deuda restada correctamente");
  } catch (error) {
    console.error("Error en subtractUserDebt controller:", error.message);

    if (error.message.includes("ID inválido")) {
      return customResponse(res, 400, null, error.message);
    }

    if (error.message.includes("no encontrado")) {
      return customResponse(res, 404, null, error.message);
    }

    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addUserDebt,
  subtractUserDebt,
};
