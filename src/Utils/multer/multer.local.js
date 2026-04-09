import multer from "multer";
import path from "node:path";
import fs from "node:fs";

export const LocalFileStorge = ({ GeneralPath }) => {
  // 0. set the file fapth
  let filepath = `Uploudes/${GeneralPath}`;
  //1. set the file destination
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // make the user path
      if (req.user?.id) {
        filepath += `/${req.user.id}`;
      }
      const fullpath = path.resolve(`./src/${filepath}`);
      //   check if that file is exist
      if (!fs.existsSync(fullpath)) {
        fs.mkdirSync(fullpath, { recursive: true });
      }
      //   2. saveing the full path that fille will going too
      cb(null, fullpath);
    },
    // 3. set the file it self
    filename: (req, file, cb) => {
      // create uniqe name end with the file original name
      const CipherName =
        Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
      // 4. set the new file path in the req.file or just file
      file.RelativFilePath = `${filepath}/${CipherName}`;
      // 5. setting the final name for the file that will name with it
      cb(null, CipherName);
    },
  });
  //   6. return the multer refrunce
  return multer({ storage });
};
