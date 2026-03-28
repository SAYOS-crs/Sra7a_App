import { NotFoundException } from "../../Utils/responses/error.respons.js";
import { SuccessRespons } from "../../Utils/responses/success.respons.js";

export const GetProfile = async (req, res) => {
  // the req is holding new and object has {user  , decoded } data form the auth middleware
  const { user, decoded } = req;
  if (!user || !decoded) {
    throw NotFoundException({ message: "not found " });
  }
  return SuccessRespons({ res, massage: "done", data: { user, decoded } });
};
