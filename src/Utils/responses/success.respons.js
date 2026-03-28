export const SuccessRespons = ({
  res,
  status = 200,
  massage = "done",
  data = undefined,
}) => {
  return res.status(status).json({ massage, data });
};
