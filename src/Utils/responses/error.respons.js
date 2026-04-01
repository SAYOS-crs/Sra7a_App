function ErrorRespons({ message = "Error", status = 400, extra }) {
  const error = new Error(
    typeof message === "string" ? message : message?.message || "Error",
  );
  error.status = status;
  error.extra = extra;
  throw error;
}
// exceptions
export const BadRequstException = ({
  message = "BadRequst Exception",
  status = 400,
  extra = undefined,
}) => {
  return ErrorRespons({ message, status, extra });
};
export const ConflictException = ({
  message = "ConflictException",
  extra = undefined,
}) => {
  return ErrorRespons({ message, status: 409, extra });
};
export const NotFoundException = ({
  message = "NotFoundException",
  extra = undefined,
}) => {
  return ErrorRespons({ message, status: 404, extra });
};
export const ForbiddenException = ({
  message = "ForbiddenException",
  extra = undefined,
}) => {
  return ErrorRespons({ message, status: 403, extra });
};

// global error
export const GlobalError = (error, req, res, next) => {
  const status = error.status ?? 500;

  return res
    .status(status)
    .json({
      message: error.message,
      extra: error.extra,
      stack: error.stack,
      status: status,
    });
};
