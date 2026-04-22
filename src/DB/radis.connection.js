import chalk from "chalk";
import { createClient } from "redis";
export const Radis = await createClient();

export default async function RadisConnection() {
  try {
    await Radis.connect();
    console.log(chalk.green("Radis server is connected"));
  } catch (error) {
    console.log("Radis Server Failure", error);
  }
}
