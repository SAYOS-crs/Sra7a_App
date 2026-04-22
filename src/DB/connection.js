import mongoose from "mongoose";
import { DataBase_URI } from "../../config/config.service.js";
import chalk from "chalk";

export default function DB_Connect() {
  try {
    mongoose.connect(DataBase_URI);
    console.log(chalk.green("DataBase Connected Successfly"));
  } catch (error) {
    console.log(chalk.red(error));
  }
}
