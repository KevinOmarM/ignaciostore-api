require('dotenv').config();
const connectDB = require("./config/dbConnection");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./storage/imgs",
  })
);

app.use(require('./src/routes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer();