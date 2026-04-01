import dotenv from "dotenv";
import { resolve } from "node:path";
dotenv.config({ path: resolve("./config/.env.dev") });

export const PORT = parseInt(process.env.PORT);
export const DataBase_URI = process.env.DATA_BASE;
export const Salt = parseInt(process.env.SALT);
export const IV_Length = parseInt(process.env.IV_length);
export const SERCRET_KEY = process.env.SERCRET_KEY;
// --------------------------------
// --------------------------------
// --------------------------------
// --------------------------------
// token-----------------------------
//-----User
export const ACCESS_USER_SIGNATURE = process.env.ACCESS_USER_SIGNATURE;
export const REFRESH_USER_SIGNATURE = process.env.REFRESH_USER_SIGNATURE;
// --------------------------------
// --------------------------------
// -----ADMIN
export const ACCESS_ADMIN_SIGNATURE = process.env.ACCESS_ADMIN_SIGNATURE;
export const REFRESH_ADMIN_SIGNATURE = process.env.REFRESH_ADMIN_SIGNATURE;
export const Google_ClintID = process.env.CLINT_ID;
