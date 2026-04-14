import { Radis } from "../../DB/radis.connection.js";

export const RedisKeyPrefix = ({ userId, jti }) => {
  return `revoke-token-user:${userId}-jti:${jti}`;
};

export const RedisUserCredentials = ({ userId }) => {
  return `user:${userId}-CredentialsDate`;
};

export const set = async ({ key, value, ttl = null }) => {
  try {
    const StringValue =
      typeof value == "string" ? value : JSON.stringify(value);
    if (ttl) {
      return await Radis.set(key, value, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await Radis.set(key, value);
    }
  } catch (error) {
    console.log("radis set error ", error);
  }
};

export const get = async ({ key }) => {
  try {
    return Radis.get(key);
  } catch (error) {
    console.log("radis get error ", error);
  }
};

export const update = async ({ key, value, ttl = undefined }) => {
  const StringValue = typeof value == "string" ? value : JSON.stringify(value);
  try {
    // const IsExist = await Radis.EXISTS(key);
    // if (!IsExist) {
    //   return null;
    // }

    if (ttl) {
      return await Radis.set(key, StringValue, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await Radis.set(key, StringValue);
    }
  } catch (error) {
    console.log("radis update error ", error);
  }
};

export const del = async ({ key }) => {
  try {
    return Radis.get(key);
  } catch (error) {
    console.log("radis delete error ", error);
  }
};
