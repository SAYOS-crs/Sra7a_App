import { AuthRouter, UserRouter } from "./Modules/index.js";
import { GlobalError } from "./Utils/responses/error.respons.js";

export default function Bootstrap(app, express) {
  app.use("/Auth", AuthRouter);
  app.use("/User", UserRouter);
  app.all("/*dummy", (req, res) => {
    res.json({ massage: "not found handler" });
  });
  // ===================== Global Error Handler =======================
  app.use(GlobalError);
}
