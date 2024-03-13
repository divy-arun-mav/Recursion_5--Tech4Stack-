require('dotenv').config();
const express = require("express");
const app = express();
const router = require("./routers/routes");
const bodyParser = require('body-parser')
const mongoConnect = require('./db')
const PORT = 8000;
const cors = require("cors");

app.use(cors())
app.use(express.json());
app.use(require("./routers/routes")); 

app.use(bodyParser.json());

mongoConnect(process.env.MONGO_URL).then(async () => {
  app.listen(PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error(err);
});