import mongoose from "mongoose";
import { DataBase_URI } from "../../config/config.service.js";
import chalk from "chalk";

export default async function DB_Connect() {
  try {
    await mongoose.connect(DataBase_URI);
    console.log(chalk.green("DataBase Connected Successfly"));
  } catch (error) {
    console.log(chalk.red(error));
  }
}
