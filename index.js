require('dotenv').config();
const connectDB = require("./config/dbConnection");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { Server } = require('socket.io');
const { createServer } = require('node:http');

const app = express();
const ACCEPTED_ORIGINS = ['http://localhost:5173']
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ACCEPTED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Origen no permitido."))
  }
}));

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./storage/imgs",
  })
);

module.exports = { app, server, io };

app.use(require('./src/routes'));

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer();