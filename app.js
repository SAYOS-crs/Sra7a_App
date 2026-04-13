import { PORT } from "./config/config.service.js";
import Bootstrap from "./src/app.controller.js";
import express from "express";
import DB_Connect from "./src/DB/connection.js";
import cors from "cors";
import RadisConnection from "./src/DB/radis.connection.js";
const app = express();
app.use(express.json(), cors());

Bootstrap(app, express);
DB_Connect();
RadisConnection();
app.listen(PORT, () => {
  console.log(`server is running successfly on ${PORT}`);
});
