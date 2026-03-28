import jwt from "jsonwebtoken";
export const GeneratToken = ({ payloud, signature, options = undefined }) => {
  const result = jwt.sign({ id: payloud }, signature, options);
  return result;
};

export const VerifyToken = ({ token, signature }) => {
  const result = jwt.verify(token, signature);
  return result;
};
