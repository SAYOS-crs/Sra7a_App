import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
import { BadRequstException } from "../Utils/responses/error.respons.js";
export default function filefilter({ allowedTypes = [] }) {
  return async (req, res, next) => {
    if (allowedTypes.length === 0) {
      throw BadRequstException({ message: "there is no allowedTypes set" });
    }
    // get the file path
    const filePath = req.file.path;
    // read the file and return buffer
    const buffer = fs.readFileSync(filePath);
    // get the file type
    const type = await fileTypeFromBuffer(buffer);
    // validate
    if (!type || !allowedTypes.includes(type.mime))
      throw BadRequstException({
        message: "invalid type error",
        extra: `allowed types are : ${allowedTypes} `,
      });
    return next();
  };
}
