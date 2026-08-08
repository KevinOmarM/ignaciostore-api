const { customResponse } = require("../helpers/objectDataResponse");
const logService = require("../services/logService.js");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
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
  changeUserPhotoService,
} = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      role = "all",
      debt = "all"
    } = req.query

    const users = await getAllUsersService({ page, limit, status, search, role, debt });

    return customResponse(res, 200, users, "Usuarios obtenidos exitosamente");
  } catch (error) {
    console.error("Error en getAllUsers controller:", error.message);
    return customResponse(res, 500, null, "Error interno del servidor");
  }
};

const getAllUsersNames = async (req, res) => {
  try {
    const users = await getAllUsersNamesService();

    return customResponse(res, 200, users, "Usuarios obtenidos exitosamente");
  } catch (error) {
    console.error("Error en getAllUsersNames controller:", error.message);
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
    const { firstName, lastName, username, password, role } = req.body;

    console.log(req.body)

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

    const newUser = await createUserService({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      role
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

    const { firstName, lastName, username, password, role, debt, status } =
      req.body;

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
    if (status !== undefined) updateData.status = status;

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

    console.log(deletedBy);

    try {
      await logService.createLog(
        deletedBy,
        "Eliminar usuario",
        `Usuario ${user.username} eliminado`,
      );
    } catch (logError) {
      console.error("Error al crear log de eliminación:", logError.message);
    }

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
//Esto sirve para la parte de deuda del user
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

const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id } = req.params;

    const response = await changePasswordService(id, currentPassword, newPassword);

    return customResponse(res, 200, null, "Contraseña actualizada correctamente")
  } catch (error) {
    console.error(error);
    if (error.message.includes("Credenciales Invalidas")) return customResponse(res, 400, null, "Credenciales Invalidas")
    return customResponse(res, 500, null, "Error al cambiar la contraseña.")
  }
}

const changeUserPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.userPhoto) {
      return customResponse(res, 400, null, "No se envió ninguna imagen");
    }

    const { userPhoto } = req.files;
    await changeUserPhotoService(id, userPhoto.tempFilePath);

    return customResponse(res, 200, null, "Foto de usuario actualizada correctamente");
  } catch (error) {
    console.error(error);
    if (error.message.includes("Usuario no encontrado")) {
      return customResponse(res, 404, null, "Usuario no encontrado");
    }
    return customResponse(res, 500, null, "Error al cambiar la foto de usuario.");
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
  getAllUsersNames,
  changeUserPassword,
  changeUserPhoto
};
