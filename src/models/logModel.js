const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Actions = [
    "Crear producto",
    "Actualizar producto",
    "Eliminar producto",
    "Crear usuario",
    "Actualizar usuario",
    "Eliminar usuario",
    "Iniciar sesión",
    "Realizar compra",
    "Pagar deuda",
];

const logSchema = new mongoose.Schema( 
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            required: true,
            enum: Actions
        },

        value: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
        }
    },
    { timestamps: true }
);

logSchema.plugin(mongoosePaginate);

const Logs = mongoose.model("Log", logSchema);
module.exports = Logs;
