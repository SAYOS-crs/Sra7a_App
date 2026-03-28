import { ForbiddenException } from "../Utils/responses/error.respons.js";

export const Authorization = ({ AuthorizedRolles = [] }) => {
  return (req, res, next) => {
    // check if for user rolles if its incloud the AuthorizedRolles
    if (AuthorizedRolles.includes(req.user.Roll)) {
      // if yes so pass it using next
      return next();
    }
    // if no then throw and error
    throw ForbiddenException({ message: "Access denied" });
  };
};
