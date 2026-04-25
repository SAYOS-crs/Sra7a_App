import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

// const logPath = path.resolve();
// export const loger = (app, PathRouter, router, logType) => {
//   const logStream = fs.createWriteStream(
//     path.join(logPath, "./src/logs/", logType),
//     { flags: "a" },
//   );

//   app.use(
//     PathRouter,
//     morgan("combined", { stream: logStream }),
//     morgan("dev"),
//     router,
//   );
// };
export const LogRecoreder = ({ fileName }) => {
  const AbsolutePath = path.resolve(`./src/logs/${fileName}.log`);
  if (!fs.existsSync(AbsolutePath)) {
    fs.mkdirSync(AbsolutePath, { recursive: true });
  }
  const StreamPath = fs.createWriteStream(AbsolutePath, { flags: "a" });
  const dualStream = {
    write: (message) => {
      StreamPath.write(message); // Write to file
    },
  };

  // morgan is middleware so we can use inclojer
  return morgan("combined", { stream: dualStream });
};
