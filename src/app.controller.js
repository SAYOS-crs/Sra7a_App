import morgan from "morgan";
import { AuthRouter, MessageRouter, UserRouter } from "./Modules/index.js";
import { GlobalError } from "./Utils/responses/error.respons.js";
import path from "node:path";
import { LogRecoreder } from "./Utils/logs/logs.js";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import geoip from "geoip-lite";
import { Radis } from "./DB/radis.connection.js";

export const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  limit: async function (req) {
    const { country } = geoip.lookup(req.ip) || {};
    // return country == "EG" ? 10 : 1;
    return 10;
  },

  legacyHeaders: false,
  handler: (req, res, next) => {
    res.status(429).json({ message: "to many requsts , try again later" });
  },

  keyGenerator: (req, res, next) => {
    const ip = ipKeyGenerator(req.ip, 56);

    return `${ip}-${req.path}`;
  },
  store: {
    incr: async (key, cb) => {
      try {
        const counter = await Radis.incr(key);

        if (counter === 1) {
          await Radis.expire(key, 60 * 3);
        }

        cb(null, counter);
      } catch (error) {
        cb(error, null);
      }
    },
    decrement: async (key) => {
      if (await Radis.exists(key)) {
        await Radis.decr(key);
      }
    },
  },
});

export default function Bootstrap(app, express) {
  // loger(app, "/Auth", AuthRouter, "auth.log");

  app.set("trust proxy", true);
  app.use(limiter);

  app.use("/a", express.static(path.resolve("./src/Uploudes")));
  app.use("/Auth", LogRecoreder({ fileName: "Auth" }), AuthRouter);
  app.use("/User", LogRecoreder({ fileName: "User" }), UserRouter);
  app.use("/Message", LogRecoreder({ fileName: "Massage" }), MessageRouter);
  app.all("/*dummy", (req, res) => {
    res.json({ massage: "not found handler" });
  });
  // ===================== Global Error Handler =======================
  app.use(GlobalError);
  app.use("/", (req, res) => {
    res.send(openRouterPage());
  });
}
