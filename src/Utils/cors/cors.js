import { Accessple_Origines } from "../../../config/config.service.js";

const Origines = Accessple_Origines.split(",") || [];
export default function OriginesCors() {
  return {
    origin: function (origin, callback) {
      if (Origines.includes(origin)) {
        console.log(origin);
        return callback(null, origin);
      } else if (!origin) {
        return callback(null, origin);
      } else {
        return callback(null, origin);
      }
      return callback(new Error("unothorized origin"), null);
    },
  };
}
